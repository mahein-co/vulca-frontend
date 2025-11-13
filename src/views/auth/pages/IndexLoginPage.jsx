import React from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../constants/globalConstants";

export default function IndexLoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // 🔐 Handle login logic here
    console.log("Form submitted");
  };

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-gray-600 space-y-5">
        {/* Header */}
        <div className="text-center pb-8">
          <Link
            to={PATHS.home}
            className="inside-title text-dark text-3xl font-semibold sm:text-3xl"
          >
            Vulca <span className="inside-title text-primary">Menabe</span>
          </Link>
          <div className="mt-5">
            <h3 className="text-dark text-2xl font-normal sm:text-3xl">
              Log in to your account
            </h3>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full mt-2 px-3 py-2 text-grey bg-transparent outline-none border focus:border-grey shadow-sm rounded-lg"
            />
          </div>

          <div>
            <label className="font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
              className="w-full mt-2 px-3 py-2 text-grey bg-transparent outline-none border focus:border-grey shadow-sm rounded-lg"
            />
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <Link
              to={PATHS.forgotPassword}
              className="text-center font-normal text-primary hover:text-secondary"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white font-medium bg-primary hover:bg-red-500 active:bg-primary rounded-lg duration-150"
          >
            Sign in
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center">
          Don&apos;t have an account?{" "}
          <Link
            to={PATHS.register}
            className="font-normal text-primary hover:text-red-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
