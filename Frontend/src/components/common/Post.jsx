import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";

const Post = ({ post }) => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const [comment, setComment] = useState("");

  // Safely access properties with null checks
  const postOwner = post?.user || {};
  const isLiked = authUser?._id && post?.likes?.includes(authUser._id);
  const isMyPost = authUser?._id && authUser._id === post?.user?._id;
  const formattedDate = post?.createdAt ? formatPostDate(post.createdAt) : "";

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/posts/${post._id}`,
          {
            method: "DELETE",
            credentials: "include", // Include credentials
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to delete post: ${res.status}`);
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error deleting post:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/posts/like/${post._id}`,
          {
            method: "POST",
            credentials: "include", // Include credentials
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to like post: ${res.status}`);
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error liking post:", error);
        throw error;
      }
    },
    onMutate: async () => {
      // Cancel ongoing queries to prevent conflicts
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Get the current state before modifying
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update UI
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return [];

        return oldData.map((p) => {
          if (p._id === post._id) {
            const hasLiked = p.likes?.includes(authUser?._id);

            return {
              ...p,
              likes: hasLiked
                ? p.likes.filter((id) => id !== authUser?._id)
                : [...(p.likes || []), authUser?._id].filter(Boolean), // Filter out null/undefined
            };
          }
          return p;
        });
      });

      return { previousPosts };
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return [];

        return oldData.map((p) =>
          p._id === updatedPost._id ? updatedPost : p
        );
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error(err.message || "Failed to like post");
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async ({ postId, comment }) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/posts/comment/${postId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include credentials
            body: JSON.stringify({ text: comment, id: postId }),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to comment: ${res.status}`);
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error commenting on post:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    if (!post?._id) {
      toast.error("Cannot identify post");
      return;
    }
    commentPost({ postId: post._id, comment });
  };

  const handleDeletePost = () => {
    if (!post?._id) {
      toast.error("Cannot identify post to delete");
      return;
    }
    deletePost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    if (!authUser?._id) {
      toast.error("Please login to like posts");
      return;
    }
    if (!post?._id) {
      toast.error("Cannot identify post to like");
      return;
    }
    likePost();
  };

  // Guard against invalid post data
  if (!post) {
    return null;
  }

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <div className="avatar">
        <Link
          to={`/profile/${postOwner.username || ""}`}
          className="w-8 h-8 rounded-full overflow-hidden block"
        >
          <img
            src={postOwner.profileImg || "/avatar-placeholder.png"}
            alt={`${postOwner.username || "User"}'s profile`}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link
            to={`/profile/${postOwner.username || ""}`}
            className="font-bold"
          >
            {postOwner.fullName || postOwner.fullname || "User"}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner.username || ""}`}>
              @{postOwner.username || "user"}
            </Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isDeleting && (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              )}

              {isDeleting && <LoadingSpinner size="sm" />}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt="Post image"
            />
          )}
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() => {
                const modal = document.getElementById(
                  `comments_modal${post._id}`
                );
                if (modal) modal.showModal();
              }}
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">
                {post.comments?.length || 0}
              </span>
            </div>

            {/* Comment Dialog */}
            <dialog
              id={`comments_modal${post._id}`}
              className="modal border-none outline-none"
            >
              <div className="modal-box rounded border border-gray-600">
                <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                  {!post.comments || post.comments.length === 0 ? (
                    <p className="text-sm text-slate-500">No comments yet 🤔</p>
                  ) : (
                    post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            <img
                              src={
                                comment.user?.profileImg ||
                                "/avatar-placeholder.png"
                              }
                              alt={`${
                                comment.user?.username || "User"
                              }'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user?.fullName ||
                                comment.user?.fullname ||
                                "User"}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment.user?.username || "user"}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form
                  className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                  onSubmit={handlePostComment}
                >
                  <textarea
                    className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary rounded-full btn-sm text-white px-4"
                    disabled={isCommenting || !comment.trim()}
                  >
                    {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                  </button>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button className="outline-none">close</button>
              </form>
            </dialog>

            <div className="flex gap-1 items-center group cursor-pointer">
              <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
              <span className="text-sm text-slate-500 group-hover:text-green-500">
                0
              </span>
            </div>

            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={handleLikePost}
            >
              {isLiking && <LoadingSpinner size="sm" />}
              {!isLiking &&
                (isLiked ? (
                  <FaHeart className="w-4 h-4 cursor-pointer text-pink-500" />
                ) : (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                ))}

              <span
                className={`text-sm group-hover:text-pink-500 ${
                  isLiked ? "text-pink-500" : "text-slate-500"
                }`}
              >
                {post.likes?.length || 0}
              </span>
            </div>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
