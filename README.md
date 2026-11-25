# Meraki – Tienda online de papelería aesthetic

Meraki es una tienda online de papelería aesthetic desarrollada como proyecto académico. Permite explorar productos, gestionar un carrito de compras, realizar pedidos y administrar las operaciones de la tienda.

## Tecnologías utilizadas

### Backend
- PHP 8.3 o superior.
- Laravel 13.
- Inertia Laravel.
- Laravel Fortify.
- Spatie Laravel Permission.
- DomPDF.
- Laravel Excel.
- Mercado Pago SDK.
- Shopping Cart.

### Frontend
- React 19.
- TypeScript.
- Inertia.js React.
- Vite Plus.
- Tailwind CSS 4.
- Radix UI.
- Swiper.
- SweetAlert2.
- Sonner.
- Lucide React.
- Recharts.
- SortableJS.
- date-fns.

## Requisitos previos

Antes de instalar el proyecto, es necesario contar con:

- PHP 8.3 o superior.
- Composer.
- Node.js y npm.
- MySQL o MariaDB.
- Git.
- Ngrok (para probar las notificaciones de Mercado Pago mediante webhooks en el entorno local).

## Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/N9AA/TP-FINAL-PAW.git
cd TP-FINAL-PAW
```

### 2. Instalar las dependencias

Instalar las dependencias de PHP:

```bash
composer install
```

Instalar las dependencias del frontend:

```bash
npm ci
```

### 3. Configurar el entorno

Crear el archivo `.env` a partir del archivo de ejemplo.

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Generar la clave de la aplicación:

```bash
php artisan key:generate
```

### 4. Configurar la base de datos

Crear una base de datos en MySQL o MariaDB. Luego, configurar los siguientes valores en el archivo `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=meraki
DB_USERNAME=root
DB_PASSWORD=
```

Los valores deben ajustarse según la configuración local de cada desarrollador.

### 5. Ejecutar las migraciones y los seeders

Ejecutar las migraciones para crear las tablas:

```bash
php artisan migrate
```

Cargar los datos iniciales y de prueba:

```bash
php artisan db:seed
```

Los seeders generan los permisos, roles, familias, opciones, usuarios, direcciones, repartidores, productos, órdenes, envíos y portadas promocionales.

### 6. Configurar el almacenamiento

Crear el enlace simbólico para acceder a los archivos almacenados:

```bash
php artisan storage:link
```

## Usuarios de prueba

Al ejecutar los seeders, se crea automáticamente un usuario administrador para acceder al panel de administración.

### Administrador

| Dato | Valor |
|---|---|
| Nombre | Alejandra |
| Correo electrónico | alejandra@gmail.com |
| Contraseña | 12345678 |
| Rol | admin |

También se generan 20 usuarios adicionales mediante factories para disponer de datos de prueba.

**Importante:** estas credenciales son exclusivamente para el entorno de desarrollo y pruebas. No deben utilizarse en producción.

## Configuración de Mercado Pago

Para probar los pagos es necesario configurar las credenciales de Mercado Pago en el archivo `.env`, utilizando las variables de entorno que requiere la integración del proyecto.

No compartir ni subir credenciales privadas al repositorio.

## Configuración de Ngrok para Mercado Pago

Ngrok permite exponer temporalmente el servidor local a Internet para que Mercado Pago pueda enviar notificaciones a la aplicación mediante webhooks.

### 1. Instalar Ngrok

Descargar e instalar Ngrok desde su sitio oficial:

https://ngrok.com/download

Configurar la autenticación siguiendo la documentación oficial:

https://ngrok.com/docs/getting-started/

### 2. Iniciar el servidor Laravel

Desde una terminal, ejecutar:

```bash
php artisan serve
```

### 3. Iniciar Ngrok

Abrir otra terminal y ejecutar:

```bash
ngrok http 8000
```

Ngrok generará una URL pública HTTPS.

### 4. Configurar el webhook

Copiar la URL HTTPS generada por Ngrok y utilizarla para configurar el destino de las notificaciones en Mercado Pago.

La ruta del webhook definida en Laravel es:

```text
POST /webhooks/mercadopago
```

Por lo tanto, la URL completa tendrá el siguiente formato:

```text
https://TU-URL-DE-NGROK/webhooks/mercadopago
```

Reemplazar `TU-URL-DE-NGROK` por la dirección HTTPS que proporcione Ngrok.

**Importante:** la URL pública puede cambiar al reiniciar Ngrok. En ese caso, será necesario actualizar el destino del webhook en Mercado Pago.

Ngrok es necesario para probar localmente las notificaciones externas de Mercado Pago; no es necesario para ejecutar las funcionalidades que no dependen de recibir webhooks.

## Ejecución del proyecto

Para ejecutar la aplicación en el entorno local, abrir dos terminales dentro del directorio del proyecto.

**Terminal 1 – Servidor Laravel**

```bash
php artisan serve
```

**Terminal 2 – Servidor frontend**

```bash
npm run dev
```

Ingresar desde el navegador a:

http://127.0.0.1:8000

## Compilar el frontend para producción

Para generar los archivos optimizados del frontend:

```bash
npm run build
```

## Repositorio

https://github.com/N9AA/TP-FINAL-PAW
