<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Medida del producto (ej. "Doble 140x190"). Cada medida es un producto aparte
 * con su propio precio. Es opcional: hay productos sin medida y los que ya
 * existían quedan "sin medida".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->string('medida', 50)->nullable()->after('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('medida');
        });
    }
};
