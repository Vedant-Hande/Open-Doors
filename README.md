# Open Doors 🏠

A comprehensive full-stack web application for property listings and reviews. This is my first full-stack website built with modern web technologies to demonstrate advanced Express.js patterns, data validation, error handling, logging, and performance optimization techniques.

## 🎯 Project Overview

Open Doors is a feature-rich property listing platform that allows users to browse, create, edit, and review property listings. The application showcases advanced web development concepts including comprehensive validation, error handling, request logging, and modular architecture.

### Why this project exists

- Master full-stack development with Express.js and MongoDB
- Implement advanced middleware patterns and error handling
- Practice data validation, logging, and performance optimization
- Build a production-ready application with proper architecture
- Learn modern web development best practices

## 📸 Screenshots

Here are some screenshots showcasing the Open Doors application:

### Application Interface

![Listings Index](image/Screenshot%202025-09-20%20223044.png)
_Main listings page showing all available properties_

![Property Details](image/Screenshot%202025-09-20%20223125.png)
_Detailed view of individual property listings_

### Key Features Showcased

- **Responsive Design**: Clean, modern interface that works on all devices
- **User-Friendly Forms**: Intuitive forms for creating and editing listings
- **Review System**: Easy-to-use rating and review functionality
- **System Monitoring**: Built-in health check and performance monitoring
- **Flash Messages**: User feedback system for better UX

## ✨ Core Features

### Property Management

- **CRUD Operations**: Create, read, update, and delete property listings
- **Rich Data Model**: Comprehensive listing schema with validation
- **Image Support**: URL-based image handling with fallbacks
- **Search & Filtering**: Advanced search capabilities (see New Features section)

### Review System

- **User Reviews**: Rate and comment on properties (1-5 stars)
- **Review Management**: Add and delete reviews for each listing
- **Data Relationships**: Proper MongoDB relationships between listings and reviews

### Advanced Features

- **Comprehensive Validation**: Joi-based input validation with detailed error messages
- **Request Logging**: Advanced logging system with rotation and performance monitoring
- **Error Handling**: Global error handling with custom error pages
- **Health Monitoring**: System health check endpoint with performance metrics
- **Session Management**: Express-session integration for user state management
- **Flash Messages**: Temporary message display system for user feedback
- **Modular Architecture**: Clean separation of concerns with middleware and utilities

### Performance & Monitoring

- **Database Indexing**: Optimized queries with strategic indexes
- **Request Tracking**: Detailed request/response logging
- **Performance Monitoring**: Slow request detection and logging
- **Log Rotation**: Automatic log file management and cleanup

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.18.0
- **Validation**: Joi 18.0.1 for comprehensive input validation
- **Environment**: dotenv 17.2.2 for environment configuration
- **Sessions**: express-session 1.18.2 for user session management
- **Flash Messages**: connect-flash 0.1.1 for temporary message display

### Frontend

- **Templating**: EJS 3.1.10 with ejs-mate 4.0.0 for layouts/partials
- **Styling**: Bootstrap 5.3.8 for responsive design
- **Forms**: method-override 3.0.0 for PUT/DELETE operations

### Development Tools

- **Process Manager**: nodemon 3.0.1 for development
- **Code Quality**: ESLint 9.35.0 for code linting
- **Logging**: Custom logging middleware with file rotation
- **Error Handling**: Custom error handling middleware

### Architecture

- **MVC Pattern**: Clean separation of models, views, and controllers
- **Middleware**: Custom middleware for validation, logging, and error handling
- **Modular Routes**: Organized route handlers with proper error wrapping
- **Database Indexing**: Strategic indexes for performance optimization

### Prerequisites

- Node.js 18+
- MongoDB running locally (default) or a connection string

### Installation

```bash
git clone <repo-url>
cd "Open Doors"
npm install
```

### Configuration

The app connects to MongoDB at `mongodb://localhost:27017/OpenD***` by default (see `config/database.js` and `init/index.js`). If your MongoDB runs elsewhere, update the connection URI in those files.

Port defaults to `8080`.

Session configuration is handled in `config/session.js` with secure session management for user state and flash messages.

### Seed the database (optional)

Sample listings are available under `init/data.js`.

Run the seeder to wipe and repopulate the `OpenDoors` database:

```bash
node init/index.js
```

### Run the app

```bash
node index.js
```

Then open `http://localhost:8080/` (home) or `http://localhost:8080/listing/` (listings).

## 🛣️ API Routes

### Property Listings

