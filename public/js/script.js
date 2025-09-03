// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

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
