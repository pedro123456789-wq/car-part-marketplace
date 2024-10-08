// /pages/api/update-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { decode } from "jsonwebtoken";

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

interface UpdateUserRequest {
    newPassword?: string;
    newUsername?: string;
    newPostcode?: string;
}

export async function POST(req: Request) {
    const { newPassword, newUsername, newPostcode }: UpdateUserRequest = await req.json();

    // Get the Authorization header (token) from the request
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { message: "Missing or invalid Authorization header" },
            { status: 401 }
        );
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify and decode the Supabase JWT to get the user ID
        const { sub: userId } = decode(token) as { sub: string }; // `sub` contains the user ID

        if (!userId) {
            throw new Error("Invalid token: User ID not found");
        }

        // Update the password in Supabase Auth if newPassword is provided
        if (newPassword) {
            const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                password: newPassword,
            });
            console.log("PASS -> ", passwordError)

            if (passwordError) {
                throw passwordError;
            }
        }

        // Update the username and postcode in the database if provided
        const updates: Record<string, any> = {};
        if (newUsername) updates.name = newUsername;
        if (newPostcode) updates.postcode = newPostcode;

        console.log("IO-->", updates)

        if (Object.keys(updates).length > 0) {
            const { error: dbError } = await supabaseAdmin
                .from("user")
                .update(updates)
                .eq("uuid", userId); // Use the user ID from the token to match

            if (dbError) {
                throw dbError;
            }
        }

        return NextResponse.json(
            { message: "User updated successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}
