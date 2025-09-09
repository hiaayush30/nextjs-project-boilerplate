import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const NewUserSchema = z.object({
    username: z.string().min(3, { message: "Minimum 3 characters required" }),
    email: z.email(),
    password: z.string().min(3, { message: "Minimum 3 characters required" })
})

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const parsedData = NewUserSchema.safeParse(body);
        if (!parsedData.success) {
            console.log(parsedData.error.issues)
            return NextResponse.json({
                error: "Invalid Request"
            }, { status: 400 })
        }
        const { email, username, password } = parsedData.data;
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            return NextResponse.json({
                error: "email or username already registered!"
            }, { status: 403 })
        }
        const hashedPassword = await bcrypt.hash(password, 5);
        await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                profilePic: `https://avatar.iran.liara.run/username?username=${username}`
            }
        })
        return NextResponse.json({
            message: "user registered successfully!"
        }, { status: 201 })

    } catch (error) {
        console.log("Error in register route:", error)
        return NextResponse.json({
            error: "Internal server error"
        }), { status: 500 }
    }
}