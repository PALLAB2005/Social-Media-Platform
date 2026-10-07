const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

// Get user ID from URL (viewing another profile) or default to logged-in user
const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get("id") || localStorage.getItem("userId");

const usernameEl = document.getElementById("username");
const followersEl = document.getElementById("followers");
const followingEl = document.getElementById("following");
const followBtn = document.getElementById("followBtn");
const userPostsDiv = document.getElementById("userPosts");

// Load user profile info
async function loadProfile() {
  try {
    const res = await fetch(`http://localhost:5000/api/users/${profileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load profile');
    
    const user = await res.json();

    if (usernameEl) usernameEl.innerText = user.username;
    if (followersEl) followersEl.innerText = user.friends?.length || 0;
    if (followingEl) followingEl.innerText = user.friends?.length || 0;

    // Show follow/unfollow button only for other users
    if (followBtn && user._id !== localStorage.getItem("userId")) {
      followBtn.style.display = "inline-block";
      const isFollowing = user.friends?.includes(localStorage.getItem("userId")) || false;
      followBtn.innerText = isFollowing ? "Unfollow" : "Follow";
    } else if (followBtn) {
      followBtn.style.display = "none";
    }

    loadUserPosts(profileId);
  } catch (err) {
    console.error(err);
    if (usernameEl) usernameEl.innerText = "Error loading profile";
    alert("Failed to load profile.");
  }
}

// Load posts of this user
async function loadUserPosts(viewedUserId) {
  try {
    const res = await fetch("http://localhost:5000/api/posts", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load posts');
    
    const posts = await res.json();

    const userPosts = posts.filter(p => p.author._id === viewedUserId);

    if (userPostsDiv) {
      if (userPosts.length === 0) {
        userPostsDiv.innerHTML = "<p>No posts yet.</p>";
        return;
      }
      
      userPostsDiv.innerHTML = userPosts.map(p => `
        <div class="post">
          <strong>${p.author.username}</strong>: ${p.content}
          <p>Likes: ${p.likes?.length || 0}</p>
          ${p.author._id === localStorage.getItem("userId") ? 
            `<button onclick="deletePost('${p._id}')">Delete</button>` : ""}
          <button onclick="likePost('${p._id}')">Like</button>
          <button onclick="unlikePost('${p._id}')">Unlike</button>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error(err);
    if (userPostsDiv) userPostsDiv.innerHTML = "Failed to load posts.";
  }
}

// Send friend request (since there's no follow/unfollow API)
if (followBtn) {
  followBtn.addEventListener("click", async () => {
    try {
      const action = followBtn.innerText.toLowerCase();
      const currentUserId = localStorage.getItem("userId");
      
      if (action === "follow") {
        // Send friend request
        await fetch(`http://localhost:5000/api/users/${profileId}/friend-request`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ senderId: currentUserId })
        });
        alert("Friend request sent!");
      } else if (action === "unfollow") {
        // Note: You need to implement unfollow/remove friend endpoint
        alert("Unfollow functionality not implemented yet");
      }
      
      loadProfile(); // refresh profile data
    } catch (err) {
      console.error(err);
      alert("Failed to update follow status.");
    }
  });
}

// Delete post (only for logged-in user's posts)
async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  try {
    await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadProfile(); // refresh posts
  } catch (err) {
    console.error(err);
    alert("Failed to delete post.");
  }
}

// Like post
async function likePost(postId) {
  try {
    await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadProfile();
  } catch (err) {
    console.error(err);
    alert("Failed to like post.");
  }
}

// Unlike post
async function unlikePost(postId) {
  try {
    await fetch(`http://localhost:5000/api/posts/${postId}/unlike`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadProfile();
  } catch (err) {
    console.error(err);
    alert("Failed to unlike post.");
  }
}

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', loadProfile);