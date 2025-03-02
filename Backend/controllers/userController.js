import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.js";
import Notification from "../models/notification.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      //User not Found
      return res.status(404).json({ erorr: "User Not Found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile Controller:", error.message);
    return res.status(500).json({ erorr: "Internal Server Erorr" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");

    const followingList = usersFollowedByMe.following;
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 15 } },
    ]);
    // usersFollowedByMe.following is used because mongoose returns an object not an array to begin with
    const filteredUsers = users.filter(
      (user) => !followingList.includes(user._id.toString())
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    console.log(suggestedUsers);
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Erorr in getSuggestedUsers contoller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    //Checks
    if (id === currentUser._id.toString()) {
      return res.status(400).json({ error: "Can't Follow/Unfollow Yourself" });
    }

    if (!userToModify || !currentUser) {
      return res.status(400).json({ erorr: "User Not Found" });
    }
    const isFollowing = currentUser.following.includes(id);
    //Showing follow or Unfollow button
    if (isFollowing) {
      //Unfollow Button
      await User.findByIdAndUpdate(id, {
        $pull: { followers: currentUser._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: id },
      });
      res.status(200).json({ message: "User Unfollowed Successfully" });
    } else {
      //Follow Button
      await User.findByIdAndUpdate(id, {
        $push: { followers: currentUser._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: id },
      });
      //Sending Follow Notification
      const newNotification = new Notification({
        type: "follow",
        from: currentUser._id,
        to: userToModify._id,
      });

      await newNotification.save();
      res.status(200).json({ message: "User Followed Successfully" });
    }
  } catch (error) {
    console.log("Error in folllowUnfollowUser Controller:", error.message);
    return res.status(500).json({ erorr: "Internal Server Erorr" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullname, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  console.log(req.body);
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      //User is not found
      return res.status(404).json({ message: "User Not Found" });
    }

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ message: "Provide both Current & New Password fields" });
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        //Incorrect current Password
        return res.status(400).json({ message: "Incorrect Current password" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password length must be atleast 6 charactes" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedImg = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedImg.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedImg = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedImg.secure_url;
    }
    //Updating User in Database
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null; // Prevent fishing from response

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUserProfile Controller:", error);
    return res.status(500).json({ error: "Internal Server Erorr" });
  }
};
