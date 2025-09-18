const express = require('express');
const mongoose = require('mongoose');
const Pagination = require('./pagination');

const app = express();

// Sample User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  city: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

// Initialize pagination
const pagination = new Pagination({
  defaultLimit: 10,
  maxLimit: 50
});

// Offset-based pagination
app.get('/api/users', async (req, res) => {
  try {
    // Validate pagination parameters
    const validation = pagination.validatePagination(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters',
        details: validation.errors
      });
    }

    // Build pagination parameters
    const paginationParams = pagination.buildPagination(req.query);
    
    // Build base query
    const baseQuery = {};
    if (req.query.city) {
      baseQuery.city = req.query.city;
    }
    if (req.query.isActive !== undefined) {
      baseQuery.isActive = req.query.isActive === 'true';
    }

    // Execute query with pagination
    const users = await User.find(baseQuery)
      .sort({ createdAt: -1 })
      .skip(paginationParams.skip)
      .limit(paginationParams.limit);

    // Get total count
    const totalCount = await User.countDocuments(baseQuery);

    // Build pagination info
    const paginationInfo = pagination.buildPaginationInfo(paginationParams, totalCount);

    // Build pagination links
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    const queryParams = { ...req.query };
    delete queryParams.page; // Remove page from query params for clean URLs
    
    const paginationMetadata = pagination.buildPaginationMetadata(
      paginationInfo, 
      baseUrl, 
      queryParams
    );

    res.json({
      success: true,
      data: users,
      pagination: paginationMetadata
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cursor-based pagination for large datasets
app.get('/api/users/cursor', async (req, res) => {
  try {
    // Build cursor pagination parameters
    const cursorParams = pagination.buildCursorPagination(req.query, 'createdAt', 'desc');
    
    // Build base query
    const baseQuery = {};
    if (req.query.city) {
      baseQuery.city = req.query.city;
    }

    // Build cursor query
    const cursorQuery = pagination.buildCursorQuery(cursorParams, baseQuery);

    // Execute query
    const users = await User.find(cursorQuery)
      .sort({ createdAt: cursorParams.sortOrder })
      .limit(cursorParams.limit + 1); // Get one extra to check for more

    // Process results
    const processedResults = pagination.processCursorResults(users, cursorParams);

    res.json({
      success: true,
      ...processedResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pagination with aggregation
app.get('/api/users/stats', async (req, res) => {
  try {
    const paginationParams = pagination.buildPagination(req.query);
    
    // Build aggregation pipeline
    const pipeline = [
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' },
          users: { $push: { name: '$name', email: '$email', age: '$age' } }
        }
      },
      {
        $sort: { count: -1 }
      },
      ...pagination.buildAggregationPagination(req.query)
    ];

    // Execute aggregation
    const results = await User.aggregate(pipeline);
    
    // Get total count for pagination
    const totalCountPipeline = [
      { $group: { _id: '$city' } },
      { $count: 'total' }
    ];
    const totalCountResult = await User.aggregate(totalCountPipeline);
    const totalCount = totalCountResult[0]?.total || 0;

    // Process results
    const processedResults = pagination.processAggregationResults(
      results, 
      paginationParams, 
      totalCount
    );

    res.json({
      success: true,
      ...processedResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Infinite scroll pagination
app.get('/api/users/infinite', async (req, res) => {
  try {
    const { lastId, limit = 10 } = req.query;
    
    const query = {};
    if (lastId) {
      query._id = { $lt: lastId };
    }

    const users = await User.find(query)
      .sort({ _id: -1 })
      .limit(parseInt(limit) + 1);

    const hasMore = users.length > limit;
    if (hasMore) {
      users.pop();
    }

    const lastUser = users[users.length - 1];
    const nextCursor = lastUser ? lastUser._id : null;

    res.json({
      success: true,
      data: users,
      hasMore,
      nextCursor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search with pagination
app.get('/api/users/search', async (req, res) => {
  try {
    const { q, ...filters } = req.query;
    const paginationParams = pagination.buildPagination(req.query);
    
    // Build search query
    const searchQuery = {};
    
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ];
    }

    // Add filters
    Object.keys(filters).forEach(key => {
      if (key !== 'page' && key !== 'limit' && key !== 'q') {
        searchQuery[key] = filters[key];
      }
    });

    // Execute search with pagination
    const users = await User.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(paginationParams.skip)
      .limit(paginationParams.limit);

    const totalCount = await User.countDocuments(searchQuery);
    const paginationInfo = pagination.buildPaginationInfo(paginationParams, totalCount);

    res.json({
      success: true,
      data: users,
      pagination: paginationInfo,
      searchQuery: q
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect('mongodb://localhost:27017/pagination-example')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server running on port 3000');
      console.log('\nTry these endpoints:');
      console.log('  GET /api/users?page=1&limit=5');
      console.log('  GET /api/users?city=New York&page=2');
      console.log('  GET /api/users/cursor?limit=5');
      console.log('  GET /api/users/cursor?cursor=2024-01-15T10:00:00.000Z&limit=5');
      console.log('  GET /api/users/infinite?limit=5');
      console.log('  GET /api/users/infinite?lastId=507f1f77bcf86cd799439011&limit=5');
      console.log('  GET /api/users/search?q=john&page=1&limit=5');
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
