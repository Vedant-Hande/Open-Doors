# Search & Filtering - Advanced Search Across Multiple Fields

## Overview
Advanced search and filtering system that supports text search, range filtering, sorting, and pagination across multiple database fields. Perfect for e-commerce, content management, and any application requiring sophisticated data retrieval.

## Features

### 🔍 Text Search
- **Multi-field Search**: Search across multiple fields simultaneously
- **Case-insensitive**: Automatically handles case variations
- **Partial Matching**: Find results with partial text matches
- **Fuzzy Search**: Find similar results even with typos

### 🎯 Filtering
- **Exact Match**: Filter by exact values
- **Range Filters**: Filter by numeric and date ranges
- **Boolean Filters**: True/false filtering
- **Array Filters**: Filter by array values
- **Multiple Operators**: eq, ne, gt, gte, lt, lte, in, nin, regex, exists

### 📊 Sorting & Pagination
- **Multi-field Sorting**: Sort by any field
- **Ascending/Descending**: Both sort orders supported
- **Pagination**: Efficient data loading with page limits
- **Total Count**: Always know total available results

## How It Works

### 1. Query Building
```javascript
const searchOptions = {
  searchFields: ['name', 'description', 'tags'], // Fields to search
  filterFields: {
    category: { type: 'string', operator: 'eq' },
    brand: { type: 'string', operator: 'eq' }
  },
  rangeFields: {
    price: 'price', // Creates price_min, price_max filters
    rating: 'rating' // Creates rating_min, rating_max filters
  }
};

const query = searchFilter.buildQuery(req.query, searchOptions);
```

### 2. Text Search Implementation
```javascript
// Multi-field text search
if (params.search && searchFields.length > 0) {
  query.$or = searchFields.map(field => ({
    [field]: { $regex: params.search, $options: 'i' }
  }));
}
```

### 3. Range Filtering
```javascript
// Numeric range filtering
if (params.price_min || params.price_max) {
  query.price = {};
  if (params.price_min) query.price.$gte = Number(params.price_min);
  if (params.price_max) query.price.$lte = Number(params.price_max);
}
```

## Usage Examples

### Basic Search
```javascript
// Search for "laptop" in name, description, or tags
GET /api/products?search=laptop

// Filter by category
GET /api/products?category=electronics

// Combine search and filter
GET /api/products?search=laptop&category=electronics
```

### Range Filtering
```javascript
// Price range filtering
GET /api/products?price_min=100&price_max=1000

// Date range filtering
GET /api/products?createdAt_from=2024-01-01&createdAt_to=2024-12-31

// Rating filtering
GET /api/products?rating_min=4&rating_max=5
```

### Sorting and Pagination
```javascript
// Sort by price (ascending)
GET /api/products?sortBy=price&sortOrder=asc

// Pagination
GET /api/products?page=2&limit=20

// Combined
GET /api/products?search=laptop&sortBy=price&sortOrder=asc&page=1&limit=10
```

### Advanced Filtering
```javascript
// Multiple filters
GET /api/products?category=electronics&brand=apple&price_min=500&inStock=true

// Array filtering
GET /api/products?tags=wireless,bluetooth

// Boolean filtering
GET /api/products?inStock=true&featured=true
```

## API Endpoints

### 1. Search Products
```javascript
GET /api/products
Query Parameters:
- search: Text to search for
- category: Filter by category
- brand: Filter by brand
- price_min: Minimum price
- price_max: Maximum price
- rating_min: Minimum rating
- rating_max: Maximum rating
- sortBy: Field to sort by
- sortOrder: asc or desc
- page: Page number
- limit: Items per page
```

### 2. Advanced Search
```javascript
GET /api/products/advanced
// Uses aggregation pipeline for complex queries
// Supports computed fields and advanced filtering
```

### 3. Search Suggestions
```javascript
GET /api/products/suggestions?q=laptop
// Returns search suggestions based on partial input
```

### 4. Filter Options
```javascript
GET /api/products/filters
// Returns available filter options (categories, brands, price ranges)
```

## Response Format

### Successful Response
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "MacBook Pro",
      "description": "Powerful laptop for professionals",
      "price": 1999,
      "category": "electronics",
      "brand": "apple",
      "inStock": true,
      "rating": 4.8
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 200,
    "hasNext": true,
    "hasPrev": false,
    "limit": 20
  },
  "filters": {
    "search": "laptop",
    "category": "electronics",
    "priceMin": "100",
    "priceMax": "2000"
  }
}
```

## Database Optimization

### Indexes for Performance
```javascript
// Text search indexes
db.products.createIndex({ "name": "text", "description": "text", "tags": "text" })

