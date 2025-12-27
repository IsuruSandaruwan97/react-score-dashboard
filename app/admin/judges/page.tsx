"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Scale } from "lucide-react"

interface Judge {
  id: string
  name: string
  label: string
}

export default function JudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null)
  const [deleteJudge, setDeleteJudge] = useState<Judge | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    label: "",
  })

  useEffect(() => {
    const loadJudges = async () => {
      try {
        const response = await fetch("/api/data/judges")
        const data = await response.json()
        setJudges(data.judges)
      } catch (error) {
        console.error("[v0] Error loading judges:", error)
      }
    }

    loadJudges()
  }, [])

  const handleOpenDialog = (judge?: Judge) => {
    if (judge) {
      setEditingJudge(judge)
      setFormData({
        name: judge.name,
        label: judge.label,
      })
    } else {
      setEditingJudge(null)
      setFormData({
        name: "",
        label: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = "/api/admin/judges"
      const method = editingJudge ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingJudge ? { id: editingJudge.id, ...formData } : formData),
      })

      if (response.ok) { 
        if (editingJudge) {
          setJudges(judges.map((j) => (j.id === editingJudge.id ? {...j, ...formData} : j)))
        } 
        else{
          setJudges(prev => [
            ...prev,
            { name: formData.name, label: 'fdsfds', id: '' }
          ])
        }
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("[v0] Error saving judge:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteJudge) return

    try {
      const response = await fetch(`/api/admin/judges?id=${deleteJudge.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setJudges(judges.filter((j) => j.id !== deleteJudge.id))
        setDeleteJudge(null)
      }
    } catch (error) {
      console.error("[v0] Error deleting judge:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Judge Management</h1>
          <p className="text-slate-400 mt-1">Manage judges and their display labels</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4" />
              Add Judge
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{editingJudge ? "Edit Judge" : "Add New Judge"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingJudge ? "Update judge details" : "Add a new judge to the competition"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="bg-slate-950/50 border-slate-700 text-white"
                  required
                />
              </div>

               

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {editingJudge ? "Update Judge" : "Add Judge"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Added slide-up animation and hover lift effect to card */}
      <Card className="bg-slate-900/50 border-purple-500/20 animate-slide-up hover-lift">
        <CardHeader>
          <CardTitle className="text-white">Judges</CardTitle>
          <CardDescription className="text-slate-400">
            Judges appear as column headers in the score entry grid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {judges.map((judge, index) => (
              <div
                key={judge.id}
                className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                    <Scale className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{judge.name}</h3>
                    <p className="text-sm text-slate-400">{judge.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(judge)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteJudge(judge)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteJudge} onOpenChange={(open) => !open && setDeleteJudge(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Judge</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete <strong>{deleteJudge?.name}</strong>? This action cannot be undone. If
              scores already exist for this judge, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Judge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
