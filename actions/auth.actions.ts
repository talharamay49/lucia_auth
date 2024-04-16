"use server"

import { lucia, ValidateRequest } from '@/lib/auth';
import { userTable } from './../app/lib/db/schema';
import db from "@/app/lib/db"
import { SignInFormSchema, SignUpFormSchema } from "@/types"
import { generateId } from "lucia"
import { Argon2id } from "oslo/password"
import { z } from "zod"
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

export const signUp = async (values: z.infer<typeof SignUpFormSchema>) => {
    console.log("SignUp", values)

    const hashedPassword = await new Argon2id().hash(values.password)
    const userId = generateId(15)

    try {
        await db.insert(userTable).values({
            id: userId,
            userName: values.userName,
            hashedPassword: hashedPassword
        }).returning({
            id: userTable.id,
            userName: userTable.userName,
        })

        const session = await lucia.createSession(userId, {
            expiresIn: 60 * 60 * 24 * 30
        })

        const sessionCookie = await lucia.createSessionCookie(session.id)

        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

        return {
            success: true,
            data: {
                userId,
            }
        }

    } catch (error: any) {
        return { error: error?.message }
    }
}


export const signIn = async (values: z.infer<typeof SignInFormSchema>) => {
    try {
        SignInFormSchema.parse(values)
    } catch (error: any) {
        return {
            error: error.message,
        }
    }

    const existingUser = await db.query.userTable.findFirst({
        where: (table) => eq(table.userName, values.userName),
    })

    if (!existingUser) {
        return {
            error: "User not found",
        }
    }

    if (!existingUser.hashedPassword) {
        return {
            error: "User not found",
        }
    }

    const isValidPassword = await new Argon2id().verify(
        existingUser.hashedPassword,
        values.password
    )

    if (!isValidPassword) {
        return {
            error: "Incorrect username or password",
        }
    }

    const session = await lucia.createSession(existingUser.id, {
        expiresIn: 60 * 60 * 24 * 30,
    })

    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    )

    return {
        success: "Logged in successfully",
    }
}


export const signOut = async () => {
    try {
        const { session } = await ValidateRequest()

        if (!session) {
            return {
                error: "Unauthorized",
            }
        }

        await lucia.invalidateSession(session.id)

        const sessionCookie = lucia.createBlankSessionCookie()

        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        )
    } catch (error: any) {
        return {
            error: error?.message,
        }
    }
}