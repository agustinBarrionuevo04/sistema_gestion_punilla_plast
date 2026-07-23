import { useState } from 'react';
import { useStore } from '../state/store';
import { condicionesFiscal } from '../data/mockData';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';

const emptyClient = {
  razonSocial: '',
  cuitDni: '',
  telefono: '',
  direccion: '',
  condicionFiscal: 'Consumidor Final',
};

export default function Clientes({ onNavigate }) {
  const { state, addClient, editClient, deleteClient, getSaldoCliente } = useStore();
  const [busqueda, setBusqueda] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyClient);

  const filtered = state.clientes.filter((c) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      c.razonSocial.toLowerCase().includes(q) ||
      c.cuitDni.toLowerCase().includes(q) ||
      c.telefono.includes(q)
    );
  });

  const openNew = () => {
    setForm(emptyClient);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({ ...c });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.razonSocial.trim()) return;
    if (editingId) {
      editClient({ ...form, id: editingId });
    } else {
      addClient(form);
    }
    setShowForm(false);
    setForm(emptyClient);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    deleteClient(id);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Clientes</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 mb-4">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, CUIT/DNI o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary"
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background">
              <tr className="text-left text-text-muted">
                <th className="px-4 py-3 font-medium">Nombre / Razón Social</th>
                <th className="px-4 py-3 font-medium">CUIT / DNI</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Condición Fiscal</th>
                <th className="px-4 py-3 font-medium text-right">Saldo Deudor</th>
                <th className="px-4 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const saldo = getSaldoCliente(c.id);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-background">
                    <td className="px-4 py-3 font-medium text-text-primary">{c.razonSocial}</td>
                    <td className="px-4 py-3 text-text-muted font-mono text-xs">{c.cuitDni}</td>
                    <td className="px-4 py-3 text-text-muted">{c.telefono}</td>
                    <td className="px-4 py-3 text-text-muted">{c.condicionFiscal}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${saldo > 0 ? 'text-danger' : 'text-success'}`}>
                        $ {saldo.toLocaleString('es-AR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onNavigate('cliente-detalle', c.id)}
                          className="p-1.5 text-success hover:bg-success-light rounded transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-secondary hover:bg-secondary-light rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-danger hover:bg-danger-light rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    No se encontraron clientes.
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
              {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Nombre / Razón Social
                </label>
                <input
                  type="text"
                  value={form.razonSocial}
                  onChange={(e) => updateField('razonSocial', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">CUIT / DNI</label>
                <input
                  type="text"
                  value={form.cuitDni}
                  onChange={(e) => updateField('cuitDni', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Teléfono</label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={(e) => updateField('telefono', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-muted mb-1">Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => updateField('direccion', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Condición Fiscal
                </label>
                <select
                  value={form.condicionFiscal}
                  onChange={(e) => updateField('condicionFiscal', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                >
                  <option value="">Sin especificar</option>
                  {condicionesFiscal.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowForm(false); setForm(emptyClient); setEditingId(null); }}
                className="px-4 py-2 text-sm text-text-muted hover:bg-background rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                {editingId ? 'Guardar Cambios' : 'Crear Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
