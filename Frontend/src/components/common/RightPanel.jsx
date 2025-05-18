import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import useFollow from "../../hooks/useFollow";
import TrendingTopics from "./TrendingTopics";

const RightPanel = () => {
  const { data: authUser } = useAuth();
  const { follow, isPending: isFollowingUser } = useFollow();

  const {
    data: suggestedUsers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/suggested`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  if (!authUser) return null;

  return (
    <div className="hidden lg:flex flex-col basis-1/3 p-4 sticky top-0 h-screen overflow-auto theme-panel">
      <div className="flex flex-col gap-4">
        <div className="theme-card p-4">
          <h2 className="font-bold text-xl mb-5 theme-text-primary">Who to follow</h2>
          {isLoading && (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          )}
          {isError && <p className="text-red-500">{error.message}</p>}
          <div className="flex flex-col gap-4">
            {suggestedUsers?.map((user) => (
              <div className="flex justify-between" key={user._id}>
                <Link to={`/profile/${user.username}`} className="flex gap-2">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img
                        src={user.profileImg || "/avatar-placeholder.png"}
                        alt={`${user.username}'s avatar`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold theme-text-primary">
                      {user.fullname}
                    </span>
                    <span className="theme-text-secondary">@{user.username}</span>
                  </div>
                </Link>
                <button
                  onClick={() => follow(user._id)}
                  className="theme-button-primary px-4 py-1 rounded-full text-sm"
                  disabled={isFollowingUser}
                >
                  {isFollowingUser ? "Following..." : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <TrendingTopics />
      </div>
    </div>
  );
};

export default RightPanel;
