<?php
namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Variant;
use Gloudemans\Shoppingcart\Facades\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ShippingController extends Controller
{
    public function index(): Response
    {
        Cart::instance('shopping');

        $user = auth()->user();

        $addresses = Address::where('user_id', $user->id)
            ->orderByDesc('default')
            ->latest()
            ->get();

        $cartItems = Cart::content()->map(function ($item) {
            $options = $item->options->toArray();

            $variantId = $options['variant_id'] ?? null;
            $sku = $options['sku'] ?? null;

            $variant = null;

            if ($variantId) {
                $variant = Variant::where('id', $variantId)
                    ->where('sku', $sku)
                    ->first();
            } elseif ($sku) {
                $variant = Variant::where('sku', $sku)->first();
            }

            return [
                'rowId' => $item->rowId,
                'id' => $item->id,
                'name' => $item->name,
                'qty' => $item->qty,
                'price' => (float) $item->price,
                'options' => [
                    'image' => $options['image'] ?? null,
                    'sku' => $variant?->sku ?? $sku,
                    'variant_id' => $variant?->id,
                    'stock' => (int) ($variant?->stock ?? 0),
                    'features' => $options['features'] ?? [],
                ],
            ];
        })->values();

        $cartSubtotal = $cartItems
            ->filter(function ($item) {
                return $item['options']['variant_id'] !== null
                    && $item['options']['stock'] > 0
                    && $item['qty'] <= $item['options']['stock'];
            })
            ->sum(function ($item) {
                return $item['price'] * $item['qty'];
            });

        return Inertia::render('shipping/Index', [
            'addresses' => $addresses,
            'user' => [
                'name' => $user->name,
                'last_name' => $user->last_name,
                'document_type' => $user->document_type,
                'document' => $user->document,
                'phone' => $user->phone,
            ],
            'cartItems' => $cartItems,
            'cartCount' => Cart::count(),
            'cartSubtotal' => (float) $cartSubtotal,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateAddress($request);

        if ((int) $validated['receiver'] === 1) {
            $validated['receiver_info'] = $this->getCurrentUserReceiverInfo();
        }

        $validated['user_id'] = auth()->id();

        DB::transaction(function () use (&$validated) {
            $makeDefault = (bool) ($validated['default'] ?? false);

            if ($makeDefault) {
                Address::where('user_id', auth()->id())
                    ->update(['default' => false]);
            }

            if (! Address::where('user_id', auth()->id())->exists()) {
                $validated['default'] = true;
            }

            Address::create($validated);
        });

        return redirect()
            ->route('shipping.index')
            ->with('swal', [
                'id' => uniqid(),
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'La dirección se guardó correctamente.',
            ]);
    }

    public function update(Request $request, Address $address): RedirectResponse
    {
        $this->authorizeAddress($address);

        $validated = $this->validateAddress($request);

        if ((int) $validated['receiver'] === 1) {
            $validated['receiver_info'] = $this->getCurrentUserReceiverInfo();
        }

        DB::transaction(function () use ($address, &$validated) {
            if ((bool) ($validated['default'] ?? false)) {
                Address::where('user_id', auth()->id())
                    ->where('id', '!=', $address->id)
                    ->update(['default' => false]);
            }

            $address->update($validated);
        });

        return redirect()
            ->route('shipping.index')
            ->with('swal', [
                'id' => uniqid(),
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'La dirección se actualizó correctamente.',
            ]);
    }

    public function destroy(Address $address): RedirectResponse
    {
        $this->authorizeAddress($address);

        DB::transaction(function () use ($address) {
            $wasDefault = $address->default;

            $address->delete();

            if ($wasDefault) {
                $nextAddress = Address::where('user_id', auth()->id())
                    ->latest()
                    ->first();

                if ($nextAddress) {
                    $nextAddress->update(['default' => true]);
                }
            }
        });

        return redirect()
            ->route('shipping.index')
            ->with('swal', [
                'id' => uniqid(),
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'La dirección se eliminó correctamente.',
            ]);
    }

    public function setDefault(Address $address): RedirectResponse
    {
        $this->authorizeAddress($address);

        DB::transaction(function () use ($address) {
            Address::where('user_id', auth()->id())
                ->update(['default' => false]);

            $address->update(['default' => true]);
        });

        return redirect()
            ->route('shipping.index')
            ->with('swal', [
                'id' => uniqid(),
                'icon' => 'success',
                'title' => '¡Bien hecho!',
                'text' => 'La dirección predeterminada se actualizó correctamente.',
            ]);
    }

    private function validateAddress(Request $request): array
    {
        return $request->validate([
            'type' => ['required', 'integer', Rule::in([1, 2])],
            'description' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'reference' => ['required', 'string', 'max:255'],
            'receiver' => ['required', 'string', Rule::in(['1', '2'])],
            'receiver_info' => [
                Rule::requiredIf((string) $request->input('receiver') === '2'),
                'array',
            ],
            'receiver_info.name' => [
                Rule::requiredIf((string) $request->input('receiver') === '2'),
                'nullable',
                'string',
                'max:255',
            ],
            'receiver_info.last_name' => [
                Rule::requiredIf((string) $request->input('receiver') === '2'),
                'nullable',
                'string',
                'max:255',
            ],
            'receiver_info.document_type' => [
                Rule::requiredIf((string) $request->input('receiver') === '2'),
                'nullable',
                'integer',
            ],
            'receiver_info.document' => [
                Rule::requiredIf((string) $request->input('receiver') === '2'),
                'nullable',
                'string',
                'max:255',
            ],
            'receiver_info.phone' => [
                Rule::requiredIf((string) $request->input('receiver') === '2'),
                'nullable',
                'string',
                'max:30',
            ],
            'default' => ['nullable', 'boolean'],
        ]);
    }

    private function getCurrentUserReceiverInfo(): array
    {
        $user = auth()->user();

        return [
            'name' => $user->name,
            'last_name' => $user->last_name,
            'document_type' => $user->document_type,
            'document' => $user->document,
            'phone' => $user->phone,
        ];
    }

    private function authorizeAddress(Address $address): void
    {
        abort_unless($address->user_id === auth()->id(), 403);
    }
}
