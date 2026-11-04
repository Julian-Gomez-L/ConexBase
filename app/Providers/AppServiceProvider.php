<?php

namespace App\Providers;

use App\Interfaces\CategoriasInterface;
use App\Interfaces\ClientesInterface;
use App\Interfaces\HistorialPedidosInterface;
use App\Interfaces\ProduccionInterface;
use App\Interfaces\ProductosInterface;
use App\Interfaces\RolInterface;
use App\Interfaces\TrabajosTapicerosInterface;
use App\Interfaces\UsuarioInterface;
use App\Repositories\CategoriasRepository;
use App\Repositories\ClientesRepository;
use App\Repositories\HistorialPedidosRepository;
use App\Repositories\ProduccionRepository;
use App\Repositories\ProductosRepository;
use App\Repositories\RolRepository;
use App\Repositories\TrabajosTapicerosRepository;
use App\Repositories\UsuarioRepository;
use App\Interfaces\TokenAccesoInterface;
use App\Repositories\TokenAccesoRepository;
use App\Interfaces\CodigoRecuperacionInterface;
use App\Repositories\CodigoRecuperacionRepository;
use App\Interfaces\IntentosLoginInterface;
use App\Repositories\IntentosLoginRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

use App\Interfaces\PedidosInterface;
use App\Repositories\PedidosRepository;

use App\Interfaces\PagosInterface; 
use App\Repositories\PagosRepository;

use App\Interfaces\DetallePedidoInterface;
use App\Repositories\DetallePedidoRepository;




class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            TrabajosTapicerosInterface::class,
            TrabajosTapicerosRepository::class
        ); 

        $this->app->bind(
            ProduccionInterface::class,
            ProduccionRepository::class
        );

        $this->app->bind(
            ProductosInterface::class,
            ProductosRepository::class
        );

        $this->app->bind(
            HistorialPedidosInterface::class,
            HistorialPedidosRepository::class
        );

        $this->app->bind(
            ClientesInterface::class,
            ClientesRepository::class
        );

         $this->app->bind(
            CategoriasInterface::class,
            CategoriasRepository::class
        );

        $this->app->bind(
            RolInterface::class,
            RolRepository::class
        );

        $this->app->bind(
            UsuarioInterface::class,
            UsuarioRepository::class
        );


        $this->app->bind(
            PedidosInterface::class,
            PedidosRepository::class
        );

        $this->app->bind(
            PagosInterface::class,
            PagosRepository::class
        );

        $this->app->bind(
            DetallePedidoInterface::class,
            DetallePedidoRepository::class
        );

        $this->app->bind(
            TokenAccesoInterface::class,
            TokenAccesoRepository::class
        );

        $this->app->bind(
            IntentosLoginInterface::class,
            IntentosLoginRepository::class
        );

        $this->app->bind(
            CodigoRecuperacionInterface::class,
            CodigoRecuperacionRepository::class
        );
        
    }
    
    public function boot(): void
    {
        // Máximo 5 intentos de login por minuto por correo + IP (protege contra fuerza bruta)
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(Str::lower((string) $request->input('correo')) . '|' . $request->ip());
        });

        // Recuperación de administrador: máximo 3 intentos por hora por IP
        RateLimiter::for('recuperacion', function (Request $request) {
            return Limit::perHour(3)->by($request->ip());
        });
    }
    /**
     * Bootstrap any application services.
     */
    
}