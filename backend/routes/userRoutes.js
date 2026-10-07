const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Notification = require("../models/notification");
const authMiddleware = require("../middleware/authMiddleware");

// GET user profile
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("friends", "username profilePicture")
      .populate("friendRequests", "username profilePicture")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send friend request
router.post("/:id/friend-request", authMiddleware, async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user.id;

    if (receiverId === senderId) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request already sent
    if (receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Check if already friends
    if (receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Add to friend requests
    receiver.friendRequests.push(senderId);
    await receiver.save();

    // Create notification
    const notification = new Notification({
      user: receiverId,
      text: `${sender.username} sent you a friend request`,
      link: `/profile.html?id=${senderId}`
    });
    await notification.save();

    res.json({ message: "Friend request sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept friend request
router.post("/:id/accept-request", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id; // Current user
    const requesterId = req.body.requesterId;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    if (!user.friendRequests.includes(requesterId)) {
      return res.status(400).json({ message: "No such friend request" });
    }

    // Remove from friend requests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    
    // Add to friends list for both users
    if (!user.friends.includes(requesterId)) {
      user.friends.push(requesterId);
    }
    
    if (!requester.friends.includes(userId)) {
      requester.friends.push(userId);
    }

    // Update followers/following
    if (!user.followers.includes(requesterId)) {
      user.followers.push(requesterId);
    }
    
    if (!requester.following.includes(userId)) {
      requester.following.push(userId);
    }

    await user.save();
    await requester.save();

    // Create notification
    const notification = new Notification({
      user: requesterId,
      text: `${user.username} accepted your friend request`,
      link: `/profile.html?id=${userId}`
    });
    await notification.save();

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject friend request
router.post("/:id/reject-request", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const requesterId = req.body.requesterId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from friend requests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    await user.save();

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Follow user
router.post("/:id/follow", authMiddleware, async (req, res) => {
  try {
    const userIdToFollow = req.params.id;
    const followerId = req.user.id;

    if (userIdToFollow === followerId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const userToFollow = await User.findById(userIdToFollow);
    const follower = await User.findById(followerId);

    if (!userToFollow || !follower) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (userToFollow.followers.includes(followerId)) {
      return res.status(400).json({ message: "Already following" });
    }

    // Add to followers/following
    userToFollow.followers.push(followerId);
    follower.following.push(userIdToFollow);

    await userToFollow.save();
    await follower.save();

    // Create notification
    const notification = new Notification({
      user: userIdToFollow,
      text: `${follower.username} started following you`,
      link: `/profile.html?id=${followerId}`
    });
    await notification.save();

    res.json({ message: "Successfully followed user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unfollow user
router.post("/:id/unfollow", authMiddleware, async (req, res) => {
  try {
    const userIdToUnfollow = req.params.id;
    const followerId = req.user.id;

    const userToUnfollow = await User.findById(userIdToUnfollow);
    const follower = await User.findById(followerId);

    if (!userToUnfollow || !follower) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from followers/following
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== followerId);
    follower.following = follower.following.filter(id => id.toString() !== userIdToUnfollow);

    await userToUnfollow.save();
    await follower.save();

    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Add these routes to userRoutes.js:

// GET user's friend requests
router.get("/:id/friend-requests", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("friendRequests", "username profilePicture");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user.friendRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET user's followers
router.get("/:id/followers", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "username profilePicture");
    
    res.json(user.followers || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET user's following
router.get("/:id/following", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("following", "username profilePicture");
    
    res.json(user.following || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;