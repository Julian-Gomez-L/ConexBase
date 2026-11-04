<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Registro de intentos de inicio de sesión fallidos (auditoría).
 *
 * Guarda una "foto" del momento: el nombre y el rol se copian como texto para
 * que el registro no cambie si después se edita o se desactiva el usuario.
 * La contraseña escrita NUNCA se guarda.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intentos_login', function (Blueprint $table) {
            $table->id();
            $table->string('correo', 150);
            // null si el correo no pertenece a ningún usuario
            $table->foreignId('usuario_id')
                ->nullable()
                ->constrained('usuarios')
                ->nullOnDelete();
            $table->string('nombre', 201)->nullable();
            $table->string('rol', 100)->nullable();
            $table->string('motivo', 50);
            $table->string('ip', 45)->nullable();
            $table->string('navegador', 255)->nullable();
            $table->dateTime('fecha')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intentos_login');
    }
};
