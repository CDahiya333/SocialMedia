import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import { BsThreeDots } from "react-icons/bs";

const TrendingTopics = () => {
  const {
    data: trends,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["trends"],
    queryFn: async () => {
      // This would normally fetch from your backend
      // For now, returning mock data
      return [
        {
          id: 1,
          category: "Sports · Trending",
          title: "SHAME ON DESHDROHI DHONI",
          posts: "38.2K",
        },
        {
          id: 2,
          category: "Trending in India",
          title: "#Charminar",
          posts: "1,847",
        },
        {
          id: 3,
          category: "Rajasthan Royals · Trending",
          title: "Yashasvi Jaiswal",
          posts: "1,120",
        },
        {
          id: 4,
          category: "Trending in India",
          title: "परमाणु परीक्षण",
          posts: "4,068",
        },
      ];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        {error?.message || "Failed to load trends"}
      </div>
    );
  }

  return (
    <div className="theme-card p-4 border-1  rounded-xl">
      <h2 className="font-bold text-xl mb-5 theme-text-primary">What&apos;s happening</h2>
      <div className="flex flex-col">
        {trends.map((trend) => (
          <div
            key={trend.id}
            className="py-1 px-4 theme-hover rounded-lg group"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-sm theme-text-secondary">{trend.category}</span>
                <span className="font-bold mt-0.5 theme-text-primary">{trend.title}</span>
                <span className="text-sm theme-text-secondary mt-0.5">
                  {trend.posts} posts
                </span>
              </div>
              <button className="p-2 rounded-full hover:bg-blue-500/20 hover:text-blue-500 invisible group-hover:visible">
                <BsThreeDots />
              </button>
            </div>
          </div>
        ))}
        <button className="text-blue-500 hover:text-blue-400 py-3 px-4 theme-hover rounded-lg text-left mt-2">
          Show more
        </button>
      </div>
    </div>
  );
};

export default TrendingTopics; 