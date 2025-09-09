import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import { prisma } from "../../../../lib/prisma"
import { User } from "@prisma/client";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "john" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {  //constructs the jwt token
                // Add logic here to look up the user from the credentials supplied
                if (!credentials?.password || !credentials.email) {
                    throw new Error("Invalid request!")
                }
                await prisma.$connect();
                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email
                    }
                })

                if (user) {
                    // user exists but no password ie he signed up through google
                    if(!user.password) throw new Error("Login using Google")
                        
                    if (!bcrypt.compareSync(credentials.password, user.password)) {
                        throw new Error("Email or Password incorrect!")
                    }
                    // Any object returned will be saved in `user` property of the JWT
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    throw new Error("username or password incorrect")

                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 20 * 24 * 60 * 60 //30 days
    },
    callbacks: {
        async jwt({ token, user, profile }) {
            // The user object is only available when the user logs in. On subsequent requests, the token is used
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.username = user.name;
                token.profilePic = user.profilePic;
                token.createdAt = user.createdAt;
            }
            else if (profile) {
                const foundUser = await prisma.user.findFirst({
                    where: {
                        email: profile.email
                    }
                })
                if (foundUser) {
                    token.id = foundUser.id;
                    token.email = foundUser.email;
                    token.username = foundUser.username;
                    token.profilePic = foundUser.profilePic;
                    token.createdAt = foundUser.createdAt;
                } else {
                    await prisma.user.create({
                        data:{
                            email:profile.email!,
                            username:profile.name || profile.email!.split("@")[0],
                            profilePic:`https://avatar.iran.liara.run/username?username=${profile.name}`,
                        }
                    })
                }
            }
            return token
        },
        async session({ session, token }) { //this user came from what we returned in the authorize fn
            // This callback modifies the session object that is sent to the client.
            // Runs every time useSession() or getSession() is called on the client.
            // Uses data from the token (not user, since user data is only available on login).

            // console.log("token in session:"+token);
            if (token) {
                const data = token as unknown as User
                session.user.id = data.id;
                session.user.email = data.email;
                session.user.username = data.username;
                session.user.createdAt = data.createdAt;
                session.user.profilePic = data.profilePic;
            }
            return session
        }
    },
    pages: {
        error: '/login',
        signIn:"/login"
    },
    secret: process.env.NEXTAUTH_SECRET
}