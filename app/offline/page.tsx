export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center safe-top safe-bottom">
      <p className="text-5xl">📡</p>
      <h1 className="text-2xl font-bold tracking-tight">Estás sin conexión</h1>
      <p className="max-w-sm text-muted-foreground">
        No pudimos cargar esta página. Revisá tu conexión a internet e intentá de nuevo.
      </p>
    </div>
  );
}
