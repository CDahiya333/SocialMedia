import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useFollow from "../../hooks/useFollow";
import useAuth from "../../hooks/useAuth";
import Posts from "../../components/common/Posts";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import UpdateProfileModal from "./EditProfileModal";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { data: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] =
    useState(false);

  const {
    data: userProfile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/${username}`,
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

  const { follow, isPending: isFollowingUser } = useFollow();

  const handleFollowUser = () => {
    if (userProfile?._id) {
      follow(userProfile._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-[4_4_0] h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="flex-[4_4_0] h-screen flex justify-center items-center flex-col">
        <p className="text-red-500">Error loading profile</p>
        <button className="mt-4 btn btn-outline" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const isOwnProfile = authUser?._id === userProfile?._id;
  const isFollowing = authUser?.following?.includes(userProfile?._id);

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        {/* Header */}
        <div className="flex px-4 py-2 items-center gap-8">
          <IoArrowBack
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <div className="flex flex-col ">
            <h1 className="font-bold text-2xl">{userProfile?.fullname}</h1>
            <div className="text-gray-400">
              {userProfile?.posts?.length || 0}{" "}
              {userProfile?.posts?.length === 1 ? "Post" : "Posts"}
            </div>
          </div>
        </div>

        {/* Profile Image & Bio */}
        <div className="border-b border-gray-700">
          {/* Cover Image */}
          <div className="h-36 bg-slate-700"></div>

          {/* Profile Pic, Edit Button, Follow Button */}
          <div className="flex justify-between mt-[-15%] px-4">
            <div className="avatar">
              <div className="w-32 h-32 rounded-full border-4 border-black">
                <img
                  src={userProfile?.profileImg || "/avatar-placeholder.png"}
                  alt="User profile"
                />
              </div>
            </div>
            <div>
              {isOwnProfile ? (
                <button
                  onClick={() => setIsUpdateProfileModalOpen(true)}
                  className="btn rounded-full btn-outline border-gray-600 mt-20"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  className="btn btn-primary rounded-full btn-outline text-white mt-20"
                  onClick={handleFollowUser}
                  disabled={isFollowingUser}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>

          {/* Info & Bio */}
          <div className="p-4">
            <h1 className="font-bold text-2xl">{userProfile?.fullname}</h1>
            <h1 className="text-gray-400 mb-4">@{userProfile?.username}</h1>
            <p>{userProfile?.bio}</p>

            <div className="flex gap-4 mt-4">
              <p>
                <span className="font-bold">
                  {userProfile?.following?.length || 0}
                </span>{" "}
                <span className="text-gray-400">Following</span>
              </p>
              <p>
                <span className="font-bold">
                  {userProfile?.followers?.length || 0}
                </span>{" "}
                <span className="text-gray-400">
                  {userProfile?.followers?.length === 1
                    ? "Follower"
                    : "Followers"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b border-gray-700 bg-black">
          <div
            className={`flex justify-center flex-1 cursor-pointer p-3 hover:bg-secondary transition duration-300 relative ${
              activeTab === "posts" ? "font-bold" : ""
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
            {activeTab === "posts" && (
              <div className="absolute bottom-0 w-12 h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className={`flex justify-center flex-1 cursor-pointer p-3 hover:bg-secondary transition duration-300 relative ${
              activeTab === "replies" ? "font-bold" : ""
            }`}
            onClick={() => setActiveTab("replies")}
          >
            Replies
            {activeTab === "replies" && (
              <div className="absolute bottom-0 w-12 h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className={`flex justify-center flex-1 cursor-pointer p-3 hover:bg-secondary transition duration-300 relative ${
              activeTab === "likes" ? "font-bold" : ""
            }`}
            onClick={() => setActiveTab("likes")}
          >
            Likes
            {activeTab === "likes" && (
              <div className="absolute bottom-0 w-12 h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>

        {/* Show filtered posts */}
        <Posts username={username} activeTab={activeTab} />
      </div>

      {isUpdateProfileModalOpen && (
        <UpdateProfileModal
          isOpen={isUpdateProfileModalOpen}
          onClose={() => setIsUpdateProfileModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProfilePage;
