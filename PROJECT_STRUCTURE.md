# Project Structure

This project follows a clear separation between frontend and backend code.

## Folder Structure

```
Open Doors/
├── backend/                 # Server-side code
│   ├── config/             # Configuration files (database, session)
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models (Mongoose)
│   ├── routes/             # Express routes
│   ├── utils/              # Utility functions
│   ├── data/               # Sample data files
│   ├── logs/               # Application logs
│   ├── uploads/            # Uploaded files
│   ├── New features/       # Feature implementations
│   ├── app.js              # Express app configuration
│   ├── index.js            # Server entry point
│   └── package.json        # Backend dependencies
│
├── frontend/               # Client-side code
│   ├── views/              # EJS templates
│   │   ├── includes/      # Partials (navbar, footer, etc.)
│   │   ├── layouts/       # Layout templates
│   │   ├── listings/      # Listing views
│   │   ├── user/          # User views (login, signup)
│   │   ├── staticPage/    # Static pages (about, contact)
│   │   └── health/        # Health check views
│   └── public/            # Static assets
│       ├── css/           # Stylesheets
│       └── js/            # Client-side JavaScript
│
├── docs/                   # Documentation
├── image/                  # Project images/screenshots
└── README.md              # Main project README

```

## Running the Application

### Backend

From the `backend/` directory:

```bash
npm install    # Install dependencies (if needed)
npm start      # Start production server
npm run dev    # Start development server with nodemon
```

### Notes

- The backend serves the frontend views and static assets
- Views are located in `frontend/views/` and referenced from `backend/app.js`
- Static assets are served from `frontend/public/`
- Uploaded files are stored in `backend/uploads/`
