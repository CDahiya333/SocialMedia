// src/hooks/useAuth.js
import { useQuery } from "@tanstack/react-query";
const useAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        console.log("error in useAuth:", error);
        return null; // Return null on error to indicate not authenticated
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

export default useAuth;
