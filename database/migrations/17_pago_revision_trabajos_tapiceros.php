<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pago y revisión de los trabajos de tapicería terminados:
 * - `valor`: lo que se le paga al tapicero por ese trabajo (lo pone Producción
 *   o el Administrador). Con él se suma lo que hizo cada tapicero en la semana.
 * - `observacion_valor`: nota opcional de quien puso el valor.
 * - `revisado_en` / `revisado_por`: el gerente (Administrador) revisó el trabajo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trabajos_tapiceros', function (Blueprint $table) {
            $table->decimal('valor', 12, 2)->nullable()->after('observaciones');
            $table->string('observacion_valor', 255)->nullable()->after('valor');
            $table->dateTime('revisado_en')->nullable()->after('observacion_valor');
            $table->foreignId('revisado_por')->nullable()->after('revisado_en')
                  ->constrained('usuarios')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('trabajos_tapiceros', function (Blueprint $table) {
            $table->dropConstrainedForeignId('revisado_por');
            $table->dropColumn(['valor', 'observacion_valor', 'revisado_en']);
        });
    }
};
