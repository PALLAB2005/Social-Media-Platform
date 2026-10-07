// mock-api.js
window.mockAPI = {
  user: {
    _id: 'user1',
    id: 'user1',
    username: 'Test User',
    email: 'test@example.com',
    friends: []
  },

  getPosts: async () => {
    return [
      {
        _id: '1',
        content: 'Welcome to LinkUp! First post! 🎉',
        author: { _id: 'user1', username: 'John Doe' },
        likes: [],
        comments: 0,
        createdAt: new Date().toISOString()
      }
    ];
  },
  
  createPost: async (content) => {
    return {
      _id: 'post' + Date.now(),
      content,
      author: { _id: 'user1', username: 'John Doe' },
      likes: [],
      comments: 0,
      createdAt: new Date().toISOString()
    };
  },

  getUser: async () => window.mockAPI.user,
  getComments: async () => [],
  getFriendRequests: async () => [],
  getNotifications: async () => [],
};

// Override fetch only when the frontend is opened without the backend.
if (window.location.protocol === 'file:' && typeof fetch === 'function') {
  if (!localStorage.getItem('token') || !localStorage.getItem('userId')) {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userId', window.mockAPI.user.id);
    localStorage.setItem('username', window.mockAPI.user.username);
  }

  const originalFetch = window.fetch;
  const mockResponse = (data, ok = true) => ({
    ok,
    status: ok ? 200 : 400,
    json: async () => data
  });

  window.fetch = async function(url, options = {}) {
    console.log('Mock API called:', url);
    
    if (url.includes('/api/posts') && !url.includes('/like') && !url.includes('/comment')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        return mockResponse(await mockAPI.createPost(body.content));
      } else {
        return mockResponse(await mockAPI.getPosts());
      }
    }

    if (url.includes('/api/auth')) {
      if (url.includes('/register')) {
        const body = JSON.parse(options.body || '{}');
        mockAPI.user.username = body.username || mockAPI.user.username;
        mockAPI.user.email = body.email || mockAPI.user.email;
        return mockResponse({ message: 'User registered successfully' });
      }

      return mockResponse({
        token: 'mock-token',
        user: mockAPI.user
      });
    }

    if (url.includes('/api/users/')) {
      return mockResponse(mockAPI.user);
    }

    if (url.includes('/api/comments') || url.includes('/api/posts/') && url.includes('/comment')) {
      return mockResponse([]);
    }

    if (url.includes('/api/users/friend-requests') || url.includes('/api/friend-requests')) {
      return mockResponse([]);
    }

    if (url.includes('/api/posts/') && (url.includes('/like') || url.includes('/unlike'))) {
      return mockResponse({ message: 'Updated' });
    }
    
    return originalFetch(url, options);
  };
}