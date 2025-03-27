"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { BarChart3, Home, LogOut, Menu, PlusCircle, Search, Settings, User } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (!isMounted) {
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Projects", href: "/dashboard/projects", icon: BarChart3 },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Mobile navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <span className="font-bold">SEO-Analyzer</span>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card border-r">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <span className="font-bold">SEO-Analyzer</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t flex items-center justify-between">
            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <header className="sticky top-0 z-10 bg-background border-b h-16 flex items-center px-4 md:px-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg font-semibold md:hidden">SEO-Analyzer</h1>
            <div className="flex items-center gap-2 ml-auto">
              <Link href="/dashboard/projects/new">
                <Button size="sm" className="hidden md:flex gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Neues Projekt
                </Button>
              </Link>
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

