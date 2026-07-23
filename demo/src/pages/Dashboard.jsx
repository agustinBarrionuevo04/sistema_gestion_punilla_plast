import { useMemo } from 'react';
import { useStore } from '../state/store';
import {
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function Dashboard() {
  const { state, getDeudaTotal, getFacturacionMes, productoBajoStock } = useStore();

  const totalClientes = state.clientes.length;
  const deudaTotal = getDeudaTotal();
  const facturacionMes = getFacturacionMes();
  const bajoStock = productoBajoStock(5);

  const cards = [
    {
      label: 'Total Clientes',
      value: totalClientes,
      icon: Users,
      color: 'bg-secondary',
    },
    {
      label: 'Productos Bajo Stock',
      value: bajoStock.length,
      icon: AlertTriangle,
      color: 'bg-danger',
    },
    {
      label: 'Deuda Total Pendiente',
      value: `$ ${deudaTotal.toLocaleString('es-AR')}`,
      icon: DollarSign,
      color: 'bg-warning',
    },
    {
      label: 'Facturación Julio 2026',
      value: `$ ${facturacionMes.toLocaleString('es-AR')}`,
      icon: TrendingUp,
      color: 'bg-success',
    },
  ];

  const ventasPorMes = useMemo(() => {
    const map = {};
    state.facturas.forEach((f) => {
      const mes = parseInt(f.fecha.split('-')[1], 10) - 1;
      const total = f.items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0) - f.descuento;
      map[mes] = (map[mes] || 0) + total;
    });
    return months.map((name, i) => ({ mes: name, total: map[i] || 0 }));
  }, [state.facturas]);

  const productosPorCategoria = useMemo(() => {
    const map = {};
    state.productos.forEach((p) => {
      map[p.categoria] = (map[p.categoria] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [state.productos]);

  const CATEGORY_COLORS = ['#2E9FE6', '#EA7317', '#22C55E'];

  const topDeudores = useMemo(() => {
    return state.clientes
      .map((c) => ({
        ...c,
        saldo: state.movimientos
          .filter((m) => m.clienteId === c.id)
          .reduce((acc, m) => acc + (m.tipo === 'compra' ? m.monto : -m.monto), 0),
      }))
      .sort((a, b) => b.saldo - a.saldo)
      .filter((c) => c.saldo > 0)
      .slice(0, 5);
  }, [state.clientes, state.movimientos]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-surface rounded-xl shadow-sm p-5 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{card.label}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Facturación por Mes (2026)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ventasPorMes} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mes" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`$ ${value.toLocaleString('es-AR')}`, 'Total']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="total" fill="#EA7317" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Productos por Categoría</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={productosPorCategoria}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
              >
                {productosPorCategoria.map((_, idx) => (
                  <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Clientes Deudores</h3>
          {topDeudores.length === 0 ? (
            <p className="text-text-muted text-sm">No hay clientes con deuda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium text-right">Saldo Deudor</th>
                  </tr>
                </thead>
                <tbody>
                  {topDeudores.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-2 text-text-primary">{c.razonSocial}</td>
                      <td className="py-2 text-right font-semibold text-danger">
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
          <h3 className="text-lg font-semibold text-text-primary mb-4">Productos con Bajo Stock (≤ 5)</h3>
          {bajoStock.length === 0 ? (
            <p className="text-text-muted text-sm">No hay productos con bajo stock.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="pb-2 font-medium">Producto</th>
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium text-right">Stock</th>
                    <th className="pb-2 font-medium text-right">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {bajoStock.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="py-2 text-text-primary">{p.nombre}</td>
                      <td className="py-2 text-text-muted text-xs font-mono">{p.sku}</td>
                      <td className="py-2 text-right">
                        <span className="text-danger font-semibold">{p.stock}</span>
                      </td>
                      <td className="py-2 text-right text-text-primary">
                        $ {p.precio.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
