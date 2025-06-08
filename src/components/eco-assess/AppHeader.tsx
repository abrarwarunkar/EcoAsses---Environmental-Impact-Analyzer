
import { Leaf, BookOpen } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  return (
    <header className="py-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-primary">
            EcoAssess
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/learn" className="flex items-center gap-1">
              <BookOpen className="h-5 w-5" />
              Learn
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
