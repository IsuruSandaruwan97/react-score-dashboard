"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { useState, useEffect } from "react"
import { isChristmasTheme } from "@/lib/theme-config"

const baseNavItems: never[] = []

export default function Navigation() {
  const pathname = usePathname()
  const [resultsPublished, setResultsPublished] = useState(false)
  const [isXmas, setIsXmas] = useState(false)

  useEffect(() => {
    fetch("/api/data/settings")
      .then((res) => res.json())
      .then((data) => setResultsPublished(data.resultsPublished))
      .catch((err) => console.error("Error loading settings:", err))

    setIsXmas(isChristmasTheme())
  }, [])

  const navItems = resultsPublished ? [...baseNavItems, { href: "/results", label: "Results" }] : baseNavItems
return <></>
  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${isXmas ? "christmas-lights" : ""}`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="CWR Network" width={120} height={48} className="h-12 w-auto" priority />
          {isXmas && <span className="text-2xl animate-float">🎄</span>}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
