import { PrismaAdapter } from "@auth/prisma-adapter";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { Awaitable, NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { JWT } from "next-auth/jwt";
import { User } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // TODO -> Workaround DB persistance for credential provider auth -> https://nneko.branche.online/next-auth-credentials-provider-with-the-database-session-strategy/
  adapter: PrismaAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        console.log("authorize", credentials);
        if (typeof credentials !== "undefined") {
          try {
            const { email, password } = credentials;

            const res = await fetch(
              "http://localhost:3000/api/user/auth/login",
              {
                method: "post",
                body: JSON.stringify({
                  email,
                  password,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            // console.log("res", await res.text());
            const data = await res.json();
            console.log("data", data);

            if (typeof data !== "undefined") {
              console.log("in !!!");
              return { ...data.user, apiToken: data.token };
            }

            return null;
          } catch (error) {
            console.error("error", error);
          }
        } else {
          return null;
        }
      },
    }),
  ],
  jwt: {
    maxAge: 60 * 60, // 1h
  },
  session: { strategy: "jwt" },
  callbacks: {
    // async signIn() {
    //   // redirect("/app");
    // },
    async session({ session, token, user }) {
      console.log("session.token", token);
      console.log("session.user", user);

      const sanitizedToken = Object.keys(token).reduce((p, c) => {
        // strip unnecessary properties
        if (c !== "iat" && c !== "exp" && c !== "jti" && c !== "apiToken") {
          return { ...p, [c]: token[c] };
        } else {
          return p;
        }
      }, {});

      session.user = token;

      return { ...session, user: sanitizedToken, apiToken: token.apiToken };
    },
    async jwt(data) {
      console.log("jwt.all", data);
      const { token, user, account, profile } = data;
      console.log("jwt.token", token);
      console.log("jwt.user", user);
      console.log("jwt.account", user);
      if (typeof user !== "undefined") {
        // user has just signed in so the user object is populated
        return user as unknown as JWT;
      }

      return token;
    },
  },
};

// Use it in server contexts
export function getAuthServerSession(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  const session = getServerSession(...args, authOptions);

  return session;
}
