<?php
namespace App\Listeners\Login;

use Gloudemans\Shoppingcart\Facades\Cart;
use Illuminate\Auth\Events\Login;

class RestoreCartItems
{
    public function handle(Login $event): void
    {
        Cart::instance('shopping')->restore($event->user->id);
    }
}
