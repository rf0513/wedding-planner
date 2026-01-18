import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = sqlite.prepare('SELECT * FROM users WHERE username = ?').get(credentials.username) as {
          id: number
          username: string
          password_hash: string
          name: string
          role: string
        } | undefined

        if (!user) {
          return null
        }

        const passwordMatch = await compare(credentials.password as string, user.password_hash)

        if (!passwordMatch) {
          return null
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.username
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-super-secret-key-change-in-production'
})
