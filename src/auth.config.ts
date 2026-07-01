import type { NextAuthConfig } from "next-auth";

// No Prisma / bcrypt imports here — this must run on the edge runtime.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/signup");

      const isProtected =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/library") ||
        nextUrl.pathname.startsWith("/search") ||
        nextUrl.pathname.startsWith("/playlist") ||
        nextUrl.pathname.startsWith("/album") ||
        nextUrl.pathname.startsWith("/artist");

      if (isProtected) {
        return isLoggedIn;
      }
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
