# Review System Documentation

## Overview

This document outlines the comprehensive review system implemented for the Open Doors property listing application. The system includes interactive star ratings, review display, and a user-friendly review submission form.

## Features

### 🌟 Interactive Star Rating System

- **5-star rating scale** with visual feedback
- **Interactive hover effects** showing rating preview
- **Click-to-select** functionality
- **Text feedback** (Poor, Fair, Good, Very Good, Excellent)
- **Default 5-star rating** for better user experience

### 📝 Review Display

- **Average rating calculation** with visual stars
- **Individual review cards** with star ratings
- **Formatted dates** for each review
- **Review count display**
- **Empty state** with encouraging message when no reviews exist

### 📱 Responsive Design

- **Mobile-optimized** layout
- **Touch-friendly** star rating interface
- **Adaptive spacing** for different screen sizes
- **Stacked layout** on smaller devices

## Technical Implementation

### Backend Changes

#### Database Population

```javascript
// Updated show listing route to populate reviews
app.get(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("review");
    res.render("listings/show.ejs", { listing });
  })
);
```

#### Review Model

```javascript
const reviewSchema = new schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxLength: 250,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
```

### Frontend Implementation

#### HTML Structure

```html
<!-- Reviews Display Section -->
<div class="reviews-section">
  <div class="row">
    <div class="col-lg-8">
      <!-- Reviews Display -->
      <div class="reviews-display">
        <div class="reviews-header">
          <h3 class="reviews-title">
            <i class="fas fa-star me-2"></i>Reviews
            <span class="reviews-count">(<%= listing.review.length %>)</span>
          </h3>
          <!-- Average Rating Display -->
          <div class="average-rating">
            <div class="rating-stars">
              <!-- Dynamic star rendering based on average rating -->
            </div>
            <span class="rating-text"
              ><%= avgRating.toFixed(1) %> out of 5</span
            >
          </div>
        </div>

        <!-- Individual Reviews List -->
        <div class="reviews-list">
          <!-- Dynamic review items -->
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <!-- Review Form -->
      <div class="review-form-card">
        <form class="review-form needs-validation" novalidate>
          <!-- Star Rating Input -->
          <div class="star-rating-input">
            <input type="hidden" id="rating" name="review[rating]" value="5" />
            <div class="star-rating-display">
              <i class="fas fa-star" data-rating="1"></i>
              <i class="fas fa-star" data-rating="2"></i>
              <i class="fas fa-star" data-rating="3"></i>
              <i class="fas fa-star" data-rating="4"></i>
              <i class="fas fa-star" data-rating="5"></i>
            </div>
            <span class="rating-text">Excellent</span>
          </div>

          <!-- Comment Textarea -->
          <textarea
            id="comment"
            name="review[comment]"
            class="form-control"
            placeholder="Share your experience with this property..."
            rows="4"
            maxlength="250"
            required></textarea>
        </form>
      </div>
    </div>
  </div>
</div>
```

#### CSS Styling

```css
/* Reviews Section Styles */
.reviews-section {
  margin: 4rem 0;
  padding: 2rem 0;
}

.reviews-display {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  margin-bottom: 2rem;
}

/* Star Rating Styles */
.star-rating-display {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
}

.star-rating-display i {
  font-size: 1.5rem;
  color: #ffc107;
  transition: all 0.2s ease;
  cursor: pointer;
}

.star-rating-display i:hover,
.star-rating-display i.active {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3));
}

.star-rating-display i.inactive {
  color: #e0e0e0;
}

/* Review Items */
.review-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.review-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Form Styling */
.review-form-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  position: sticky;
  top: 6rem;
}

.btn-submit-review {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 2px solid #000000;
  background: #000000;
  color: #ffffff;
  transition: all 0.3s ease;
}
```

#### JavaScript Functionality

```javascript
// Star Rating Functionality
document.addEventListener("DOMContentLoaded", function () {
  const starRatingDisplay = document.querySelector(".star-rating-display");
  const ratingInput = document.getElementById("rating");
  const ratingText = document.querySelector(".star-rating-input .rating-text");

  if (starRatingDisplay && ratingInput && ratingText) {
    const stars = starRatingDisplay.querySelectorAll("i");
    const ratingTexts = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };

    // Initialize with default rating
    updateStarDisplay(5);
    ratingText.textContent = ratingTexts[5];

    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        const rating = index + 1;
        ratingInput.value = rating;
        updateStarDisplay(rating);
        ratingText.textContent = ratingTexts[rating];
      });

      star.addEventListener("mouseenter", () => {
        const rating = index + 1;
        updateStarDisplay(rating);
        ratingText.textContent = ratingTexts[rating];
      });
    });

    starRatingDisplay.addEventListener("mouseleave", () => {
      const currentRating = parseInt(ratingInput.value);
      updateStarDisplay(currentRating);
      ratingText.textContent = ratingTexts[currentRating];
    });

    function updateStarDisplay(rating) {
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.add("active");
          star.classList.remove("inactive");
        } else {
          star.classList.add("inactive");
          star.classList.remove("active");
        }
      });
    }
  }

  // Character counter for review textarea
  const commentTextarea = document.getElementById("comment");
  if (commentTextarea) {
    const maxLength = 250;

    // Create character counter element
    const charCounter = document.createElement("div");
    charCounter.className = "char-counter";
    charCounter.textContent = `0/${maxLength}`;
    commentTextarea.parentNode.appendChild(charCounter);

    commentTextarea.addEventListener("input", function () {
      const currentLength = this.value.length;
      charCounter.textContent = `${currentLength}/${maxLength}`;

      // Update counter color based on length
      charCounter.classList.remove("warning", "danger");
      if (currentLength > maxLength * 0.8) {
        charCounter.classList.add("warning");
      }
      if (currentLength >= maxLength) {
        charCounter.classList.add("danger");
      }
    });
  }
});
```

