<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cuántas unidades de la producción le tocan a cada tapicero. Permite repartir
 * una producción de varias unidades (ej. 6 camas) entre varios tapiceros
 * (ej. 3 + 2 + 1). Es nullable: los trabajos que ya existían quedan en NULL,
 * que significa "todas las unidades de la producción".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trabajos_tapiceros', function (Blueprint $table) {
            $table->unsignedInteger('cantidad')->nullable()->after('usuario_id');
        });
    }

    public function down(): void
    {
        Schema::table('trabajos_tapiceros', function (Blueprint $table) {
            $table->dropColumn('cantidad');
        });
    }
};
