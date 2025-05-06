import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { MdAutoDelete } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
          {
            credentials: "include", // Add credentials to ensure auth cookies are sent
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || `Failed to fetch notifications: ${res.status}`
          );
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
    },
  });

  const { mutate: deleteNotifications, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
          {
            method: "DELETE",
            credentials: "include", // Add credentials to ensure auth cookies are sent
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || `Failed to delete notifications: ${res.status}`
          );
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error deleting notifications:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notifications");
    },
  });

  const handleDeleteNotifications = () => {
    if (notifications && notifications.length > 0) {
      deleteNotifications();
    } else {
      toast.error("No notifications to delete");
    }
  };

  if (error) {
    return (
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
        </div>
        <div className="text-center p-4">
          <p className="text-red-500">Error loading notifications</p>
          <p className="text-sm text-gray-400">{error.message}</p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["notifications"] })
            }
            className="mt-2 btn btn-sm btn-outline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <p className="font-bold">Notifications</p>
        <div
          tabIndex={0}
          role="button"
          className={`m-1 ${
            isDeleting || !notifications?.length
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:text-red-500"
          }`}
          onClick={handleDeleteNotifications}
          disabled={isDeleting || !notifications?.length}
        >
          <MdAutoDelete className="w-4 h-4" />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center h-64 items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!isLoading && (!notifications || notifications.length === 0) && (
        <div className="text-center p-4 font-bold">No notifications</div>
      )}

      {!isLoading && notifications && notifications.length > 0 && (
        <div>
          {notifications.map((notification) => (
            <div className="border-b border-gray-700" key={notification._id}>
              <div className="flex gap-2 p-4 items-center">
                {notification.type === "follow" && (
                  <FaUser className="w-7 h-7 text-primary flex-shrink-0" />
                )}
                {notification.type === "like" && (
                  <FaHeart className="w-7 h-7 text-red-500 flex-shrink-0" />
                )}

                <div className="flex gap-2 items-center">
                  <Link
                    to={`/profile/${notification.from?.username}`}
                    className="flex items-center gap-2"
                  >
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img
                          src={
                            notification.from?.profileImg ||
                            "/avatar-placeholder.png"
                          }
                          alt={`${
                            notification.from?.username || "User"
                          }'s avatar`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold">
                        @{notification.from?.username || "Unknown User"}
                      </span>
                      <span className="text-sm text-gray-400">
                        {notification.type === "follow"
                          ? "followed you"
                          : "liked your post"}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-4 rounded shadow-lg flex flex-col items-center">
            <LoadingSpinner size="md" />
            <p className="mt-2">Deleting notifications...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
