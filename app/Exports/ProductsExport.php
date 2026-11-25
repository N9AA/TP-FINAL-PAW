<?php
namespace App\Exports;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ProductsExport implements
    FromQuery,
    WithMapping,
    WithHeadings,
    ShouldAutoSize,
    WithEvents
{
    protected array $filtros;

    public function __construct(array $filtros = [])
    {
        $this->filtros = $filtros;
    }

    public function query(): Builder
    {
        $buscar = $this->filtros['buscar'] ?? '';
        $familia = $this->filtros['familia'] ?? '';
        $categoria = $this->filtros['categoria'] ?? '';
        $subcategoria = $this->filtros['subcategoria'] ?? '';
        $estado = $this->filtros['estado'] ?? '';
        $precioMin = $this->filtros['precio_min'] ?? '';
        $precioMax = $this->filtros['precio_max'] ?? '';
        $orden = $this->filtros['orden'] ?? 'id';
        $direccion = $this->filtros['direccion'] ?? 'desc';

        $ordenesPermitidos = [
            'id',
            'sku',
            'name',
            'price',
            'estado',
        ];

        if (!in_array($orden, $ordenesPermitidos, true)) {
            $orden = 'id';
        }

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'desc';
        }

        return Product::query()
            ->with([
                'variants.features.option',
                'subcategory.category.family',
            ])
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
            ->orderBy($orden, $direccion);
    }

    public function headings(): array
    {
        return [
            'Producto',
            'SKU producto',
            'Características',
            'SKU variante',
            'Precio',
            'Stock',
            'Estado',
        ];
    }

    public function map($product): array
    {
        $estado = (int) $product->estado === 1
            ? 'Activo'
            : 'Inactivo';

        if ($product->variants->isEmpty()) {
            return [[
                $product->name,
                (string) $product->sku,
                'Sin variantes',
                '',
                $product->price,
                '',
                $estado,
            ]];
        }

        return $product->variants->map(function ($variant) use ($product, $estado) {
            $caracteristicas = $variant->features
                ->map(function ($feature) {
                    $nombre = $feature->option?->name ?? 'Característica';

                    return $nombre . ': ' . $feature->value;
                })
                ->implode(', ');

            return [
                $product->name,
                (string) $product->sku,
                $caracteristicas !== ''
                    ? $caracteristicas
                    : 'Sin características',
                (string) ($variant->sku ?? ''),
                $product->price,
                $variant->stock,
                $estado,
            ];
        })->all();
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $ultimaFila = $sheet->getHighestRow();

                // Encabezados con el color principal de Meraki.
                $sheet->getStyle('A1:G1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => 'FFFFFF'],
                        'size' => 11,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '8C5770'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getRowDimension(1)->setRowHeight(30);

                if ($ultimaFila >= 2) {

                    // Alineación general.
                    $sheet->getStyle("A2:G{$ultimaFila}")
                        ->getAlignment()
                        ->setVertical(Alignment::VERTICAL_CENTER);

                    // Producto y características a la izquierda.
                    foreach (['A', 'C'] as $columna) {
                        $sheet->getStyle("{$columna}2:{$columna}{$ultimaFila}")
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    }

                    // Resto de las columnas centradas.
                    foreach (['B', 'D', 'E', 'F', 'G'] as $columna) {
                        $sheet->getStyle("{$columna}2:{$columna}{$ultimaFila}")
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }

                    // Ajustar texto de características.
                    $sheet->getStyle("C2:C{$ultimaFila}")
                        ->getAlignment()
                        ->setWrapText(true);

                    // Formato de precio.
                    $sheet->getStyle("E2:E{$ultimaFila}")
                        ->getNumberFormat()
                        ->setFormatCode('"$" #,##0.00');

                    // Bordes suaves de Meraki.
                    $sheet->getStyle("A1:G{$ultimaFila}")
                        ->getBorders()
                        ->getAllBorders()
                        ->applyFromArray([
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'E8DDE6'],
                        ]);

                    // Filas alternadas y colores de los estados.
                    for ($fila = 2; $fila <= $ultimaFila; $fila++) {

                        // Fondo alternado.
                        if ($fila % 2 === 0) {
                            $sheet->getStyle("A{$fila}:G{$fila}")
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID);

                            $sheet->getStyle("A{$fila}:G{$fila}")
                                ->getFill()
                                ->getStartColor()
                                ->setRGB('FAF7F9');
                        }

                        $sheet->getRowDimension($fila)->setRowHeight(25);

                        // Colores de los estados.
                        $estado = $sheet->getCell("G{$fila}")->getValue();

                        if ($estado === 'Activo') {
                            $fondo = 'DCFCE7';
                            $texto = '166534';
                        } else {
                            $fondo = 'F2BFBD';
                            $texto = '8B3030';
                        }

                        $sheet->getStyle("G{$fila}")->applyFromArray([
                            'font' => [
                                'bold' => true,
                                'color' => ['rgb' => $texto],
                            ],
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => $fondo],
                            ],
                        ]);
                    }
                }

                // Congelar encabezados.
                $sheet->freezePane('A2');

                // Activar filtros.
                $sheet->setAutoFilter("A1:G{$ultimaFila}");
            },
        ];
    }
}