- **GET** `/listing/` - List all property listings
- **GET** `/listing/new` - Display new listing form
- **POST** `/listing/` - Create a new listing (with validation)
- **GET** `/listing/:id` - Show specific listing details with reviews
- **GET** `/listing/:id/edit` - Display edit form for a listing
- **PUT** `/listing/:id` - Update a listing (with validation)
- **DELETE** `/listing/:id` - Delete a listing and associated reviews
- **POST** `/listing/:id/reviews` - Add a review to a listing (with validation)
- **DELETE** `/listing/:id/reviews/:reviewId` - Delete a specific review

### Authentication (Static Views)

- **GET** `/login` - Login page
- **GET** `/signup` - Registration page

### System Monitoring

- **GET** `/health` - Health check endpoint with system metrics
  - Returns system status, uptime, memory usage, and Node.js version
  - Useful for monitoring and load balancer health checks

### Error Handling

- **404** - Custom 404 page for non-existent routes
- **500** - Global error handler with detailed error pages

## 📊 Data Models

### Listing Model

The main property listing schema with comprehensive validation and indexing:

```javascript
{
  title: String,        // Required, 3-50 chars, indexed for search
  desc: String,         // Required, 10-500 chars
  image: {
    filename: String,   // Default: "listingimage"
    url: String         // Required, must be valid URI
  },
  price: Number,        // Required, min: 0, max: 1,000,000, indexed
  location: String,     // Required, 2-100 chars, indexed for search
  country: String,      // Required, 2-50 chars, indexed for filtering
  review: [ObjectId],   // Array of Review references
  createdAt: Date,      // Auto-generated, indexed for sorting
  updatedAt: Date       // Auto-updated on modifications
}
```

### Review Model

User review schema for property ratings and comments:

```javascript
{
  rating: Number,       // Required, 1-5 stars
  comment: String,      // Required, 5-250 chars
  date: Date           // Auto-generated timestamp
}
```

### Database Features

- **Indexing**: Strategic indexes on searchable fields (title, location, country, price, createdAt)
- **Relationships**: Proper MongoDB references between listings and reviews
- **Cascade Deletion**: Reviews are automatically deleted when their parent listing is removed
- **Validation**: Comprehensive field validation with custom error messages

## 🚀 Advanced Features

The project includes a comprehensive set of advanced features located in the `New features/` directory. These are production-ready implementations that can be integrated into any Express.js application.

### 1. In-Memory Caching (`New features/1-Caching/`)

- **Performance Optimization**: Reduce database queries with intelligent caching
- **Memory Management**: Efficient cache storage with TTL support
- **Cache Invalidation**: Smart cache clearing strategies
- **Production Ready**: Redis integration examples included

### 2. Request Logging (`New features/2-Request-Logging/`)

- **Comprehensive Logging**: Track all incoming requests with detailed metadata
- **Error Logging**: Capture and log errors with stack traces
- **Performance Monitoring**: Track response times and slow requests
- **Log Rotation**: Automatic log file management and cleanup
- **Security Auditing**: Monitor suspicious activity and access patterns

### 3. Search & Filtering (`New features/3-Search-Filtering/`)

- **Multi-field Search**: Search across multiple fields simultaneously
- **Range Filtering**: Numeric and date range filters
- **Advanced Sorting**: Multiple sort options with database optimization
- **Pagination Integration**: Works seamlessly with pagination system

### 4. Pagination (`New features/4-Pagination/`)

- **Offset Pagination**: Traditional page-based navigation
- **Cursor Pagination**: Efficient for large datasets
- **Infinite Scroll**: Modern UI patterns for seamless browsing
- **Performance Optimization**: Database indexing strategies

### Integration Examples

Each feature includes:

- **Core Implementation**: Production-ready utility classes
- **Example Usage**: Practical implementation examples
- **Comprehensive Documentation**: Detailed README files
- **Best Practices**: Industry-standard implementation patterns

## 📁 Project Structure

The project uses a modular architecture. Below is a deeper tree highlighting key files and folders:

