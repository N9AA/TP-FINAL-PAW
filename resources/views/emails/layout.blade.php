
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meraki</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F9; font-family: Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color: #FAF7F9; padding: 30px 10px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0"
                       style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #E8DDE6;">

                    <tr>
                        <td align="center"
                            style="padding: 28px; background-color: #8C5770; color: #ffffff; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; font-size: 28px;">Meraki</h1>
                            <p style="margin: 8px 0 0; font-size: 14px;">
                                Papelería con encanto
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px; color: #5F4665; font-size: 15px; line-height: 1.6;">
                            @yield('content')
                        </td>
                    </tr>

                    <tr>
                        <td align="center"
                            style="padding: 20px; background-color: #FAF7F9; color: #8C5770; font-size: 12px; border-radius: 0 0 12px 12px; border-top: 1px solid #E8DDE6;">
                            Este es un correo automático. Por favor, no respondas a este mensaje.
                            <br>
                            © {{ date('Y') }} Meraki
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
