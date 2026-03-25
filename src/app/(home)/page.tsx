import Link from 'next/link';
import { Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      {/* Badge */}
      {/* test push */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Built on top of shadcn/ui
      </div>

      {/* Headline */}
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
        Components you actually <span className="text-muted-foreground">need.</span>
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
        Practical, copy-paste React components built on top of shadcn/ui. Designed for dashboards,
        admin panels, and internal tools — but flexible enough for any project.
      </p>

      {/* CTA */}
      <div className="mt-10 flex items-center gap-3">
        <Button asChild>
          <Link href="/docs">
            View Components <ArrowRight size={15} className="ml-1" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://github.com/MelAlejandrino/jejeui" target="_blank" rel="noreferrer">
            <Github size={15} className="mr-1" /> Github
          </Link>
        </Button>
      </div>
    </div>
  );
}
