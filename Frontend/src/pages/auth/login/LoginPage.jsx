import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import toast from "react-hot-toast";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to Login");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Login Successful");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
    // console.log(formData);
  };
  // const isError = false;
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <div
      className="flex relative h-screen w-full flex-row opacity-10 "
      style={{
        backgroundImage: "url('/shadowArmy.jpg')",
        backgroundPosition: "100% 50%",
        backgroundSize: "cover",
        opacity: "0.8",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Center Content */}
      <div className="flex flex-1 flex-col justify-center items-center px-4 z-20">
        <form
          className="flex gap-4 flex-col w-full max-w-md"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24  fill-white" />
          <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <div className="flex flex-row gap-4 items-start">
            <button className="btn rounded-full btn-outline btn-primary pr-4 text-white w-1/3">
              {isPending ? "Loading..." : "Login"}
            </button>
            <Link to="/signup">
              <button className="btn rounded-full btn-outline btn-error pl-4 mr-16 text-white w-full">
                Sign up
              </button>
            </Link>
          </div>

          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
      </div>

      {/* Right Image Panel */}
      <div className="hidden relative basis-1/3 items-center justify-center">
        {/* Left-side gradient */}
        <div className="absolute top-0 left-0 h-full w-40 bg-gradient-to-r from-zinc-900 via-zin-700 to-transparent pointer-events-none" />

        {/* Actual Image */}
        <img src="/RightPanel.jpg" className="object-cover h-full w-full" />
      </div>
    </div>
  );
};
export default LoginPage;
