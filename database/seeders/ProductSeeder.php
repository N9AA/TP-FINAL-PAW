<?php
namespace Database\Seeders;

use App\Models\Product;
use App\Models\Option;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            'Auralis',
            'Nuvia',
            'Lunelle',
            'Bloomy',
            'Papelune',
            'Miskia',
            'Veloura',
            'Kirei',
            'Amelie',
            'Luvia',
        ];

        /*
        |--------------------------------------------------------------------------
        | Productos por subcategoría y opciones compatibles
        |--------------------------------------------------------------------------
        */

        $catalog = [

            // PAPELERÍA

            'Cuadernos universitarios' => [
                'Cuaderno universitario',
                ['Tamaño', 'Diseño', 'Color'],
            ],
            'Libretas A5' => [
                'Libreta A5',
                ['Diseño', 'Color'],
            ],
            'Libretas pequeñas' => [
                'Libreta de bolsillo',
                ['Diseño', 'Color'],
            ],
            'Cuadernos anillados' => [
                'Cuaderno anillado',
                ['Tamaño', 'Diseño', 'Color'],
            ],
            'Cuadernos de tapa dura' => [
                'Cuaderno de tapa dura',
                ['Tamaño', 'Diseño', 'Color'],
            ],
            'Cuadernos de tapa blanda' => [
                'Cuaderno de tapa blanda',
                ['Tamaño', 'Diseño', 'Color'],
            ],
            'Repuestos para cuadernos' => [
                'Repuesto de hojas',
                ['Tamaño'],
            ],

            // AGENDAS Y PLANIFICACIÓN

            'Agendas anuales' => [
                'Agenda anual',
                ['Diseño', 'Color'],
            ],
            'Planificadores semanales' => [
                'Planificador semanal',
                ['Diseño', 'Color'],
            ],
            'Planificadores mensuales' => [
                'Planificador mensual',
                ['Diseño', 'Color'],
            ],
            'Planificadores diarios' => [
                'Planificador diario',
                ['Diseño', 'Color'],
            ],
            'Calendarios' => [
                'Calendario de escritorio',
                ['Diseño', 'Color'],
            ],
            'Organizadores de estudio' => [
                'Organizador de estudio',
                ['Diseño', 'Color'],
            ],

            // ESCRITURA

            'Lapiceras' => [
                'Lapicera gel',
                ['Color de tinta', 'Grosor de punta'],
            ],
            'Lápices' => [
                'Lápiz de escritura',
                ['Color'],
            ],
            'Portaminas' => [
                'Portaminas',
                ['Color', 'Grosor de punta'],
            ],
            'Resaltadores' => [
                'Resaltador',
                ['Color', 'Tipo de punta'],
            ],
            'Marcadores' => [
                'Marcador',
                ['Color', 'Tipo de punta'],
            ],
            'Correctores' => [
                'Corrector de escritura',
                [],
            ],
            'Repuestos de tinta' => [
                'Repuesto de tinta',
                ['Color de tinta'],
            ],

            // PAPELES Y NOTAS

            'Notas adhesivas' => [
                'Notas adhesivas',
                ['Color', 'Diseño'],
            ],
            'Blocs de notas' => [
                'Bloc de notas',
                ['Tamaño', 'Diseño'],
            ],
            'Hojas de colores' => [
                'Pack de hojas de colores',
                ['Color', 'Tamaño', 'Cantidad'],
            ],
            'Papel decorativo' => [
                'Papel decorativo',
                ['Diseño', 'Tamaño'],
            ],
            'Tarjetas' => [
                'Set de tarjetas',
                ['Diseño', 'Cantidad'],
            ],
            'Separadores de página' => [
                'Separadores de página',
                ['Color', 'Diseño'],
            ],

            // CARPETAS Y ARCHIVADORES

            'Carpetas' => [
                'Carpeta organizadora',
                ['Color', 'Tamaño'],
            ],
            'Archivadores' => [
                'Archivador',
                ['Color', 'Tamaño'],
            ],
            'Separadores' => [
                'Separadores para carpetas',
                ['Color'],
            ],
            'Folios y fundas' => [
                'Pack de folios y fundas',
                ['Tamaño', 'Cantidad'],
            ],
            'Portadocumentos' => [
                'Portadocumentos',
                ['Color'],
            ],

            // ARTE Y CREATIVIDAD

            'Lápices de colores' => [
                'Set de lápices de colores',
                ['Cantidad'],
            ],
            'Acuarelas' => [
                'Set de acuarelas',
                ['Cantidad'],
            ],
            'Pinturas acrílicas' => [
                'Pintura acrílica',
                ['Color'],
            ],
            'Pinceles' => [
                'Pincel artístico',
                ['Tamaño'],
            ],
            'Blocks de dibujo' => [
                'Block de dibujo',
                ['Tamaño'],
            ],
            'Cuadernos de bocetos' => [
                'Cuaderno de bocetos',
                ['Tamaño', 'Diseño'],
            ],

            // LETTERING Y CALIGRAFÍA

            'Brush pens' => [
                'Brush pen',
                ['Color', 'Tipo de punta'],
            ],
            'Plumones de lettering' => [
                'Set de plumones de lettering',
                ['Color', 'Cantidad'],
            ],
            'Plumas de caligrafía' => [
                'Pluma de caligrafía',
                ['Color'],
            ],
            'Cuadernos de lettering' => [
                'Cuaderno de lettering',
                ['Tamaño', 'Diseño'],
            ],
            'Guías de práctica' => [
                'Guía de práctica de lettering',
                ['Tamaño'],
            ],

            // MANUALIDADES

            'Tijeras decorativas' => [
                'Tijera decorativa',
                ['Diseño'],
            ],
            'Pegamentos' => [
                'Pegamento escolar',
                [],
            ],
            'Troqueladoras' => [
                'Troqueladora decorativa',
                ['Diseño'],
            ],
            'Sellos' => [
                'Set de sellos',
                ['Diseño', 'Cantidad'],
            ],
            'Papeles para manualidades' => [
                'Pack de papeles para manualidades',
                ['Color', 'Diseño', 'Cantidad'],
            ],

            // STICKERS

            'Stickers decorativos' => [
                'Set de stickers decorativos',
                ['Diseño', 'Cantidad'],
            ],
            'Stickers para agendas' => [
                'Set de stickers para agendas',
                ['Diseño', 'Cantidad'],
            ],
            'Stickers temáticos' => [
                'Set de stickers temáticos',
                ['Diseño', 'Cantidad'],
            ],
            'Stickers transparentes' => [
                'Set de stickers transparentes',
                ['Diseño', 'Cantidad'],
            ],
            'Stickers con frases' => [
                'Set de stickers con frases',
                ['Diseño', 'Cantidad'],
            ],

            // WASHI TAPES Y CINTAS

            'Washi tapes estampadas' => [
                'Washi tape estampada',
                ['Diseño'],
            ],
            'Cintas decorativas' => [
                'Cinta decorativa',
                ['Color', 'Diseño'],
            ],
            'Sets de cintas' => [
                'Set de cintas decorativas',
                ['Color', 'Diseño', 'Cantidad'],
            ],

            // SELLOS Y ACCESORIOS DECORATIVOS

            'Sellos decorativos' => [
                'Sello decorativo',
                ['Diseño'],
            ],
            'Tintas para sellos' => [
                'Tinta para sellos',
                ['Color'],
            ],
            'Stencils' => [
                'Stencil decorativo',
                ['Diseño'],
            ],
            'Clips decorativos' => [
                'Set de clips decorativos',
                ['Color', 'Diseño', 'Cantidad'],
            ],

            // ORGANIZACIÓN

            'Organizadores de escritorio' => [
                'Organizador de escritorio',
                ['Color'],
            ],
            'Portalápices' => [
                'Portalápices',
                ['Color', 'Diseño'],
            ],
            'Bandejas organizadoras' => [
                'Bandeja organizadora',
                ['Color'],
            ],
            'Cajas organizadoras' => [
                'Caja organizadora',
                ['Color', 'Tamaño'],
            ],
            'Portanotas' => [
                'Portanotas de escritorio',
                ['Color', 'Diseño'],
            ],

            // ACCESORIOS DE ESCRITORIO

            'Clips' => [
                'Set de clips',
                ['Color', 'Cantidad'],
            ],
            'Broches sujetapapeles' => [
                'Set de broches sujetapapeles',
                ['Color', 'Cantidad'],
            ],
            'Gomas de borrar' => [
                'Goma de borrar',
                ['Diseño'],
            ],
            'Sacapuntas' => [
                'Sacapuntas',
                ['Color', 'Diseño'],
            ],
            'Reglas' => [
                'Regla escolar',
                ['Tamaño', 'Color'],
            ],

            // ILUMINACIÓN Y SOPORTES

            'Soportes para libros' => [
                'Soporte para libros',
                ['Color'],
            ],
            'Soportes para celular' => [
                'Soporte para celular',
                ['Color'],
            ],
            'Lámparas de escritorio' => [
                'Lámpara de escritorio',
                ['Color'],
            ],

            // CARTUCHERAS Y ESTUCHES

            'Cartucheras simples' => [
                'Cartuchera simple',
                ['Color', 'Diseño'],
            ],
            'Cartucheras con compartimentos' => [
                'Cartuchera con compartimentos',
                ['Color', 'Diseño'],
            ],
            'Cartucheras transparentes' => [
                'Cartuchera transparente',
                ['Color'],
            ],
            'Cartucheras estampadas' => [
                'Cartuchera estampada',
                ['Diseño'],
            ],
            'Estuches para lápices' => [
                'Estuche para lápices',
                ['Color', 'Diseño'],
            ],
            'Estuches pequeños' => [
                'Estuche pequeño',
                ['Color', 'Diseño'],
            ],
            'Bolsitas organizadoras' => [
                'Bolsita organizadora',
                ['Color', 'Diseño'],
            ],

            // REGALOS Y KITS

            'Kits de estudio' => [
                'Kit de estudio',
                ['Diseño'],
            ],
            'Kits de escritura' => [
                'Kit de escritura',
                ['Color'],
            ],
            'Kits de lettering' => [
                'Kit de lettering',
                ['Color', 'Diseño'],
            ],
            'Kits de organización' => [
                'Kit de organización',
                ['Color'],
            ],
            'Sets de cuadernos y lapiceras' => [
                'Set de cuaderno y lapicera',
                ['Color', 'Diseño'],
            ],
            'Sets de stickers' => [
                'Set de stickers',
                ['Diseño', 'Cantidad'],
            ],
            'Sets de notas adhesivas' => [
                'Set de notas adhesivas',
                ['Color', 'Diseño', 'Cantidad'],
            ],
            'Cajas de regalo' => [
                'Caja de regalo',
                ['Color', 'Diseño'],
            ],

            // TARJETAS Y ENVOLTORIOS

            'Tarjetas de felicitación' => [
                'Tarjeta de felicitación',
                ['Diseño'],
            ],
            'Tarjetas de agradecimiento' => [
                'Tarjeta de agradecimiento',
                ['Diseño'],
            ],
            'Papel de regalo' => [
                'Papel de regalo',
                ['Diseño'],
            ],
            'Bolsas de regalo' => [
                'Bolsa de regalo',
                ['Color', 'Diseño'],
            ],
            'Etiquetas decorativas' => [
                'Set de etiquetas decorativas',
                ['Diseño', 'Cantidad'],
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Cargar subcategorías y opciones
        |--------------------------------------------------------------------------
        */

        $subcategories = Subcategory::all()->keyBy('name');

        $options = Option::with('features')->get()->keyBy('name');

        $missing = collect(array_keys($catalog))
            ->diff($subcategories->keys());

        if ($missing->isNotEmpty()) {
            $this->command->error(
                'Faltan estas subcategorías: ' . $missing->implode(', ')
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Verificar opciones
        |--------------------------------------------------------------------------
        */

        $requiredOptions = collect($catalog)
            ->flatMap(fn ($item) => $item[1])
            ->unique();

        $missingOptions = $requiredOptions->diff($options->keys());

        if ($missingOptions->isNotEmpty()) {
            $this->command->error(
                'Faltan estas opciones: ' . $missingOptions->implode(', ')
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Crear productos
        |--------------------------------------------------------------------------
        */

        $totalProducts = 150;
        $catalogItems = array_keys($catalog);

        for ($i = 0; $i < $totalProducts; $i++) {

            $subcategoryName = $catalogItems[$i % count($catalogItems)];

            [$productName, $allowedOptions] = $catalog[$subcategoryName];

            $brand = $brands[
                intdiv($i, count($catalogItems)) % count($brands)
            ];

            $product = Product::factory()->create([
                'name' => $productName . ' ' . $brand,
                'subcategory_id' => $subcategories[$subcategoryName]->id,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Asociar opciones y características
            |--------------------------------------------------------------------------
            */

            $selectedOptions = collect($allowedOptions)
                ->map(fn ($name) => $options->get($name))
                ->filter(fn ($option) => $option->features->isNotEmpty());

            foreach ($selectedOptions as $option) {

                $features = $option->features->shuffle()->take(
                    min(3, $option->features->count())
                );

                $snapshot = $features->map(fn ($feature) => [
                    'id' => $feature->id,
                    'value' => $feature->value,
                    'description' => $feature->description,
                ])->values()->all();

                $product->options()->attach($option->id, [
                    'features' => json_encode($snapshot),
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Generar variantes
            |--------------------------------------------------------------------------
            */

            $product->load('options');

            $groups = $product->options->map(function ($option) {
                return collect(json_decode($option->pivot->features, true))
                    ->pluck('id')
                    ->map(fn ($id) => (int) $id)
                    ->all();
            })->all();

            if (empty($groups)) {
                continue;
            }

            $combinations = [[]];

            foreach ($groups as $group) {

                $newCombinations = [];

                foreach ($combinations as $combination) {
                    foreach ($group as $featureId) {
                        $newCombinations[] = [
                            ...$combination,
                            $featureId,
                        ];
                    }
                }

                $combinations = $newCombinations;
            }

            // Eliminar la variante predeterminada creada por ProductObserver.

            $product->variants()->delete();

            foreach ($combinations as $combination) {

                $variant = $product->variants()->create([
                    'sku' => $product->sku . '-' . implode('-', $combination),
                    'stock' => rand(0, 30),
                ]);

                $variant->features()->sync($combination);
            }
        }

        $this->command->info(
            "{$totalProducts} productos y sus variantes fueron creados correctamente."
        );
    }
}
