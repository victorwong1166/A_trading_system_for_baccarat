import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      async authorize(credentials, req) {
        // 這裡處理用戶驗證邏輯
        // 示例：簡單的用戶名和密碼驗證
        if (credentials?.username === "user" && credentials?.password === "user") {
          return { id: "1", name: "Frontend User", email: "user@example.com", role: "user" }
        } else if (credentials?.username === "admin" && credentials?.password === "admin") {
          return { id: "2", name: "System Admin", email: "admin@example.com", role: "admin" }
        }
        return null
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
      session.user.role = token.role
      session.user.id = token.id
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

