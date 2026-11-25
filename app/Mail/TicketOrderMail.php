<?php
namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketOrderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu comprobante de compra - Meraki'
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.ticket',
            with: [
                'order' => $this->order,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk(
                'public',
                $this->order->pdf_path
            )
                ->as('ticket-' . $this->order->id . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