// Filter indexes
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "brand": 1 })
db.products.createIndex({ "price": 1 })
db.products.createIndex({ "rating": 1 })
db.products.createIndex({ "inStock": 1 })

// Compound indexes for common queries
db.products.createIndex({ "category": 1, "price": 1 })
db.products.createIndex({ "brand": 1, "inStock": 1 })
```

### Query Optimization
```javascript
// Use projection to limit returned fields
const products = await Product.find(query, 'name price category brand')
  .sort(sort)
  .skip(skip)
  .limit(limit);

// Use aggregation for complex queries
const pipeline = [
  { $match: query },
  { $sort: sort },
  { $skip: skip },
  { $limit: limit },
  { $project: { name: 1, price: 1, category: 1 } }
];
```

## Frontend Integration

### Search Form
```html
<form id="searchForm">
  <input type="text" name="search" placeholder="Search products...">
  <select name="category">
    <option value="">All Categories</option>
    <option value="electronics">Electronics</option>
    <option value="clothing">Clothing</option>
  </select>
  <input type="number" name="price_min" placeholder="Min Price">
  <input type="number" name="price_max" placeholder="Max Price">
  <select name="sortBy">
    <option value="name">Name</option>
    <option value="price">Price</option>
    <option value="rating">Rating</option>
  </select>
  <select name="sortOrder">
    <option value="asc">Ascending</option>
    <option value="desc">Descending</option>
  </select>
  <button type="submit">Search</button>
</form>
```

### JavaScript Integration
```javascript
// Handle search form submission
document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const params = new URLSearchParams(formData);
  
  const response = await fetch(`/api/products?${params}`);
  const data = await response.json();
  
  displayResults(data);
});

// Display search results
function displayResults(data) {
  const container = document.getElementById('results');
  container.innerHTML = data.data.map(product => `
    <div class="product">
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <p>${product.category}</p>
    </div>
  `).join('');
  
  displayPagination(data.pagination);
}
```

## Performance Tips

### 1. Database Indexes
- Create indexes on frequently searched fields
- Use compound indexes for common filter combinations
- Consider text indexes for full-text search

### 2. Query Optimization
- Use projection to limit returned fields
- Implement proper pagination
- Cache frequently accessed data

### 3. Frontend Optimization
- Implement debounced search (wait for user to stop typing)
- Use pagination to limit results
- Cache search results client-side

### 4. Caching Strategy
```javascript
// Cache search results
const cacheKey = `search:${JSON.stringify(query)}`;
const cached = cache.get(cacheKey);

if (cached) {
  return res.json(cached);
}

// Execute search and cache result
const results = await executeSearch(query);
cache.set(cacheKey, results, 300); // Cache for 5 minutes
```

## Advanced Features

### 1. Search Suggestions
```javascript
// Auto-complete search suggestions
app.get('/api/search/suggestions', async (req, res) => {
  const { q } = req.query;
  const suggestions = await Product.aggregate([
    { $match: { name: { $regex: q, $options: 'i' } } },
    { $group: { _id: '$name' } },
    { $limit: 10 }
  ]);
  
  res.json(suggestions.map(s => s._id));
});
```

### 2. Faceted Search
```javascript
// Get filter facets
app.get('/api/search/facets', async (req, res) => {
  const facets = await Product.aggregate([
    { $group: {
      _id: null,
      categories: { $addToSet: '$category' },
      brands: { $addToSet: '$brand' },
      priceRange: {
        $push: {
          $switch: {
            branches: [
              { case: { $lt: ['$price', 100] }, then: 'Under $100' },
              { case: { $lt: ['$price', 500] }, then: '$100-$500' },
              { case: { $gte: ['$price', 500] }, then: 'Over $500' }
            ]
          }
        }
      }
    }}
  ]);
  
  res.json(facets[0]);
});
```

### 3. Search Analytics
```javascript
// Track search queries
app.use('/api/products', (req, res, next) => {
  if (req.query.search) {
    // Log search query for analytics
    analytics.track('search', {
      query: req.query.search,
      filters: req.query,
      timestamp: new Date()
    });
  }
  next();
});
```

This advanced search and filtering system will make your application highly searchable and user-friendly! 🔍
