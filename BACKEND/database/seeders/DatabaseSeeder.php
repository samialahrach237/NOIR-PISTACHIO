<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Category;
use App\Models\GalleryImage;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create(['name' => 'Noir Admin', 'email' => 'admin@noir-pistachio.test', 'password' => Hash::make('Admin123!'), 'phone' => '+212 5 35 00 00 00', 'role' => 'admin']);
        User::create(['name' => 'Sara El Mansouri', 'email' => 'sara@example.com', 'password' => Hash::make('Customer123!'), 'role' => 'customer']);

        $images = ['Coffee' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80', 'Iced Coffee' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80', 'Desserts' => 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=700&q=80', 'Breakfast' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80'];
        foreach ($images as $name => $image) Category::create(['name' => $name, 'slug' => Str::slug($name), 'image' => $image]);

        $products = [
            ['Coffee', 'Espresso', 'A short, syrupy double shot.', 24], ['Coffee', 'Americano', 'Double espresso, hot water, no fuss.', 28], ['Coffee', 'Cappuccino', 'Velvety milk foam over a bold shot.', 32], ['Coffee', 'Latte', 'Silky milk and balanced espresso.', 34], ['Coffee', 'Flat White', 'Microfoam over a double ristretto.', 36],
            ['Iced Coffee', 'Iced Latte', 'Chilled espresso with silky milk.', 38], ['Iced Coffee', 'Pistachio Tiramisu Iced Latte', 'Espresso, milk, pistachio cream and tiramisu foam.', 52], ['Iced Coffee', 'Iced Spanish Latte', 'Sweetened condensed milk and cold espresso.', 44], ['Iced Coffee', 'Cold Brew', '18-hour steep, clean and quietly complex.', 40],
            ['Desserts', 'Tiramisu', 'Mascarpone, espresso-soaked sponge, cocoa.', 42], ['Desserts', 'Cheesecake', 'Creamy baked cheesecake with berry compote.', 44], ['Desserts', 'Brownie', 'Dark chocolate, fudgy and warm.', 30], ['Desserts', 'Cookies', 'Fresh-baked chocolate chip cookies.', 22],
            ['Breakfast', 'Croissant', 'Buttery, crisp, baked fresh each morning.', 28], ['Breakfast', 'Avocado Toast', 'Sourdough, avocado, herbs and lemon.', 48], ['Breakfast', 'Pancakes', 'Fluffy pancakes with maple and fruit.', 46], ['Breakfast', 'Granola Bowl', 'Yogurt, house granola, fruit and honey.', 40],
        ];
        foreach ($products as [$category, $name, $description, $price]) Product::create(['category_id' => Category::where('name', $category)->value('id'), 'name' => $name, 'slug' => Str::slug($name), 'description' => $description, 'price' => $price, 'image' => $images[$category], 'is_featured' => $name === 'Pistachio Tiramisu Iced Latte']);

        foreach ([['Sara El Mansouri', 5, 'Beautiful coffee, beautiful atmosphere. One of my favorite places in the city.'], ['Youssef A.', 5, 'Everything tastes fresh and carefully made.'], ['Nadia R.', 5, 'The pistachio latte is incredible.']] as [$name, $rating, $comment]) Review::create(['customer_name' => $name, 'rating' => $rating, 'comment' => $comment, 'is_approved' => true]);
        $gallery = [['Coffee being poured into a ceramic cup', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85', 'tall'], ['Warm coffee shop interior with wooden tables', 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=85', 'wide'], ['Barista preparing a coffee behind the counter', 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=1000&q=85', 'square'], ['Fresh pastries arranged on a bakery counter', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85', 'square'], ['Roasted coffee beans in a tray', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=85', 'wide'], ['Detailed latte art in a white cup', 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1000&q=85', 'tall']];
        foreach ($gallery as $sort => [$title, $image, $category]) GalleryImage::create(['title' => $title, 'image' => $image, 'category' => $category, 'sort_order' => $sort]);
    }
}
