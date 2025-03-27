import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Search, Zap } from "lucide-react"
import adojo from "@/public/adojo.png"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-background border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">SEO Analyzer-adojo GmbH</h1>
             
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button>Registrieren</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted">
          <div className="container max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Analysiere und verbessere die SEO deiner Website</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Umfassende SEO-Analyse mit KI-gestützten Empfehlungen zur Verbesserung der Leistung und Sichtbarkeit deiner Website.
              
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                Jetzt starten <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                 Zum Dashboard anmelden
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Hauptfunktionen</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Website Crawling</h3>
                <p className="text-muted-foreground">
                 Durchsuche deine Website automatisch, um SEO-Probleme, defekte Links und Optimierungsmöglichkeiten zu erkennen.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Lighthouse Integration</h3>
                <p className="text-muted-foreground">
                 Erhalte detaillierte Leistungs-, Zugänglichkeits-, Best-Practice- und SEO-Werte mit Google Lighthouse.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">KI-Empfehlungen</h3>
                <p className="text-muted-foreground">
                 Erhalte intelligente, umsetzbare Empfehlungen zur Verbesserung der SEO-Leistung deiner Website.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} SEO-Analyzer. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  )
}

