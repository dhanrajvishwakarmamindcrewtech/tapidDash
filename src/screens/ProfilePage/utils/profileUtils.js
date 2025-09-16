export const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";

  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const validateField = (fieldName, value, validation) => {
  const rules = validation[fieldName];
  if (!rules) return null;

  // Required validation
  if (rules.required && (!value || value.trim() === "")) {
    return `${fieldName.replace(/([A-Z])/g, " $1").toLowerCase()} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim() === "") return null;

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return `Must be less than ${rules.maxLength} characters`;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    switch (fieldName) {
      case "website":
        return "Please enter a valid URL (starting with http:// or https://)";
      case "phone":
        return "Please enter a valid phone number";
      case "email":
        return "Please enter a valid email address";
      default:
        return "Invalid format";
    }
  }

  return null;
};

export const formatBusinessStats = (businessData, locations = []) => {
  const stats = {
    locationsCount: locations.length,
    dataQuality: locations.length > 0 ? "100%" : "0%",
    avgRating: 0,
    completionStatus: "Complete",
  };

  // Calculate average rating
  const ratingsSum = locations.reduce(
    (sum, loc) => sum + (loc.reviewsSummary?.rating || 0),
    0
  );
  stats.avgRating =
    locations.length > 0 ? (ratingsSum / locations.length).toFixed(1) : "0.0";

  return stats;
};

export const sanitizeInput = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/<script[^>]*>.*?<\/script>/gi, "");
};
