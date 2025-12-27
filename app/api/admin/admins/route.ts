import { type NextRequest, NextResponse } from "next/server"
import { createAdmin, updateAdmin, deleteAdmin } from "@/lib/db/repositories/admins"
import { hashPassword } from "@/lib/password-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, username, email, password, role, requirePasswordChange = true } = body

    const hashedPassword = await hashPassword(password)

    const newAdmin = {
      id: `admin_${Date.now()}`,
      name,
      username,
      password: hashedPassword,
      email,
      role,
      status: "active" as const,
      requirePasswordChange,
      lastLogin: null,
    }

    await createAdmin(newAdmin)

    return NextResponse.json({ success: true, admin: newAdmin })
  } catch (error) {
    console.error("[v0] Error creating admin:", error)
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, username, email, password, role } = body

    const updates: any = { name, username, email, role }

    if (password) {
      updates.password = await hashPassword(password)
      updates.requirePasswordChange = true
    }

    await updateAdmin(id, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating admin:", error)
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    await updateAdmin(id, { status })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error toggling admin status:", error)
    return NextResponse.json({ error: "Failed to toggle admin status" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    await deleteAdmin(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting admin:", error)
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 })
  }
}
