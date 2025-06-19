
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Lightbulb, BarChart3, Recycle, Search, Link2, ImageIcon, Users, Brain, BookOpen, ArrowRight } from "lucide-react";

const features = [
  {
    icon: <Brain className="h-10 w-10 text-primary mb-4" />,
    title: "AI-Powered Analysis",
    description: "Leverage cutting-edge AI to get a detailed environmental impact score for products.",
  },
  {
    icon: <Search className="h-10 w-10 text-primary mb-4" />,
    title: "Multiple Input Methods",
    description: "Analyze products by describing them, uploading an image, or simply providing a URL.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary mb-4" />,
    title: "Detailed Impact Breakdown",
    description: "Understand the impact across key categories: Carbon Footprint, Water Usage, Material Sourcing, and Recyclability.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary mb-4" />,
    title: "Product Comparison",
    description: "Compare two products side-by-side to make informed decisions quickly.",
  },
  {
    icon: <Recycle className="h-10 w-10 text-primary mb-4" />,
    title: "Sustainable Alternatives",
    description: "Discover eco-friendly alternatives tailored to your preferences.",
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary mb-4" />,
    title: "Actionable Eco-Insights",
    description: "Receive practical tips and highlights to guide your sustainable choices.",
  },
  {
    icon: <BookOpen className="h-10 w-10 text-primary mb-4" />,
    title: "Educational Resources",
    description: "Learn more about sustainability concepts and how to reduce your impact.",
  },
];

const howItWorksSteps = [
  {
    step: 1,
    title: "Input Product",
    description: "Provide product details via text, image, or URL.",
    icon: <Search className="h-8 w-8 text-accent" />,
  },
  {
    step: 2,
    title: "Get AI Analysis",
    description: "Our AI assesses the environmental impact and generates a detailed report.",
    icon: <Brain className="h-8 w-8 text-accent" />,
  },
  {
    step: 3,
    title: "Make Informed Choices",
    description: "Use insights, comparisons, and alternative suggestions to choose sustainably.",
    icon: <CheckCircle className="h-8 w-8 text-accent" />,
  },
];

export default function LandingPageContent() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-primary mb-6 tracking-tight">
            Understand Your Environmental Impact.
            <br />
            Make Sustainable Choices with EcoAssess.
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            EcoAssess empowers you to analyze the environmental footprint of products using AI.
            Get detailed reports, compare items, and discover eco-friendly alternatives to build a greener future.
          </p>
          <Link href="/assess">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
              Start Assessing Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Why EcoAssess?</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Unlock a new level of awareness and make choices that truly matter for the planet.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center bg-card">
                <CardHeader className="items-center">
                  {feature.icon}
                  <CardTitle className="font-headline text-xl text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Simple Steps to Sustainability</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">Getting started with EcoAssess is easy and impactful.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center p-6">
                <div className="mb-4 p-4 bg-primary/10 rounded-full">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-semibold font-headline text-primary mb-2">{`Step ${step.step}: ${step.title}`}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Break Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">Empowering Conscious Consumers</h2>
              <p className="text-lg text-muted-foreground mb-6">
                EcoAssess provides the clarity you need to align your purchases with your values.
                By understanding the full environmental story behind products, you can actively contribute to a healthier planet.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Reduce your carbon footprint.</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Support sustainable material sourcing.</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Promote water conservation and recyclability.</li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzdXN0YWluYWJpbGl0eXxlbnwwfHx8fDE3NTAyNjkyMjR8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Sustainable choices illustration" 
                width={600} 
                height={400} 
                className="w-full h-auto object-cover"
                data-ai-hint="eco friendly lifestyle" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Ready to Make a Difference?</h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/80 mb-10">
            Join a growing community of conscious consumers. Start analyzing products and making more sustainable choices today with EcoAssess.
          </p>
          <Link href="/assess">
            <Button size="lg" variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
              Explore EcoAssess Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
