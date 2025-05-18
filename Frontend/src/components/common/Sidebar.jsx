import { Link } from "react-router-dom";
import XSvg from "../svgs/X";
import { BiSolidHomeCircle } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { FaBell } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { BsSun, BsMoon } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = () => {
  const { data: authUser } = useAuth();
  const queryClient = useQueryClient();
  const { isDark, toggleTheme } = useTheme();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to logout");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.setQueryData(["authUser"], null);
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    },
  });

  if (!authUser) return null;

  return (
    <div className="md:flex hidden flex-col justify-between h-screen sticky top-0 overflow-auto p-4 md:basis-1/4 w-fit theme-sidebar">
      <div className="flex flex-col items-start gap-2">
        <div className="p-3 cursor-pointer">
          <XSvg className="w-7 theme-text-primary" />
        </div>

        <Link
          to="/"
          className="flex font-semibold gap-4 items-center hover:bg-gray-300/60 dark:hover:bg-white/10 p-3 rounded-full transition duration-300 w-full"
        >
          <BiSolidHomeCircle className="text-2xl" />
          <span className="hidden md:inline">Home</span>
        </Link>

        <Link
          to="/notifications"
          className="flex font-semibold gap-4 items-center hover:bg-black/60 dark:hover:bg-white/10 p-3 rounded-full transition duration-300 w-full"
        >
          <FaBell className="text-2xl" />
          <span className="hidden md:inline">Notifications</span>
        </Link>

        <Link
          to={`/profile/${authUser?.username}`}
          className="flex font-semibold gap-4 items-center hover:bg-gray-300/60 dark:hover:bg-white/10 p-3 rounded-full transition duration-300 w-full"
        >
          <CgProfile className="text-2xl" />
          <span className="hidden md:inline">Profile</span>
        </Link>

        <button 
          onClick={toggleTheme}
          className="flex font-semibold gap-4 items-center hover:bg-gray-300/60 dark:hover:bg-white/10 p-3 rounded-full transition duration-300 w-full"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <BsSun className="text-2xl" />
          ) : (
            <BsMoon className="text-2xl" />
          )}
          <span className="hidden md:inline">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button className="theme-button-primary text-center rounded-full p-3 w-full hidden md:block mt-2">
          Post
        </button>
      </div>

      <div className="flex items-center justify-between p-3 gap-2 hover:bg-gray-300/60 dark:hover:bg-white/10 rounded-full transition duration-300 group cursor-pointer">
        <Link
          to={`/profile/${authUser?.username}`}
          className="flex gap-2 items-center"
        >
          <div className="avatar">
            <div className="w-10 rounded-full cursor-pointer">
              <img
                src={authUser?.profileImg || "/avatar-placeholder.png"}
                alt="User avatar"
              />
            </div>
          </div>
          <div className="hidden md:block">
            <h3 className="font-bold theme-text-primary">{authUser?.fullname || "User"}</h3>
            <p className="theme-text-secondary">@{authUser?.username || "username"}</p>
          </div>
        </Link>
        <button 
          onClick={() => logout()} 
          className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-full transition duration-300"
          title="Logout"
        >
          <FiLogOut className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
