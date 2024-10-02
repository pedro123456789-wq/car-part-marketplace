"use client";
import { useEffect, useState } from "react";
import NavigationBar from "@/app/components/NavigationBar";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import LoadingIndicator from "../components/LoadingIndicator";
import { useAlert } from "../components/alert/useAlert";
import Alert from "../components/alert/Alert";

const MyProfile = () => {
    const [profileData, setProfileData] = useState({
        email: "",
        username: "",
        password: "",
        location: "",
    });
    const supabase = createFrontEndClient();
    const { showAlert, message, type, triggerAlert } = useAlert();


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Fetch user data from the API on component mount
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch("/api/auth/get-user", {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setProfileData({
                        email: data.userData.email || "",
                        username: data.userData.name || "",
                        password: "", // Do not pre-fill passwords
                        location: data.userData.postcode || "",
                    });
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [supabase]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");

        // Validate required fields
        if (!profileData.username || !profileData.password) {
            triggerAlert("You must enter required fields!", "error");
            return;
        }
        setIsSaving(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch("/api/auth/update-user", {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newUsername: profileData.username,
                    newPassword: profileData.password,
                    newPostcode: profileData.location,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                triggerAlert("Your profile is successfully updated.", "success");
            } else {
                console.error(data.message);
                triggerAlert(data.message, "error");
            }
        } catch (error: any) {
            console.error("Error updating user data:", error);
            triggerAlert(error?.message, "error");
        }
        setIsSaving(false);
    };

    if (loading) {
        return <div className="bg-white w-[100vw] h-screen flex justify-center items-center">
            <LoadingIndicator />
        </div>;
    }

    return (
        <div>
            {showAlert && (
                <div className="absolute top-0 w-full">
                    <Alert message={message} type={type} />
                </div>
            )}
            <NavigationBar />
            <div className="pt-10">
                <div className="flex justify-center items-center">
                    <form onSubmit={handleSubmit} className="bg-white shadow-2xl flex flex-col gap-5 rounded-xl min-w-full sm:min-w-[400px] border-4 px-5 py-10">
                        <div>
                            <label className="font-semibold">Email*</label>
                            <input
                                type="text"
                                className="input input-bordered w-full mt-2"
                                value={profileData.email}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="font-semibold">Username*</label>
                            <input
                                type="text"
                                className="input input-bordered w-full mt-2"
                                value={profileData.username}
                                onChange={(e) =>
                                    setProfileData({ ...profileData, username: e.target.value })
                                }
                                placeholder="Username"
                                required
                            />
                        </div>
                        <div>
                            <label className="font-semibold">Password*</label>
                            <input
                                type="password"
                                className="input input-bordered w-full mt-2"
                                value={profileData.password}
                                onChange={(e) =>
                                    setProfileData({ ...profileData, password: e.target.value })
                                }
                                placeholder="Change Password"
                                required
                            />
                        </div>
                        <div>
                            <label className="font-semibold">Location/Pincode</label>
                            <input
                                type="text"
                                className="input input-bordered w-full mt-2"
                                value={profileData.location}
                                onChange={(e) =>
                                    setProfileData({ ...profileData, location: e.target.value })
                                }
                                placeholder="Location"
                            />
                        </div>
                        {error && <div className="text-red-500 text-center">{error}</div>}
                        <div className="text-center">
                            <button type="submit" className="btn btn-outline mt-4">
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
