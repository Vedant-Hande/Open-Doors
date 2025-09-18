# Pagination - Efficient Data Loading

## Overview
Pagination is a technique for dividing large datasets into smaller, manageable chunks. It improves performance, user experience, and reduces server load by loading only the data needed at any given time.

## Types of Pagination

### 1. Offset-Based Pagination (Page-Based)
- **How it works**: Uses `skip` and `limit` to jump to specific pages
- **Best for**: Small to medium datasets, when you need to jump to specific pages
- **Pros**: Simple to implement, easy to understand
- **Cons**: Performance degrades with large offsets

### 2. Cursor-Based Pagination
- **How it works**: Uses a cursor (usually an ID or timestamp) to fetch next/previous items
- **Best for**: Large datasets, real-time data, infinite scroll
- **Pros**: Consistent performance, works well with real-time data
- **Cons**: Can't jump to specific pages, more complex to implement

### 3. Infinite Scroll Pagination
- **How it works**: Loads more data as user scrolls
- **Best for**: Social media feeds, content streams
- **Pros**: Seamless user experience, good for mobile
- **Cons**: Can't jump to specific content, memory usage grows

## Implementation Examples

### Offset-Based Pagination
```javascript
// Basic offset pagination
app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .skip(skip)
    .limit(limit);

  const totalCount = await User.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    data: users,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});
```

### Cursor-Based Pagination
```javascript
// Cursor-based pagination
app.get('/api/users/cursor', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;
  const direction = req.query.direction || 'next';

  let query = {};
  if (cursor) {
    query.createdAt = direction === 'next' 
      ? { $lt: new Date(cursor) }
      : { $gt: new Date(cursor) };
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = users.length > limit;
  if (hasMore) {
    users.pop();
  }

  res.json({
    data: users,
    pagination: {
      hasMore,
      nextCursor: users.length > 0 ? users[users.length - 1].createdAt : null,
      prevCursor: users.length > 0 ? users[0].createdAt : null
    }
  });
});
```

### Infinite Scroll Pagination
```javascript
// Infinite scroll pagination
app.get('/api/users/infinite', async (req, res) => {
  const lastId = req.query.lastId;
  const limit = parseInt(req.query.limit) || 20;

  let query = {};
  if (lastId) {
    query._id = { $lt: lastId };
  }

  const users = await User.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasMore = users.length > limit;
  if (hasMore) {
    users.pop();
  }

  res.json({
    data: users,
    hasMore,
    nextCursor: users.length > 0 ? users[users.length - 1]._id : null
  });
});
```

## Response Formats

### Standard Pagination Response
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "John Doe", "email": "john@example.com" },
    { "id": "2", "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 200,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### Cursor Pagination Response
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "John Doe", "createdAt": "2024-01-15T10:00:00.000Z" }
  ],
  "pagination": {
    "hasNext": true,
    "hasPrev": false,
    "nextCursor": "2024-01-15T10:00:00.000Z",
    "prevCursor": null,
    "limit": 20
  }
}
```

### Infinite Scroll Response
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "John Doe" }
  ],
  "hasMore": true,
  "nextCursor": "507f1f77bcf86cd799439011"
}
```

## Frontend Integration

### Offset Pagination UI
```html
<!-- Pagination controls -->
<div class="pagination">
  <button onclick="loadPage(1)" class="btn">First</button>
  <button onclick="loadPage(prevPage)" class="btn" :disabled="!hasPrev">Previous</button>
  
  <span class="page-info">
    Page {{ currentPage }} of {{ totalPages }}
  </span>
  
  <button onclick="loadPage(nextPage)" class="btn" :disabled="!hasNext">Next</button>
  <button onclick="loadPage(totalPages)" class="btn">Last</button>
</div>
```

### Infinite Scroll UI
```javascript
// Infinite scroll implementation
let isLoading = false;
let hasMore = true;
let nextCursor = null;

window.addEventListener('scroll', async () => {
  if (isLoading || !hasMore) return;
  
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
    await loadMoreData();
  }
});

async function loadMoreData() {
  isLoading = true;
  
  try {
    const response = await fetch(`/api/users/infinite?lastId=${nextCursor}`);
    const data = await response.json();
    
    appendData(data.data);
    hasMore = data.hasMore;
    nextCursor = data.nextCursor;
  } catch (error) {
    console.error('Error loading more data:', error);
  } finally {
    isLoading = false;
  }
}
```

