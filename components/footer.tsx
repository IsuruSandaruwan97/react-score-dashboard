"use client"

import Link from "next/link"
import Image from "next/image"
import { Trophy, Users, Calendar, Award } from "lucide-react"
import { useState, useEffect } from "react"
import { isChristmasTheme } from "@/lib/theme-config"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [isXmas, setIsXmas] = useState(false)

  useEffect(() => {
    setIsXmas(isChristmasTheme())
  }, [])

  return (
    <footer className={`border-t border-border bg-card/50 backdrop-blur-sm mt-auto ${isXmas ? "christmas-glow" : ""}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="CWR Network" width={140} height={56} className="h-14 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Epic Minecraft building competition featuring 300+ talented builders competing for glory and prizes.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Trophy className="h-4 w-4" />
              <span className="font-semibold">$5,000 Prize Pool</span>
              {isXmas && <span className="animate-bounce-in">🎁</span>}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/players"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                >
                  Players
                </Link>
              </li>
              <li>
                <Link
                  href="/results"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                >
                  Results
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                >
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Competition Info */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">Competition Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>312 Participants</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Jan 15 - Jan 30, 2025</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4 text-primary" />
                <span>Medieval Fantasy Theme</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">Connect With Us</h3>
            <p className="text-sm text-muted-foreground">
              Join our community and stay updated with the latest competition news and announcements.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://cwresports.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary transition-colors hover:underline"
              >
                Visit CWR Esports
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CWR Minecraft Network. All rights reserved.
            {isXmas && <span className="ml-2">🎄 Happy Holidays! ⛄</span>}
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Rules
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
