"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Users, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PlayersManagementPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [stats, setStats] = useState<{ added: number; updated: number; total: number } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase()
      if (fileExt === "xlsx" || fileExt === "xls" || fileExt === "csv") {
        setFile(selectedFile)
        setMessage(null)
      } else {
        setMessage({ type: "error", text: "Please select an Excel file (.xlsx, .xls) or CSV file (.csv)" })
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setMessage(null)
    setStats(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/players/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: result.message })
        setStats(result.stats)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setMessage({ type: "error", text: result.error || "Upload failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload file. Please try again." })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create sample Excel data
    const template = `ID,Username,Minecraft Username,Discord Username,Team,Status
P001,BlockMaster99,BlockMaster99,blockmaster#1234,Solo,active
P002,CraftyBuilder,CraftyBuilder,crafty#5678,Solo,active
P003,PixelArtist,PixelArtist_MC,pixelart#9012,Solo,active`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "players_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Players Management</h1>
          <p className="text-slate-400 mt-2">Upload and manage player data via Excel spreadsheet</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Card */}
        <Card
          className="bg-slate-900/50 border-purple-500/20 animate-slide-up hover-lift"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Upload Players
            </CardTitle>
            <CardDescription className="text-slate-400">
              Upload an Excel or CSV file with player information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <p className="text-white font-medium mb-1">{file ? file.name : "Click to select file"}</p>
                <p className="text-sm text-slate-400">Supports .xlsx, .xls, and .csv formats</p>
              </label>
            </div>

            {message && (
              <Alert
                className={
                  message.type === "error" ? "border-red-500/50 bg-red-500/10" : "border-green-500/50 bg-green-500/10"
                }
              >
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                )}
                <AlertDescription className={message.type === "error" ? "text-red-300" : "text-green-300"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {stats && (
              <div className="bg-slate-950/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-slate-400">Upload Statistics:</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">{stats.added}</p>
                    <p className="text-xs text-slate-400">Added</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{stats.updated}</p>
                    <p className="text-xs text-slate-400">Updated</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Players
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Template Download Card */}
        <Card
          className="bg-slate-900/50 border-cyan-500/20 animate-slide-up hover-lift"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              Download Template
            </CardTitle>
            <CardDescription className="text-slate-400">Get the CSV template with correct format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-950/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium mb-2">Required Columns:</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>
                      • <span className="text-white">ID</span> - Unique player ID (e.g., P001)
                    </li>
                    <li>
                      • <span className="text-white">Username</span> - Display name
                    </li>
                    <li>
                      • <span className="text-white">Minecraft Username</span> - In-game name
                    </li>
                    <li>
                      • <span className="text-white">Discord Username</span> - Discord handle
                    </li>
                    <li>
                      • <span className="text-white">Team</span> - Team name or "Solo"
                    </li>
                    <li>
                      • <span className="text-white">Status</span> - "active" or "inactive"
                    </li>
                  </ul>
                </div>
              </div>

              <Alert className="border-cyan-500/30 bg-cyan-500/5">
                <AlertCircle className="h-4 w-4 text-cyan-400" />
                <AlertDescription className="text-cyan-300 text-sm">
                  The template includes sample data. Replace it with your actual player information.
                </AlertDescription>
              </Alert>
            </div>

            <Button onClick={downloadTemplate} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            <p className="text-xs text-slate-500 text-center">
              You can open the CSV file in Excel and save it as .xlsx format
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-slate-900/50 border-slate-700/50 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <CardHeader>
          <CardTitle className="text-white">Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-400">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-400 text-sm font-bold">1</span>
            </div>
            <p>Download the CSV template and open it in Excel or Google Sheets</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-400 text-sm font-bold">2</span>
            </div>
            <p>Fill in player data following the template format. Keep the header row unchanged.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-400 text-sm font-bold">3</span>
            </div>
            <p>Save the file as Excel format (.xlsx or .xls) or keep it as CSV</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-400 text-sm font-bold">4</span>
            </div>
            <p>Upload the file using the upload section. Existing players will be updated, new ones will be added.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
