import { useState } from 'react';
import { useStore } from '../state/store';
import { categoriasProducto, unidadesMedida } from '../data/mockData';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const emptyProduct = {
  sku: '',
  nombre: '',
  categoria: 'Sanitarios',
  subcategoria: '',
  precio: 0,
  stock: 0,
  unidadMedida: 'unidad',
  proveedor: '',
};

export default function Productos() {
  const { state, addProduct, editProduct, deleteProduct } = useStore();
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  const filtered = state.productos.filter((p) => {
    if (filtroCategoria !== 'Todas' && p.categoria !== filtroCategoria) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.proveedor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openNew = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.sku.trim() || !form.nombre.trim()) return;
    if (editingId) {
      editProduct({ ...form, id: editingId });
    } else {
      addProduct(form);
    }
    setShowForm(false);
    setForm(emptyProduct);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Productos</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={18} className="text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary bg-background"
            />
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
          >
            <option value="Todas">Todas las categorías</option>
            {categoriasProducto.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background">
              <tr className="text-left text-text-muted">
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium text-right">Precio</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-background">
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{p.nombre}</td>
                  <td className="px-4 py-3 text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      {p.categoria}
                      {p.subcategoria && (
                        <span className="text-xs text-text-muted">| {p.subcategoria}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    $ {p.precio.toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        p.stock <= 5 ? 'text-danger' : 'text-text-primary'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.unidadMedida}</td>
                  <td className="px-4 py-3 text-text-muted">{p.proveedor}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-secondary hover:bg-secondary-light rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-danger hover:bg-danger-light rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => updateField('nombre', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => updateField('categoria', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                >
                  {categoriasProducto.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Subcategoría</label>
                <input
                  type="text"
                  value={form.subcategoria}
                  onChange={(e) => updateField('subcategoria', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Precio</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => updateField('precio', Number(e.target.value))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => updateField('stock', Number(e.target.value))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Unidad de Medida</label>
                <select
                  value={form.unidadMedida}
                  onChange={(e) => updateField('unidadMedida', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                >
                  {unidadesMedida.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Proveedor</label>
                <input
                  type="text"
                  value={form.proveedor}
                  onChange={(e) => updateField('proveedor', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowForm(false); setForm(emptyProduct); setEditingId(null); }}
                className="px-4 py-2 text-sm text-text-muted hover:bg-background rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                {editingId ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
