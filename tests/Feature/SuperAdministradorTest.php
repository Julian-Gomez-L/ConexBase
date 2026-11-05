<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Super Administrador vs. Administrador (ADR-0008).
 */
class SuperAdministradorTest extends TestCase
{
    use RefreshDatabase;

    private Rol $rolSuper;
    private Rol $rolAdmin;
    private Rol $rolVendedor;
    private Usuario $super;
    private Usuario $admin;
    private Usuario $vendedor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rolSuper = Rol::where('nombre', Roles::SUPERADMIN)->firstOrFail(); // lo crea la migración 15
        $this->rolAdmin = Rol::create(['nombre' => Roles::ADMIN, 'estado' => true]);
        $this->rolVendedor = Rol::create(['nombre' => Roles::VENDEDOR, 'estado' => true]);

        $this->super = $this->crearUsuario('super@conexbase.com', '1', $this->rolSuper->id);
        $this->admin = $this->crearUsuario('admin@conexbase.com', '2', $this->rolAdmin->id);
        $this->vendedor = $this->crearUsuario('vendedor@conexbase.com', '3', $this->rolVendedor->id);
    }

    private function crearUsuario(string $correo, string $documento, int $rolId): Usuario
    {
        return Usuario::create([
            'documento' => $documento, 'nombre' => 'N', 'apellido' => 'A', 'correo' => $correo,
            'password' => 'secreto123', 'rol_id' => $rolId, 'estado' => true,
        ]);
    }

    private function como(string $correo): static
    {
        $token = $this->postJson('/api/auth/login', ['correo' => $correo, 'password' => 'secreto123'])->json('data.token');

        return $this->withToken($token);
    }

    private function datosUsuario(array $cambios = []): array
    {
        return array_merge([
            'documento' => '99', 'nombre' => 'Nuevo', 'apellido' => 'Usuario', 'correo' => 'nuevo@conexbase.com',
            'password' => 'secreto123', 'rol_id' => $this->rolVendedor->id, 'estado' => true,
        ], $cambios);
    }

    // ── Usuarios y roles: el Administrador solo mira ─────────────────────

    public function test_el_administrador_ve_los_usuarios_pero_no_puede_modificarlos(): void
    {
        $admin = $this->como('admin@conexbase.com');

        $admin->getJson('/api/usuarios')->assertOk();
        $admin->postJson('/api/usuarios', $this->datosUsuario())->assertForbidden();
        $admin->putJson("/api/usuarios/{$this->vendedor->id}", ['estado' => false])->assertForbidden();
        $admin->deleteJson("/api/usuarios/{$this->vendedor->id}")->assertForbidden();
        $admin->postJson('/api/roles', ['nombre' => 'Contador'])->assertForbidden();

        $this->assertTrue((bool) $this->vendedor->fresh()->estado);
    }

    public function test_el_super_administrador_crea_usuarios_y_cambia_roles(): void
    {
        $super = $this->como('super@conexbase.com');

        $super->postJson('/api/usuarios', $this->datosUsuario())->assertCreated();
        $super->putJson("/api/usuarios/{$this->vendedor->id}", ['rol_id' => $this->rolAdmin->id])->assertOk();

        $this->assertSame($this->rolAdmin->id, $this->vendedor->fresh()->rol_id);
    }

    public function test_el_super_administrador_puede_crear_otro_super_administrador(): void
    {
        $this->como('super@conexbase.com')
            ->postJson('/api/usuarios', $this->datosUsuario(['rol_id' => $this->rolSuper->id]))
            ->assertCreated();

        $this->assertSame(2, Usuario::where('rol_id', $this->rolSuper->id)->count());
    }

    // ── Nunca sin Super Administrador ────────────────────────────────────

    public function test_no_se_puede_desactivar_ni_cambiar_de_rol_al_ultimo_super_administrador(): void
    {
        $super = $this->como('super@conexbase.com');

        $super->putJson("/api/usuarios/{$this->super->id}", ['estado' => false])
            ->assertStatus(422)
            ->assertJsonPath('errors.rol_id.0', 'Es el único Super Administrador activo: asigna primero el rol a otra persona.');
        $super->putJson("/api/usuarios/{$this->super->id}", ['rol_id' => $this->rolAdmin->id])->assertStatus(422);
        $super->deleteJson("/api/usuarios/{$this->super->id}")->assertStatus(422);

        $this->assertTrue((bool) $this->super->fresh()->estado);
    }

    public function test_con_dos_super_administradores_si_se_puede_desactivar_uno(): void
    {
        $otro = $this->crearUsuario('otro@conexbase.com', '4', $this->rolSuper->id);

        $this->como('super@conexbase.com')
            ->putJson("/api/usuarios/{$otro->id}", ['estado' => false])
            ->assertOk();
    }

    public function test_el_rol_super_administrador_no_se_renombra_desactiva_ni_elimina(): void
    {
        $super = $this->como('super@conexbase.com');

        $super->putJson("/api/roles/{$this->rolSuper->id}", ['nombre' => 'Jefe'])->assertStatus(422);
        $super->putJson("/api/roles/{$this->rolSuper->id}", ['estado' => false])->assertStatus(422);
        $super->deleteJson("/api/roles/{$this->rolSuper->id}")->assertStatus(422);
        $super->putJson("/api/roles/{$this->rolSuper->id}", ['descripcion' => 'Dueño de la empresa'])->assertOk();
    }

    // ── Todo lo demás: igual que el Administrador ────────────────────────

    public function test_el_super_administrador_hereda_todo_lo_del_administrador(): void
    {
        foreach (['super@conexbase.com', 'admin@conexbase.com'] as $i => $correo) {
            $this->como($correo)->postJson('/api/categorias', ['nombre' => "Categoría {$i}"])->assertCreated();
            $this->como($correo)->getJson('/api/intentos-login')->assertOk();
        }
    }

    public function test_el_middleware_agrega_el_super_administrador_donde_esta_el_administrador(): void
    {
        $this->assertSame('rol:Super Administrador,Administrador,Vendedor', Roles::middleware(Roles::ADMIN, Roles::VENDEDOR));
        $this->assertSame('rol:Vendedor', Roles::middleware(Roles::VENDEDOR));
        $this->assertSame('rol:Super Administrador', Roles::middleware(Roles::SUPERADMIN));
    }
}
