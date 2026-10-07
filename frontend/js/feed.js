const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
if (!token) window.location.href = "login.html";

const feedPostsDiv = document.getElementById("feedPosts");
const friendRequestsDiv = document.getElementById("friendRequests");
const notificationsDiv = document.getElementById("notifications");

async function loadFeed() {
  try {
    const res = await fetch(`http://localhost:5000/api/posts/feed`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load feed');
    
    const posts = await res.json();
    
    // Clear the feed first
    feedPostsDiv.innerHTML = '';
    
    // Process each post sequentially to ensure DOM is updated
    for (const p of posts) {
      await renderPost(p);
    }
    
    // Now load comments for all posts
    posts.forEach(p => loadComments(p._id));
    
  } catch (err) {
    console.error(err);
    feedPostsDiv.innerHTML = '<p class="error">Failed to load feed. Please try again later.</p>';
  }
}

async function renderPost(p) {
  // Create post HTML
  const postHTML = `
    <div class="post" id="post-${p._id}">
      <div class="post-author">
        <strong><a href="profile.html?id=${p.author._id}">${p.author.username}</a></strong>
      </div>
      <div class="post-content">${p.content}</div>
      <div class="post-meta">
        <span>Likes: ${p.likes?.length || 0}</span>
        <span class="timestamp">${new Date(p.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="post-actions">
        ${p.author._id === userId ? `<button onclick="deletePost('${p._id}')" class="delete-btn">Delete</button>` : ""}
        <button onclick="likePost('${p._id}')" class="like-btn ${p.likes?.includes(userId) ? 'liked' : ''}">
          ${p.likes?.includes(userId) ? 'Unlike' : 'Like'}
        </button>
      </div>
      <div class="comments-section">
        <div id="comments-${p._id}" class="commentsDiv">
          <div class="loading-spinner"></div>
        </div>
        <div class="comment-input-container">
          <input type="text" id="commentInput-${p._id}" placeholder="Add a comment" />
          <button onclick="addComment('${p._id}')">Comment</button>
        </div>
      </div>
    </div>
  `;
  
  // Append to feed
  feedPostsDiv.insertAdjacentHTML('beforeend', postHTML);
}

async function loadComments(postId) {
  try {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    if (!commentsDiv) return;
    
    commentsDiv.innerHTML = '<div class="loading-spinner"></div>';
    
    const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to load comments');
    
    const comments = await res.json();
    
    if (comments.length === 0) {
      commentsDiv.innerHTML = '<p class="empty-state">No comments yet. Be the first to comment!</p>';
      return;
    }
    
    commentsDiv.innerHTML = comments.map(c => `
      <div class="comment">
        <strong><a href="profile.html?id=${c.author._id}">${c.author.username}</a>:</strong> 
        <span>${c.text}</span>
        <small class="timestamp">${new Date(c.createdAt).toLocaleDateString()}</small>
      </div>
    `).join("");
    
  } catch (err) {
    console.error(err);
    const commentsDiv = document.getElementById(`comments-${postId}`);
    if (commentsDiv) {
      commentsDiv.innerHTML = '<p class="error">Failed to load comments</p>';
    }
  }
}

async function addComment(postId) {
  const input = document.getElementById(`commentInput-${postId}`);
  const text = input.value.trim();
  
  if (!text) {
    showAlert('Please enter a comment', 'error');
    return;
  }
  
  try {
    // Disable button and show loading
    const btn = input.nextElementSibling;
    const originalText = btn.textContent;
    btn.textContent = 'Posting...';
    btn.disabled = true;
    
    const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ text })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add comment');
    }
    
    // Clear input and re-enable button
    input.value = "";
    btn.textContent = originalText;
    btn.disabled = false;
    
    // Reload comments
    await loadComments(postId);
    
    showAlert('Comment added successfully!', 'success');
    
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Failed to add comment', 'error');
    
    // Re-enable button
    const btn = input.nextElementSibling;
    btn.textContent = 'Comment';
    btn.disabled = false;
  }
}

async function createPost() {
  const content = document.getElementById("postContent").value.trim();
  if (!content) {
    showAlert('Please write something!', 'error');
    return;
  }
  
  try {
    // Disable button and show loading
    const btn = document.getElementById("createPostBtn");
    const originalText = btn.textContent;
    btn.textContent = 'Posting...';
    btn.disabled = true;
    
    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ content })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create post');
    }
    
    // Clear input and re-enable button
    document.getElementById("postContent").value = "";
    btn.textContent = originalText;
    btn.disabled = false;
    
    // Reload feed
    await loadFeed();
    
    showAlert('Post created successfully!', 'success');
    
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Failed to create post', 'error');
    
    // Re-enable button
    const btn = document.getElementById("createPostBtn");
    btn.textContent = 'Post';
    btn.disabled = false;
  }
}

async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  
  try {
    const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete post');
    }
    
    // Remove post from DOM immediately for better UX
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      postElement.remove();
    }
    
    showAlert('Post deleted successfully!', 'success');
    
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Failed to delete post', 'error');
  }
}

async function likePost(postId) {
  try {
    const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to like post');
    }
    
    // Update UI immediately without full reload for better UX
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      const likeBtn = postElement.querySelector('.like-btn');
      const likesCount = postElement.querySelector('.post-meta span');
      
      if (likeBtn) {
        likeBtn.textContent = 'Unlike';
        likeBtn.classList.add('liked');
      }
      
      if (likesCount) {
        const currentLikes = parseInt(likesCount.textContent.replace('Likes: ', '')) || 0;
        likesCount.textContent = `Likes: ${currentLikes + 1}`;
      }
    }
    
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Failed to like post', 'error');
  }
}

