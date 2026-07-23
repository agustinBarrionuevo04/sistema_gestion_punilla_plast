import { useState, useMemo } from 'react';
import { useStore } from '../state/store';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function PresupuestoForm({ onNavigate }) {
  const { state, addPresupuesto, getProductById } = useStore();
  const [clienteId, setClienteId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ productoId: '', cantidad: 1 }]);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [descuentoFijo, setDescuentoFijo] = useState(0);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, it) => {
        const prod = getProductById(Number(it.productoId));
        return prod ? sum + it.cantidad * prod.precio : sum;
      }, 0),
    [items, getProductById]
  );

  const descuentoTotal =
    descuentoFijo > 0 ? descuentoFijo : Math.round(subtotal * (descuentoPorcentaje / 100));

  const total = subtotal - descuentoTotal;

  const addItem = () => {
    setItems((prev) => [...prev, { productoId: '', cantidad: 1 }]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };

  const handleGuardar = () => {
    if (!clienteId || items.length === 0) return;
    const itemsValidos = items
      .filter((it) => it.productoId && it.cantidad > 0)
      .map((it) => {
        const prod = getProductById(Number(it.productoId));
        return {
          productoId: Number(it.productoId),
          cantidad: Number(it.cantidad),
          precioUnitario: prod.precio,
        };
      });

    if (itemsValidos.length === 0) return;

    addPresupuesto({
      clienteId: Number(clienteId),
      fecha,
      items: itemsValidos,
      descuento: descuentoTotal,
      descuentoPorcentaje: descuentoFijo > 0 ? 0 : descuentoPorcentaje,
      estado: 'pendiente',
    });

    onNavigate('presupuestos');
  };

  return (
    <div>
      <button
        onClick={() => onNavigate('presupuestos')}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a Presupuestos
      </button>

      <h2 className="text-2xl font-bold text-text-primary mb-6">Nuevo Presupuesto</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Cliente</label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                >
                  <option value="">Seleccionar cliente...</option>
                  {state.clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razonSocial} ({c.cuitDni})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Productos</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium"
              >
                <Plus size={16} /> Agregar Producto
              </button>
            </div>

            <div className="space-y-3">
              {items.map((it, idx) => {
                const prod = getProductById(Number(it.productoId));
                const precio = prod ? prod.precio : 0;
                const subtotalItem = it.cantidad * precio;

                return (
                  <div
                    key={idx}
                    className="flex items-end gap-3 p-3 bg-background rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        Producto
                      </label>
                      <select
                        value={it.productoId}
                        onChange={(e) => updateItem(idx, 'productoId', e.target.value)}
                        className="w-full border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                      >
                        <option value="">Seleccionar producto...</option>
                        {state.productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} — $ {p.precio.toLocaleString('es-AR')} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={it.cantidad}
                        onChange={(e) =>
                          updateItem(idx, 'cantidad', Number(e.target.value))
                        }
                        className="w-full border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                      />
                    </div>
                    <div className="w-28 text-right pb-1.5">
                      {prod ? (
                        <span className="text-sm font-medium text-text-primary">
                          $ {subtotalItem.toLocaleString('es-AR')}
                        </span>
                      ) : (
                        <span className="text-sm text-text-muted">—</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-danger/60 hover:text-danger hover:bg-danger-light rounded transition-colors mb-1"
                      disabled={items.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
            <h3 className="font-semibold text-text-primary mb-4">Descuentos</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={descuentoPorcentaje}
                  onChange={(e) => {
                    setDescuentoPorcentaje(Number(e.target.value));
                    if (Number(e.target.value) > 0) setDescuentoFijo(0);
                  }}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div className="text-center text-sm text-text-muted">o</div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Descuento fijo ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={descuentoFijo}
                  onChange={(e) => {
                    setDescuentoFijo(Number(e.target.value));
                    if (Number(e.target.value) > 0) setDescuentoPorcentaje(0);
                  }}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
            <h3 className="font-semibold text-text-primary mb-4">Totales</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span>$ {subtotal.toLocaleString('es-AR')}</span>
              </div>
              {descuentoTotal > 0 && (
                <div className="flex justify-between text-success">
                  <span>Descuento</span>
                  <span>-$ {descuentoTotal.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-text-primary border-t border-border pt-2">
                <span>Total</span>
                <span>$ {total.toLocaleString('es-AR')}</span>
              </div>
            </div>
            <button
              onClick={handleGuardar}
              disabled={!clienteId || items.every((it) => !it.productoId)}
              className="w-full mt-4 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Presupuesto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
