<?php

namespace Tests\Feature;

use App\Models\IntentoLogin;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Registro de inicios de sesión fallidos (tabla intentos_login).
 */
class IntentosLoginTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $admin;
    private Usuario $vendedor;

    protected function setUp(): void
    {
        parent::setUp();

        $rolAdmin = Rol::create(['nombre' => 'Administrador', 'estado' => true]);
        $rolVendedor = Rol::create(['nombre' => 'Vendedor', 'estado' => true]);

        $this->admin = $this->crearUsuario('admin@conexbase.com', 'Carlos', 'Rodriguez', $rolAdmin->id);
        $this->vendedor = $this->crearUsuario('vendedor@conexbase.com', 'Juan', 'Perez', $rolVendedor->id);
    }

    private function crearUsuario(string $correo, string $nombre, string $apellido, int $rolId, bool $activo = true): Usuario
    {
        return Usuario::create([
            'documento' => (string) random_int(10000000, 99999999),
            'nombre' => $nombre,
            'apellido' => $apellido,
            'correo' => $correo,
            'password' => 'secreto123',
            'rol_id' => $rolId,
            'estado' => $activo,
        ]);
    }

    private function login(string $correo, string $password)
    {
        return $this->withHeaders(['User-Agent' => 'Navegador de prueba'])
            ->postJson('/api/auth/login', ['correo' => $correo, 'password' => $password]);
    }

    private function tokenDe(string $correo): string
    {
        return $this->login($correo, 'secreto123')->assertOk()->json('data.token');
    }

    public function test_contrasena_incorrecta_guarda_el_intento_con_nombre_rol_y_fecha(): void
    {
        $this->login('vendedor@conexbase.com', 'equivocada')
            ->assertStatus(401)
            ->assertJsonPath('error', 'INVALID_CREDENTIALS');

        $intento = IntentoLogin::sole();
        $this->assertSame('vendedor@conexbase.com', $intento->correo);
        $this->assertSame($this->vendedor->id, $intento->usuario_id);
        $this->assertSame('Juan Perez', $intento->nombre);
        $this->assertSame('Vendedor', $intento->rol);
        $this->assertSame(IntentoLogin::CONTRASENA_INCORRECTA, $intento->motivo);
        $this->assertSame('127.0.0.1', $intento->ip);
        $this->assertSame('Navegador de prueba', $intento->navegador);
        $this->assertTrue($intento->fecha->isToday());
    }

    public function test_correo_que_no_existe_se_guarda_sin_usuario(): void
    {
        $this->login('nadie@gmail.com', 'loquesea')->assertStatus(401);

        $intento = IntentoLogin::sole();
        $this->assertSame('nadie@gmail.com', $intento->correo);
        $this->assertNull($intento->usuario_id);
        $this->assertNull($intento->nombre);
        $this->assertNull($intento->rol);
        $this->assertSame(IntentoLogin::CORREO_NO_EXISTE, $intento->motivo);
    }

    public function test_usuario_inactivo_con_contrasena_correcta_se_guarda_como_inactivo(): void
    {
        $this->vendedor->update(['estado' => false]);

        $this->login('vendedor@conexbase.com', 'secreto123')->assertStatus(401);

        $this->assertSame(IntentoLogin::USUARIO_INACTIVO, IntentoLogin::sole()->motivo);
    }

    public function test_el_login_correcto_no_se_guarda(): void
    {
        $this->login('vendedor@conexbase.com', 'secreto123')->assertOk();

        $this->assertSame(0, IntentoLogin::count());
    }

    public function test_la_contrasena_escrita_nunca_se_guarda(): void
    {
        $this->login('vendedor@conexbase.com', 'MiClaveSecreta2026')->assertStatus(401);

        $fila = json_encode(IntentoLogin::sole()->getAttributes());
        $this->assertStringNotContainsString('MiClaveSecreta2026', $fila);
    }

    public function test_el_mensaje_al_usuario_no_revela_el_motivo(): void
    {
        $inexistente = $this->login('nadie@gmail.com', 'x')->json('message');
        $equivocada = $this->login('vendedor@conexbase.com', 'x')->json('message');

        $this->assertSame($inexistente, $equivocada);
    }

    public function test_el_administrador_ve_los_intentos_del_mas_reciente_al_mas_antiguo(): void
    {
        $this->travel(-10)->minutes();
        $this->login('vendedor@conexbase.com', 'primero');
        $this->travelBack();
        $this->login('nadie@gmail.com', 'segundo');

        $respuesta = $this->withToken($this->tokenDe('admin@conexbase.com'))
            ->getJson('/api/intentos-login')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');

        $this->assertSame('nadie@gmail.com', $respuesta->json('data.0.correo'));
        $this->assertSame('vendedor@conexbase.com', $respuesta->json('data.1.correo'));
        // Fecha con hora, en el formato de MySQL (hora de Colombia)
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $respuesta->json('data.0.fecha'));
    }

    public function test_otros_roles_no_pueden_ver_los_intentos(): void
    {
        $this->withToken($this->tokenDe('vendedor@conexbase.com'))
            ->getJson('/api/intentos-login')
            ->assertForbidden();
    }

    public function test_sin_sesion_no_se_pueden_ver_los_intentos(): void
    {
        $this->getJson('/api/intentos-login')->assertUnauthorized();
    }
}
