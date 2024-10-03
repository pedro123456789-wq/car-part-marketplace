"use client";

import { FC, useEffect, useState } from "react";
import { User } from "../types_db";
import { createFrontEndClient } from "@/app/utils/supabase/client";

interface SellerInfoProps {
    sellerId: string;
}

const SellerInformation: FC<SellerInfoProps> = ({ sellerId }) => {
    const supabase = createFrontEndClient();
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Function to fetch user information from Supabase
        const fetchUserInfo = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("user") // Adjust table name to match your Supabase table
                    .select("*")
                    .eq("uuid", sellerId)
                    .single(); // Fetch a single user based on sellerId (uuid)

                if (error) {
                    console.error("Error fetching user data:", error);
                    return;
                }

                setUserInfo(data);
            } catch (error) {
                console.error("Error fetching user info:", error);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) {
            fetchUserInfo();
        }
    }, [sellerId, supabase]);

    if (loading) {
        return <div className="card bg-base-100 shadow-xl mb-10 min-h-40 p-5 flex items-center">
            <p>No Loading Information available...</p>
        </div>
    }

    if (!userInfo) {
        return <div className="card bg-base-100 shadow-xl mb-10 min-h-40 p-5 flex items-center">
            <p>No Seller Information available.</p>
        </div>

    }

    return (
        <div className="card rounded-md shadow-md bg-base-100 mb-10 p-5">
            <p className="text-lg font-semibold">Seller Information</p>
            <div className="flex flex-col mt-3">
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Phone:</strong> {userInfo.phone}</p>
                <p><strong>Address:</strong> {userInfo.address}</p>
                <p><strong>Postcode:</strong> {userInfo.postcode}</p>
                <p><strong>Area:</strong> {userInfo.area}</p>
            </div>
        </div>
    );
};

export default SellerInformation;
