<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/categories', [ApiController::class, 'categories']);
Route::get('/products', [ApiController::class, 'products']);
Route::get('/products/featured', [ApiController::class, 'featured']);
Route::get('/products/{product}', [ApiController::class, 'product']);
Route::get('/gallery', [ApiController::class, 'gallery']);
Route::get('/reviews', [ApiController::class, 'reviews']);
Route::post('/register', [ApiController::class, 'register']);
Route::post('/login', [ApiController::class, 'login']);
Route::post('/contact', [ApiController::class, 'contact']);
Route::post('/reservations', [ApiController::class, 'createReservation']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [ApiController::class, 'logout']);
    Route::get('/user', [ApiController::class, 'user']);
    Route::get('/orders', [ApiController::class, 'orders']);
    Route::post('/orders', [ApiController::class, 'createOrder']);
    Route::get('/orders/{order}', [ApiController::class, 'order']);
    Route::patch('/orders/{order}/cancel', [ApiController::class, 'cancelOrder']);
    Route::get('/reservations', [ApiController::class, 'reservations']);
    Route::patch('/reservations/{reservation}/cancel', [ApiController::class, 'cancelReservation']);
    Route::post('/reviews', [ApiController::class, 'createReview']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/products', [AdminController::class, 'products']);
        Route::post('/products', [AdminController::class, 'createProduct']);
        Route::put('/products/{product}', [AdminController::class, 'updateProduct']);
        Route::delete('/products/{product}', [AdminController::class, 'deleteProduct']);
        Route::get('/categories', [AdminController::class, 'categories']);
        Route::post('/categories', [AdminController::class, 'createCategory']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::patch('/orders/{order}', [AdminController::class, 'updateOrder']);
        Route::get('/reservations', [AdminController::class, 'reservations']);
        Route::patch('/reservations/{reservation}', [AdminController::class, 'updateReservation']);
        Route::get('/reviews', [AdminController::class, 'reviews']);
        Route::patch('/reviews/{review}', [AdminController::class, 'updateReview']);
        Route::get('/gallery', [AdminController::class, 'gallery']);
        Route::post('/gallery', [AdminController::class, 'createGallery']);
        Route::get('/messages', [AdminController::class, 'messages']);
        Route::patch('/messages/{message}', [AdminController::class, 'updateMessage']);
    });
});
