import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChefHat, Heart, Search, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

const SHOWCASE_CARDS = [
  { emoji: '🍪', title: 'Cookies estilo New York', author: '@martina', gradient: 'from-amber-400 to-orange-500' },
  { emoji: '🍝', title: 'Fettuccine al pesto', author: '@lucas', gradient: 'from-emerald-400 to-teal-500' },
  { emoji: '🌮', title: 'Tacos al pastor', author: '@sole', gradient: 'from-rose-400 to-red-500' },
  { emoji: '🍰', title: 'Torta de zanahoria', author: '@juli', gradient: 'from-fuchsia-400 to-pink-500' },
];

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/feed');

  return (
    <div className="min-h-screen bg-background">
      <header className="container flex items-center justify-between py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Crear cuenta</Link>
          </Button>
        </div>
      </header>

      <section className="container flex flex-col items-center gap-6 py-12 text-center md:py-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> La receta que ves es la receta que cocinás
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Descubrí. <span className="text-primary">Cociná.</span> Compartí.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Encontrá recetas increíbles, cocinalas y mostrale al mundo cómo te quedaron.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">Crear cuenta gratis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/explore">Explorar recetas</Link>
          </Button>
        </div>
      </section>

      <section className="container py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SHOWCASE_CARDS.map((card) => (
            <div key={card.title} className="group overflow-hidden rounded-2xl border border-border shadow-card transition-transform hover:-translate-y-1">
              <div className={`flex aspect-[4/5] items-center justify-center bg-gradient-to-br ${card.gradient} text-6xl`}>
                {card.emoji}
              </div>
              <div className="bg-card p-3">
                <p className="truncate text-sm font-semibold">{card.title}</p>
                <p className="text-xs text-muted-foreground">{card.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container grid gap-6 py-16 md:grid-cols-3">
        <FeatureCard
          icon={<ChefHat className="h-6 w-6" />}
          title="De la receta al resultado"
          description="Guardá una receta, cocinala y mostrá cómo te quedó. Todo queda conectado."
        />
        <FeatureCard
          icon={<Search className="h-6 w-6" />}
          title="¿Qué puedo cocinar?"
          description="Ingresá lo que tenés en tu heladera y descubrí qué recetas podés hacer hoy."
        />
        <FeatureCard
          icon={<Heart className="h-6 w-6" />}
          title="Una comunidad real"
          description="Mirá cómo les quedó a otros, dejá reseñas y encontrá tips antes de cocinar."
        />
      </section>

      <footer className="container flex flex-col items-center gap-3 border-t border-border py-8 text-sm text-muted-foreground">
        <Logo showText={false} />
        <p>© {new Date().getFullYear()} RecetApp</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <h3 className="mb-1.5 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
