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

function togglePassword(inputId, iconId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(iconId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
}

// Password strength checker
document.getElementById("password").addEventListener("input", function () {
  const password = this.value;
  const strengthFill = document.getElementById("strength-fill");
  const strengthText = document.getElementById("strength-text");

  let strength = 0;
  let strengthLabel = "";

  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/)) strength++;
  if (password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^a-zA-Z0-9]/)) strength++;

  switch (strength) {
    case 0:
    case 1:
      strengthLabel = "Very Weak";
      strengthFill.style.width = "20%";
      strengthFill.style.background = "#ff4444";
      break;
    case 2:
      strengthLabel = "Weak";
      strengthFill.style.width = "40%";
      strengthFill.style.background = "#ff8800";
      break;
    case 3:
      strengthLabel = "Fair";
      strengthFill.style.width = "60%";
      strengthFill.style.background = "#ffaa00";
      break;
    case 4:
      strengthLabel = "Good";
      strengthFill.style.width = "80%";
      strengthFill.style.background = "#00aa00";
      break;
    case 5:
      strengthLabel = "Strong";
      strengthFill.style.width = "100%";
      strengthFill.style.background = "#008800";
      break;
  }

  strengthText.textContent = strengthLabel;
});

// Password confirmation checker
document
  .getElementById("confirmPassword")
  .addEventListener("input", function () {
    const password = document.getElementById("password").value;
    const confirmPassword = this.value;

    if (confirmPassword && password !== confirmPassword) {
      this.setCustomValidity("Passwords do not match");
    } else {
      this.setCustomValidity("");
    }
  });
