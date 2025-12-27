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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, UserX, UserCheck, Shield, User } from "lucide-react"

interface Admin {
  id: string
  name: string
  username: string
  email: string
  role: "main" | "normal"
  status: "active" | "disabled"
  lastLogin: string
  createdAt: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "normal" as "normal" | "main",
  })

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const response = await fetch("/api/data/admins")
        const data = await response.json()
        setAdmins(data.admins)
      } catch (error) {
        console.error("[v0] Error loading admins:", error)
      }
    }

    loadAdmins()
  }, [])

  const handleOpenDialog = (admin?: Admin) => {
    if (admin) {
      setEditingAdmin(admin)
      setFormData({
        name: admin.name,
        username: admin.username,
        email: admin.email,
        password: "",
        role: admin.role,
      })
    } else {
      setEditingAdmin(null)
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "normal",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingAdmin ? "/api/admin/admins" : "/api/admin/admins"
      const method = editingAdmin ? "PUT" : "POST"

      const payload = editingAdmin ? { id: editingAdmin.id, ...formData } : { ...formData, requirePasswordChange: true }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const { admin } = await response.json()

        if (editingAdmin) {
          setAdmins(admins.map((a) => (a.id === admin.id ? admin : a)))
        } else {
          setAdmins([...admins, admin])
        }

        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("[v0] Error saving admin:", error)
    }
  }

  const handleToggleStatus = async (adminId: string) => {
    const admin = admins.find((a) => a.id === adminId)
    if (!admin) return

    try {
      const response = await fetch("/api/admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: adminId,
          status: admin.status === "active" ? "disabled" : "active",
        }),
      })

      if (response.ok) {
        const { admin: updatedAdmin } = await response.json()
        setAdmins(admins.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a)))
      }
    } catch (error) {
      console.error("[v0] Error toggling admin status:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Management</h1>
          <p className="text-slate-400 mt-1">Manage admin accounts and permissions</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{editingAdmin ? "Edit Admin" : "Create New Admin"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingAdmin ? "Update admin account details" : "Add a new admin to the system"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-950/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-slate-950/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-950/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingAdmin ? "New Password (leave blank to keep current)" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-950/50 border-slate-700 text-white"
                  required={!editingAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "normal" | "main") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="normal">Normal Admin</SelectItem>
                    <SelectItem value="main">Main Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {editingAdmin ? "Update Admin" : "Create Admin"}
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

      <Card className="bg-slate-900/50 border-purple-500/20 animate-slide-up hover-lift">
        <CardHeader>
          <CardTitle className="text-white">Admin Accounts</CardTitle>
          <CardDescription className="text-slate-400">Manage and monitor admin access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin, index) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                    {admin.role === "main" ? (
                      <Shield className="w-5 h-5 text-purple-400" />
                    ) : (
                      <User className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{admin.name}</h3>
                      <Badge
                        variant={admin.status === "active" ? "default" : "secondary"}
                        className={
                          admin.status === "active"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-slate-700 text-slate-400"
                        }
                      >
                        {admin.status}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {admin.role === "main" ? "Main Admin" : "Normal Admin"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span>{admin.username}</span>
                      <span>•</span>
                      <span>{admin.email}</span>
                      <span>•</span>
                      <span>Last login: {formatDate(admin.lastLogin)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(admin)}
                    className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800/50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(admin.id)}
                    className={`gap-2 border-slate-700 ${
                      admin.status === "active"
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-green-400 hover:bg-green-500/10"
                    }`}
                  >
                    {admin.status === "active" ? (
                      <>
                        <UserX className="w-4 h-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Enable
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
