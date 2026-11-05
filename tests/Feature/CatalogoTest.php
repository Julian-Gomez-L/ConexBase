<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Catálogo: productos (con precio y medida) y categorías.
 * Solo el Administrador crea y edita; todos los usuarios con sesión pueden ver.
 */
class CatalogoTest extends TestCase
{
    use RefreshDatabase;

    private Categoria $camas;

    protected function setUp(): void
    {
        parent::setUp();

        $rolAdmin = Rol::create(['nombre' => 'Administrador', 'estado' => true]);
        $rolVendedor = Rol::create(['nombre' => 'Vendedor', 'estado' => true]);

        foreach ([['admin@conexbase.com', '1', $rolAdmin->id], ['vendedor@conexbase.com', '2', $rolVendedor->id]] as [$correo, $doc, $rol]) {
            Usuario::create([
                'documento' => $doc, 'nombre' => 'N', 'apellido' => 'A', 'correo' => $correo,
                'password' => 'secreto123', 'rol_id' => $rol, 'estado' => true,
            ]);
        }

        $this->camas = Categoria::create(['nombre' => 'Camas', 'estado' => true]);
    }

    private function como(string $correo): static
    {
        $token = $this->postJson('/api/auth/login', ['correo' => $correo, 'password' => 'secreto123'])->json('data.token');

        return $this->withToken($token);
    }

    public function test_el_administrador_crea_un_producto_con_precio_y_medida(): void
    {
        $this->como('admin@conexbase.com')
            ->postJson('/api/productos', [
                'nombre' => 'Base cama',
                'medida' => 'Doble 140x190',
                'precio' => 850000,
                'categoria_id' => $this->camas->id,
                'estado' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.medida', 'Doble 140x190');

        $producto = Producto::sole();
        $this->assertSame('Doble 140x190', $producto->medida);
        $this->assertSame('850000.00', $producto->precio);
    }

    public function test_la_medida_es_opcional(): void
    {
        $this->como('admin@conexbase.com')
            ->postJson('/api/productos', ['nombre' => 'Cojín', 'precio' => 45000, 'categoria_id' => $this->camas->id])
            ->assertCreated();

        $this->assertNull(Producto::sole()->medida);
    }

    public function test_el_administrador_cambia_la_medida_y_el_precio(): void
    {
        $producto = Producto::create(['nombre' => 'Base cama', 'medida' => 'Doble 140x190', 'precio' => 850000, 'categoria_id' => $this->camas->id]);

        $this->como('admin@conexbase.com')
            ->putJson("/api/productos/{$producto->id}", ['medida' => 'Queen 160x190', 'precio' => 990000])
            ->assertOk()
            ->assertJsonPath('data.medida', 'Queen 160x190');

        $this->assertSame('990000.00', $producto->fresh()->precio);
    }

    public function test_la_medida_tiene_un_maximo_y_el_mensaje_es_en_espanol(): void
    {
        $this->como('admin@conexbase.com')
            ->postJson('/api/productos', [
                'nombre' => 'Base cama',
                'medida' => str_repeat('x', 51),
                'precio' => 850000,
                'categoria_id' => $this->camas->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('errors.medida.0', 'La medida no puede tener más de 50 caracteres.');
    }

    public function test_el_vendedor_ve_los_productos_pero_no_puede_crearlos(): void
    {
        Producto::create(['nombre' => 'Base cama', 'medida' => 'Doble 140x190', 'precio' => 850000, 'categoria_id' => $this->camas->id]);
        $vendedor = $this->como('vendedor@conexbase.com');

        $vendedor->getJson('/api/productos')->assertOk()->assertJsonPath('data.0.medida', 'Doble 140x190');
        $vendedor->postJson('/api/productos', ['nombre' => 'X', 'precio' => 1, 'categoria_id' => $this->camas->id])->assertForbidden();
        $vendedor->postJson('/api/categorias', ['nombre' => 'Colchones'])->assertForbidden();
    }

    public function test_el_administrador_crea_y_desactiva_categorias(): void
    {
        $admin = $this->como('admin@conexbase.com');

        $id = $admin->postJson('/api/categorias', ['nombre' => 'Colchones', 'estado' => true])->assertCreated()->json('data.id');
        $admin->putJson("/api/categorias/{$id}", ['estado' => false])->assertOk();

        $this->assertFalse(Categoria::find($id)->estado);
        $admin->postJson('/api/categorias', ['nombre' => 'Colchones'])
            ->assertStatus(422)
            ->assertJsonPath('errors.nombre.0', 'Ya existe una categoría con ese nombre.');
    }
}
