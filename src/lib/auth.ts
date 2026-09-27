import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const business = await prisma.business.findUnique({ where: { adminEmail: email } });
        if (!business) return null;

        const valid = await bcrypt.compare(password, business.adminPassword);
        if (!valid) return null;

        return { id: business.id, email: business.adminEmail, name: business.name };
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
