export const validateCampaignName = (name) => {
  if (!name || name.trim().length < 3 || name.trim().length > 100) {
    return "Campaign name is required and must be 3-100 characters";
  }
  return null;
};

export const validateRewardDescription = (description) => {
  if (
    !description ||
    description.trim().length < 5 ||
    description.trim().length > 300
  ) {
    return "Description is required and must be 5-300 characters";
  }
  return null;
};

export const validateTiers = (tiers) => {
  const errors = tiers.map((tier, index) => {
    let msg = null;

    // Check reward text
    if (!tier.rewardText?.trim()) {
      msg = `Tier ${index + 1} reward description is required.`;
    }

    // Check points - FIXED: More flexible validation
    const points = parseInt(tier.points);
    if (!tier.points || isNaN(points) || points < 1) {
      msg =
        (msg ? msg + " " : "") +
        `Tier ${index + 1} must have at least 1 point.`;
    } else if (points > 1000000) {
      msg =
        (msg ? msg + " " : "") +
        `Tier ${index + 1} points cannot exceed 1,000,000.`;
    }

    // Check tier progression - FIXED: Allow equal points but warn
    if (index > 0 && points > 0) {
      const prevPoints = parseInt(tiers[index - 1]?.points) || 0;
      if (points <= prevPoints) {
        msg =
          (msg ? msg + " " : "") +
          `Tier ${
            index + 1
          } should require more points than Tier ${index} (${prevPoints} pts).`;
      }
    }

    return msg;
  });

  return errors;
};

// Enhanced validation with better error messages
export const validateForm = (form, tiers) => {
  const errors = {};

  // Validate campaign name
  const nameError = validateCampaignName(form.campaignName);
  if (nameError) errors.campaignName = nameError;

  // Validate reward description
  const descError = validateRewardDescription(form.rewardDescription);
  if (descError) errors.rewardDescription = descError;

  // Validate tiers
  const tierErrors = validateTiers(tiers);
  const hasTierErrors = tierErrors.some(Boolean);

  // Additional business logic validation
  if (tiers.length < 1) {
    errors.tiers = "At least one reward tier is required.";
  }

  if (tiers.length > 5) {
    errors.tiers = "Maximum of 5 reward tiers allowed.";
  }

  return {
    errors,
    tierErrors,
    isValid: Object.keys(errors).length === 0 && !hasTierErrors,
  };
};

// Helper function for points formatting
export const formatPoints = (points) => {
  const num = parseInt(points);
  if (isNaN(num)) return "";
  return num.toLocaleString();
};

// Helper function to suggest points values
export const suggestNextPoints = (currentTiers, tierIndex) => {
  if (tierIndex === 0) return 500; // First tier default

  const prevPoints = parseInt(currentTiers[tierIndex - 1]?.points) || 0;
  const increment = Math.max(200, Math.round(prevPoints * 0.5));
  return prevPoints + increment;
};
