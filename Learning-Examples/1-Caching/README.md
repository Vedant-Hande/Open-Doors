# Caching - In-Memory Caching for Frequently Accessed Data

## Overview

Caching stores frequently requested data in memory to avoid repeated database queries, significantly improving application performance.

## How It Works

### 1. Cache Storage

- Uses JavaScript `Map` for in-memory storage
- Stores data with timestamps for expiration
- Key-value pairs where key is the request URL

### 2. Cache Middleware

```javascript
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);

    // Return cached data if exists and not expired
    if (cached && Date.now() - cached.timestamp < duration * 1000) {
      return res.json(cached.data);
    }

    // Cache new responses
    res.json = function (data) {
      cache.set(key, { data, timestamp: Date.now() });
      originalJson.call(this, data);
    };

    next();
  };
};
```

## Benefits

### ⚡ Performance

- **Faster Response Times**: No database query needed for cached data
- **Reduced Database Load**: Fewer queries to your database
- **Better User Experience**: Instant responses for repeated requests

### 💰 Cost Savings

- **Lower Server Costs**: Reduced CPU and memory usage
- **Database Efficiency**: Less load on your database server
- **Bandwidth Savings**: Faster data delivery

## Usage Examples

### Basic Caching

```javascript
// Cache for 5 minutes (300 seconds)
app.get("/api/data", cacheMiddleware(300), (req, res) => {
  // Your expensive operation here
  res.json(expensiveData);
});
```

### Different Cache Durations

```javascript
// User data - cache for 5 minutes
app.get("/api/users", cacheMiddleware(300), handler);

// Settings - cache for 1 hour (3600 seconds)
app.get("/api/settings", cacheMiddleware(3600), handler);

// Static content - cache for 1 day
app.get("/api/static", cacheMiddleware(86400), handler);
```

### Cache Management

```javascript
// Clear specific cache
clearCache("/api/users");

// Clear all cache
clearAllCache();

// Get cache statistics
const stats = getCacheStats();
```

## When to Use Caching

### ✅ Good for Caching

- **Read-heavy data** (user profiles, settings, configurations)
- **Expensive computations** (reports, analytics)
- **External API calls** (weather data, exchange rates)
- **Static content** (menus, categories, lists)

### ❌ Don't Cache

- **User-specific sensitive data** (passwords, personal info)
- **Real-time data** (live chat, notifications)
- **Frequently changing data** (stock prices, live scores)
- **Large datasets** (full database dumps)

## Production Considerations

### Memory Management

```javascript
// Set maximum cache size
const MAX_CACHE_SIZE = 1000;
if (cache.size > MAX_CACHE_SIZE) {
  // Clear oldest entries
  const oldestKey = cache.keys().next().value;
  cache.delete(oldestKey);
}
```

### Redis for Production

For production applications, consider using Redis instead of in-memory caching:

```javascript
const redis = require("redis");
const client = redis.createClient();

const redisCache = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    res.json = function (data) {
      client.setex(key, duration, JSON.stringify(data));
      originalJson.call(this, data);
    };

    next();
  };
};
```

## Testing Cache

### Manual Testing

```bash
# First request - will be slow (cache miss)
curl http://localhost:3000/api/users

# Second request - will be fast (cache hit)
curl http://localhost:3000/api/users
```

### Cache Headers

You can also add HTTP cache headers:

```javascript
res.set("Cache-Control", "public, max-age=300");
res.set("ETag", generateETag(data));
```

## Best Practices

1. **Choose Appropriate Duration**: Balance between freshness and performance
2. **Monitor Cache Hit Rate**: Track how often cache is used
3. **Clear Cache on Updates**: Invalidate cache when data changes
4. **Use Different Durations**: Different data types need different cache times
5. **Handle Memory Limits**: Set maximum cache size for production
6. **Log Cache Operations**: Monitor cache performance and issues

## Common Patterns

### Cache-Aside Pattern

```javascript
app.get("/api/user/:id", async (req, res) => {
  const cacheKey = `user:${req.params.id}`;
  let user = cache.get(cacheKey);

  if (!user) {
    user = await User.findById(req.params.id);
    cache.set(cacheKey, user, 300); // Cache for 5 minutes
  }

  res.json(user);
});
```

### Write-Through Pattern

```javascript
app.post("/api/user", async (req, res) => {
  const user = await User.create(req.body);

  // Update cache immediately
  cache.set(`user:${user.id}`, user, 300);

  res.json(user);
});
```

This caching implementation will significantly improve your application's performance! 🚀
