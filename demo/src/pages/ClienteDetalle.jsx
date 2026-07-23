import { useStore } from '../state/store';
import { ArrowLeft } from 'lucide-react';

export default function ClienteDetalle({ clienteId, onNavigate }) {
  const { state, getSaldoCliente } = useStore();

  const cliente = state.clientes.find((c) => c.id === clienteId);
  if (!cliente) {
    return (
      <div className="text-center py-12 text-text-muted">
        Cliente no encontrado.
      </div>
    );
  }

  const saldo = getSaldoCliente(clienteId);

  const movimientosCliente = state.movimientos
    .filter((m) => m.clienteId === clienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const presupuestosCliente = state.presupuestos
    .filter((p) => p.clienteId === clienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const facturasCliente = state.facturas
    .filter((f) => f.clienteId === clienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div>
      <button
        onClick={() => onNavigate('clientes')}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a Clientes
      </button>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{cliente.razonSocial}</h2>
            <div className="flex gap-4 mt-2 text-sm text-text-muted">
              <span>CUIT/DNI: {cliente.cuitDni}</span>
              <span>Tel: {cliente.telefono}</span>
            </div>
            <p className="text-sm text-text-muted mt-1">{cliente.direccion}</p>
            {cliente.condicionFiscal && (
              <p className="text-xs text-text-muted mt-1">
                Condición fiscal: {cliente.condicionFiscal}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">Saldo Deudor</p>
            <p className={`text-2xl font-bold ${saldo > 0 ? 'text-danger' : 'text-success'}`}>
              $ {saldo.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Historial de Movimientos
          </h3>
          {movimientosCliente.length === 0 ? (
            <p className="text-text-muted text-sm">Sin movimientos registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Descripción</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {movimientosCliente.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="py-2 text-text-muted">
                      {new Date(m.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-2 text-text-primary">{m.descripcion}</td>
                    <td className="py-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          m.tipo === 'compra'
                            ? 'bg-danger-light text-danger'
                            : 'bg-success-light text-success'
                        }`}
                      >
                        {m.tipo === 'compra' ? 'Compra' : 'Pago'}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <span className={m.tipo === 'compra' ? 'text-danger' : 'text-success'}>
                        {m.tipo === 'compra' ? '+' : '-'} $ {m.monto.toLocaleString('es-AR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Presupuestos</h3>
            {presupuestosCliente.length === 0 ? (
              <p className="text-text-muted text-sm">Sin presupuestos.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="pb-2 font-medium">N°</th>
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestosCliente.map((p) => {
                    const subtotal = p.items.reduce(
                      (sum, it) => sum + it.cantidad * it.precioUnitario, 0
                    );
                    const total = subtotal - p.descuento;
                    return (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="py-2 font-medium text-text-primary">{p.numero}</td>
                        <td className="py-2 text-text-muted">
                          {new Date(p.fecha).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
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
                        <td className="py-2 text-right font-semibold text-text-primary">
                          $ {total.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Facturas Emitidas</h3>
            {facturasCliente.length === 0 ? (
              <p className="text-text-muted text-sm">Sin facturas emitidas.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="pb-2 font-medium">N°</th>
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium">Origen</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {facturasCliente.map((f) => {
                    const total = f.items.reduce(
                      (sum, it) => sum + it.cantidad * it.precioUnitario, 0
                    ) - f.descuento;
                    return (
                      <tr key={f.id} className="border-b border-border last:border-0">
                        <td className="py-2 font-medium text-text-primary">{f.numero}</td>
                        <td className="py-2 text-text-muted">
                          {new Date(f.fecha).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-2">
                          <span className="text-xs bg-background text-text-muted px-2 py-0.5 rounded border border-border">
                            {f.tipoOrigen === 'presupuesto' ? 'Desde presupuesto' : 'Directa'}
                          </span>
                        </td>
                        <td className="py-2 text-right font-semibold text-text-primary">
                          $ {total.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
