<?php

namespace Tests\Feature;

use App\Models\IntentoLogin;
use App\Models\Rol;
use App\Models\Usuario;
use App\Services\RecuperacionAdminService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Código de recuperación de administrador.
 */
class RecuperacionAdminTest extends TestCase
{
    use RefreshDatabase;

    private Rol $rolAdmin;
    private Usuario $admin;
    private Usuario $vendedor;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $this->rolAdmin = Rol::create(['nombre' => 'Administrador', 'estado' => true]);
        $rolVendedor = Rol::create(['nombre' => 'Vendedor', 'estado' => true]);

        $this->admin = $this->crearUsuario('admin@conexbase.com', '1001', $this->rolAdmin->id);
        $this->vendedor = $this->crearUsuario('vendedor@conexbase.com', '1002', $rolVendedor->id);
    }

    private function crearUsuario(string $correo, string $documento, int $rolId): Usuario
    {
        return Usuario::create([
            'documento' => $documento,
            'nombre' => 'Nombre',
            'apellido' => 'Apellido',
            'correo' => $correo,
            'password' => 'secreto123',
            'rol_id' => $rolId,
            'estado' => true,
        ]);
    }

    private function token(string $correo, string $password = 'secreto123'): string
    {
        return $this->postJson('/api/auth/login', ['correo' => $correo, 'password' => $password])
            ->assertOk()
            ->json('data.token');
    }

    /** Genera un código como lo haría el Administrador desde la pantalla. */
    private function generarCodigo(): string
    {
        return app(RecuperacionAdminService::class)->generar($this->admin)['codigo'];
    }

    private function recuperar(string $codigo, array $cambios = [])
    {
        return $this->postJson('/api/auth/recuperar-admin', array_merge([
            'codigo' => $codigo,
            'documento' => '9999',
            'nombre' => 'Dueño',
            'apellido' => 'Empresa',
            'correo' => 'dueno@conexbase.com',
            'password' => 'nuevaClave2026',
            'password_confirmation' => 'nuevaClave2026',
        ], $cambios));
    }

    // ── Generar el código ────────────────────────────────────────────────

    public function test_el_administrador_genera_un_codigo_y_solo_se_guarda_cifrado(): void
    {
        $respuesta = $this->withToken($this->token('admin@conexbase.com'))
            ->postJson('/api/recuperacion-admin/codigo')
            ->assertCreated();

        $codigo = $respuesta->json('data.codigo');
        $this->assertMatchesRegularExpression('/^([A-Z2-9]{4}-){4}[A-Z2-9]{4}$/', $codigo);

        $archivo = Storage::disk('local')->get('seguridad/codigo-recuperacion-admin.json');
        $this->assertStringNotContainsString($codigo, $archivo);
        $this->assertStringNotContainsString(str_replace('-', '', $codigo), $archivo);
    }

    public function test_el_estado_dice_si_hay_codigo_pero_nunca_lo_muestra(): void
    {
        $token = $this->token('admin@conexbase.com');

        $this->withToken($token)->getJson('/api/recuperacion-admin')
            ->assertOk()
            ->assertJsonPath('data.configurado', false);

        $this->generarCodigo();

        $respuesta = $this->withToken($token)->getJson('/api/recuperacion-admin')
            ->assertOk()
            ->assertJsonPath('data.configurado', true)
            ->assertJsonPath('data.generado_por', 'Nombre Apellido');
        $this->assertArrayNotHasKey('codigo', $respuesta->json('data'));
        $this->assertArrayNotHasKey('hash', $respuesta->json('data'));
    }

    public function test_otros_roles_no_pueden_generar_ni_consultar_el_codigo(): void
    {
        $token = $this->token('vendedor@conexbase.com');

        $this->withToken($token)->postJson('/api/recuperacion-admin/codigo')->assertForbidden();
        $this->withToken($token)->getJson('/api/recuperacion-admin')->assertForbidden();
    }

    // ── Recuperar el acceso ──────────────────────────────────────────────

    public function test_no_funciona_mientras_haya_un_administrador_activo(): void
    {
        $codigo = $this->generarCodigo();

        $this->recuperar($codigo)
            ->assertStatus(409)
            ->assertJsonPath('error', 'RECUPERACION_NO_DISPONIBLE');

        $this->assertNull(Usuario::where('correo', 'dueno@conexbase.com')->first());
    }

    public function test_sin_administradores_el_codigo_crea_uno_nuevo_que_puede_entrar(): void
    {
        $codigo = $this->generarCodigo();
        $this->admin->update(['estado' => false]);

        $this->recuperar($codigo)->assertCreated();

        $nuevo = Usuario::where('correo', 'dueno@conexbase.com')->first();
        $this->assertSame($this->rolAdmin->id, $nuevo->rol_id);
        $this->assertTrue((bool) $nuevo->estado);

        $this->token('dueno@conexbase.com', 'nuevaClave2026');
    }

    public function test_el_codigo_es_de_un_solo_uso(): void
    {
        $codigo = $this->generarCodigo();
        $this->admin->update(['estado' => false]);
        $this->recuperar($codigo)->assertCreated();

        // Aunque se vuelva a quedar sin administradores, el mismo código ya no sirve
        Usuario::where('correo', 'dueno@conexbase.com')->update(['estado' => false]);

        $this->recuperar($codigo, ['correo' => 'otro@conexbase.com', 'documento' => '8888'])
            ->assertStatus(409)
            ->assertJsonPath('error', 'SIN_CODIGO_RECUPERACION');
    }

    public function test_acepta_el_codigo_en_minusculas_y_con_espacios(): void
    {
        $codigo = $this->generarCodigo();
        $this->admin->update(['estado' => false]);

        $this->recuperar(strtolower(str_replace('-', ' ', $codigo)))->assertCreated();
    }

    public function test_un_codigo_equivocado_no_crea_nada_y_queda_registrado(): void
    {
        $this->generarCodigo();
        $this->admin->update(['estado' => false]);

        $this->recuperar('AAAA-BBBB-CCCC-DDDD-EEEE')
            ->assertStatus(422)
            ->assertJsonPath('error', 'CODIGO_RECUPERACION_INVALIDO');

        $this->assertNull(Usuario::where('correo', 'dueno@conexbase.com')->first());
        $intento = IntentoLogin::sole();
        $this->assertSame(RecuperacionAdminService::MOTIVO_CODIGO_INVALIDO, $intento->motivo);
        $this->assertSame('dueno@conexbase.com', $intento->correo);
    }

    public function test_si_el_correo_ya_existe_reactiva_a_ese_usuario_como_administrador(): void
    {
        $codigo = $this->generarCodigo();
        // Alguien desactivó al administrador y además lo eliminó
        $this->admin->update(['estado' => false]);
        $this->admin->delete();

        $this->recuperar($codigo, ['correo' => 'admin@conexbase.com'])->assertCreated();

        $admin = Usuario::where('correo', 'admin@conexbase.com')->first();
        $this->assertNotNull($admin);
        $this->assertTrue((bool) $admin->estado);
        $this->assertSame(1, Usuario::withTrashed()->where('correo', 'admin@conexbase.com')->count());

        $this->token('admin@conexbase.com', 'nuevaClave2026');
    }

    public function test_si_borraron_el_rol_administrador_lo_vuelve_a_crear(): void
    {
        $codigo = $this->generarCodigo();
        $this->admin->update(['estado' => false]);
        $this->rolAdmin->delete();

        $this->recuperar($codigo)->assertCreated();

        $nuevo = Usuario::with('rol')->where('correo', 'dueno@conexbase.com')->first();
        $this->assertSame('Administrador', $nuevo->rol->nombre);
    }

    public function test_un_documento_repetido_se_explica_en_espanol(): void
    {
        $codigo = $this->generarCodigo();
        $this->admin->update(['estado' => false]);

        $this->recuperar($codigo, ['documento' => '1002']) // el del vendedor
            ->assertStatus(422)
            ->assertJsonValidationErrors(['documento']);

        // El código no se gastó
        $this->recuperar($codigo, ['documento' => '7777'])->assertCreated();
    }

    public function test_maximo_tres_intentos_por_hora(): void
    {
        $this->generarCodigo();
        $this->admin->update(['estado' => false]);

        for ($i = 0; $i < 3; $i++) {
            $this->recuperar('MALO-MALO-MALO-MALO-MALO')->assertStatus(422);
        }

        $this->recuperar('MALO-MALO-MALO-MALO-MALO')
            ->assertStatus(429)
            ->assertJsonPath('error', 'TOO_MANY_REQUESTS')
            ->assertJsonPath('message', 'Demasiados intentos. Espera 60 minutos e inténtalo de nuevo.');
    }
}
