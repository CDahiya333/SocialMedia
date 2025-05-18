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
            credentials: "include", 
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
            credentials: "include",
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
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Get the current posts from the cache
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Update all matching post queries in the cache
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((p) => {
          if (p._id === post._id) {
            const hasLiked = p.likes?.includes(authUser?._id);
            return {
              ...p,
              likes: hasLiked
                ? p.likes.filter((id) => id !== authUser?._id)
                : [...(p.likes || []), authUser?._id],
            };
          }
          return p;
        });
      });

      // Return the previous posts for rollback in case of error
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousPosts) {
        queryClient.setQueriesData({ queryKey: ["posts"] }, context.previousPosts);
      }
      toast.error(err.message || "Failed to like post");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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

  if (!post) {
    return null;
  }

  return (
    <div className="flex gap-2 items-start p-4 border-b border-border-light dark:border-border-dark">
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
            className="font-bold hover:underline theme-text-primary"
          >
            {postOwner.fullName || postOwner.fullname || "User"}
          </Link>
          <span className="theme-text-secondary flex gap-1 text-sm">
            <Link to={`/profile/${postOwner.username || ""}`} className="hover:underline">
              @{postOwner.username || "user"}
            </Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isDeleting && (
                <FaTrash
                  className="cursor-pointer theme-text-secondary hover:text-red-500"
                  onClick={handleDeletePost}
                />
              )}
              {isDeleting && <LoadingSpinner size="sm" />}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <span className="theme-text-primary">{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-border-light dark:border-border-dark"
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
              <FaRegComment className="w-4 h-4 theme-text-secondary group-hover:text-blue-500" />
              <span className="text-sm theme-text-secondary group-hover:text-blue-500">
                {post.comments?.length || 0}
              </span>
            </div>

            {/* Comment Dialog */}
            <dialog
              id={`comments_modal${post._id}`}
              className="modal border-none outline-none"
            >
              <div className="modal-box theme-card max-w-lg w-full">
                <h3 className="font-bold text-xl mb-4 theme-text-primary">Comments</h3>
                <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                  {!post.comments || post.comments.length === 0 ? (
                    <p className="text-sm theme-text-secondary">No comments yet 🤔</p>
                  ) : (
                    post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start group p-2 theme-hover rounded-lg transition-colors">
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
                        <div className="flex flex-col flex-grow">
                          <div className="flex items-center gap-1">
                            <span className="font-bold theme-text-primary">
                              {comment.user?.fullName ||
                                comment.user?.fullname ||
                                "User"}
                            </span>
                            <span className="text-sm theme-text-secondary">
                              @{comment.user?.username || "user"}
                            </span>
                          </div>
                          <div className="text-sm theme-text-primary">{comment.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form
                  className="flex gap-2 items-center mt-4 border-t border-border-light dark:border-border-dark pt-2"
                  onSubmit={handlePostComment}
                >
                  <textarea
                    className="w-full p-2 rounded-lg text-md resize-none bg-surface-light dark:bg-surface-dark theme-text-primary placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark border border-border-light dark:border-border-dark focus:outline-none focus:border-primary-light dark:focus:border-primary-dark transition-colors"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="1"
                  />
                  <button
                    type="submit"
                    className="theme-button-primary px-4 py-1 rounded-full text-sm min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isCommenting || !comment.trim()}
                  >
                    {isCommenting ? <LoadingSpinner size="sm" /> : "Post"}
                  </button>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop bg-black/50">
                <button className="outline-none cursor-default w-full h-full">close</button>
              </form>
            </dialog>

            <div className="flex gap-1 items-center group cursor-pointer">
              <BiRepost className="w-6 h-6 theme-text-secondary group-hover:text-green-500" />
              <span className="text-sm theme-text-secondary group-hover:text-green-500">
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
                  <FaRegHeart className="w-4 h-4 cursor-pointer theme-text-secondary group-hover:text-pink-500" />
                ))}

              <span
                className={`text-sm group-hover:text-pink-500 ${
                  isLiked ? "text-pink-500" : "theme-text-secondary"
                }`}
              >
                {post.likes?.length || 0}
              </span>
            </div>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 theme-text-secondary cursor-pointer hover:text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
