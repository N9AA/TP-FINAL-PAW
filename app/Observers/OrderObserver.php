<?php
namespace App\Observers;

use App\Models\Order;
use App\Enums\OrderStatus;
use App\Mail\TicketOrderMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Throwable;

class OrderObserver
{
    public function created(Order $order): void
    {
        // No generar el ticket al crear una orden pendiente.
    }

    public function updated(Order $order): void
    {
        // Detectar cuando el pago es aprobado.
        if (
            !$order->wasChanged('status') ||
            $order->status !== OrderStatus::Processing
        ) {
            return;
        }

        // Generar el ticket si todavía no existe.
        if (empty($order->pdf_path)) {
            $pdf = Pdf::loadView('orders.ticket', [
                'order' => $order,
            ])->setPaper('a5');

            Storage::disk('public')->makeDirectory('tickets');

            $path = 'tickets/ticket-' . $order->id . '.pdf';

            Storage::disk('public')->put($path, $pdf->output());

            $order->updateQuietly([
                'pdf_path' => $path,
            ]);
        }

        $orderId = $order->getKey();

        // Enviar el correo después de confirmar la transacción.
        DB::afterCommit(function () use ($orderId) {
            try {
                $order = Order::with('user')->find($orderId);

                if (!$order) {
                    return;
                }

                // Evitar envíos duplicados.
                if ($order->ticket_email_sent_at) {
                    return;
                }

                // Comprobar que el ticket exista.
                if (
                    !$order->pdf_path ||
                    !Storage::disk('public')->exists($order->pdf_path)
                ) {
                    throw new \RuntimeException(
                        'No se encontró el PDF del ticket.'
                    );
                }

                // Comprobar el email del cliente.
                if (!$order->user || !$order->user->email) {
                    throw new \RuntimeException(
                        'La orden no tiene un cliente con email registrado.'
                    );
                }

                // Enviar el ticket existente como adjunto.
                Mail::to($order->user->email)
                    ->send(new TicketOrderMail($order));

                // Registrar la fecha de envío.
                $order->updateQuietly([
                    'ticket_email_sent_at' => now(),
                ]);

                Log::info('Ticket enviado correctamente.', [
                    'order_id' => $order->id,
                ]);

            } catch (Throwable $e) {
                Log::error('No se pudo enviar el ticket por email.', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                ]);
            }
        });
    }
}
