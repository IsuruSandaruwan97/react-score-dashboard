import { NextResponse } from "next/server"
import { getAdminById, updateAdmin } from "@/lib/db/repositories/admins"
import { comparePassword, hashPassword } from "@/lib/password-utils"

export async function POST(request: Request) {
  try {
    const { adminId, currentPassword, newPassword } = await request.json()

    const admin = await getAdminById(adminId)

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 })
    }

    const isPasswordValid = await comparePassword(currentPassword, admin.password)
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 })
    }

    const hashedPassword = await hashPassword(newPassword)
const lastLogin = new Date().toISOString().slice(0, 19).replace('T', ' ')
    await updateAdmin(adminId, {
      password: hashedPassword,
      requirePasswordChange: false,
      lastLogin,
    })

    const { password, ...adminWithoutPassword } = admin

    return NextResponse.json({
      success: true,
      admin: { ...adminWithoutPassword, requirePasswordChange: false },
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("[v0] Password change error:", error)
    return NextResponse.json({ success: false, message: "Failed to change password" }, { status: 500 })
  }
}
