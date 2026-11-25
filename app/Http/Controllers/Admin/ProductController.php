<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Exports\ProductsExport;
use App\Models\Feature;
use App\Models\Family;
use App\Models\Option;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    /**
     * Mostrar el listado de productos
     */
    public function index(Request $request)
    {
        $filtros = $request->validate([
            'buscar' => 'nullable|string|max:255',
            'familia' => 'nullable|integer',
            'categoria' => 'nullable|integer',
            'subcategoria' => 'nullable|integer',
            'estado' => 'nullable|in:0,1',
            'precio_min' => 'nullable|numeric|min:0',
            'precio_max' => 'nullable|numeric|min:0',
            'orden' => 'nullable|in:id,sku,name,price,estado',
            'direccion' => 'nullable|in:asc,desc',
            'por_pagina' => 'nullable|in:5,10,20',
        ]);

        $buscar = $filtros['buscar'] ?? '';
        $familia = $filtros['familia'] ?? '';
        $categoria = $filtros['categoria'] ?? '';
        $subcategoria = $filtros['subcategoria'] ?? '';
        $estado = $filtros['estado'] ?? '';
        $precioMin = $filtros['precio_min'] ?? '';
        $precioMax = $filtros['precio_max'] ?? '';

        $orden = $filtros['orden'] ?? 'id';
        $direccion = $filtros['direccion'] ?? 'desc';
        $porPagina = (int) ($filtros['por_pagina'] ?? 10);

        $products = Product::with(['subcategory.category'])
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    $q->where('name', 'like', "%{$buscar}%")
                        ->orWhere('sku', 'like', "%{$buscar}%");
                });
            })
            ->when($familia !== '', function ($query) use ($familia) {
                $query->whereHas('subcategory.category.family', function ($q) use ($familia) {
                    $q->where('id', $familia);
                });
            })
            ->when($categoria !== '', function ($query) use ($categoria) {
                $query->whereHas('subcategory.category', function ($q) use ($categoria) {
                    $q->where('id', $categoria);
                });
            })
            ->when($subcategoria !== '', function ($query) use ($subcategoria) {
                $query->where('subcategory_id', $subcategoria);
            })
            ->when($estado !== '', function ($query) use ($estado) {
                $query->where('estado', $estado);
            })
            ->when($precioMin !== '', function ($query) use ($precioMin) {
                $query->where('price', '>=', $precioMin);
            })
            ->when($precioMax !== '', function ($query) use ($precioMax) {
                $query->where('price', '<=', $precioMax);
            })
            ->orderBy($orden, $direccion)
            ->paginate($porPagina)
            ->withQueryString();

        // Agregar la URL de la imagen a cada producto
        $products->getCollection()->each->append('image');

        $families = Family::with('categories.subcategories')->get();

        return Inertia::render('admin/products/Index', [
            'products' => $products,
            'families' => $families,
            'filtros' => [
                'buscar' => $buscar,
                'familia' => (string) $familia,
                'categoria' => (string) $categoria,
                'subcategoria' => (string) $subcategoria,
                'estado' => (string) $estado,
                'precio_min' => (string) $precioMin,
                'precio_max' => (string) $precioMax,
                'orden' => $orden,
                'direccion' => $direccion,
                'por_pagina' => $porPagina,
            ],
        ]);
    }

    /**
     * Exportar los productos filtrados a Excel
     */
    public function export(Request $request)
    {
        $filtros = $request->validate([
            'buscar' => 'nullable|string|max:255',
            'familia' => 'nullable|integer',
            'categoria' => 'nullable|integer',
            'subcategoria' => 'nullable|integer',
            'estado' => 'nullable|in:0,1',
            'precio_min' => 'nullable|numeric|min:0',
            'precio_max' => 'nullable|numeric|min:0',
            'orden' => 'nullable|in:id,sku,name,price,estado',
            'direccion' => 'nullable|in:asc,desc',
        ]);

        return Excel::download(
            new ProductsExport($filtros),
            'productos.xlsx'
        );
    }

    /**
     * Mostrar el formulario para crear un producto
     */
    public function create()
    {
        $families = Family::with('categories.subcategories')->get();

        return Inertia::render('admin/products/Create', [
            'families' => $families,
        ]);
    }

    /**
     * Guardar un producto nuevo
     *
     * La variante principal se crea con stock inicial en 0
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        $validated['image_path'] = $request->file('image')
            ->store('products', 'public');

        unset($validated['image']);

        DB::transaction(function () use ($validated) {
            $product = Product::create($validated);

            $product->variants()->create([
                'sku' => $product->sku,
                'stock' => 0,
            ]);
        });

        $product = Product::latest('id')->first();

        return redirect()
            ->route('admin.products.index', $product)
            ->with('swal', [
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'Producto creado correctamente.',
            ]);
    }

    /**
     * Mostrar el detalle de un producto
     */
    public function show(Product $product)
    {
        $product->load([
            'subcategory.category.family',
            'options',
            'variants.features',
        ]);

        // Decodificar las características guardadas en el pivote de cada opción
        $product->options->each(function ($option) {
            $features = $option->pivot->features;

            if (is_string($features)) {
                $features = json_decode($features, true);
            }

            $option->pivot->features = array_values($features ?? []);
        });

        // Agregar la URL de la imagen de cada variante
        $product->variants->each(function ($variant) {
            $variant->append('image');
        });

        // Agregar la URL de la imagen del producto
        $product->append('image');

        return Inertia::render('admin/products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Mostrar el formulario para editar un producto
     */
    public function edit(Product $product)
    {
        $product->load([
            'subcategory.category',
            'options.features',
            'variants.features',
        ]);

        // Agrega el atributo image de cada variante
        $product->variants->each(function ($variant) {
            $variant->append('image');
        });

        $families = Family::with('categories.subcategories')->get();

        $options = Option::with('features')->get();

        return Inertia::render('admin/products/Edit', [
            'product' => $product,
            'families' => $families,
            'options' => $options,
        ]);
    }

    /**
     * Actualizar los datos generales del producto
     *
     * El stock se modifica desde la edición de cada variante
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }

            $validated['image_path'] = $request->file('image')
                ->store('products', 'public');
        }

        unset($validated['image']);

        DB::transaction(function () use ($product, $validated) {
            $product->update($validated);

            /*
             * Si el producto no tiene opciones, su variante principal
             * utiliza el mismo SKU que el producto
             */
            if ($product->options()->count() === 0) {
                $variant = $product->variants()->first();

                if ($variant) {
                    $variant->update([
                        'sku' => $product->sku,
                    ]);
                }
            }
        });

        return redirect()
            ->route('admin.products.index', $product)
            ->with('swal', [
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'Producto actualizado correctamente.',
            ]);
    }

    /**
     * Eliminar un producto
     */
    public function destroy(Product $product)
    {
        DB::transaction(function () use ($product) {
            foreach ($product->variants as $variant) {
                if ($variant->image_path) {
                    Storage::disk('public')->delete($variant->image_path);
                }
            }

            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }

            $product->delete();
        });

        return redirect()
            ->route('admin.products.index')
            ->with('swal', [
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'Producto eliminado correctamente.',
            ]);
    }

    /**
     * Agregar una opción al producto.
     *
     * Ejemplo:
     * Opción: Color
     * Características seleccionadas: Rosa, Celeste.
     */
    public function storeOption(Request $request, Product $product)
    {
        $validated = $request->validate([
            'option_id' => 'required|exists:options,id',
            'feature_ids' => 'required|array|min:1',
            'feature_ids.*' => 'required|integer|distinct|exists:features,id',
        ]);

        $option = Option::findOrFail($validated['option_id']);

        if ($product->options()->where('options.id', $option->id)->exists()) {
            return back()->with('swal', [
                'icon' => 'error',
                'title' => 'Atención',
                'text' => 'Esta opción ya está agregada al producto.',
            ]);
        }

        $features = $this->getOptionFeatureSnapshot(
            $option,
            $validated['feature_ids']
        );

        DB::transaction(function () use ($product, $option, $features) {
            $product->options()->attach($option->id, [
                'features' => json_encode($features),
            ]);

            $this->regenerateVariants($product);
        });

        return back()->with('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Opción agregada correctamente.',
        ]);
    }

    /**
     * Actualizar las características seleccionadas de una opción
     *
     * Se envía el conjunto completo de IDs seleccionados
     */
    public function updateOptionFeatures(
        Request $request,
        Product $product,
        Option $option
    ) {
        $this->ensureOptionBelongsToProduct($product, $option);

        $validated = $request->validate([
            'feature_ids' => 'present|array',
            'feature_ids.*' => 'required|integer|distinct|exists:features,id',
        ]);

        $features = $this->getOptionFeatureSnapshot(
            $option,
            $validated['feature_ids']
        );

        DB::transaction(function () use ($product, $option, $features) {
            if (count($features) === 0) {
                $product->options()->detach($option->id);
            } else {
                $product->options()->updateExistingPivot($option->id, [
                    'features' => json_encode($features),
                ]);
            }

            $this->regenerateVariants($product);
        });

        return back()->with('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Características actualizadas correctamente.',
        ]);
    }

    /**
     * Eliminar una opción completa del producto
     */
    public function destroyOption(Product $product, Option $option)
    {
        $this->ensureOptionBelongsToProduct($product, $option);

        DB::transaction(function () use ($product, $option) {
            $product->options()->detach($option->id);

            $this->regenerateVariants($product);
        });

        return back()->with('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Opción eliminada correctamente.',
        ]);
    }

    /**
     * Eliminar una característica seleccionada de una opción
     */
    public function destroyOptionFeature(
        Product $product,
        Option $option,
        Feature $feature
    ) {
        $this->ensureOptionBelongsToProduct($product, $option);

        abort_unless($feature->option_id === $option->id, 404);

        $pivot = $product->options()
            ->where('options.id', $option->id)
            ->first()
            ->pivot;

        $selectedFeatures = $this->decodePivotFeatures($pivot->features);

        $selectedFeatures = array_values(array_filter(
            $selectedFeatures,
            fn ($item) => (int) $item['id'] !== (int) $feature->id
        ));

        DB::transaction(function () use (
            $product,
            $option,
            $selectedFeatures
        ) {
            if (count($selectedFeatures) === 0) {
                $product->options()->detach($option->id);
            } else {
                $product->options()->updateExistingPivot($option->id, [
                    'features' => json_encode($selectedFeatures),
                ]);
            }

            $this->regenerateVariants($product);
        });

        return back()->with('swal', [
            'icon' => 'success',
            'title' => '¡Bien hecho!',
            'text' => 'Característica eliminada correctamente.',
        ]);
    }

    /**
     * Mostrar la pantalla de edición de una variante
     */
    public function variants(Product $product, Variant $variant)
    {
        abort_unless(
            (int) $variant->product_id === (int) $product->id,
            404
        );

        $product->load('subcategory.category');

        $variant->load('features');

        $variant->append('image');

        return Inertia::render('admin/products/Variants', [
            'product' => $product,
            'variant' => $variant,
        ]);
    }

    /**
     * Actualizar una variante individual
     */
    public function variantsUpdate(
        Request $request,
        Product $product,
        Variant $variant
    ) {
        abort_unless(
            (int) $variant->product_id === (int) $product->id,
            404
        );

        $validated = $request->validate([
            'image' => 'nullable|image|max:5120',
            'sku' => 'required|string|max:255|unique:variants,sku,' . $variant->id,
            'stock' => 'required|integer|min:0',
        ]);

        if ($request->hasFile('image')) {
            if ($variant->image_path) {
                Storage::disk('public')->delete($variant->image_path);
            }

            $validated['image_path'] = $request->file('image')
                ->store('products', 'public');
        }

        unset($validated['image']);

        $variant->update($validated);

        return redirect()
            ->route('admin.products.variants', [$product, $variant])
            ->with('swal', [
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'Variante actualizada correctamente.',
            ]);
    }

    /* MÉTODOS AUXILIARES */

    /**
     * Comprobar que la opción pertenece al producto
     */
    private function ensureOptionBelongsToProduct(
        Product $product,
        Option $option
    ): void {
        abort_unless(
            $product->options()->where('options.id', $option->id)->exists(),
            404
        );
    }

    /**
     * Obtener las características de una opción y verificar
     * que todas pertenezcan a esa opción
     *
     * Se guarda una copia de sus datos en el JSON de la tabla pivote
     */
    private function getOptionFeatureSnapshot(
        Option $option,
        array $featureIds
    ): array {
        $features = $option->features()
            ->whereIn('id', $featureIds)
            ->get(['id', 'value', 'description']);

        if ($features->count() !== count(array_unique($featureIds))) {
            abort(422, 'Una o más características no pertenecen a esta opción.');
        }

        return $features->map(function ($feature) {
            return [
                'id' => $feature->id,
                'value' => $feature->value,
                'description' => $feature->description,
            ];
        })->values()->all();
    }

    /**
     * Convertir las características guardadas en el pivote
     * a un array PHP
     */
    private function decodePivotFeatures($features): array
    {
        if (is_string($features)) {
            $features = json_decode($features, true);
        }

        return is_array($features) ? $features : [];
    }

    /**
     * Regenerar las variantes según las opciones y características
     * seleccionadas para el producto
     * Conserva SKU, stock e imagen de las variantes que siguen existiendo
     */
    private function regenerateVariants(Product $product): void
    {
        $product->load('options');

        $options = $product->options;

        /*
         * Si el producto no tiene opciones, debe tener una variante
         * principal con el SKU del producto
         */
        if ($options->isEmpty()) {
            $variants = $product->variants()->with('features')->get();

            $mainVariant = $variants->first();

            if (!$mainVariant) {
                $mainVariant = $product->variants()->create([
                    'sku' => $product->sku,
                    'stock' => 0,
                ]);
            } else {
                $mainVariant->update([
                    'sku' => $product->sku,
                ]);

                $mainVariant->features()->sync();
            }

            foreach ($variants->skip(1) as $variant) {
                if ($variant->image_path) {
                    Storage::disk('public')->delete($variant->image_path);
                }

                $variant->delete();
            }

            return;
        }

        /*
         * Obtener los IDs de características seleccionadas
         * para cada opción
         */
        $featureGroups = [];

        foreach ($options as $option) {
            $selectedFeatures = $this->decodePivotFeatures(
                $option->pivot->features
            );

            $featureIds = collect($selectedFeatures)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            /*
             * Si alguna opción no tiene características seleccionadas,
             * no se generan combinaciones incompletas
             */
            if (empty($featureIds)) {
                return;
            }

            $featureGroups[] = $featureIds;
        }

        /*
         * Obtener todas las combinaciones posibles
         */
        $combinations = $this->generateCombinations($featureGroups);

        /*
         * Recuperar las variantes actuales para conservar
         * los datos de las combinaciones que siguen existiendo
         */
        $existingVariants = $product->variants()
            ->with('features')
            ->get();

        $existingByCombination = [];

        foreach ($existingVariants as $variant) {
            $key = $this->combinationKey(
                $variant->features->pluck('id')->all()
            );

            $existingByCombination[$key] = $variant;
        }

        $keptVariantIds = [];

        foreach ($combinations as $combination) {
            $key = $this->combinationKey($combination);

            if (isset($existingByCombination[$key])) {
                $variant = $existingByCombination[$key];

                // Conserva SKU, stock e imagen
                $variant->features()->sync($combination);

                $keptVariantIds[] = $variant->id;

                continue;
            }

            /*
             * Crear una variante nueva para la combinación
             */
            $sku = $product->sku . '-' . implode('-', $combination);

            $variant = $product->variants()->create([
                'sku' => $sku,
                'stock' => 0,
            ]);

            $variant->features()->sync($combination);

            $keptVariantIds[] = $variant->id;
        }

        /*
         * Eliminar las variantes cuyas combinaciones ya no existen
         */
        $obsoleteVariants = $existingVariants->whereNotIn(
            'id',
            $keptVariantIds
        );

        foreach ($obsoleteVariants as $variant) {
            if ($variant->image_path) {
                Storage::disk('public')->delete($variant->image_path);
            }

            $variant->delete();
        }
    }

    /**
     * Generar el producto cartesiano de las características.
     *
     * Ejemplo:
     * [
     *   [Rosa, Celeste],
     *   [A5, A4]
     * ]
     *
     * Resultado:
     * [
     *   [Rosa, A5],
     *   [Rosa, A4],
     *   [Celeste, A5],
     *   [Celeste, A4]
     * ]
     */
    private function generateCombinations(array $groups): array
    {
        $combinations = [[]];

        foreach ($groups as $group) {
            $newCombinations = [];

            foreach ($combinations as $combination) {
                foreach ($group as $featureId) {
                    $newCombinations[] = [
                        ...$combination,
                        (int) $featureId,
                    ];
                }
            }

            $combinations = $newCombinations;
        }

        return $combinations;
    }

    /**
     * Crear una clave consistente para identificar una combinación
     */
    private function combinationKey(array $featureIds): string
    {
        $featureIds = array_map('intval', $featureIds);

        sort($featureIds);

        return implode('-', $featureIds);
    }
}
