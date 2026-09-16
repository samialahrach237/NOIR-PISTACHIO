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
use Illuminate\Support\Str;

class AdminController extends Controller
{
    private function ok(string $message, mixed $data = [], int $status = 200) { return response()->json(['success' => true, 'message' => $message, 'data' => $data], $status); }
    public function stats() { return $this->ok('Dashboard statistics retrieved successfully', ['total_orders' => Order::count(), 'pending_orders' => Order::where('status', 'pending')->count(), 'total_revenue' => Order::whereNot('status', 'cancelled')->sum('total'), 'total_products' => Product::count(), 'pending_reservations' => Reservation::where('status', 'pending')->count(), 'new_messages' => ContactMessage::where('status', 'new')->count()]); }
    public function products() { return $this->ok('Products retrieved successfully', Product::with('category')->latest()->get()); }
    public function createProduct(Request $request) { $data = $request->validate(['category_id' => 'required|exists:categories,id', 'name' => 'required|string|max:150', 'description' => 'required|string', 'price' => 'required|numeric|min:0', 'image' => 'nullable', 'is_available' => 'boolean', 'is_featured' => 'boolean']); if ($request->hasFile('image')) $data['image'] = $request->file('image')->store('products', 'public'); $data['slug'] = Str::slug($data['name']); return $this->ok('Product created successfully', Product::create($data), 201); }
    public function updateProduct(Request $request, Product $product) { $data = $request->validate(['category_id' => 'sometimes|exists:categories,id', 'name' => 'sometimes|string|max:150', 'description' => 'sometimes|string', 'price' => 'sometimes|numeric|min:0', 'image' => 'nullable', 'is_available' => 'boolean', 'is_featured' => 'boolean']); if ($request->hasFile('image')) $data['image'] = $request->file('image')->store('products', 'public'); if (isset($data['name'])) $data['slug'] = Str::slug($data['name']).'-'.$product->id; $product->update($data); return $this->ok('Product updated successfully', $product->fresh('category')); }
    public function deleteProduct(Product $product) { $product->delete(); return $this->ok('Product deleted successfully'); }
    public function categories() { return $this->ok('Categories retrieved successfully', Category::withCount('products')->latest()->get()); }
    public function createCategory(Request $request) { $data = $request->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string', 'image' => 'nullable|string']); $data['slug'] = Str::slug($data['name']); return $this->ok('Category created successfully', Category::create($data), 201); }
    public function updateOrder(Request $request, Order $order) { $data = $request->validate(['status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled']); $order->update($data); return $this->ok('Order status updated successfully', $order); }
    public function orders() { return $this->ok('Orders retrieved successfully', Order::with('items.product', 'user')->latest()->get()); }
    public function reservations() { return $this->ok('Reservations retrieved successfully', Reservation::with('user')->latest()->get()); }
    public function updateReservation(Request $request, Reservation $reservation) { $data = $request->validate(['status' => 'required|in:pending,confirmed,cancelled,completed']); $reservation->update($data); return $this->ok('Reservation status updated successfully', $reservation); }
    public function reviews() { return $this->ok('Reviews retrieved successfully', Review::latest()->get()); }
    public function updateReview(Request $request, Review $review) { $data = $request->validate(['is_approved' => 'required|boolean']); $review->update($data); return $this->ok('Review moderation updated successfully', $review); }
    public function gallery() { return $this->ok('Gallery retrieved successfully', GalleryImage::latest()->get()); }
    public function createGallery(Request $request) { $data = $request->validate(['title' => 'required|string|max:150', 'image' => 'required', 'category' => 'nullable|string', 'sort_order' => 'integer', 'is_active' => 'boolean']); if ($request->hasFile('image')) $data['image'] = $request->file('image')->store('gallery', 'public'); return $this->ok('Gallery image created successfully', GalleryImage::create($data), 201); }
    public function messages() { return $this->ok('Messages retrieved successfully', ContactMessage::latest()->get()); }
    public function updateMessage(Request $request, ContactMessage $message) { $data = $request->validate(['status' => 'required|in:new,read,replied']); $message->update($data); return $this->ok('Message status updated successfully', $message); }
}