## Performance Optimization

### Database Indexes
```javascript
// Create indexes for pagination
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ _id: -1 });
db.users.createIndex({ name: 1 });
db.users.createIndex({ email: 1 });
```

### Query Optimization
```javascript
// Use projection to limit returned fields
const users = await User.find(query, 'name email createdAt')
  .skip(skip)
  .limit(limit);

// Use aggregation for complex pagination
const pipeline = [
  { $match: query },
  { $sort: { createdAt: -1 } },
  { $skip: skip },
  { $limit: limit },
  { $project: { name: 1, email: 1, createdAt: 1 } }
];
```

### Caching Strategy
```javascript
// Cache paginated results
const cacheKey = `users:page:${page}:limit:${limit}`;
let users = cache.get(cacheKey);

if (!users) {
  users = await User.find().skip(skip).limit(limit);
  cache.set(cacheKey, users, 300); // Cache for 5 minutes
}
```

## Best Practices

### 1. Choose the Right Type
- **Offset**: When you need page numbers and jumping to specific pages
- **Cursor**: For large datasets and real-time data
- **Infinite Scroll**: For content feeds and mobile apps

### 2. Set Reasonable Limits
```javascript
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
```

### 3. Validate Input
```javascript
const validatePagination = (query) => {
  const errors = [];
  
  if (query.page && (isNaN(query.page) || query.page < 1)) {
    errors.push('Page must be a positive integer');
  }
  
  if (query.limit && (isNaN(query.limit) || query.limit < 1 || query.limit > 100)) {
    errors.push('Limit must be between 1 and 100');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### 4. Handle Edge Cases
```javascript
// Handle empty results
if (users.length === 0) {
  return res.json({
    data: [],
    pagination: {
      currentPage: page,
      totalPages: 0,
      totalCount: 0,
      hasNext: false,
      hasPrev: false
    }
  });
}
```

### 5. Provide Useful Metadata
```javascript
const paginationInfo = {
  currentPage: page,
  totalPages: Math.ceil(totalCount / limit),
  totalCount,
  limit,
  hasNext: page < Math.ceil(totalCount / limit),
  hasPrev: page > 1,
  startIndex: skip + 1,
  endIndex: Math.min(skip + limit, totalCount)
};
```

## Common Patterns

### Search with Pagination
```javascript
app.get('/api/search', async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const query = q ? { $text: { $search: q } } : {};
  
  const results = await Model.find(query)
    .skip(skip)
    .limit(limit);
    
  const totalCount = await Model.countDocuments(query);
  
  res.json({
    data: results,
    pagination: buildPaginationInfo(page, limit, totalCount),
    searchQuery: q
  });
});
```

### Filtered Pagination
```javascript
app.get('/api/users', async (req, res) => {
  const { city, age, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const query = {};
  if (city) query.city = city;
  if (age) query.age = { $gte: parseInt(age) };
  
  const users = await User.find(query)
    .skip(skip)
    .limit(limit);
    
  const totalCount = await User.countDocuments(query);
  
  res.json({
    data: users,
    pagination: buildPaginationInfo(page, limit, totalCount),
    filters: { city, age }
  });
});
```

## Monitoring and Analytics

### Track Pagination Usage
```javascript
// Log pagination metrics
app.use('/api/users', (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    analytics.track('pagination_request', {
      page: req.query.page,
      limit: req.query.limit,
      duration,
      statusCode: res.statusCode
    });
  });
  
  next();
});
```

### Performance Monitoring
```javascript
// Monitor pagination performance
const monitorPagination = (query, duration) => {
  if (duration > 1000) { // Log slow queries
    console.warn('Slow pagination query:', {
      query,
      duration,
      timestamp: new Date()
    });
  }
};
```

This comprehensive pagination system will make your application efficient and user-friendly! 📄
