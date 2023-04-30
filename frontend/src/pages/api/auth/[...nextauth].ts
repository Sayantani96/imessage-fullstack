import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_SECRET_ID as string,
    }),
  ],
  secret:process.env.NEXTAUTH_SECRET ,
  callbacks:{
    async session({ session, token, user }) {
      console.log(session.user.username);
      // Send properties to the client, like an access_token and user id from a provider.
      // session.accessToken = token.accessToken
      return {...session,user:{...session.user,...user}}
    }
  }
});