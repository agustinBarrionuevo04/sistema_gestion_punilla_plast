import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  productos as initialProductos,
  clientes as initialClientes,
  movimientos as initialMovimientos,
  presupuestos as initialPresupuestos,
  facturas as initialFacturas,
  getNextId,
} from '../data/mockData';

const StoreContext = createContext(null);

function productReducer(state, action) {
  switch (action.type) {
    case 'ADD_PRODUCTO':
      return [...state, { ...action.payload, id: getNextId('producto') }];
    case 'EDIT_PRODUCTO':
      return state.map((p) => (p.id === action.payload.id ? { ...action.payload } : p));
    case 'DELETE_PRODUCTO':
      return state.filter((p) => p.id !== action.payload);
    default:
      return state;
  }
}

function clienteReducer(state, action) {
  switch (action.type) {
    case 'ADD_CLIENTE':
      return [...state, { ...action.payload, id: getNextId('cliente') }];
    case 'EDIT_CLIENTE':
      return state.map((c) => (c.id === action.payload.id ? { ...action.payload } : c));
    case 'DELETE_CLIENTE':
      return state.filter((c) => c.id !== action.payload);
    default:
      return state;
  }
}

function movimientoReducer(state, action) {
  switch (action.type) {
    case 'ADD_MOVIMIENTO':
      return [...state, { ...action.payload, id: getNextId('movimiento') }];
    case 'DELETE_MOVIMIENTO':
      return state.filter((m) => m.id !== action.payload);
    default:
      return state;
  }
}

function presupuestoReducer(state, action) {
  switch (action.type) {
    case 'ADD_PRESUPUESTO':
      return [...state, { ...action.payload, id: getNextId('presupuesto') }];
    case 'EDIT_PRESUPUESTO':
      return state.map((p) => (p.id === action.payload.id ? { ...action.payload } : p));
    case 'DELETE_PRESUPUESTO':
      return state.filter((p) => p.id !== action.payload);
    case 'UPDATE_PRESUPUESTO_ESTADO':
      return state.map((p) =>
        p.id === action.payload.id ? { ...p, estado: action.payload.estado } : p
      );
    default:
      return state;
  }
}

function facturaReducer(state, action) {
  switch (action.type) {
    case 'ADD_FACTURA':
      return [...state, { ...action.payload, id: getNextId('factura') }];
    case 'DELETE_FACTURA':
      return state.filter((f) => f.id !== action.payload);
    default:
      return state;
  }
}

function rootReducer(state, action) {
  const entityType = action.entityType;
  switch (entityType) {
    case 'productos':
      return { ...state, productos: productReducer(state.productos, action) };
    case 'clientes':
      return { ...state, clientes: clienteReducer(state.clientes, action) };
    case 'movimientos':
      return { ...state, movimientos: movimientoReducer(state.movimientos, action) };
    case 'presupuestos':
      return { ...state, presupuestos: presupuestoReducer(state.presupuestos, action) };
    case 'facturas':
      return { ...state, facturas: facturaReducer(state.facturas, action) };
    default:
      return state;
  }
}

const initialState = {
  productos: initialProductos,
  clientes: initialClientes,
  movimientos: initialMovimientos,
  presupuestos: initialPresupuestos,
  facturas: initialFacturas,
};

