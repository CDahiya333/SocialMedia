import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();
  const {
    mutate: follow,
    isPending,
  } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/follow/${userId}`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to follow user");
        }

        return await res.json();
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("User followed successfully");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to follow user");
    },
  });
  return { follow, isPending };
};

export default useFollow;
