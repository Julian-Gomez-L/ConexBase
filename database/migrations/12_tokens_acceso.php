<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tokens de acceso (Bearer) emitidos al iniciar sesión.
     * Solo se guarda el HASH (sha256) del token: el valor real únicamente lo recibe el cliente.
     */
    public function up(): void
    {
        Schema::create('tokens_acceso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')
                ->constrained('usuarios')
                ->onDelete('cascade');
            $table->char('token', 64)->unique();
            $table->dateTime('expira_en');
            $table->dateTime('ultimo_uso_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tokens_acceso');
    }
};