let nextNumPresupuesto = 5;
let nextNumFactura = 7;

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  const addProduct = useCallback((p) => dispatch({ entityType: 'productos', type: 'ADD_PRODUCTO', payload: p }), []);
  const editProduct = useCallback((p) => dispatch({ entityType: 'productos', type: 'EDIT_PRODUCTO', payload: p }), []);
  const deleteProduct = useCallback((id) => dispatch({ entityType: 'productos', type: 'DELETE_PRODUCTO', payload: id }), []);

  const addClient = useCallback((c) => dispatch({ entityType: 'clientes', type: 'ADD_CLIENTE', payload: c }), []);
  const editClient = useCallback((c) => dispatch({ entityType: 'clientes', type: 'EDIT_CLIENTE', payload: c }), []);
  const deleteClient = useCallback((id) => dispatch({ entityType: 'clientes', type: 'DELETE_CLIENTE', payload: id }), []);

  const addMovimiento = useCallback((m) => dispatch({ entityType: 'movimientos', type: 'ADD_MOVIMIENTO', payload: m }), []);
  const deleteMovimiento = useCallback((id) => dispatch({ entityType: 'movimientos', type: 'DELETE_MOVIMIENTO', payload: id }), []);

  const addPresupuestoRaw = useCallback((p) => dispatch({ entityType: 'presupuestos', type: 'ADD_PRESUPUESTO', payload: p }), []);
  const editPresupuesto = useCallback((p) => dispatch({ entityType: 'presupuestos', type: 'EDIT_PRESUPUESTO', payload: p }), []);
  const deletePresupuesto = useCallback((id) => dispatch({ entityType: 'presupuestos', type: 'DELETE_PRESUPUESTO', payload: id }), []);
  const updateEstadoPresupuesto = useCallback((id, estado) =>
    dispatch({ entityType: 'presupuestos', type: 'UPDATE_PRESUPUESTO_ESTADO', payload: { id, estado } }),
    []
  );

  const addFacturaRaw = useCallback((f) => dispatch({ entityType: 'facturas', type: 'ADD_FACTURA', payload: f }), []);
  const deleteFactura = useCallback((id) => dispatch({ entityType: 'facturas', type: 'DELETE_FACTURA', payload: id }), []);

  const addPresupuesto = useCallback(
    (p) => {
      const num = `PRES-${String(nextNumPresupuesto++).padStart(3, '0')}`;
      addPresupuestoRaw({ ...p, numero: num });
    },
    [addPresupuestoRaw]
  );

  const addFactura = useCallback(
    (f) => {
      const num = `F-${String(nextNumFactura++).padStart(3, '0')}`;
      addFacturaRaw({ ...f, numero: num });
    },
    [addFacturaRaw]
  );

  const getSaldoCliente = useCallback(
    (clienteId) => {
      return state.movimientos
        .filter((m) => m.clienteId === clienteId)
        .reduce((acc, m) => acc + (m.tipo === 'compra' ? m.monto : -m.monto), 0);
    },
    [state.movimientos]
  );

  const getProductById = useCallback(
    (id) => state.productos.find((p) => p.id === id),
    [state.productos]
  );

  const getClienteById = useCallback(
    (id) => state.clientes.find((c) => c.id === id),
    [state.clientes]
  );

  const getFacturacionMes = useCallback(() => {
    const now = new Date('2026-07-22');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const anio = now.getFullYear();
    return state.facturas
      .filter((f) => f.fecha.startsWith(`${anio}-${mes}`))
      .reduce((acc, f) => acc + f.items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0) - f.descuento, 0);
  }, [state.facturas]);

  const getDeudaTotal = useCallback(() => {
    const saldos = new Map();
    state.movimientos.forEach((m) => {
      const prev = saldos.get(m.clienteId) || 0;
      saldos.set(m.clienteId, prev + (m.tipo === 'compra' ? m.monto : -m.monto));
    });
    let total = 0;
    saldos.forEach((s) => { if (s > 0) total += s; });
    return total;
  }, [state.movimientos]);

  const productoBajoStock = useCallback(
    (threshold = 5) => state.productos.filter((p) => p.stock <= threshold),
    [state.productos]
  );

  const computePresupuestoTotal = useCallback(
    (items, descuento = 0) => {
      const subtotal = items.reduce((sum, it) => sum + it.cantidad * it.precioUnitario, 0);
      return { subtotal, total: subtotal - descuento };
    },
    []
  );

  const computeFacturaTotal = useCallback(
    (items, descuento = 0) => {
      const subtotal = items.reduce((sum, it) => sum + it.cantidad * it.precioUnitario, 0);
      return { subtotal, total: subtotal - descuento };
    },
    []
  );

  const value = useMemo(
    () => ({
      state,
      addProduct, editProduct, deleteProduct,
      addClient, editClient, deleteClient,
      addMovimiento, deleteMovimiento,
      addPresupuesto, editPresupuesto, deletePresupuesto, updateEstadoPresupuesto,
      addFactura, deleteFactura,
      getSaldoCliente, getProductById, getClienteById,
      getFacturacionMes, getDeudaTotal, productoBajoStock,
      computePresupuestoTotal, computeFacturaTotal,
    }),
    [
      state,
      addProduct, editProduct, deleteProduct,
      addClient, editClient, deleteClient,
      addMovimiento, deleteMovimiento,
      addPresupuesto, editPresupuesto, deletePresupuesto, updateEstadoPresupuesto,
      addFactura, deleteFactura,
      getSaldoCliente, getProductById, getClienteById,
      getFacturacionMes, getDeudaTotal, productoBajoStock,
      computePresupuestoTotal, computeFacturaTotal,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
