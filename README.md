# Kabwata Shopping Complex - Full-Stack Web Application

## Overview
A complete full-stack payment management application built with Node.js, Express.js, EJS, and Firebase. Features user authentication, file uploads, payment tracking, and an admin panel.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: EJS templating, CSS, Vanilla JavaScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Sessions**: express-session

## Features
- User registration and login with Firebase Auth
- Secure session management
- Payment submission with file uploads (images/PDFs)
- Payment history for users
- Admin panel for viewing all users and their payments
- Mobile-first responsive design
- File upload to Firebase Storage with temporary local storage

## Project Structure
```
kabwata-shopping-complex/
├── app.js                     # Main server file
├── package.json              # Dependencies
├── /routes/
│   ├── auth.js              # Authentication routes
│   ├── dashboard.js         # User dashboard routes
│   └── admin.js             # Admin panel routes
├── /views/                   # EJS templates
│   ├── login.ejs
│   ├── signup.ejs
│   ├── dashboard.ejs
│   ├── admin.ejs
│   └── 404.ejs
├── /public/                  # Static files
│   ├── css/styles.css
│   └── js/app.js
├── /uploads/                 # Temporary file storage
├── /config/
│   └── firebase.js          # Firebase configuration
└── serviceAccountKey.json   # Firebase service account key (to be added)
```

## Setup Instructions

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: "kabwata-shopping-complex"
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
4. Enable Firestore Database:
   - Go to Firestore Database → Create database
   - Choose "Start in production mode"
5. Enable Storage:
   - Go to Storage → Get started
   - Choose "Start in production mode"
6. Generate Service Account Key:
   - Go to Project settings → Service accounts
   - Click "Generate new private key"
   - Download the JSON file and rename it to `serviceAccountKey.json`
   - Place it in the project root

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase
1. Open `config/firebase.js`
2. Replace `'YOUR_PROJECT_ID.appspot.com'` with your actual storage bucket URL
3. The service account key is loaded from `serviceAccountKey.json`

### 4. Get Firebase API Key
1. In Firebase Console → Project settings → General
2. Scroll to "Your apps" → Web app
3. Copy the API key
4. Open `routes/auth.js`
5. Replace `'YOUR_FIREBASE_API_KEY'` with your actual API key

### 5. Run the Application
```bash
npm start
# or for development with auto-restart:
npm run dev
```

### 6. Access the Application
- Open http://localhost:3000 in your browser
- Sign up with any email/password
- For admin access, sign up with email: `admin@kabwata.com`

## Routes
- `GET /` - Redirect to login or dashboard
- `GET /login` - Login page
- `GET /signup` - Signup page
- `POST /signup` - Process signup
- `POST /login` - Process login
- `GET /logout` - Logout
- `GET /dashboard` - User dashboard (protected)
- `POST /dashboard/submit-payment` - Submit payment (protected)
- `GET /admin-9382-hidden` - Admin panel (protected, admin only)
- `GET /admin-9382-hidden/user/:userId` - View user payments (admin only)

## Security Features
- Session-based authentication
- Route protection middleware
- Admin email validation
- Input validation
- File type and size restrictions
- Firebase security rules (users can only access their own data)

## File Upload Process
1. File uploaded via multer to `/uploads` directory
2. File uploaded to Firebase Storage
3. Download URL generated
4. Payment record saved to Firestore
5. Local file deleted

## Admin Panel
- Access via `/admin-9382-hidden`
- Only accessible with `admin@kabwata.com` email
- View all registered users
- Click user to see their payments grouped by month
- Download/view uploaded files

## Development Notes
- Uses EJS templating for server-side rendering
- Mobile-first CSS design inspired by iPhone UI
- Flash messages for user feedback
- Error handling and validation
- Clean, maintainable code structure

## Production Deployment
For production deployment:
1. Set `NODE_ENV=production`
2. Use HTTPS
3. Configure proper session secrets
4. Set up Firebase security rules
5. Configure CORS if needed
6. Use a process manager like PM2

## Troubleshooting
- Ensure `serviceAccountKey.json` is in the project root
- Check Firebase API key in `routes/auth.js`
- Verify Firebase project configuration
- Check file permissions for `/uploads` directory
- Ensure all npm packages are installed