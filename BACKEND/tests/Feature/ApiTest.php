<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_are_publicly_available(): void
    {
        $category = Category::create(['name' => 'Coffee', 'slug' => 'coffee']);
        Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'slug' => 'espresso', 'description' => 'Double shot', 'price' => 24, 'is_available' => true]);
        $this->getJson('/api/products')->assertOk()->assertJsonPath('data.0.name', 'Espresso');
    }

    public function test_customer_can_login_and_create_an_order_with_database_price(): void
    {
        $user = User::create(['name' => 'Customer', 'email' => 'customer@test.test', 'password' => Hash::make('password'), 'role' => 'customer']);
        $category = Category::create(['name' => 'Coffee', 'slug' => 'coffee']);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'slug' => 'espresso', 'description' => 'Double shot', 'price' => 24, 'is_available' => true]);
        $token = $user->createToken('test')->plainTextToken;
        $this->withToken($token)->postJson('/api/orders', ['customer_name' => 'Customer', 'customer_email' => 'customer@test.test', 'customer_phone' => '123', 'items' => [['product_id' => $product->id, 'quantity' => 2]]])->assertCreated()->assertJsonPath('data.total', '48.00');
    }
}
