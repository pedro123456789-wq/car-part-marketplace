import React, { useState } from "react";
import {
  FaHome,
  FaWrench,
  FaRegCommentAlt,
  FaRegUserCircle,
  FaPlusCircle,
  FaSignOutAlt,
  FaHamburger,
  FaBars,
  FaInbox,
  FaSignInAlt,
  FaUserCircle
} from "react-icons/fa";
import { useUser } from "../contexts/UserContext";

export default function NavigationBar() {
  // State to manage the visibility of the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, logOut } = useUser();

  // Function to toggle the mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-black text-white p-4 flex justify-between items-center md:rounded-b-lg shadow-lg">
        <div className="flex items-center">
          <a
            href="/"
            className={`text-xl font-bold flex flex-row space-x-5 hover:text-blue-200 ${window.location.pathname === "/" && "text-blue-300"
              }`}
          >
            <h1>Purkuosa.com</h1>
            <FaHome className="w-6 h-6" />
          </a>
        </div>

        <div className="hidden md:flex flex-row space-x-6 items-center text-sm">
          {session ? (
            <>
              <a
                href="/myParts"
                className={`flex flex-col justify-center items-center space-y-2 hover:text-blue-300 ${window.location.pathname === "/myParts" && "text-blue-300"
                  }`}
              >
                <FaPlusCircle className="text-2xl" />
                <span className="text-md">My parts</span>
              </a>

              <a
                href="/vehicles"
                className={`flex flex-col justify-center items-center space-y-2 hover:text-blue-300 ${["/vehicles", "/newPart"].includes(
                  window.location.pathname
                ) && "text-blue-300"
                  }`}
              >
                <FaWrench className="text-2xl" />
                <span className="text-md">Sell parts</span>
              </a>
              <a
                href="/chat"
                className="flex flex-col justify-center items-center space-y-2 hover:text-blue-200"
              >
                <FaRegCommentAlt className="text-2xl" />
                <span className="text-md">Messages</span>
              </a>
              <a
                href="/profile"
                className={`flex flex-col justify-center items-center space-y-2 hover:text-blue-200 ${window.location.pathname === "/profile" && "text-blue-300"
                  }`}
              >
                <FaUserCircle className="text-2xl" />
                <span className="text-md">My Profile</span>
              </a>
              <a
                onClick={() => logOut()}
                className="flex flex-col justify-center items-center space-y-2 hover:cursor-pointer hover:text-blue-200"
              >
                <FaSignOutAlt className="text-2xl" />
                <span className="text-md">Log Out</span>
              </a>
            </>
          ) : (
            <>
              <a
                href="/logIn"
                className="flex flex-col justify-center items-center space-y-2 hover:text-blue-200"
              >
                <FaSignInAlt className="text-2xl" />
                <span className="text-md">Log In</span>
              </a>
              <a
                href="/signIn"
                className="flex flex-col justify-center items-center space-y-2 hover:text-blue-200"
              >
                <FaRegUserCircle className="text-2xl" />
                <span className="text-md">Sign Up</span>
              </a>
            </>
          )}
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden flex items-center">
          <button className="hover:text-blue-200" onClick={toggleMobileMenu}>
            <FaBars />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black text-white text-sm w-full rounded-b-lg z-10">
          <div className="w-32 py-5 flex flex-col space-y-3 ml-10">
            {session ? (
              <>
                <a
                  href="#"
                  className="flex flex-row items-center space-x-2 hover:text-blue-200"
                >
                  <FaPlusCircle className="text-xl" />
                  <span>My parts</span>
                </a>
                <a
                  href="#"
                  className="flex flex-row items-center space-x-2 hover:text-blue-200"
                >
                  <FaWrench className="text-xl" />
                  <span>Sell parts</span>
                </a>
                <a
                  href="#"
                  className="flex flex-row items-center space-x-2 hover:text-blue-200"
                >
                  <FaRegCommentAlt className="text-xl" />
                  <span>Messages</span>
                </a>
                <a
                  href="/profile"
                  className={`flex flex-col justify-center items-center space-y-2 hover:text-blue-200 ${window.location.pathname === "/profile" && "text-blue-300"
                    }`}
                >
                  <FaUserCircle className="text-2xl" />
                  <span className="text-md">My Profile</span>
                </a>
                <a
                  onClick={() => logOut()}
                  className="flex flex-row items-center space-x-2 hover:cursor-pointer hover:text-blue-200"
                >
                  <FaSignOutAlt className="text-xl" />
                  <span>Log Out</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href="/signIn"
                  className="flex flex-row items-center space-x-2"
                >
                  <FaRegUserCircle className="text-xl" />
                  <span>Sign In</span>
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
