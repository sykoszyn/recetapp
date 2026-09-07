import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center safe-top safe-bottom">
      <p className="text-5xl">🍽️</p>
      <h1 className="text-2xl font-bold tracking-tight">No encontramos esta página</h1>
      <p className="max-w-sm text-muted-foreground">El contenido que buscás no existe, fue eliminado o el link está roto.</p>
      <Button asChild>
        <Link href="/feed">Volver al inicio</Link>
      </Button>
    </div>
  );
}
