<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Recargo del pedido. Hoy solo lo usa el pago con Addi: se paga todo por
 * anticipado con un 10 % adicional sobre el valor de los productos.
 * `total` ya incluye el recargo; los pedidos anteriores quedan en 0.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->decimal('recargo', 12, 2)->default(0)->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('recargo');
        });
    }
};
