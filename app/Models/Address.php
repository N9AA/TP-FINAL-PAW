<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'description',
        'province',
        'city',
        'reference',
        'receiver',
        'receiver_info',
        'default',
    ];

    protected function casts(): array
    {
        return [
            'receiver_info' => 'array',
            'default' => 'boolean',
        ];
    }
}
