import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { users } from "@/lib/db/schema"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // 查詢用戶
          const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.username, credentials.username),
          })

          if (!user || !user.isActive) {
            return null
          }

          // 驗證密碼
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          // 更新最後登錄時間
          await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id))

          return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// 權限檢查函數
export function canAccessAdmin(role: string): boolean {
  return ["admin", "operator"].includes(role)
}

export function canManageUsers(role: string): boolean {
  return role === "admin"
}

export function canManageTransactions(role: string): boolean {
  return ["admin", "operator"].includes(role)
}

export function canCancelTransactions(role: string): boolean {
  return role === "admin"
}

// 類型定義
declare module "next-auth" {
  interface User {
    id: string
    username: string
    role: string
  }

  interface Session {
    user: User & {
      id: string
      username: string
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: string
  }
}

