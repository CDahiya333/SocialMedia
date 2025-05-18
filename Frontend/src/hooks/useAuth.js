// src/hooks/useAuth.js
import { useQuery } from "@tanstack/react-query";
import api from '../utils/axiosConfig';

const useAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (!data) return null;
        return data;
      } catch (error) {
        // If it's a 401 error, let the interceptor handle it
        if (error.response?.status === 401) {
          return null;
        }
        console.error("Error in useAuth:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
  });
};

export default useAuth;
