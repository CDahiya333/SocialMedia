import { Link } from "react-router-dom";
import XSvg from "../svgs/X";
import { BiSolidHomeCircle } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { FaBell } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const { data: authUser } = useAuth();
  const queryClient = useQueryClient();

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
    <div className="md:flex hidden flex-col justify-between h-screen sticky top-0 overflow-auto p-4 md:basis-1/4 w-fit">
      <div className="flex flex-col items-start gap-2">
        <div className="p-3 cursor-pointer">
          <XSvg className="w-7 fill-white" />
        </div>

        <Link
          to="/"
          className="flex font-semibold gap-4 items-center hover:bg-zinc-900 p-3 rounded-full transition duration-300 w-full"
        >
          <BiSolidHomeCircle className="text-2xl" />
          <span className="hidden md:inline">Home</span>
        </Link>

        <Link
          to="/notifications"
          className="flex font-semibold gap-4 items-center hover:bg-zinc-900 p-3 rounded-full transition duration-300 w-full"
        >
          <FaBell className="text-2xl" />
          <span className="hidden md:inline">Notifications</span>
        </Link>

        <Link
          to={`/profile/${authUser?.username}`}
          className="flex font-semibold gap-4 items-center hover:bg-zinc-900 p-3 rounded-full transition duration-300 w-full"
        >
          <CgProfile className="text-2xl" />
          <span className="hidden md:inline">Profile</span>
        </Link>

        <button className="bg-primary hover:bg-opacity-80 text-white text-center rounded-full p-3 w-full hidden md:block mt-2">
          Post
        </button>

        <button onClick={() => logout()} className="btn btn-ghost md:w-3/4">
          Logout
        </button>
      </div>

      <div className="flex p-3 gap-2 items-center">
        <div className="avatar">
          <div className="w-10 rounded-full cursor-pointer">
            <img
              src={authUser?.profileImg || "/avatar-placeholder.png"}
              alt="User avatar"
            />
          </div>
        </div>
        <div className="hidden md:block">
          <h3 className="font-bold">{authUser?.fullname || "User"}</h3>
          <p className="text-gray-400">@{authUser?.username || "username"}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