```bash
Open Doors/
├── app.js
├── index.js
├── package.json
├── package-lock.json
├── README.md
├── review.md
├── config/
│   ├── database.js
│   └── session.js
├── docs/
│   └── API.md
├── image/
│   ├── Screenshot*.png
├── init/
│   ├── data.js
│   ├── index.js
│   └── sampleData.txt
├── logs/
│   ├── access.log
│   ├── app.log
│   └── error.log
├── middleware/
│   ├── connectFlash.js
│   ├── errorHandler.js
│   ├── logger.js
│   └── validation.js
├── models/
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── New features/
│   ├── 1-Caching/
│   ├── 2-Request-Logging/
│   ├── 3-Search-Filtering/
│   └── 4-Pagination/
├── public/
│   ├── css/
│   │   ├── main.scss
│   │   └── style.css
│   └── js/
│       └── script.js
├── routes/
│   ├── healthRoute.js
│   ├── listingRoute.js
│   ├── reviewRoute.js
│   ├── staticPagesRoute.js
│   └── userRoute.js
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
└── views/
    ├── health/
    │   └── health.ejs
    ├── includes/
    │   ├── flashMsg.ejs
    │   ├── footer.ejs
    │   ├── main.ejs
    │   └── navbar.ejs
    ├── layouts/
    │   └── boilerplate.ejs
    ├── listings/
    │   ├── editListing.ejs
    │   ├── error.ejs
    │   ├── index.ejs
    │   ├── newListing.ejs
    │   └── show.ejs
    ├── staticPage/
    │   ├── about.ejs
    │   ├── contact.ejs
    │   ├── main.ejs
    │   ├── privacy.ejs
    │   └── terms.ejs
    └── user/
        ├── login.ejs
        └── signup.ejs
```

## 🚀 Getting Started

- **Node.js**: Version 18 or higher
- **MongoDB**: Running locally or connection string
- **Git**: For cloning the repository

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "Open Doors"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment** (optional)
   Create a `.env` file in the root directory:

   ```env
   MONGODB_ATLAS_URI=process.env.MONGODB_ATLAS_URI
   PORT=8080
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Seed the database** (optional)

   ```bash
   node init/index.js
   ```

6. **Run the application**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:8080/listing/`

### Available Scripts

- `npm start` - Start the application in production mode
- `npm run dev` - Start with nodemon for development
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically

## 🔧 Development

### Code Quality

- **ESLint**: Configured with modern JavaScript standards
- **Error Handling**: Comprehensive error handling with custom error classes
- **Validation**: Joi-based input validation with detailed error messages
- **Logging**: Structured logging for debugging and monitoring

### Development Tips

- **Hot Reload**: Use `npm run dev` for automatic server restart
- **Database**: MongoDB connection is handled in `config/database.js`
- **Static Files**: Served from `public/` directory
- **Forms**: Use `_method=PUT|DELETE` for PUT/DELETE operations
- **Templates**: EJS with `ejs-mate` for layouts and partials

### Debugging

- **Logs**: Check `logs/` directory for detailed application logs
- **Error Pages**: Custom error pages for better user experience
- **Health Check**: Use `/health` endpoint to monitor application status

## 🚀 Deployment

### Environment Variables

Create a `.env` file for production configuration:

```env
MONGODB_ATLAS_URI=mongodb://your-mongodb-connection-string
PORT=8080
NODE_ENV=production
```

### Production Considerations

- **Database**: Use MongoDB Atlas or production MongoDB instance
- **Logging**: Implement log rotation and monitoring
- **Security**: Add authentication and authorization
- **Performance**: Enable caching and optimize database queries
- **Monitoring**: Set up health checks and error tracking

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

## 🛠️ Customization

### Adding New Features

1. **Models**: Add new schemas in `models/` directory
2. **Routes**: Create route handlers in `routes/` directory
3. **Middleware**: Add custom middleware in `middleware/` directory
4. **Views**: Create EJS templates in `views/` directory

- **Database**: Modify `config/database.js` for different MongoDB setups
- **Validation**: Update `middleware/validation.js` for new validation rules
- **Logging**: Customize `middleware/logger.js` for different log formats

## 📚 Learning Resources

Explore the `New features/` directory for production-ready implementations:

- **Caching**: Learn in-memory caching strategies
- **Logging**: Understand comprehensive logging systems
- **Search**: Implement advanced search and filtering
- **Pagination**: Add efficient data loading patterns

### Best Practices

- **Error Handling**: Global error handling with custom error pages
- **Validation**: Input validation with detailed error messages
- **Logging**: Structured logging with rotation and cleanup
- **Performance**: Database indexing and query optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- GitHub: [@vedanthande](https://github.com/vedanthande)
- Project: TripSpot - Full-Stack Property Listing Platform

---

## 🎯 Roadmap

### Planned Features

- [ ] User authentication and authorization
- [ ] Image upload with cloud storage
- [ ] Advanced search and filtering UI
- [ ] Real-time notifications
- [ ] Mobile-responsive design improvements
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

### Performance Improvements

- [ ] Redis caching integration
- [ ] Database query optimization
- [ ] CDN for static assets
- [ ] Load balancing setup
- [ ] Monitoring and alerting

---
