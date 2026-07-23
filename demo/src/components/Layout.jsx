import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Calculator,
  FileText,
  Receipt,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import BetaBanner from './BetaBanner';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'gestion',
    label: 'Gestión',
    icon: Package,
    children: [
      { id: 'productos', label: 'Productos' },
      { id: 'clientes', label: 'Clientes' },
    ],
  },
  { id: 'cuentas-corrientes', label: 'Cuentas Corrientes', icon: Calculator },
  { id: 'presupuestos', label: 'Presupuestos', icon: FileText },
  { id: 'facturacion', label: 'Facturación', icon: Receipt },
];

export default function Layout({ activePage, onNavigate, children }) {
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const childActive = item.children.some((c) => c.id === activePage);
        if (childActive) {
          setExpanded((prev) => ({ ...prev, [item.id]: true }));
        }
      }
      if (item.id === 'presupuestos' && activePage === 'presupuesto-form') {
        setExpanded((prev) => ({ ...prev, ['presupuestos']: true }));
      }
      if (item.id === 'facturacion' && activePage === 'factura-form') {
        setExpanded((prev) => ({ ...prev, ['facturacion']: true }));
      }
    });
  }, [activePage]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-sidebar text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img
              src="/logo_punillaplast.jpg"
              alt="Punillaplast"
              className="w-10 h-10 rounded object-contain bg-white"
            />
            <div>
              <h1 className="text-base font-bold">Punillaplast</h1>
              <p className="text-xs text-text-muted">Sistema de Gestión</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expanded[item.id];
            const isActive = activePage === item.id;
            const childActive = hasChildren && item.children.some((c) => c.id === activePage);

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpand(item.id);
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive || childActive
                      ? 'bg-primary text-white'
                      : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren &&
                    (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </button>
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.id)}
                        className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                          activePage === child.id
                            ? 'bg-primary text-white'
                            : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border text-xs text-center" style={{ color: '#6B7280' }}>
          Punillaplast v1.0-beta
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <BetaBanner />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
