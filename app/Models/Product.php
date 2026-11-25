<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'image_path',
        'price',
        'subcategory_id',
        'estado',
    ];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image_path
                ? Storage::url($this->image_path)
                : asset('img/image.png'),
        );
    }

    public function scopeCustomOrder($query, $orderBy)
    {
        return $query
            ->when($orderBy == 1, function ($query) {
                $query->orderBy('created_at', 'desc');
            })
            ->when($orderBy == 2, function ($query) {
                $query->orderBy('price', 'desc');
            })
            ->when($orderBy == 3, function ($query) {
                $query->orderBy('price', 'asc');
            });
    }

    public function scopeVerifyFamily($query, $family_id)
    {
        return $query->when($family_id, function ($query) use ($family_id) {
            $query->whereHas('subcategory.category', function ($query) use ($family_id) {
                $query->where('family_id', $family_id);
            });
        });
    }

    public function scopeVerifyCategory($query, $category_id)
    {
        return $query->when($category_id, function ($query) use ($category_id) {
            $query->whereHas('subcategory', function ($query) use ($category_id) {
                $query->where('category_id', $category_id);
            });
        });
    }

    public function scopeVerifySubcategory($query, $subcategory_id)
    {
        return $query->when($subcategory_id, function ($query) use ($subcategory_id) {
            $query->where('subcategory_id', $subcategory_id);
        });
    }

    public function scopeSelectFeatures($query, $selected_features)
    {
        return $query->when(!empty($selected_features), function ($query) use ($selected_features) {
            $query->whereHas('variants.features', function ($query) use ($selected_features) {
                $query->whereIn('features.id', $selected_features);
            });
        });
    }

    // Relación uno a muchos inversa
    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    // Relación uno a muchos
    public function variants()
    {
        return $this->hasMany(Variant::class);
    }

    // Relación muchos a muchos
    public function options()
    {
        return $this->belongsToMany(Option::class)
            ->using(OptionProduct::class)
            ->withPivot('features')
            ->withTimestamps();
    }
}
