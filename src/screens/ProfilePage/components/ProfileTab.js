import { useState, useCallback } from "react";
import { Edit, Loader } from "lucide-react";
import { INDUSTRY_OPTIONS, FORM_VALIDATION } from "../config/profileConfig";
import { validateField, sanitizeInput } from "../utils/profileUtils";
import StarRating from "./StarRating";
import styles from "../ProfilePage.module.css";

const ProfileTab = ({ businessData, businessStats, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    businessName: businessData?.businessName || "",
    industry: businessData?.industry || "",
    website: businessData?.website || "",
    primaryOperatingCountry: businessData?.primaryOperatingCountry || "",
    phone: businessData?.contactInfo?.phone || "",
    email: businessData?.contactInfo?.email || "",
    description: businessData?.description || "",
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const sanitizedValue = sanitizeInput(value);

      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field], FORM_VALIDATION);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    const updatedData = {
      ...formData,
      contactInfo: {
        phone: formData.phone,
        email: formData.email,
      },
    };

    await onSave(updatedData);
  }, [formData, validateForm, onSave]);

  // const stats = formatBusinessStats(businessData, []);

  return (
    <div className={styles.tabContent}>
      <div className={styles.profileSection}>
        {/* Profile Stats Header */}
        <div
          className={styles.profileStats}
          // style={{
          //   maxWidth: "900px",
          // }}
        >
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {businessStats?.locationsCount || 0}
            </span>
            <span className={styles.statLabel}>Locations</span>
          </div>
          <div className={styles.statCard}>
            <span
              className={styles.statValue}
              style={{ display: "flex", justifyContent: "center", gap: "6px" }}
            >
              {businessStats?.dataQuality || "0%"}
              <span className={styles.statBadge}>
                {businessStats?.dataQuality === "100%"
                  ? "Complete"
                  : "Incomplete"}
              </span>
            </span>
            <span className={styles.statLabel}>Data Quality</span>
          </div>
          <div className={styles.statCard}>
            <span
              className={styles.statValue}
              style={{ display: "flex", justifyContent: "center", gap: "6px" }}
            >
              {businessStats?.avgRating?.toFixed(1) || "0.0"}
              <StarRating rating={businessStats?.avgRating || 0} />
            </span>
            <span className={styles.statLabel}>Avg Rating</span>
          </div>
        </div>

        {/* Business Information Form */}
        <div className={styles.formSection}>
          {/* <h3 className={styles.sectionTitle}>Business Information</h3> */}

          <div className={styles.formGrid}>
            {/* Row 1: Business Name & Industry */}
            <div className={styles.inputLabel}>
              <span>Business Name *</span>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className={`${styles.inputField} ${
                  errors.businessName ? styles.inputError : ""
                }`}
                placeholder="Enter business name"
              />
              {errors.businessName && (
                <span className={styles.error}>{errors.businessName}</span>
              )}
            </div>

            <div className={styles.inputLabel}>
              <span>Industry</span>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className={styles.selectField}
              >
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Website & Country */}
            <div className={styles.inputLabel}>
              <span>Website</span>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={`${styles.inputField} ${
                  errors.website ? styles.inputError : ""
                }`}
                placeholder="https://example.com"
              />
              {errors.website && (
                <span className={styles.error}>{errors.website}</span>
              )}
            </div>

            <div className={styles.inputLabel}>
              <span>Primary Operating Country</span>
              <input
                type="text"
                name="primaryOperatingCountry"
                value={formData.primaryOperatingCountry}
                onChange={handleInputChange}
                className={styles.inputField}
                placeholder="Enter country"
              />
            </div>

            {/* Row 3: Phone & Email */}
            <div className={styles.inputLabel}>
              <span>Phone Number</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${styles.inputField} ${
                  errors.phone ? styles.inputError : ""
                }`}
                placeholder="+1 555 123-4567"
              />
              {errors.phone && (
                <span className={styles.error}>{errors.phone}</span>
              )}
            </div>

            <div className={styles.inputLabel}>
              <span>Email Address</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.inputField} ${
                  errors.email ? styles.inputError : ""
                }`}
                disabled
                placeholder="contact@business.com"
              />
              {errors.email && (
                <span className={styles.error}>{errors.email}</span>
              )}
            </div>

            {/* Description (spans 2 columns) */}
            <div className={`${styles.inputLabel} ${styles.descriptionField}`}>
              <span>Business Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`${styles.textAreaField} ${
                  errors.description ? styles.inputError : ""
                }`}
                placeholder="Describe your business, services, and what makes you unique..."
                rows={4}
              />
              {errors.description && (
                <span className={styles.error}>{errors.description}</span>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={styles.saveBtn}
            >
              {isSaving ? (
                <>
                  <Loader className={styles.spinning} size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Edit size={16} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
