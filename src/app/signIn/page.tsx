"use client";

import React, { useEffect, useState } from "react";
import PurkosaLogo from "../assets/logo.png";
import { useAlert } from "../components/alert/useAlert";
import Alert from "../components/alert/Alert";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/UserContext";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postCode, setPostCode] = useState("");
  const [area, setArea] = useState("");
  const [businessID, setBusinessID] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accountType, setAccountType] = useState("Company");
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert, message, type, triggerAlert } = useAlert();
  const { session } = useUser();
  const router = useRouter();

  // Client-side validation function
  const validateForm = () => {
    if (!email || !name || !password || !phone || !address || !postCode || !area || !accountType) {
      triggerAlert("All fields must be filled", "error");
      return false;
    }

    if (password !== confirmPassword) {
      triggerAlert("Passwords do not match", "error");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      triggerAlert("Invalid email format", "error");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password,
          phone,
          address,
          postcode: postCode,
          area,
          business_id: businessID,
          company_name: companyName,
          account_type: accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      triggerAlert("User created successfully", "success");
      router.push("/logIn?justJoined=true");
    } catch (error) {

      console.error(error);
      triggerAlert("Error creating account", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onPageLoad = async () => {
    if (session) {
      router.push("/");
      return;
    }
  };

  useEffect(() => {
    onPageLoad();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center">
        <span className="loading loading-ring loading-lg text-black"></span>
      </div>
    );
  }

  return (
    <>
      {showAlert && (
        <div className="absolute top-0 w-full">
          <Alert message={message} type={type} />
        </div>
      )}

      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
        {/* Logo Section */}
        <div className="w-full max-w-4xl flex justify-center mb-6 pt-5">
          <img
            src={PurkosaLogo.src}
            alt="Purkosa Logo"
            className="w-full max-w-2xl h-auto rounded-lg"
          />
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Create a free account easily</h3>
              <ul className="list-disc list-inside">
                <li>Access a variety of auctions</li>
                <li>Participate in verified transactions</li>
                <li>View and track your bidding history</li>
                <li>Save and manage your favorite items</li>
                <li>Receive personalized recommendations</li>
              </ul>
            </div>

            {/* Right Section - Sign Up Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="input input-bordered"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">Phone number</label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    className="input input-bordered"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="form-control">
                  <label className="label">Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="input input-bordered"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    className="input input-bordered"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="input input-bordered"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">Address</label>
                <input
                  type="text"
                  placeholder="Address"
                  className="input input-bordered"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">Post code</label>
                  <input
                    type="text"
                    placeholder="Post code"
                    className="input input-bordered"
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">Area</label>
                  <input
                    type="text"
                    placeholder="Area"
                    className="input input-bordered"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">Customer Type</label>
                <div className="flex space-x-4">
                  <label className="cursor-pointer flex items-center space-x-2">
                    <input
                      type="radio"
                      name="customerType"
                      className="radio"
                      value="Company"
                      checked={accountType === "Company"}
                      onChange={() => setAccountType("Company")}
                    />
                    <span>Company</span>
                  </label>
                  <label className="cursor-pointer flex items-center space-x-2">
                    <input
                      type="radio"
                      name="customerType"
                      className="radio"
                      value="Individual"
                      checked={accountType === "Individual"}
                      onChange={() => setAccountType("Individual")}
                    />
                    <span>Individual</span>
                  </label>
                </div>
              </div>

              {accountType === "Company" && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">Business ID</label>
                    <input
                      type="text"
                      placeholder="Business ID"
                      className="input input-bordered"
                      value={businessID}
                      onChange={(e) => setBusinessID(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">Company Name</label>
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="input input-bordered"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSignUp}
                className="btn btn-primary w-full mt-4"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
