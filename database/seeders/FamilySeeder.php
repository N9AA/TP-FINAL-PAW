<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Family;
use App\Models\Category;
use App\Models\Subcategory;

class FamilySeeder extends Seeder
{
    public function run(): void
    {
        $families = [
            'Papelería' => [
                'Cuadernos y libretas' => [
                    'Cuadernos universitarios',
                    'Libretas A5',
                    'Libretas pequeñas',
                    'Cuadernos anillados',
                    'Cuadernos de tapa dura',
                    'Cuadernos de tapa blanda',
                    'Repuestos para cuadernos',
                ],
                'Agendas y planificación' => [
                    'Agendas anuales',
                    'Planificadores semanales',
                    'Planificadores mensuales',
                    'Planificadores diarios',
                    'Calendarios',
                    'Organizadores de estudio',
                ],
                'Escritura' => [
                    'Lapiceras',
                    'Lápices',
                    'Portaminas',
                    'Resaltadores',
                    'Marcadores',
                    'Correctores',
                    'Repuestos de tinta',
                ],
                'Papeles y notas' => [
                    'Notas adhesivas',
                    'Blocs de notas',
                    'Hojas de colores',
                    'Papel decorativo',
                    'Tarjetas',
                    'Separadores de página',
                ],
                'Carpetas y archivadores' => [
                    'Carpetas',
                    'Archivadores',
                    'Separadores',
                    'Folios y fundas',
                    'Portadocumentos',
                ],
            ],

            'Arte y creatividad' => [
                'Dibujo y pintura' => [
                    'Lápices de colores',
                    'Acuarelas',
                    'Pinturas acrílicas',
                    'Pinceles',
                    'Blocks de dibujo',
                    'Cuadernos de bocetos',
                ],
                'Lettering y caligrafía' => [
                    'Brush pens',
                    'Plumones de lettering',
                    'Plumas de caligrafía',
                    'Cuadernos de lettering',
                    'Guías de práctica',
                ],
                'Manualidades' => [
                    'Tijeras decorativas',
                    'Pegamentos',
                    'Troqueladoras',
                    'Sellos',
                    'Papeles para manualidades',
                ],
            ],

            'Stickers y decoración' => [
                'Stickers' => [
                    'Stickers decorativos',
                    'Stickers para agendas',
                    'Stickers temáticos',
                    'Stickers transparentes',
                    'Stickers con frases',
                ],
                'Washi tapes y cintas' => [
                    'Washi tapes estampadas',
                    'Cintas decorativas',
                    'Sets de cintas',
                ],
                'Sellos y accesorios decorativos' => [
                    'Sellos decorativos',
                    'Tintas para sellos',
                    'Stencils',
                    'Clips decorativos',
                ],
            ],

            'Organización de escritorio' => [
                'Organizadores' => [
                    'Organizadores de escritorio',
                    'Portalápices',
                    'Bandejas organizadoras',
                    'Cajas organizadoras',
                    'Portanotas',
                ],
                'Accesorios de escritorio' => [
                    'Clips',
                    'Broches sujetapapeles',
                    'Gomas de borrar',
                    'Sacapuntas',
                    'Reglas',
                    'Correctores',
                ],
                'Iluminación y soportes' => [
                    'Soportes para libros',
                    'Soportes para celular',
                    'Lámparas de escritorio',
                ],
            ],

            'Cartucheras y estuches' => [
                'Cartucheras' => [
                    'Cartucheras simples',
                    'Cartucheras con compartimentos',
                    'Cartucheras transparentes',
                    'Cartucheras estampadas',
                ],
                'Estuches' => [
                    'Estuches para lápices',
                    'Estuches pequeños',
                    'Bolsitas organizadoras',
                ],
            ],

            'Regalos y kits' => [
                'Kits de papelería' => [
                    'Kits de estudio',
                    'Kits de escritura',
                    'Kits de lettering',
                    'Kits de organización',
                ],
                'Sets de regalo' => [
                    'Sets de cuadernos y lapiceras',
                    'Sets de stickers',
                    'Sets de notas adhesivas',
                    'Cajas de regalo',
                ],
                'Tarjetas y envoltorios' => [
                    'Tarjetas de felicitación',
                    'Tarjetas de agradecimiento',
                    'Papel de regalo',
                    'Bolsas de regalo',
                    'Etiquetas decorativas',
                ],
            ],
        ];

        foreach ($families as $familyName => $categories) {
            $family = Family::firstOrCreate([
                'name' => $familyName,
            ]);

            foreach ($categories as $categoryName => $subcategories) {
                $category = Category::firstOrCreate([
                    'name' => $categoryName,
                    'family_id' => $family->id,
                ]);

                foreach ($subcategories as $subcategoryName) {
                    Subcategory::firstOrCreate([
                        'name' => $subcategoryName,
                        'category_id' => $category->id,
                    ]);
                }
            }
        }
    }
}
