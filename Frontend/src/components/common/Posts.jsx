import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType = "forYou", username, activeTab }) => {
  const getPostEndpoint = () => {
    // Use activeTab if provided (for profile page), otherwise use feedType (for feed page)
    const tabType = activeTab || feedType;

    switch (tabType) {
      case "forYou":
        return `${import.meta.env.VITE_BACKEND_URL}/api/posts/all`;
      case "following":
        return `${import.meta.env.VITE_BACKEND_URL}/api/posts/following`;
      case "posts":
        return `${import.meta.env.VITE_BACKEND_URL}/api/posts/user/${username}`;
      case "likes":
        return `${import.meta.env.VITE_BACKEND_URL}/api/posts/likes/user/${username}`;
      case "replies":
        return `${import.meta.env.VITE_BACKEND_URL}/api/posts/replies/user/${username}`;
      default:
        return `${import.meta.env.VITE_BACKEND_URL}/api/posts/all`;
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["posts", activeTab || feedType, username],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT, {
          credentials: "include", // Ensures cookies are sent with the request
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to fetch posts: ${res.status}`);
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
    },
    enabled: Boolean(
      username || feedType === "forYou" || feedType === "following"
    ),
  });

  useEffect(() => {
    refetch();
  }, [feedType, activeTab, username, refetch]);

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error loading posts</p>
        <p className="text-sm text-gray-400">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 btn btn-sm btn-outline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && (!posts || posts.length === 0) && (
        <p className="text-center my-4">No posts to show</p>
      )}
      {!isLoading && !isRefetching && posts && posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
