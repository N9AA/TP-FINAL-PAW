 @extends('emails.layout')

@section('content')

    <h2 style="color: #8C5770; margin-top: 0;">
        ¡Gracias por tu compra!
    </h2>

    <p>
        Hola {{ $order->user->name ?? 'cliente' }},
    </p>

    <p>
        Tu compra en Meraki fue confirmada correctamente.
    </p>

    <p>
        Adjuntamos tu comprobante de compra en formato PDF.
    </p>

    <p>
        ¡Esperamos que disfrutes tu compra!
    </p>

@endsection