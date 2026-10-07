const token = localStorage.getItem("token");
const feedDiv = document.getElementById("feed");
const newPostContent = document.getElementById("newPostContent");
const createPostBtn = document.getElementById("createPostBtn");

if (!token) {
  window.location.href = "login.html";
}

// Fetch feed
async function getFeed() {
  const res = await fetch("http://localhost:5000/api/posts/feed", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const posts = await res.json();
  feedDiv.innerHTML = posts.map(post => `
    <div class="post">
      <strong>${post.author.username}</strong>: ${post.content}
      <button onclick="likePost('${post._id}')">Like (${post.likes.length})</button>
      ${post.author._id === localStorage.getItem("userId") ? 
        `<button onclick="deletePost('${post._id}')">Delete</button>` : ""}
      <div>
        <input type="text" id="comment-${post._id}" placeholder="Add comment">
        <button onclick="addComment('${post._id}')">Comment</button>
      </div>
      <div id="comments-${post._id}"></div>
    </div>
  `).join("");

  posts.forEach(post => getComments(post._id));
}

// Create post
createPostBtn.addEventListener("click", async () => {
  const content = newPostContent.value;
  if (!content) return alert("Write something!");

  await fetch("http://localhost:5000/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content })
  });
  newPostContent.value = "";
  getFeed();
});

// Delete post
async function deletePost(postId) {
  await fetch(`http://localhost:5000/api/posts/${postId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  getFeed();
}

// Like post
async function likePost(postId) {
  await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  getFeed();
}

// Add comment
async function addComment(postId) {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value;
  if (!text) return;
  await fetch(`http://localhost:5000/api/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text })
  });
  input.value = "";
  getComments(postId);
}

// Get comments
async function getComments(postId) {
  const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const comments = await res.json();
  const div = document.getElementById(`comments-${postId}`);
  div.innerHTML = comments.map(c => `
    <div>${c.author.username}: ${c.text}
      ${c.author._id === localStorage.getItem("userId") ? 
        `<button onclick="deleteComment('${c._id}', '${postId}')">Delete</button>` : ""}
    </div>
  `).join("");
}

// Delete comment
async function deleteComment(commentId, postId) {
  await fetch(`http://localhost:5000/api/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  getComments(postId);
}

getFeed();
