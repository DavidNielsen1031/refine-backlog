"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Loader2, Download, Copy, AlertCircle, CheckCircle2 } from "lucide-react"

interface GroomedItem {
  title: string
  problem: string
  priority: "P0" | "P1" | "P2" | "P3"
  effort: "S" | "M" | "L" | "XL"
  category: string
  dependencies: string
}

export function BacklogGroomer() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<GroomedItem[]>([])
  const [error, setError] = useState("")
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  const handleGroom = async () => {
    if (!input.trim()) {
      setError("Please enter some backlog items")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/groom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: input,
          format: 'text'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to groom backlog')
      }

      setResults(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const exportAsCSV = () => {
    const headers = ['Title', 'Problem Statement', 'Priority', 'Effort', 'Category', 'Dependencies']
    const rows = results.map(item => [
      `"${item.title}"`,
      `"${item.problem}"`,
      item.priority,
      item.effort,
      item.category,
      `"${item.dependencies}"`
    ])
    
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    copyToClipboard(csv, 'csv')
  }

  const exportAsMarkdown = () => {
    const markdown = [
      '# Groomed Backlog',
      '',
      '| Title | Problem | Priority | Effort | Category | Dependencies |',
      '|-------|---------|----------|--------|----------|--------------|',
      ...results.map(item => 
        `| ${item.title} | ${item.problem} | ${item.priority} | ${item.effort} | ${item.category} | ${item.dependencies} |`
      )
    ].join('\n')
    
    copyToClipboard(markdown, 'markdown')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'P1': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'P2': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'P3': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'S': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'M': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'L': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'XL': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <section id="groomer" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-section-title font-space-grotesk mb-4">
              Groom Your Backlog
            </h2>
            <p className="text-lg text-muted-foreground">
              Paste your messy backlog items below and watch AI transform them into a clean, prioritized list.
            </p>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl">Input Your Backlog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your backlog items here... (one per line)

Example:
- fix bug with login
- new feature for dashboard  
- update documentation
- performance improvements
- mobile responsive design"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] resize-none"
                disabled={isLoading}
              />
              
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Free tier: 10 items max, 3 sessions/day
                </div>
                <Button 
                  onClick={handleGroom}
                  disabled={isLoading || !input.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Grooming...' : 'Groom Backlog'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card className="mt-8 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-emerald-400">
                    Groomed Results
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportAsCSV}
                      className="border-border/50"
                    >
                      {copySuccess === 'csv' ? (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Copied!</>
                      ) : (
                        <><Copy className="mr-2 h-4 w-4" /> Copy CSV</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportAsMarkdown}
                      className="border-border/50"
                    >
                      {copySuccess === 'markdown' ? (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Copied!</>
                      ) : (
                        <><Download className="mr-2 h-4 w-4" /> Copy Markdown</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Problem Statement</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Effort</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Dependencies</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell className="max-w-xs text-sm text-muted-foreground">
                            {item.problem}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getEffortColor(item.effort)}>
                              {item.effort}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.dependencies}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}