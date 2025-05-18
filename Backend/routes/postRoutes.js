import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createPost,
  deletePost,
  likeUnlikePost,
  commentOnPost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  getUserReplies,
} from "../controllers/postController.js";
import multer from "multer";

const router = express.Router();
// 🔹 Multer setup to store file in memory (for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔹 Updated create post route to accept file uploads
router.post("/create", protectRoute, upload.single("img"), createPost);

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/user/:username", protectRoute, getLikedPosts);
router.get("/replies/user/:username", protectRoute, getUserReplies);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;
