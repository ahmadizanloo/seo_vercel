"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Globe } from "lucide-react"
import Link from "next/link"
import { API_BASE_URL } from "@/app/config"

export default function NewProject() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    project_name: "",
    domain: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("You must be logged in")
      }

      const response = await fetch(`${API_BASE_URL}/create-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project")
      }

      // Redirect to the new project page
      router.push(`/dashboard/projects/${data.project_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück zu den Projekten
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neues Projekt erstellen</CardTitle>
          <CardDescription>Füge eine neue Website hinzu, um ihre SEO-Leistung zu analysieren</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="project_name">Projektname</Label>
              <Input
                id="project_name"
                name="project_name"
                placeholder="My Website"
                required
                value={formData.project_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain-ohne https://</Label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="domain"
                  name="domain"
                  placeholder="example.com"
                  required
                  value={formData.domain}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Gib die Domain ohne http:// oder https:// ein</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href="/dashboard/projects">
              <Button variant="outline" type="button">
               Abbrechen
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

