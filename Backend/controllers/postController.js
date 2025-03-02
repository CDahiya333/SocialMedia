import User from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.js";
import Notification from "../models/notification.js";

export const createPost = async (req, res) => {
  try {
    const text = req.body.text;
    let img = null;
    const userId = req.user._id.toString();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    if (!text && !req.file) {
      return res.status(400).json({ error: "Post must have text or an image" });
    }

    if (req.file) {
      const uploadedImg = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(req.file.buffer);
      });

      img = uploadedImg;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();

    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost Controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const commentOnPost = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const text = req.body.text;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(400).json({ error: "Text Field Empty" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post Not Found" });
    }
    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    return res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentOnPost Controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post Not Found" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (!userLikedPost) {
      //Likes the Post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      //Notification
      const newNotification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await newNotification.save();
    } else {
      // Dislikes the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      // Like Count excluding the authUser
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    }
    return res.status(200).json({
      message: userLikedPost
        ? "Post Disliked Successfully"
        : "Post Liked Successfully",
      post, // Return Entire post
    });
  } catch (error) {
    console.log("Error in likeUnlikePost Controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post Not Found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "UnAuthorized to Delete Post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post Deleted Successfully" });
  } catch (error) {
    console.log("Error in deletePost Controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts Controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts || [] } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" })
      .lean(); // Optimize query performance

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts Controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    const AccountsFollowing = user.following;

    const feedPosts = await Post.find({ user: { $in: AccountsFollowing } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts Controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts Controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
