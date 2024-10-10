// /pages/api/create-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { error } from "console";

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  phone: string;
  address: string;
  postcode: string;
  area: string;
  business_id?: string;
  company_name?: string;
  account_type: string;
}

export async function POST(req: Request) {
  const {
    email,
    name,
    password,
    phone,
    address,
    postcode,
    area,
    business_id,
    company_name,
    account_type,
  }: CreateUserRequest = await req.json();

  // Server-side validation
  if (
    !email ||
    !name ||
    !password ||
    !phone ||
    !address ||
    !postcode ||
    !area ||
    !account_type
  ) {
    return NextResponse.json(
      {
        message: "All required fields must be filled",
      },
      {
        status: 400,
      }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      {
        message: "Password must be at least 6 characters long",
      },
      {
        status: 400,
      }
    );
  }

  try {
    // Create a new Supabase auth user
    const { data: { user }, error: authError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/`
        }
      });

    if (authError || !user) {
      throw authError;
    }

    // Insert the new user into the User table
    const { error: dbError } = await supabaseAdmin.from("user").insert([
      {
        email,
        name,
        phone,
        address,
        postcode,
        area,
        business_id: business_id || null, // Null if not provided
        company_name: company_name || null, // Null if not provided
        account_type,
        uuid: user.id, // Use the id from the created auth user
      },
    ]);

    if (dbError) {
      // Delete the auth user if database insertion fails
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw dbError;
    }

    return NextResponse.json(
      {
        message: "User created successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
