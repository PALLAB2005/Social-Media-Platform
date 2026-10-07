const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const Notification = require("../models/notification");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE POST
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, image } = req.body;

    const post = new Post({
      author: req.user.id,
      content,
      image
    });

    await post.save();
    
    // Populate author info
    await post.populate("author", "username profilePicture");
    
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL POSTS (for feed)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET FEED FOR USER (posts from user and friends)
router.get("/feed/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get IDs of user and their friends
    const userIds = [user._id, ...user.friends];
    
    const posts = await Post.find({
      author: { $in: userIds }
    })
    .populate("author", "username profilePicture")
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET POSTS BY USER
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE POST
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePicture");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// LIKE POST
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already liked
    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Post already liked" });
    }

    // Add like
    post.likes.push(req.user.id);
    await post.save();

    // Create notification if not the author
    if (post.author.toString() !== req.user.id) {
      const notification = new Notification({
        user: post.author,
        text: `${req.user.username} liked your post`,
        link: `/feed.html`
      });
      await notification.save();
    }

    res.json({ message: "Post liked", likes: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// UNLIKE POST
router.post("/:id/unlike", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Remove like
    post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    await post.save();

    res.json({ message: "Post unliked", likes: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE POST
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this route to postRoutes.js:

// GET comments for post
router.get("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "username profilePicture")
      .sort({ createdAt: 1 });
    
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD comment to post
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      post: postId,
      author: req.user.id,
      text: content
    });

    await comment.save();
    
    // Populate author info
    await comment.populate("author", "username profilePicture");

    // Create notification for post author if not the same user
    if (post.author.toString() !== req.user.id) {
      const notification = new Notification({
        user: post.author,
        text: `${req.user.username} commented on your post`,
        link: `/feed.html`
      });
      await notification.save();
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;