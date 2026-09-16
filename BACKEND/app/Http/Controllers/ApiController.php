<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\GalleryImage;
use App\Models\Order;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ApiController extends Controller
{
    private function ok(string $message, mixed $data = [], int $status = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $status);
    }

    public function categories() { return $this->ok('Categories retrieved successfully', Category::withCount('products')->orderBy('name')->get()); }

    public function products(Request $request)
    {
        $query = Product::with('category')->where('is_available', true);
        if ($request->filled('category')) $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        return $this->ok('Products retrieved successfully', $query->orderBy('name')->get());
    }

    public function featured() { return $this->ok('Featured product retrieved successfully', Product::with('category')->where('is_featured', true)->where('is_available', true)->first()); }
    public function product(Product $product) { return $this->ok('Product retrieved successfully', $product->load('category')); }
    public function gallery() { return $this->ok('Gallery retrieved successfully', GalleryImage::where('is_active', true)->orderBy('sort_order')->get()); }
    public function reviews() { return $this->ok('Reviews retrieved successfully', Review::where('is_approved', true)->latest()->get()); }

    public function register(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100', 'email' => 'required|email|unique:users,email', 'password' => 'required|string|min:8|confirmed', 'phone' => 'nullable|string|max:30']);
        $user = \App\Models\User::create([...$data, 'password' => Hash::make($data['password']), 'role' => 'customer']);
        return $this->ok('Registration successful', ['user' => $user, 'token' => $user->createToken('frontend')->plainTextToken], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = \App\Models\User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) return response()->json(['success' => false, 'message' => 'Invalid email or password.'], 401);
        return $this->ok('Login successful', ['user' => $user, 'token' => $user->createToken('frontend')->plainTextToken]);
    }

    public function logout(Request $request) { $request->user()->currentAccessToken()?->delete(); return $this->ok('Logged out successfully'); }
    public function user(Request $request) { return $this->ok('User retrieved successfully', $request->user()); }

    public function createOrder(Request $request)
    {
        $data = $request->validate(['customer_name' => 'required|string|max:100', 'customer_email' => 'required|email', 'customer_phone' => 'required|string|max:30', 'notes' => 'nullable|string|max:1000', 'items' => 'required|array|min:1', 'items.*.product_id' => 'required|integer|exists:products,id', 'items.*.quantity' => 'required|integer|min:1|max:50']);
        $order = DB::transaction(function () use ($data, $request) {
            $ids = collect($data['items'])->pluck('product_id');
            $products = Product::whereIn('id', $ids)->where('is_available', true)->get()->keyBy('id');
            if ($products->count() !== $ids->unique()->count()) abort(422, 'One or more products are unavailable.');
            $total = 0;
            $lines = [];
            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];
                $subtotal = (float) $product->price * $item['quantity'];
                $total += $subtotal;
                $lines[] = ['product_id' => $product->id, 'quantity' => $item['quantity'], 'price' => $product->price, 'subtotal' => $subtotal];
            }
            $order = Order::create(['user_id' => $request->user()?->id, 'customer_name' => $data['customer_name'], 'customer_email' => $data['customer_email'], 'customer_phone' => $data['customer_phone'], 'notes' => $data['notes'] ?? null, 'total' => $total]);
            $order->items()->createMany($lines);
            return $order->load('items.product');
        });
        return $this->ok('Order created successfully', $order, 201);
    }

    public function orders(Request $request) { return $this->ok('Orders retrieved successfully', $request->user()->orders()->with('items.product')->latest()->get()); }
    public function order(Request $request, Order $order) { abort_unless($order->user_id === $request->user()->id, 403); return $this->ok('Order retrieved successfully', $order->load('items.product')); }
    public function cancelOrder(Request $request, Order $order) { abort_unless($order->user_id === $request->user()->id, 403); abort_if($order->status !== 'pending', 422, 'Only pending orders can be cancelled.'); $order->update(['status' => 'cancelled']); return $this->ok('Order cancelled successfully', $order); }

    public function createReservation(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100', 'email' => 'required|email', 'phone' => 'required|string|max:30', 'reservation_date' => 'required|date|after_or_equal:today', 'reservation_time' => 'required|date_format:H:i', 'guests' => 'required|integer|min:1|max:20', 'notes' => 'nullable|string|max:1000']);
        $reservation = Reservation::create([...$data, 'user_id' => $request->user()?->id]);
        return $this->ok('Reservation created successfully', $reservation, 201);
    }

    public function reservations(Request $request) { return $this->ok('Reservations retrieved successfully', $request->user()->reservations()->latest()->get()); }
    public function cancelReservation(Request $request, Reservation $reservation) { abort_unless($reservation->user_id === $request->user()->id, 403); abort_if($reservation->status !== 'pending', 422, 'Only pending reservations can be cancelled.'); $reservation->update(['status' => 'cancelled']); return $this->ok('Reservation cancelled successfully', $reservation); }

    public function createReview(Request $request)
    {
        $data = $request->validate(['rating' => 'required|integer|min:1|max:5', 'comment' => 'required|string|max:1000']);
        $review = Review::create([...$data, 'user_id' => $request->user()->id, 'customer_name' => $request->user()->name, 'is_approved' => false]);
        return $this->ok('Review submitted for approval', $review, 201);
    }

    public function contact(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100', 'email' => 'required|email', 'phone' => 'nullable|string|max:30', 'message' => 'required|string|max:3000']);
        return $this->ok('Message sent successfully', ContactMessage::create($data), 201);
    }
}
