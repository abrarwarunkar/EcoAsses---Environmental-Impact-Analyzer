
import AppHeader from "../../eco-assess/components/eco-assess/AppHeader";
import LandingPageContent from "../../eco-assess/components/eco-assess/LandingPageContent";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow">
        <LandingPageContent />
      </main>
      <footer className="py-6 border-t bg-muted/50">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} EcoAssess. Promoting sustainable choices.
        </div>
      </footer>
    </div>
  );
}
