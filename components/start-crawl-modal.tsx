"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { API_BASE_URL } from "@/app/config"

interface Project {
  id: number
  project_name: string
  domain: string
}

interface StartCrawlModalProps {
  project: Project
  onClose: () => void
  onCrawlComplete: () => void
}

export default function StartCrawlModal({ project, onClose, onCrawlComplete }: StartCrawlModalProps) {
  const [url, setUrl] = useState(`https://${project.domain}`)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState<string | null>(null)

  const handleStartCrawl = async () => {
    setLoading(true)
    setError("")
    setProgress("Starting crawl...")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("You must be logged in")
      }

      const response = await fetch(`${API_BASE_URL}/start-crawl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          project_id: project.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to start crawl")
      }

      setProgress(`Crawl completed. ${data.items_count} URLs analyzed.`)
      setTimeout(() => {
        onCrawlComplete()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crawl starten</DialogTitle>
          <DialogDescription>Gib die URL ein, die du für die SEO-Analyse crawlen möchtest.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Gib die vollständige URL inklusive https:// oder http:// ein</p>
          </div>
          {progress && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {progress}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
           Abbrechen
          </Button>
          <Button onClick={handleStartCrawl} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Crawling läuft...
              </>
            ) : (
              "Start Crawl"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

