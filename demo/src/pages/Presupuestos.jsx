import { useState } from 'react';
import { useStore } from '../state/store';
import { estadosPresupuesto } from '../data/mockData';
import { Plus, CheckCircle, XCircle, Trash2, ArrowRightLeft, X } from 'lucide-react';

export default function Presupuestos({ onNavigate }) {
  const {
    state,
    updateEstadoPresupuesto,
    deletePresupuesto,
    addFactura,
    addMovimiento,
  } = useStore();
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [detalle, setDetalle] = useState(null);

  const filtered = state.presupuestos
    .filter((p) => filtroEstado === 'Todos' || p.estado === filtroEstado)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const getClienteNombre = (id) => {
    const c = state.clientes.find((c) => c.id === id);
    return c ? c.razonSocial : '—';
  };

  const getClienteById = (id) => {
    return state.clientes.find((c) => c.id === id);
  };

  const getProductoById = (id) => {
    return state.productos.find((p) => p.id === id);
  };

  const handleAprobarRechazar = (id, estado) => {
    updateEstadoPresupuesto(id, estado);
  };

  const handleConvertirAFactura = (presupuesto) => {
    const subtotal = presupuesto.items.reduce(
      (sum, it) => sum + it.cantidad * it.precioUnitario, 0
    );

    addFactura({
      tipoOrigen: 'presupuesto',
      presupuestoId: presupuesto.id,
      clienteId: presupuesto.clienteId,
      fecha: new Date().toISOString().split('T')[0],
      items: presupuesto.items.map((it) => ({ ...it })),
      descuento: presupuesto.descuento,
    });

    const total = subtotal - presupuesto.descuento;
    const facturasActuales = state.facturas;
    const ultimoNum = Math.max(0, ...facturasActuales.map((f) => {
      const n = parseInt(f.numero.replace('F-', ''), 10);
      return isNaN(n) ? 0 : n;
    }));
    const facturaNum = `F-${String(ultimoNum + 1).padStart(3, '0')}`;

    addMovimiento({
      clienteId: presupuesto.clienteId,
      tipo: 'compra',
      monto: total,
      fecha: new Date().toISOString().split('T')[0],
      descripcion: `Factura ${facturaNum} (desde ${presupuesto.numero})`,
      referencia: facturaNum,
    });

    updateEstadoPresupuesto(presupuesto.id, 'aprobado');
  };

  const openDetalle = (presupuesto) => {
    setDetalle(presupuesto);
  };

  const presupuestoParaDetalle = detalle;
  const clienteDetalle = presupuestoParaDetalle ? getClienteById(presupuestoParaDetalle.clienteId) : null;
  const subtotalDetalle = presupuestoParaDetalle
    ? presupuestoParaDetalle.items.reduce((sum, it) => sum + it.cantidad * it.precioUnitario, 0)
    : 0;
  const totalDetalle = presupuestoParaDetalle
    ? subtotalDetalle - presupuestoParaDetalle.descuento
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Presupuestos</h2>
        <button
          onClick={() => onNavigate('presupuesto-form')}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Presupuesto
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 mb-4">
        <div className="flex gap-2">
          {['Todos', ...estadosPresupuesto].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === est
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-muted hover:bg-border'
              }`}
            >
              {est.charAt(0).toUpperCase() + est.slice(1)}
            </button>
          ))}
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
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-center">Estado</th>
                <th className="px-4 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const subtotal = p.items.reduce(
                  (sum, it) => sum + it.cantidad * it.precioUnitario, 0
                );
                const total = subtotal - p.descuento;

                return (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-background cursor-pointer"
                    onClick={() => openDetalle(p)}
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">{p.numero}</td>
                    <td className="px-4 py-3 text-text-muted">{getClienteNombre(p.clienteId)}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(p.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-text-muted max-w-[200px]">
                        {p.items.map((it, i) => (
                          <span key={i} className="inline-block">
                            {it.cantidad}x{' '}
                            {getProductoById(it.productoId)?.nombre || '—'}
                            {i < p.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <span className="font-semibold text-text-primary">
                          $ {total.toLocaleString('es-AR')}
                        </span>
                        {p.descuento > 0 && (
                          <div className="text-xs text-success">
                            (-$ {p.descuento.toLocaleString('es-AR')})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                          p.estado === 'aprobado'
                            ? 'bg-success-light text-success'
                            : p.estado === 'pendiente'
                            ? 'bg-warning-light text-warning'
                            : 'bg-danger-light text-danger'
                        }`}
                      >
                        {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {p.estado === 'pendiente' && (
                          <>
                            <button
                              onClick={() => handleAprobarRechazar(p.id, 'aprobado')}
                              className="p-1.5 text-success hover:bg-success-light rounded transition-colors"
                              title="Aprobar"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleAprobarRechazar(p.id, 'rechazado')}
                              className="p-1.5 text-danger hover:bg-danger-light rounded transition-colors"
                              title="Rechazar"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {p.estado === 'aprobado' && (
                          <button
                            onClick={() => handleConvertirAFactura(p)}
                            className="p-1.5 text-primary hover:bg-primary-light rounded transition-colors"
                            title="Convertir a factura"
                          >
                            <ArrowRightLeft size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deletePresupuesto(p.id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-light rounded transition-colors"
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
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                    No se encontraron presupuestos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detalle && (
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
                    Presupuesto {presupuestoParaDetalle.numero}
                  </h3>
                  <p className="text-xs text-text-muted">Punillaplast</p>
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
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-text-muted mb-1">Cliente</p>
                  <p className="text-sm font-medium text-text-primary">
                    {clienteDetalle?.razonSocial || '—'}
                  </p>
                  <p className="text-xs text-text-muted">{clienteDetalle?.cuitDni}</p>
                  <p className="text-xs text-text-muted">{clienteDetalle?.direccion}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted mb-1">
                    Fecha: {new Date(presupuestoParaDetalle.fecha).toLocaleDateString('es-AR')}
                  </p>
                  <span
                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                      presupuestoParaDetalle.estado === 'aprobado'
                        ? 'bg-success-light text-success'
                        : presupuestoParaDetalle.estado === 'pendiente'
                        ? 'bg-warning-light text-warning'
                        : 'bg-danger-light text-danger'
                    }`}
                  >
                    {presupuestoParaDetalle.estado.charAt(0).toUpperCase() +
                      presupuestoParaDetalle.estado.slice(1)}
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
                  {presupuestoParaDetalle.items.map((it, idx) => {
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
                {presupuestoParaDetalle.descuento > 0 && (
                  <div className="flex justify-between text-success">
                    <span>
                      Descuento
                      {presupuestoParaDetalle.descuentoPorcentaje > 0 &&
                        ` (${presupuestoParaDetalle.descuentoPorcentaje}%)`}
                    </span>
                    <span>
                      -$ {presupuestoParaDetalle.descuento.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-text-primary pt-2">
                  <span>Total</span>
                  <span>$ {totalDetalle.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {presupuestoParaDetalle.estado === 'aprobado' && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      handleConvertirAFactura(presupuestoParaDetalle);
                      setDetalle(null);
                    }}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Convertir a Factura
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
