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
        Schema::create('clientes', function (Blueprint $table) {

         $table->id();
         $table->string("documento",20)->unique();
         $table->string("nombre",150);
         $table->string("telefono",20);
         $table->string("correo",150)->unique();
         $table->string("direccion",255)->nullable();
         $table->boolean("estado")->default(1);
         $table->timestamps();
         $table->softDeletes();
            //
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("clientes");
            //
    }

    };
