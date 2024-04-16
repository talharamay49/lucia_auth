import { z } from "zod";

export const SignUpFormSchema = z.object({
    userName: z.string().min(2, {
        message: "Username must be at least 2 characters."
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
    confirmPassword: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const SignInFormSchema = z.object({
    userName: z.string().min(2).max(50),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
})