async function unlikePost(postId) {
  try {
    const res = await fetch(`http://localhost:5000/api/posts/${postId}/unlike`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to unlike post');
    }
    
    // Update UI immediately without full reload for better UX
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      const likeBtn = postElement.querySelector('.like-btn');
      const likesCount = postElement.querySelector('.post-meta span');
      
      if (likeBtn) {
        likeBtn.textContent = 'Like';
        likeBtn.classList.remove('liked');
      }
      
      if (likesCount) {
        const currentLikes = parseInt(likesCount.textContent.replace('Likes: ', '')) || 1;
        likesCount.textContent = `Likes: ${Math.max(0, currentLikes - 1)}`;
      }
    }
    
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Failed to unlike post', 'error');
  }
}

// Friend requests
async function loadFriendRequests() {
  if (!friendRequestsDiv) return;
  
  try {
    const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to load friend requests');
    
    const user = await res.json();
    
    if (!user.friendRequests || user.friendRequests.length === 0) {
      friendRequestsDiv.innerHTML = '<p class="empty-state">No friend requests</p>';
      return;
    }
    
    friendRequestsDiv.innerHTML = user.friendRequests.map(r => `
      <div class="friend-request" id="request-${r._id}">
        <div>
          <strong>${r.username}</strong>
          <p>Sent you a friend request</p>
        </div>
        <div>
          <button onclick="acceptRequest('${r._id}')" class="success-btn">Accept</button>
          <button onclick="rejectRequest('${r._id}')" class="warning-btn">Reject</button>
        </div>
      </div>
    `).join("");
    
  } catch (err) {
    console.error(err);
    friendRequestsDiv.innerHTML = '<p class="error">Failed to load friend requests</p>';
  }
}

async function acceptRequest(requesterId) {
  try {
    const res = await fetch(`http://localhost:5000/api/users/${userId}/accept-request`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ requesterId })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to accept request');
    }
    
    // Remove request from UI immediately
    const requestElement = document.getElementById(`request-${requesterId}`);
    if (requestElement) {
      requestElement.remove();
    }
    
    showAlert('Friend request accepted!', 'success');
    
    // Reload if no requests left
    const remainingRequests = document.querySelectorAll('.friend-request');
    if (remainingRequests.length === 0) {
      loadFriendRequests();
    }
    
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Failed to accept request', 'error');
  }
}

async function rejectRequest(requesterId) {
  try {
    const res = await fetch(`http://localhost:5000/api/users/${userId}/reject-request`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ requesterId })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to reject request');
    }
    
    // Remove request from UI immediately
    const requestElement = document.getElementById(`request-${requesterId}`);
    if (requestElement) {
      requestElement.remove();
    }
    
    showAlert('Friend request rejected', 'warning');
    
    // Reload if no requests left
    const remainingRequests = document.querySelectorAll('.friend-request');
    if (remainingRequests.length === 0) {
      loadFriendRequests();
    }
    
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Failed to reject request', 'error');
  }
}

// Notifications
async function loadNotifications() {
  if (!notificationsDiv) return;
  
  try {
    const res = await fetch(`http://localhost:5000/api/notifications/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to load notifications');
    
    const notes = await res.json();
    
    if (!notes || notes.length === 0) {
      notificationsDiv.innerHTML = '<p class="empty-state">No notifications</p>';
      return;
    }
    
    notificationsDiv.innerHTML = notes.map(n => `
      <div class="notification ${n.read ? 'read' : 'unread'}" id="notification-${n._id}">
        <a href="${n.link || '#'}" onclick="markAsRead('${n._id}')">
          ${n.text}
          <small class="timestamp">${new Date(n.createdAt).toLocaleDateString()}</small>
        </a>
      </div>
    `).join("");
    
  } catch (err) {
    console.error(err);
    notificationsDiv.innerHTML = '<p class="error">Failed to load notifications</p>';
  }
}

async function markAsRead(notificationId) {
  try {
    await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Update UI
    const notification = document.getElementById(`notification-${notificationId}`);
    if (notification) {
      notification.classList.remove('unread');
      notification.classList.add('read');
    }
    
  } catch (err) {
    console.error(err);
  }
}

// Alert utility function
function showAlert(message, type = 'info') {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());
  
  // Create new alert
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="background:transparent; border:none; color:inherit; cursor:pointer; margin-left:10px;">×</button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.remove();
    }
  }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const createPostBtn = document.getElementById("createPostBtn");
  if (createPostBtn) {
    createPostBtn.addEventListener("click", createPost);
  }
  
  // Also allow Enter key to create post
  const postContent = document.getElementById("postContent");
  if (postContent) {
    postContent.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        createPost();
      }
    });
  }
  
  // Initialize
  loadFeed();
  loadFriendRequests();
  loadNotifications();
});

// Make functions globally available
window.addComment = addComment;
window.createPost = createPost;
window.deletePost = deletePost;
window.likePost = likePost;
window.unlikePost = unlikePost;
window.acceptRequest = acceptRequest;
window.rejectRequest = rejectRequest;
window.markAsRead = markAsRead;
window.showAlert = showAlert;