const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/post");
const Notification = require("../models/notification");
const authMiddleware = require("../middleware/authMiddleware");

// ADD COMMENT
router.post("/:postId", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      post: postId,
      author: req.user.id,
      text
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

// GET COMMENTS FOR POST
router.get("/:postId", authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE COMMENT
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;