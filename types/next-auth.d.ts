import "next-auth";
import { DefaultSession } from "next-auth";
declare module "next-auth" {
    interface Session {
        user: {
            email: string;
            username: string,
            id: string;
            profilePic: string;
            createdAt: Date;
        } & DefaultSession['user']
    }
    interface User {
        id: string;
        username: string;
        email: string;
        profilePic: string;
        createdAt: Date;
        password: string| null;
    }

}