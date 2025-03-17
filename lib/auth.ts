import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import { users } from "./schema"
import { eq } from "drizzle-orm"

// 簡化的密碼驗證函數（實際應用中應使用加密比較）
async function verifyCredentials(username: string, password: string) {
  try {
    // 在實際應用中，應該使用加密比較密碼
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    })

    if (!user || user.password !== password || !user.is_active) {
      return null
    }

    // 更新最後登入時間
    await db.update(users).set({ last_login: new Date() }).where(eq(users.id, user.id))

    return {
      id: user.id,
      name: user.name,
      email: user.username + "@example.com", // 假設的郵箱
      role: user.role,
    }
  } catch (error) {
    console.error("Verify credentials error:", error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // 嘗試驗證用戶憑據
          const user = await verifyCredentials(credentials.username, credentials.password)

          // 如果沒有找到用戶或密碼不匹配，則使用測試帳號
          if (!user) {
            // 測試帳號，僅用於開發環境
            if (credentials.username === "admin" && credentials.password === "admin") {
              return {
                id: "test-admin-id",
                name: "System Admin",
                email: "admin@example.com",
                role: "admin",
              }
            }
            return null
          }

          return user
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
}

