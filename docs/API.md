# TripSpot API Documentation

## Base URL

```
http://localhost:8080
```

## Endpoints

### Listings

#### Get All Listings

- **GET** `/listing`
- **Query Parameters:**
  - `search` (string): Search in title, description, or location
  - `minPrice` (number): Minimum price filter
  - `maxPrice` (number): Maximum price filter
  - `location` (string): Filter by location
  - `country` (string): Filter by country
  - `sortBy` (string): Sort field (createdAt, price, title)
  - `sortOrder` (string): Sort order (asc, desc)
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20)

#### Get Single Listing

- **GET** `/listing/:id`

#### Create New Listing

- **POST** `/listing`
- **Body:** JSON with title, desc, price, location, country, image.url

#### Update Listing

- **PUT** `/listing/:id`
- **Body:** JSON with updated fields

#### Delete Listing

- **DELETE** `/listing/:id`

### Reviews

#### Add Review

- **POST** `/listing/:id/review`
- **Body:** JSON with rating and comment

#### Delete Review

- **DELETE** `/listing/:id/review/:reviewId`

### Health Check

- **GET** `/health`
- Returns server status and uptime

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "errors": ["Detailed error messages"] // For validation errors
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error
