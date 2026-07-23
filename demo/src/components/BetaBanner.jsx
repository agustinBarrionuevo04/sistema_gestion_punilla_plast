export default function BetaBanner() {
  return (
    <div className="bg-warning text-white px-4 py-2 text-center text-sm font-medium">
      <span className="bg-amber-600 rounded px-2 py-0.5 mr-2 text-xs font-bold">BETA</span>
      Versión de prueba — Los datos no persisten al recargar la página. Próximamente: integración con backend real.
    </div>
  );
}
