<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Se deja de vender desde un catálogo: cada producto del pedido se describe
 * con sus especificaciones (diseño, descripción, color y tipo de tela) y el
 * pedido lleva la localidad de entrega.
 *
 * - pedidos.localidad: lugar de entrega (texto libre).
 * - detalle_pedidos: producto_id pasa a ser opcional (los pedidos viejos lo
 *   conservan) y se agregan las especificaciones.
 * - producciones: se ligan al detalle (detalle_pedido_id); producto_id queda
 *   opcional para las producciones viejas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('localidad', 150)->nullable()->after('estado');
        });

        Schema::table('detalle_pedidos', function (Blueprint $table) {
            $table->unsignedBigInteger('producto_id')->nullable()->change();
            $table->string('diseno', 150)->nullable()->after('producto_id');
            $table->text('descripcion')->nullable()->after('diseno');
            $table->string('color_tela', 100)->nullable()->after('descripcion');
            $table->string('tipo_tela', 100)->nullable()->after('color_tela');
        });

        Schema::table('producciones', function (Blueprint $table) {
            $table->unsignedBigInteger('producto_id')->nullable()->change();
            $table->foreignId('detalle_pedido_id')->nullable()->after('producto_id')
                  ->constrained('detalle_pedidos')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('producciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('detalle_pedido_id');
        });

        Schema::table('detalle_pedidos', function (Blueprint $table) {
            $table->dropColumn(['diseno', 'descripcion', 'color_tela', 'tipo_tela']);
        });

        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('localidad');
        });
        // producto_id queda nullable: volverlo obligatorio fallaría con los pedidos nuevos.
    }
};
