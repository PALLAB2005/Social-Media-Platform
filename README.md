
# LinkUp - Social Media Platform

A modern, responsive social media platform built with HTML, CSS, and JavaScript.

## Features

### 🔐 Authentication:
- User registration and login
- JWT token-based authentication
- Protected routes

### 🏠 Homepage:
- Modern, animated design with particle background
- Responsive layout
- Feature highlights

### 📱 Feed Page:
- Create new posts
- Like/unlike posts
- Comment on posts
- Delete your own posts
- Real-time notifications
- Trending topics sidebar
- Online friends list

### 👤 Profile Page:
- View user profiles
- Follow/unfollow users
- See user's posts
- Profile statistics

## File Structure
SOCIALMEDIA-APP/                      # Root folder
├── backend/                          # Node.js/Express Backend
│   ├── config/
│   │   └── database.js               # Database configuration
│   ├── middleware/
│   │   ├── authMiddleware.js         # Authentication middleware
│   │   └── errorMiddleware.js        # Error handling middleware
│   ├── models/                       # MongoDB models
│   │   ├── User.js                   # User model
│   │   ├── Post.js                   # Post model
│   │   ├── Comment.js                # Comment model
│   │   └── Notification.js           # Notification model
│   ├── node_modules/                 # Dependencies (auto-generated)
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js             # Authentication routes
│   │   ├── userRoutes.js             # User routes
│   │   ├── postRoutes.js             # Post routes
│   │   ├── commentRoutes.js          # Comment routes
│   │   └── notificationRoutes.js     # Notification routes
│   ├── .env                          # Environment variables
│   ├── .gitignore                    # Git ignore file
│   ├── package.json                  # Backend dependencies
│   ├── package-lock.json             # Lock file
│   └── server.js                     # Main server file
│
├── frontend/                         # Frontend HTML/CSS/JS
│   ├── css/
│   │   └── style.css                 # Main stylesheet
│   ├── js/                           # JavaScript files
│   │   ├── auth.js                   # Authentication functions
│   │   ├── feed.js                   # Feed page logic
│   │   ├── profile.js                # Profile page logic
│   │   ├── posts.js                  # Post CRUD operations
│   │   └── utils.js                  # Utility functions
│   ├── assets/                       # Images, icons, etc.
│   │   ├── images/
│   │   └── icons/
│   ├── index.html                    # Homepage
│   ├── login.html                    # Login page
│   ├── register.html                 # Registration page
│   ├── feed.html                     # Main feed page
│   ├── profile.html                  # Profile page
│   ├── mock-api.js                   # Mock API for testing
│   └── README.md                     # Frontend documentation
│
├── .gitignore                        # Root git ignore
├── README.md                         # Main project documentation
└── package.json                      # Root package.json (optional)


## Setup Instructions

### Option 1: Use with Mock API (No Backend Required)
1. Simply open `index.html` in your browser
2. The app will use the mock API included in `mock-api.js`
3. You can register, login, create posts, etc.

### Option 2: Use with Real Backend
1. Clone the backend repository (if available)
2. Start the backend server on `localhost:5000`
3. Update API endpoints in the JavaScript files if needed
4. Open `index.html` in your browser

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like a post
- `POST /api/posts/:id/comment` - Comment on a post
- `GET /api/posts/:id/comments` - Get post comments

### Users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow user
- `POST /api/users/:id/unfollow` - Unfollow user

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Responsive Design
The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - Client-side functionality
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## Features in Development
- [ ] Real-time notifications
- [ ] Image upload for posts
- [ ] Direct messaging
- [ ] Dark mode
- [ ] Post sharing
- [ ] Search functionality

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - Feel free to use this project for personal or commercial purposes.
