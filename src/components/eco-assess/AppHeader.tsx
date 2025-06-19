
import { BookOpen, Rocket } from 'lucide-react';
import Image from 'next/image';
import { ModeToggle } from '@/components/mode-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  return (
    <header className="py-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/ecoassess-logo.png" // Updated path to the logo in the public directory
            alt="EcoAssess Logo"
            width={32} // You might want to adjust width/height based on the actual logo dimensions
            height={32}
            className="group-hover:opacity-80 transition-opacity"
          />
          <h1 className="text-3xl font-headline font-bold text-primary group-hover:text-primary/80 transition-colors">
            EcoAssess
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/learn" className="flex items-center gap-1">
              <BookOpen className="h-5 w-5" />
              Learn
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-primary/50 hover:bg-primary/10">
            <Link href="/assess" className="flex items-center gap-1 text-primary">
              <Rocket className="h-5 w-5" />
              Launch App
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
