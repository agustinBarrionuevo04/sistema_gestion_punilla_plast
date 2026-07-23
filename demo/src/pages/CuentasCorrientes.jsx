import { useState } from 'react';
import { useStore } from '../state/store';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function CuentasCorrientes() {
  const { state, addMovimiento, getSaldoCliente, getClienteById } = useStore();
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [pagoForm, setPagoForm] = useState({ clienteId: '', monto: 0, fecha: '' });

  const clientesConDeuda = state.clientes
    .map((c) => ({ ...c, saldo: getSaldoCliente(c.id) }))
    .filter((c) => c.saldo > 0)
    .sort((a, b) => b.saldo - a.saldo);

  const handlePago = () => {
    if (!pagoForm.clienteId || pagoForm.monto <= 0) return;

    const fecha = pagoForm.fecha || new Date().toISOString().split('T')[0];
    const cliente = getClienteById(Number(pagoForm.clienteId));

    addMovimiento({
      clienteId: Number(pagoForm.clienteId),
      tipo: 'pago',
      monto: Number(pagoForm.monto),
      fecha,
      descripcion: `Pago registrado - ${cliente?.razonSocial || 'Cliente'}`,
      referencia: null,
    });

    setPagoForm({ clienteId: '', monto: 0, fecha: '' });
    setShowPagoForm(false);
  };

  const clientesConMovimientos = state.clientes.filter((c) =>
    state.movimientos.some((m) => m.clienteId === c.id)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Cuentas Corrientes</h2>
        <button
          onClick={() => setShowPagoForm(true)}
          className="flex items-center gap-2 bg-success hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <DollarSign size={16} /> Registrar Pago
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
          <p className="text-sm text-text-muted">Total Deuda Pendiente</p>
          <p className="text-2xl font-bold text-danger">
            $ {clientesConDeuda.reduce((acc, c) => acc + c.saldo, 0).toLocaleString('es-AR')}
          </p>
        </div>
        <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
          <p className="text-sm text-text-muted">Clientes con Deuda</p>
          <p className="text-2xl font-bold text-text-primary">{clientesConDeuda.length}</p>
        </div>
        <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
          <p className="text-sm text-text-muted">Total Pagos Recibidos (Julio)</p>
          <p className="text-2xl font-bold text-success">
            ${' '}
            {state.movimientos
              .filter((m) => m.tipo === 'pago' && m.fecha.startsWith('2026-07'))
              .reduce((acc, m) => acc + m.monto, 0)
              .toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-5 mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Clientes con Deuda Pendiente
        </h3>
        {clientesConDeuda.length === 0 ? (
          <p className="text-text-muted text-sm">No hay clientes con deuda pendiente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">CUIT/DNI</th>
                  <th className="pb-2 font-medium">Teléfono</th>
                  <th className="pb-2 font-medium text-right">Saldo Deudor</th>
                </tr>
              </thead>
              <tbody>
                {clientesConDeuda.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-background">
                    <td className="py-3 font-medium text-text-primary">{c.razonSocial}</td>
                    <td className="py-3 text-text-muted font-mono text-xs">{c.cuitDni}</td>
                    <td className="py-3 text-text-muted">{c.telefono}</td>
                    <td className="py-3 text-right font-semibold text-danger">
                      $ {c.saldo.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Historial de Movimientos por Cliente
        </h3>
        {clientesConMovimientos.map((cliente) => {
          const movs = state.movimientos
            .filter((m) => m.clienteId === cliente.id)
            .sort((a, b) => b.fecha.localeCompare(a.fecha));

          return (
            <details key={cliente.id} className="border border-border rounded-lg mb-3 group">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-background">
                <span className="font-medium text-text-primary">{cliente.razonSocial}</span>
                <span className="text-sm text-text-muted">
                  {movs.length} movimiento{movs.length !== 1 ? 's' : ''}
                </span>
              </summary>
              <div className="px-4 pb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-muted border-b border-border">
                      <th className="pb-1 font-medium">Fecha</th>
                      <th className="pb-1 font-medium">Descripción</th>
                      <th className="pb-1 font-medium">Tipo</th>
                      <th className="pb-1 font-medium text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movs.map((m) => (
                      <tr key={m.id} className="border-b border-border last:border-0">
                        <td className="py-1.5 text-text-muted">
                          {new Date(m.fecha).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-1.5 text-text-primary">{m.descripcion}</td>
                        <td className="py-1.5">
                          <span className="inline-flex items-center gap-1">
                            {m.tipo === 'compra' ? (
                              <ArrowUpRight size={14} className="text-danger" />
                            ) : (
                              <ArrowDownRight size={14} className="text-success" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                m.tipo === 'compra' ? 'text-danger' : 'text-success'
                              }`}
                            >
                              {m.tipo === 'compra' ? 'Compra' : 'Pago'}
                            </span>
                          </span>
                        </td>
                        <td className="py-1.5 text-right">
                          <span className={m.tipo === 'compra' ? 'text-danger' : 'text-success'}>
                            {m.tipo === 'compra' ? '+' : '-'} ${' '}
                            {m.monto.toLocaleString('es-AR')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
      </div>

      {showPagoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Registrar Pago</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Cliente</label>
                <select
                  value={pagoForm.clienteId}
                  onChange={(e) =>
                    setPagoForm((prev) => ({ ...prev, clienteId: e.target.value }))
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                >
                  <option value="">Seleccionar cliente...</option>
                  {state.clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razonSocial} (Saldo: $ {getSaldoCliente(c.id).toLocaleString('es-AR')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Monto</label>
                <input
                  type="number"
                  value={pagoForm.monto || ''}
                  onChange={(e) =>
                    setPagoForm((prev) => ({ ...prev, monto: Number(e.target.value) }))
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Fecha</label>
                <input
                  type="date"
                  value={pagoForm.fecha}
                  onChange={(e) => setPagoForm((prev) => ({ ...prev, fecha: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPagoForm(false);
                  setPagoForm({ clienteId: '', monto: 0, fecha: '' });
                }}
                className="px-4 py-2 text-sm text-text-muted hover:bg-background rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePago}
                className="px-4 py-2 text-sm bg-success hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
