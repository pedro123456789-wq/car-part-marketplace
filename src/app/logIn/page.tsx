"use client";

import React, { useEffect, useState } from "react";
import PurkosaLogo from "../assets/logo.png"; // Update with your Purkosa logo path
import { createFrontEndClient } from "../utils/supabase/client";
import { useAlert } from "../components/alert/useAlert";
import Alert from "../components/alert/Alert";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import LoadingIndicator from "../components/LoadingIndicator";
import NavigationBar from "../components/NavigationBar";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const supabase = createFrontEndClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { showAlert, message, type, triggerAlert } = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { session } = useUser();


  const handleLogIn = async () => {
    if (email.length === 0 || password.length === 0) {
      triggerAlert("You must enter an email and a password", "error");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      triggerAlert(error.message, "error");
      setIsLoading(false);
      return;
    }

    router.push("/");
  };

  const onPageLoad = async () => {
    //if user is already logged in redirect them to the main page
    if (session) {
      router.push("/");
      return;
    }

    setIsLoading(false);

    //if user has just signed up, display a success message
    if (searchParams.get('justJoined')){
      triggerAlert("Account created successfully. You can now log in.", "success");
    }
    
  };

  useEffect(() => {
    onPageLoad();
  }, []);

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      {showAlert && (
        <div className="absolute top-0 w-full">
          <Alert message={message} type={type} />
        </div>
      )}

      <div>
        <NavigationBar />
      </div>

      {/* Container for Navbar and Content */}
      <div className="flex flex-col min-h-screen">
        {/* Main Content Area */}
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-lg p-8 space-y-8 rounded-lg shadow-lg bg-black">
            <div className="flex justify-center">
              <img
                src={PurkosaLogo.src}
                alt="Purkosa Logo"
                className="w-full h-32"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Log In
            </h2>

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-black text-black rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-black text-black rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-500 hover:text-blue-700"
                >
                  Forgot your password?
                </a>
              </div>

              <div className="text-sm">
                <a
                  href="/signIn"
                  className="font-medium text-blue-500 hover:text-blue-700"
                >
                  Don&apos;t have an account?
                </a>
              </div>
            </div>

            <div>
              <button
                onClick={handleLogIn}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
