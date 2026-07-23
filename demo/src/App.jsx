import { useState, useCallback } from 'react';
import { StoreProvider } from './state/store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import ClienteDetalle from './pages/ClienteDetalle';
import CuentasCorrientes from './pages/CuentasCorrientes';
import Presupuestos from './pages/Presupuestos';
import PresupuestoForm from './pages/PresupuestoForm';
import Facturacion from './pages/Facturacion';
import FacturaForm from './pages/FacturaForm';

function AppInner() {
  const [page, setPage] = useState('dashboard');
  const [params, setParams] = useState({});

  const navigate = useCallback((targetPage, param) => {
    if (param !== undefined) {
      setParams((prev) => ({ ...prev, [targetPage]: param }));
    }
    setPage(targetPage);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'productos':
        return <Productos />;
      case 'clientes':
        return <Clientes onNavigate={navigate} />;
      case 'cliente-detalle':
        return (
          <ClienteDetalle
            clienteId={params['cliente-detalle']}
            onNavigate={navigate}
          />
        );
      case 'cuentas-corrientes':
        return <CuentasCorrientes />;
      case 'presupuestos':
        return <Presupuestos onNavigate={navigate} />;
      case 'presupuesto-form':
        return <PresupuestoForm onNavigate={navigate} />;
      case 'facturacion':
        return <Facturacion onNavigate={navigate} />;
      case 'factura-form':
        return <FacturaForm onNavigate={navigate} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activePage={page} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
