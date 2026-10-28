<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trabajos_tapiceros', function (Blueprint $table) {

            $table->foreignId('produccion_id')
                  ->constrained('producciones')
                  ->onDelete('cascade');

            $table->foreignId('usuario_id')
                  ->constrained('usuarios')
                  ->onDelete('cascade');

            $table->id()->unique();
            $table->text("descripcion");
            $table->date("fecha_inicio");
            $table->date("fecha_fin")->nullable();
            $table->string("estado", 50);
            $table->string("observaciones")->nullable();
            $table->timestamps();   
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trabajos_tapiceros');
    }
};