## EJS Template Logic

### Average Rating Calculation

```ejs
<% if (listing.review.length > 0) { %>
  <div class="average-rating">
    <div class="rating-stars">
      <%
        const avgRating = listing.review.reduce((sum, review) => sum + review.rating, 0) / listing.review.length;
        const fullStars = Math.floor(avgRating);
        const hasHalfStar = avgRating % 1 >= 0.5;
      %>
      <% for (let i = 1; i <= 5; i++) { %>
        <% if (i <= fullStars) { %>
          <i class="fas fa-star"></i>
        <% } else if (i === fullStars + 1 && hasHalfStar) { %>
          <i class="fas fa-star-half-alt"></i>
        <% } else { %>
          <i class="far fa-star"></i>
        <% } %>
      <% } %>
    </div>
    <span class="rating-text"><%= avgRating.toFixed(1) %> out of 5</span>
  </div>
<% } %>
```

### Individual Review Rendering

```ejs
<% listing.review.forEach((review, index) => { %>
  <div class="review-item">
    <div class="review-header">
      <div class="review-rating">
        <% for (let i = 1; i <= 5; i++) { %>
          <% if (i <= review.rating) { %>
            <i class="fas fa-star"></i>
          <% } else { %>
            <i class="far fa-star"></i>
          <% } %>
        <% } %>
      </div>
      <div class="review-date">
        <i class="fas fa-calendar-alt me-1"></i>
        <%= new Date(review.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) %>
      </div>
    </div>
    <div class="review-content">
      <p class="review-comment"><%= review.comment %></p>
    </div>
  </div>
<% }) %>
```

## Responsive Design

### Mobile Breakpoints

- **992px and below**: Stacked layout, adjusted spacing
- **768px and below**: Mobile-optimized form, smaller fonts
- **576px and below**: Compact design, touch-friendly elements
- **400px and below**: Minimal spacing, essential elements only

### Key Responsive Features

- **Flexible grid system** using Bootstrap classes
- **Adaptive font sizes** with clamp() functions
- **Touch-friendly** star rating interface
- **Optimized spacing** for different screen sizes
- **Stacked layout** on mobile devices

## User Experience Features

### Interactive Elements

- **Hover effects** on stars with live preview
- **Click feedback** with visual confirmation
- **Character counter** with color-coded warnings
- **Form validation** with helpful error messages
- **Smooth animations** and transitions

### Accessibility

- **Keyboard navigation** support
- **Screen reader** friendly markup
- **High contrast** color scheme
- **Focus indicators** for interactive elements
- **Semantic HTML** structure

## File Structure

```
├── views/listings/show.ejs          # Main review display and form
├── public/css/style.css             # Review styling and responsive design
├── public/js/script.js              # Interactive star rating functionality
├── models/review.js                 # Review data model
├── index.js                         # Backend routes and review population
└── review.md                        # This documentation file
```

## Usage Instructions

### For Users

1. **View Reviews**: Scroll to the reviews section to see existing reviews with star ratings
2. **Submit Review**: Use the interactive star rating to select your rating (1-5 stars)
3. **Write Comment**: Enter your review comment (max 250 characters)
4. **Submit**: Click the submit button to add your review

### For Developers

1. **Backend**: Ensure reviews are populated using `.populate("review")` in the listing route
2. **Frontend**: Include the CSS and JavaScript files for full functionality
3. **Styling**: Customize colors and spacing in the CSS file as needed
4. **Validation**: Form validation is handled automatically with Bootstrap classes

## Future Enhancements

- **User authentication** for review ownership
- **Review editing** and deletion functionality
- **Review moderation** system
- **Photo attachments** for reviews
- **Review helpfulness** voting system
- **Email notifications** for new reviews
- **Review analytics** and reporting

---

_This review system provides a comprehensive, user-friendly way for property visitors to share their experiences and for potential renters to make informed decisions based on authentic feedback._
