import { useState, useMemo } from 'react';
import { useStore } from '../state/store';
import { Plus, AlertTriangle, Trash2, X } from 'lucide-react';

export default function Facturacion({ onNavigate }) {
  const { state, deleteFactura } = useStore();
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [detalle, setDetalle] = useState(null);

  const filtered = useMemo(() => {
    let result = [...state.facturas].map((f) => {
      const cliente = state.clientes.find((c) => c.id === f.clienteId);
      const total =
        f.items.reduce((sum, it) => sum + it.cantidad * it.precioUnitario, 0) -
        f.descuento;
      return { ...f, cliente, total };
    });

    if (filtroCliente) {
      result = result.filter((f) => f.clienteId === Number(filtroCliente));
    }
    if (filtroMes) {
      result = result.filter((f) => f.fecha.startsWith(filtroMes));
    }

    return result.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [state.facturas, state.clientes, filtroCliente, filtroMes]);

  const getProductoById = (id) => {
    return state.productos.find((p) => p.id === id);
  };

  const facturaDetalle = detalle;
  const clienteDetalle = facturaDetalle
    ? state.clientes.find((c) => c.id === facturaDetalle.clienteId)
    : null;
  const subtotalDetalle = facturaDetalle
    ? facturaDetalle.items.reduce((sum, it) => sum + it.cantidad * it.precioUnitario, 0)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Facturación</h2>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('factura-form')}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Nueva Factura Directa
          </button>
        </div>
      </div>

      <div className="bg-warning-light border border-warning rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">
              Facturación electrónica con ARCA — Próximamente
            </p>
            <p className="text-sm text-amber-700 mt-1">
              En esta beta, las facturas son comprobantes simples no fiscales. La integración real
              con ARCA (ex AFIP) estará disponible en la versión final del sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 mb-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Cliente</label>
            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary min-w-[200px]"
            >
              <option value="">Todos los clientes</option>
              {state.clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razonSocial}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Mes</label>
            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background">
              <tr className="text-left text-text-muted">
                <th className="px-4 py-3 font-medium">N°</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Origen</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium text-right">Descuento</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-border hover:bg-background cursor-pointer"
                  onClick={() => setDetalle(f)}
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{f.numero}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {f.cliente?.razonSocial || '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(f.fecha).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        f.tipoOrigen === 'presupuesto'
                          ? 'bg-secondary-light text-secondary'
                          : 'bg-primary-light text-primary'
                      }`}
                    >
                      {f.tipoOrigen === 'presupuesto' ? 'Presupuesto' : 'Directa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-text-muted max-w-[200px]">
                      {f.items.map((it, i) => (
                        <span key={i} className="inline-block">
                          {it.cantidad}x {getProductoById(it.productoId)?.nombre || '—'}
                          {i < f.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {f.descuento > 0 ? (
                      <span className="text-success">
                        -$ {f.descuento.toLocaleString('es-AR')}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-text-primary">
                    $ {f.total.toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteFactura(f.id)}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-light rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                    No se encontraron facturas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {facturaDetalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo_punillaplast.jpg"
                  alt="Punillaplast"
                  className="w-8 h-8 rounded object-contain bg-sidebar"
                />
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Factura {facturaDetalle.numero}
                  </h3>
                  <p className="text-xs text-text-muted">Punillaplast — Comprobante no fiscal</p>
                </div>
              </div>
              <button
                onClick={() => setDetalle(null)}
                className="p-2 text-text-muted hover:bg-background rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-warning-light border border-warning rounded-lg p-3 mb-4 text-xs text-amber-800">
                Este comprobante es simulado. La integración con ARCA estará disponible próximamente.
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-text-muted mb-1">Cliente</p>
                  <p className="text-sm font-medium text-text-primary">
                    {clienteDetalle?.razonSocial || '—'}
                  </p>
                  <p className="text-xs text-text-muted">{clienteDetalle?.cuitDni}</p>
                  <p className="text-xs text-text-muted">{clienteDetalle?.direccion}</p>
                  <p className="text-xs text-text-muted">
                    Condición fiscal: {clienteDetalle?.condicionFiscal || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted mb-1">
                    Fecha: {new Date(facturaDetalle.fecha).toLocaleDateString('es-AR')}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      facturaDetalle.tipoOrigen === 'presupuesto'
                        ? 'bg-secondary-light text-secondary'
                        : 'bg-primary-light text-primary'
                    }`}
                  >
                    {facturaDetalle.tipoOrigen === 'presupuesto' ? 'Desde presupuesto' : 'Factura directa'}
                  </span>
                </div>
              </div>

              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="pb-2 font-medium">Producto</th>
                    <th className="pb-2 font-medium text-right">Precio Unit.</th>
                    <th className="pb-2 font-medium text-center">Cantidad</th>
                    <th className="pb-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaDetalle.items.map((it, idx) => {
                    const prod = getProductoById(it.productoId);
                    return (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="py-2 text-text-primary">{prod?.nombre || '—'}</td>
                        <td className="py-2 text-text-muted text-right">
                          $ {it.precioUnitario.toLocaleString('es-AR')}
                        </td>
                        <td className="py-2 text-text-primary text-center">{it.cantidad}</td>
                        <td className="py-2 text-text-primary text-right">
                          $ {(it.cantidad * it.precioUnitario).toLocaleString('es-AR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="border-t border-border pt-4 space-y-1 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>$ {subtotalDetalle.toLocaleString('es-AR')}</span>
                </div>
                {facturaDetalle.descuento > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Descuento</span>
                    <span>-$ {facturaDetalle.descuento.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-text-primary pt-2">
                  <span>Total</span>
                  <span>$ {facturaDetalle.total.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
