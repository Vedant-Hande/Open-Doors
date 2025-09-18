const express = require('express');
const mongoose = require('mongoose');
const SearchFilter = require('./search-filter');

const app = express();

// Sample Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, index: true },
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  inStock: { type: Boolean, default: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now, index: true },
  rating: { type: Number, min: 0, max: 5, index: true }
});

const Product = mongoose.model('Product', productSchema);

// Initialize search filter
const searchFilter = new SearchFilter();

// Search and filter products
app.get('/api/products', async (req, res) => {
  try {
    // Define search options
    const searchOptions = {
      searchFields: ['name', 'description', 'tags'], // Fields to search in
      filterFields: {
        category: { type: 'string', operator: 'eq' },
        brand: { type: 'string', operator: 'eq' },
        inStock: { type: 'boolean' }
      },
      rangeFields: {
        price: 'price', // price_min, price_max
        rating: 'rating' // rating_min, rating_max
      },
      dateFields: {
        createdAt: 'createdAt' // createdAt_from, createdAt_to
      },
      booleanFields: ['inStock']
    };

    // Build query
    const query = searchFilter.buildQuery(req.query, searchOptions);
    
    // Build sort
    const sort = searchFilter.buildSort(req.query.sortBy, req.query.sortOrder);
    
    // Build pagination
    const pagination = searchFilter.buildPagination(req.query);

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    // Get total count
    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pagination.limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: pagination.page,
        totalPages,
        totalCount,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
        limit: pagination.limit
      },
      filters: {
        search: req.query.search,
        category: req.query.category,
        brand: req.query.brand,
        priceMin: req.query.price_min,
        priceMax: req.query.price_max,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advanced search with aggregation
app.get('/api/products/advanced', async (req, res) => {
  try {
    const searchOptions = {
      searchFields: ['name', 'description', 'tags'],
      filterFields: {
        category: { type: 'string', operator: 'eq' },
        brand: { type: 'string', operator: 'eq' }
      },
      rangeFields: {
        price: 'price',
        rating: 'rating'
      },
      computedFields: {
        priceRange: {
          $switch: {
            branches: [
              { case: { $lt: ['$price', 100] }, then: 'Budget' },
              { case: { $lt: ['$price', 500] }, then: 'Mid-range' },
              { case: { $gte: ['$price', 500] }, then: 'Premium' }
            ],
            default: 'Unknown'
          }
        }
      }
    };

    // Build aggregation pipeline
    const pipeline = searchFilter.buildAggregationPipeline(req.query, searchOptions);
    
    // Execute aggregation
    const results = await Product.aggregate(pipeline);
    
    // Process results
    const pagination = searchFilter.buildPagination(req.query);
    const processedResults = searchFilter.processResults(results, pagination);

    res.json({
      success: true,
      ...processedResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get search suggestions
app.get('/api/products/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          names: { $addToSet: '$name' },
          categories: { $addToSet: '$category' },
          brands: { $addToSet: '$brand' }
        }
      },
      {
        $project: {
          suggestions: {
            $concatArrays: [
              { $slice: ['$names', 5] },
              { $slice: ['$categories', 3] },
              { $slice: ['$brands', 3] }
            ]
          }
        }
      }
    ]);

    res.json({
      suggestions: suggestions[0]?.suggestions || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get filter options
app.get('/api/products/filters', async (req, res) => {
  try {
    const filters = await Product.aggregate([
      {
        $group: {
          _id: null,
          categories: { $addToSet: '$category' },
          brands: { $addToSet: '$brand' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          minRating: { $min: '$rating' },
          maxRating: { $max: '$rating' }
        }
      }
    ]);

    res.json({
      success: true,
      filters: filters[0] || {
        categories: [],
        brands: [],
        minPrice: 0,
        maxPrice: 0,
        minRating: 0,
        maxRating: 5
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect('mongodb://localhost:27017/search-example')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server running on port 3000');
      console.log('\nTry these endpoints:');
      console.log('  GET /api/products?search=laptop');
      console.log('  GET /api/products?category=electronics&price_min=100&price_max=1000');
      console.log('  GET /api/products?sortBy=price&sortOrder=asc&page=1&limit=10');
      console.log('  GET /api/products/suggestions?q=lap');
      console.log('  GET /api/products/filters');
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
