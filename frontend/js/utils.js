// utils.js - Utility functions for the entire app

const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "token";
const USER_ID_KEY = "userId";

// API Helper
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Users
  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async followUser(userId) {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId) {
    return this.request(`/users/${userId}/unfollow`, {
      method: 'POST',
    });
  }

  async getFollowers(userId) {
    return this.request(`/users/${userId}/followers`);
  }

  async getFollowing(userId) {
    return this.request(`/users/${userId}/following`);
  }

  // Posts
  async getFeed() {
    return this.request('/posts/feed');
  }

  async createPost(content) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(postId) {
    return this.request(`/posts/${postId}/unlike`, {
      method: 'POST',
    });
  }

  // Comments
  async getComments(postId) {
    return this.request(`/posts/${postId}/comments`);
  }

  async addComment(postId, content) {
    return this.request(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Friend Requests
  async getFriendRequests() {
    return this.request('/users/friend-requests');
  }

  async acceptFriendRequest(requestId) {
    return this.request(`/friend-requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async rejectFriendRequest(requestId) {
    return this.request(`/friend-requests/${requestId}/reject`, {
      method: 'POST',
    });
  }
}

// UI Helpers
class UIHelper {
  static showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas fa-${this.getToastIcon(type)}"></i>
      <span>${message}</span>
    `;
    
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: ${this.getToastColor(type)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);

    // Add animations if not present
    if (!document.querySelector('#toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  static getToastIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }

  static getToastColor(type) {
    const colors = {
      success: '#4cc9f0',
      error: '#ff006e',
      warning: '#ffbe0b',
      info: '#4361ee'
    };
    return colors[type] || '#4361ee';
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  }

  static getUserInitials(username) {
    if (!username) return 'U';
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  static showLoading(element) {
    element.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;
  }

  static hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add('hidden');
    }
  }

  static showElement(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('hidden');
    }
  }
}

// Auth Helper
class AuthHelper {
  static isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY) && !!localStorage.getItem(USER_ID_KEY);
  }

  static getCurrentUser() {
    return {
      id: localStorage.getItem(USER_ID_KEY),
      token: localStorage.getItem(TOKEN_KEY)
    };
  }

  static setCurrentUser(userData) {
    localStorage.setItem(TOKEN_KEY, userData.token);
    localStorage.setItem(USER_ID_KEY, userData.user.id);
    localStorage.setItem('username', userData.user.username);
  }

  static clearCurrentUser() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem('username');
  }

  static requireAuth(redirectTo = 'login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
    }
  }
}

// Initialize global API client
window.api = new ApiClient();
window.ui = UIHelper;
window.auth = AuthHelper;

// Global functions
window.logout = function() {
  if (confirm("Are you sure you want to logout?")) {
    auth.clearCurrentUser();
    window.location.href = "login.html";
  }
};

// Check auth on page load for protected pages
document.addEventListener('DOMContentLoaded', function() {
  const protectedPages = ['feed.html', 'profile.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage) && !auth.isAuthenticated()) {
    window.location.href = "login.html";
  }
});