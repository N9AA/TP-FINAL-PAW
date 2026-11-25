<?php
namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pdf_path',
        'content',
        'address',
        'payment_method',
        'payment_id',
        'total',
        'status',
        'ticket_email_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'address' => 'array',
            'status' => OrderStatus::class,
            'ticket_email_sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }
}