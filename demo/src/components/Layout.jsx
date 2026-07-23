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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [collapsed, setCollapsed] = useState(false);

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
      <aside
        className={`bg-sidebar text-white flex flex-col shrink-0 transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-64'
        }`}
      >
        <div className={`p-3 border-b border-sidebar-border ${collapsed ? 'px-2' : 'p-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <img
              src="/logo_punillaplast.jpg"
              alt="Punillaplast"
              className="w-9 h-9 rounded object-contain bg-white shrink-0"
            />
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-base font-bold whitespace-nowrap">Punillaplast</h1>
                <p className="text-xs text-text-muted">Sistema de Gestión</p>
              </div>
            )}
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
              <div key={item.id} className="relative group">
                <button
                  onClick={() => {
                    if (collapsed && hasChildren) {
                      setCollapsed(false);
                      setExpanded((prev) => ({ ...prev, [item.id]: true }));
                    } else if (hasChildren) {
                      toggleExpand(item.id);
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                  } ${
                    isActive || childActive
                      ? 'bg-primary text-white'
                      : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                      {hasChildren &&
                        (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </>
                  )}
                </button>
                {collapsed && (
                  <div className="absolute left-full top-0 ml-2 px-3 py-1.5 bg-sidebar border border-sidebar-border text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
                {hasChildren && isExpanded && !collapsed && (
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
        <div className="border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="w-full flex items-center justify-center p-3 text-slate-400 hover:text-white hover:bg-sidebar-hover transition-colors"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <BetaBanner />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
