// /pages/api/get-user-data.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Initialize Supabase client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: Request) {
    try {
        // Get the token from the Authorization header (Bearer token)
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: Token not provided' }, { status: 401 });
        }

        // Get user information from the Supabase token
        const { data: user, error: tokenError }: any = await supabaseAdmin.auth.getUser(token);
        if (tokenError || !user || !user.user) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }
        const userId = user.user.id;

        // Fetch user data from the 'user' table using the user's UUID
        const { data: userData, error: dbError } = await supabaseAdmin
            .from('user')
            .select('email, phone, address, postcode, area, company_name, account_type,name')
            .eq('uuid', userId)
            .single();


        if (dbError) {

            return NextResponse.json({ message: 'Failed to fetch user data', error: dbError.message }, { status: 500 });
        }

        // Return the user data to the frontend
        return NextResponse.json({ userData }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}
