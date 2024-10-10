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

    // State for managing the Reset Password modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

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
        if (!profileData.username) {
            triggerAlert("Username is required!", "error");
            return;
        }

        setIsSaving(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            // Prepare the payload
            const payload: any = {
                newUsername: profileData.username,
                newPostcode: profileData.location,
            };

            if (profileData.password) {
                payload.newPassword = profileData.password;
            }

            const response = await fetch("/api/auth/update-user", {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                triggerAlert("Your profile is successfully updated.", "success");
                // Clear the password field after successful update
                setProfileData((prev) => ({ ...prev, password: "" }));
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

    // Handle Reset Password modal save
    const handleResetPassword = () => {
        setPasswordError("");

        if (!newPassword || !confirmPassword) {
            setPasswordError("Please enter both the fields to change your password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match!");
            return;
        }

        // Optionally, add more password strength validations here

        // Assign the new password to profileData
        setProfileData((prev) => ({ ...prev, password: newPassword }));

        // Close the modal and clear password fields
        setIsModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");

        triggerAlert("Password has been reset. Don't forget to save changes.", "success");
    };

    if (loading) {
        return (
            <div className="bg-white w-[100vw] h-screen flex justify-center items-center">
                <LoadingIndicator />
            </div>
        );
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
                            <label className="font-semibold">Name*</label>
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
                        <div className="mt-4">
                            <button
                                type="button"
                                className="btn btn-primary w-full"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Reset Password
                            </button>
                        </div>
                        {error && <div className="text-red-500 text-center">{error}</div>}
                        <div className="text-center">
                            <button type="submit" className="btn btn-outline mt-4" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Reset Password Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                            onClick={() => setIsModalOpen(false)}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="font-semibold">New Password*</label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full mt-2"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="font-semibold">Confirm Password*</label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full mt-2"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    required
                                />
                            </div>
                            {passwordError && <div className="text-red-500 text-center">{passwordError}</div>}
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleResetPassword}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
