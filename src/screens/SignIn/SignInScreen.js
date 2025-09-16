import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/CoreContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Check,
  X,
  Shield,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  MapPin,
  Plus,
  CreditCard,
  Building,
  Globe,
} from "lucide-react";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import POSModal from "../../components/POSModal";
import styles from "./SignInScreen.module.css";

// Helper formatters for card inputs
const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const SignInScreen = () => {
  const [currentView, setCurrentView] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [emailVerificationStep, setEmailVerificationStep] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [selectedPOSTerminals, setSelectedPOSTerminals] = useState([]);
  const [connectedTerminals, setConnectedTerminals] = useState(new Set());

  // Session tracking
  const [sessionStartTime] = useState(Date.now());
  const [stepStartTimes, setStepStartTimes] = useState({});
  const [formValidationErrors, setFormValidationErrors] = useState([]);

  // Error handling states
  const [error, setError] = useState("");
  const [signInError, setSignInError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    billingAddress: "",
    city: "",
    postalCode: "",
    country: "Ireland",
  });

  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
  });

  const [locationError, setLocationError] = useState("");
  const [selectedPlaceData, setSelectedPlaceData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signIn, createAccount } = useAuth();
  const navigate = useNavigate();

  // Sign In State
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Enhanced Create Account State
  const [createAccountData, setCreateAccountData] = useState({
    // Personal/Admin Information (Step 1)
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",

    // Business Information (Step 2) - Auto-populated from location data
    companyName: "",
    website: "",
    description: "",
    primary_type: "",
    // Plan and settings
    selectedPlan: "free",
    agreeToTerms: false,
    locations: [],
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  // const [connectingTerminal, setConnectingTerminal] = useState(null);
  // const [showPOSSelectionModal, setShowPOSSelectionModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Track step start time
    setStepStartTimes((prev) => ({ ...prev, [currentStep]: Date.now() }));
  }, [currentStep]);

  // Helper function to format Firebase error messages
  const formatFirebaseError = (error) => {
    if (!error) return "";

    const errorCode = error.code || "";
    const errorMessage = error.message || "";

    switch (errorCode) {
      case "auth/weak-password":
        return "Please choose a stronger password with at least 6 characters.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please sign in with your existing password, or use a different email address for a new account.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
        return "No account found with this email address. Please check your email or create a new account.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again or reset your password.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support@tapid.ie for assistance.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait a few minutes before trying again.";
      case "auth/network-request-failed":
        return "Connection problem. Please check your internet connection and try again.";
      default:
        if (errorMessage.includes("Password should be at least")) {
          return "Please choose a stronger password with at least 6 characters.";
        }
        return "Something went wrong. Please try again, or contact support@tapid.ie if the problem continues.";
    }
  };

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
    const errors = {};

    if (currentView === "onboarding") {
      if (currentStep === 1) {
        // Personal/Admin Information Validation
        if (!createAccountData.adminName.trim()) {
          errors.adminName = "Full name is required";
        }
        if (!createAccountData.adminEmail.trim()) {
          errors.adminEmail = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(createAccountData.adminEmail)) {
          errors.adminEmail = "Please enter a valid email address";
        }
        if (!createAccountData.adminPassword) {
          errors.adminPassword = "Password is required";
        } else if (createAccountData.adminPassword.length < 6) {
          errors.adminPassword = "Password must be at least 6 characters long";
        }
      }

      if (currentStep === 3) {
        // Card validation
        if (!cardDetails.cardNumber.replace(/\s/g, "")) {
          errors.cardNumber = "Card number is required";
        }
        if (!cardDetails.expiryDate) {
          errors.expiryDate = "Expiry date is required";
        }
        if (!cardDetails.cvv) {
          errors.cvv = "CVV is required";
        }
        if (!cardDetails.cardName.trim()) {
          errors.cardName = "Cardholder name is required";
        }
        if (!cardDetails.billingAddress.trim()) {
          errors.billingAddress = "Billing address is required";
        }
        if (!cardDetails.city.trim()) {
          errors.city = "City is required";
        }
        if (!cardDetails.postalCode.trim()) {
          errors.postalCode = "Postal code is required";
        }
      }
    } else if (currentView === "signin") {
      if (!signInData.email.trim()) {
        errors.email = "Email is required";
      }
      if (!signInData.password) {
        errors.password = "Password is required";
      }
    }

    // Track validation errors for analytics
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      setFormValidationErrors((prev) => [
        ...prev,
        {
          step: currentStep,
          errors: errorKeys,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (value) => {
    setCreateAccountData((prev) => ({ ...prev, adminPassword: value }));
    setPasswordStrength(validatePassword(value));
    if (formErrors.adminPassword) {
      setFormErrors((prev) => ({ ...prev, adminPassword: "" }));
    }
  };

  // Auto-populate company data from location
  const autoPopulateCompanyData = (placeData) => {
    if (!placeData) return;
    console.log(placeData, "placeData");

    // Auto-populate company name if it's empty
    if (!createAccountData.companyName && placeData.display_name) {
      setCreateAccountData((prev) => ({
        ...prev,
        companyName: placeData.display_name,
      }));
    }

    // Auto-populate website if it's empty
    if (!createAccountData.website && placeData.website_uri) {
      setCreateAccountData((prev) => ({
        ...prev,
        website: placeData.website_uri,
      }));
    }

    // Auto-populate phone if it's empty
    if (!createAccountData.adminPhone && placeData.international_phone_number) {
      setCreateAccountData((prev) => ({
        ...prev,
        adminPhone: placeData.international_phone_number,
      }));
    }

    if (!createAccountData.primary_type && placeData.primary_type) {
      setCreateAccountData((prev) => ({
        ...prev,
        primary_type: placeData.primary_type,
      }));
    }
    if (!createAccountData.description && placeData.description) {
      setCreateAccountData((prev) => ({
        ...prev,
        description: placeData.description,
      }));
    }
  };

  // Enhanced Stepper
  const renderStepper = () => (
    <div className={styles.stepper}>
      {[1, 2, 3, 4].map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={`${styles.stepCircle} ${
              currentStep === step
                ? styles.stepActive
                : currentStep > step
                ? styles.stepCompleted
                : styles.stepInactive
            }`}
          >
            {currentStep > step ? <Check size={18} /> : step}
            {currentStep === step && <div className={styles.stepPulse}></div>}
          </div>
          {index < 3 && (
            <div
              className={`${styles.stepConnector} ${
                currentStep > step + 1 ? styles.stepConnectorCompleted : ""
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Step 1: Personal/Admin Account Information
  const renderStep1 = () => (
    <div className={`${styles.stepContainer} ${mounted ? styles.mounted : ""}`}>
      <div className={styles.glassCard}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}>
            <User size={24} />
          </div>
          <h2 className={styles.stepTitle}>Create Your Account</h2>
          <p className={styles.stepSubtitle}>
            Let's start with your personal information
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validateForm()) {
              setCurrentStep(2);
            }
          }}
          className={styles.stepForm}
        >
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                value={createAccountData.adminName}
                onChange={(e) => {
                  setCreateAccountData((prev) => ({
                    ...prev,
                    adminName: e.target.value,
                  }));
                  if (formErrors.adminName) {
                    setFormErrors((prev) => ({ ...prev, adminName: "" }));
                  }
                }}
                className={`${styles.modernInput} ${
                  formErrors.adminName ? styles.inputError : ""
                }`}
                placeholder="Your full name"
                required
              />
              {formErrors.adminName && (
                <span className={styles.fieldError}>
                  {formErrors.adminName}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone (Optional)</label>
              <div className={styles.inputWithIcon}>
                <Phone size={18} className={styles.inputIconLeft} />
                <input
                  type="tel"
                  value={createAccountData.adminPhone}
                  onChange={(e) => {
                    setCreateAccountData((prev) => ({
                      ...prev,
                      adminPhone: e.target.value,
                    }));
                  }}
                  className={`${styles.modernInput} ${styles.inputWithIconPadding}`}
                  placeholder="+353 1 234 5678"
                />
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWithIcon}>
              <Mail size={18} className={styles.inputIconLeft} />
              <input
                type="email"
                value={createAccountData.adminEmail}
                onChange={(e) => {
                  setCreateAccountData((prev) => ({
                    ...prev,
                    adminEmail: e.target.value,
                  }));
                  if (formErrors.adminEmail) {
                    setFormErrors((prev) => ({ ...prev, adminEmail: "" }));
                  }
                }}
                className={`${styles.modernInput} ${
                  styles.inputWithIconPadding
                } ${formErrors.adminEmail ? styles.inputError : ""}`}
                placeholder="you@email.com"
                required
              />
            </div>
            {formErrors.adminEmail && (
              <span className={styles.fieldError}>{formErrors.adminEmail}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWithIcon}>
              <Lock size={18} className={styles.inputIconLeft} />
              <input
                type={showPassword ? "text" : "password"}
                value={createAccountData.adminPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`${styles.modernInput} ${
                  styles.inputWithIconPadding
                } ${styles.inputWithToggle} ${
                  formErrors.adminPassword ? styles.inputError : ""
                }`}
                placeholder="Create password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.adminPassword && (
              <span className={styles.fieldError}>
                {formErrors.adminPassword}
              </span>
            )}
            {createAccountData.adminPassword && !formErrors.adminPassword && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div
                    className={`${styles.strengthFill} ${
                      styles[getPasswordStrengthColor()]
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className={styles.strengthText}>
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.primaryButton}>
              Next Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Step 2: Business Information + Locations
  const renderStep2 = () => (
    <div className={`${styles.stepContainer} ${mounted ? styles.mounted : ""}`}>
      <div className={styles.glassCard}>
        <button
          onClick={() => setCurrentStep(1)}
          className={styles.backButton}
          type="button"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}>
            <Building size={20} />
          </div>
          <h2 className={styles.stepTitle}>Business Setup</h2>
          {/* <p className={styles.stepSubtitle}>
            Tell us about your business and add your locations
          </p> */}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (locations.length > 0) {
              setCurrentStep(3);
            } else {
              setLocationError("Please add at least one location to continue.");
            }
          }}
          className={styles.stepForm}
        >
          {/* Business Information Section */}
          <div className={styles.sectionHeader}>
            <Building size={20} />
            <h3 className={styles.sectionTitle}>Business Information</h3>
            <div className={styles.sectionHelpText}>
              (Will be auto-populated when you add a location)
            </div>
          </div>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Company Name</label>
              <input
                type="text"
                value={createAccountData.companyName}
                onChange={(e) => {
                  setCreateAccountData((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }));
                }}
                disabled={true}
                className={styles.modernInput}
                placeholder="Your company name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Website</label>
              <div className={styles.inputWithIcon}>
                <Globe size={18} className={styles.inputIconLeft} />
                <input
                  type="url"
                  value={createAccountData.website}
                  onChange={(e) =>
                    setCreateAccountData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  disabled={true}
                  className={`${styles.modernInput} ${styles.inputWithIconPadding}`}
                  placeholder="https://your-website.com"
                />
              </div>
            </div>
          </div>

          {/* Locations Section */}
          <div className={styles.sectionHeader}>
            <MapPin size={20} />
            <h3 className={styles.sectionTitle}>Business Locations</h3>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              setShowLocationModal(true);
            }}
            className={`${styles.primaryButton} ${styles.addLocationButton}`}
            type="button"
          >
            <Plus size={18} />
            Add Location
          </button>

          {locations.length === 0 ? (
            <div className={styles.emptyState}>
              <MapPin size={40} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>No locations added yet</p>
              <p className={styles.emptySubtitle}>
                You need at least one location to continue
              </p>
            </div>
          ) : (
            <div className={styles.locationsList}>
              {locations.map((loc, idx) => (
                <div key={idx} className={styles.locationCard}>
                  <div className={styles.locationContent}>
                    <h3 className={styles.locationName}>{loc.name}</h3>
                    <p className={styles.locationAddress}>{loc.address}</p>
                    {/* {loc.website_uri && (
                      <p className={styles.locationWebsite}>
                        Website: {loc.website_uri}
                      </p>
                    )} */}
                  </div>
                  <div className={styles.locationActions}>
                    <button
                      onClick={() => {
                        setShowPOSModal(true);
                        console.log(
                          "🔗 Connecting POS for location:",
                          loc.name
                        );
                      }}
                      className={styles.connectPOSButton}
                      type="button"
                    >
                      <CreditCard size={16} />
                      Connect POS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {locationError && (
            <div className={styles.errorMessage}>{locationError}</div>
          )}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={locations.length === 0}
              className={`${styles.primaryButton} ${
                locations.length === 0 ? styles.disabled : ""
              }`}
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Step 3: Payment Details
  const renderStep3 = () => (
    <div className={`${styles.stepContainer} ${mounted ? styles.mounted : ""}`}>
      <div className={styles.glassCard}>
        <button
          onClick={() => setCurrentStep(2)}
          className={styles.backButton}
          type="button"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}>
            <Shield size={24} />
          </div>
          <h2 className={styles.stepTitle}>Payment Details</h2>
          <p className={styles.stepSubtitle}>
            Enter your card details to complete setup
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validateForm()) {
              setCurrentStep(4);
            }
          }}
          className={styles.stepForm}
        >
          <div className={styles.inputGroup}>
            <label className={styles.label}>Card Number</label>
            <input
              className={`${styles.modernInput} ${
                formErrors.cardNumber ? styles.inputError : ""
              }`}
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              maxLength={19}
              value={cardDetails.cardNumber}
              onChange={(e) => {
                setCardDetails((prev) => ({
                  ...prev,
                  cardNumber: formatCardNumber(e.target.value),
                }));
                if (formErrors.cardNumber) {
                  setFormErrors((prev) => ({ ...prev, cardNumber: "" }));
                }
              }}
              required
            />
            {formErrors.cardNumber && (
              <span className={styles.fieldError}>{formErrors.cardNumber}</span>
            )}
          </div>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Expiry Date</label>
              <input
                className={`${styles.modernInput} ${
                  formErrors.expiryDate ? styles.inputError : ""
                }`}
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                inputMode="numeric"
                maxLength={5}
                value={cardDetails.expiryDate}
                onChange={(e) => {
                  setCardDetails((prev) => ({
                    ...prev,
                    expiryDate: formatExpiry(e.target.value),
                  }));
                  if (formErrors.expiryDate) {
                    setFormErrors((prev) => ({ ...prev, expiryDate: "" }));
                  }
                }}
                required
              />
              {formErrors.expiryDate && (
                <span className={styles.fieldError}>
                  {formErrors.expiryDate}
                </span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>CVV</label>
              <input
                className={`${styles.modernInput} ${
                  formErrors.cvv ? styles.inputError : ""
                }`}
                type="text"
                name="cvv"
                placeholder="123"
                inputMode="numeric"
                maxLength={4}
                minLength={3}
                value={cardDetails.cvv}
                onChange={(e) => {
                  setCardDetails((prev) => ({
                    ...prev,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                  }));
                  if (formErrors.cvv) {
                    setFormErrors((prev) => ({ ...prev, cvv: "" }));
                  }
                }}
                required
              />
              {formErrors.cvv && (
                <span className={styles.fieldError}>{formErrors.cvv}</span>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Cardholder Name</label>
            <input
              type="text"
              value={cardDetails.cardName}
              onChange={(e) => {
                setCardDetails((prev) => ({
                  ...prev,
                  cardName: e.target.value,
                }));
                if (formErrors.cardName) {
                  setFormErrors((prev) => ({ ...prev, cardName: "" }));
                }
              }}
              className={`${styles.modernInput} ${
                formErrors.cardName ? styles.inputError : ""
              }`}
              placeholder="Name on card"
              required
            />
            {formErrors.cardName && (
              <span className={styles.fieldError}>{formErrors.cardName}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Billing Address</label>
            <input
              type="text"
              value={cardDetails.billingAddress}
              onChange={(e) => {
                setCardDetails((prev) => ({
                  ...prev,
                  billingAddress: e.target.value,
                }));
                if (formErrors.billingAddress) {
                  setFormErrors((prev) => ({ ...prev, billingAddress: "" }));
                }
              }}
              className={`${styles.modernInput} ${
                formErrors.billingAddress ? styles.inputError : ""
              }`}
              placeholder="123 Main Street"
              required
            />
            {formErrors.billingAddress && (
              <span className={styles.fieldError}>
                {formErrors.billingAddress}
              </span>
            )}
          </div>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>City</label>
              <input
                type="text"
                value={cardDetails.city}
                onChange={(e) => {
                  setCardDetails((prev) => ({ ...prev, city: e.target.value }));
                  if (formErrors.city) {
                    setFormErrors((prev) => ({ ...prev, city: "" }));
                  }
                }}
                className={`${styles.modernInput} ${
                  formErrors.city ? styles.inputError : ""
                }`}
                placeholder="Dublin"
                required
              />
              {formErrors.city && (
                <span className={styles.fieldError}>{formErrors.city}</span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Postal Code</label>
              <input
                type="text"
                value={cardDetails.postalCode}
                onChange={(e) => {
                  setCardDetails((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }));
                  if (formErrors.postalCode) {
                    setFormErrors((prev) => ({ ...prev, postalCode: "" }));
                  }
                }}
                className={`${styles.modernInput} ${
                  formErrors.postalCode ? styles.inputError : ""
                }`}
                placeholder="D01 A123"
                required
              />
              {formErrors.postalCode && (
                <span className={styles.fieldError}>
                  {formErrors.postalCode}
                </span>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Country</label>
            <select
              value={cardDetails.country}
              onChange={(e) =>
                setCardDetails((prev) => ({ ...prev, country: e.target.value }))
              }
              className={styles.modernSelect}
              required
            >
              <option value="Ireland">Ireland</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
            </select>
          </div>

          <button type="submit" className={styles.primaryButton}>
            Continue to Welcome
          </button>
        </form>
      </div>
    </div>
  );

  // Step 4: Welcome
  const renderStep4 = () => (
    <div className={`${styles.stepContainer} ${mounted ? styles.mounted : ""}`}>
      <div className={styles.welcomeCard}>
        <button
          onClick={() => setCurrentStep(3)}
          className={styles.backButton}
          type="button"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}>
            <CheckCircle size={24} />
          </div>
          <h2 className={styles.stepTitle}>Welcome to Tapid!</h2>
          <p className={styles.stepSubtitle}>
            Thank you for joining our beta platform
          </p>
        </div>

        <div className={styles.welcomeContent}>
          {error && (
            <div className={styles.errorMessage}>
              <X size={16} />
              {error}
            </div>
          )}

          <p className={styles.welcomeText}>
            Tapid is a next-generation platform for businesses to engage
            customers and grow loyalty. We value your feedback and are excited
            to have you on board.
          </p>

          <ul className={styles.welcomeFeatures}>
            <li>We are in beta – your feedback helps shape the product</li>
            <li>Enjoy early adopter benefits if you used a promo code</li>
            <li>Reach out to us any time for support or suggestions</li>
          </ul>

          <div className={styles.termsGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  terms and conditions
                </a>
              </span>
            </label>
          </div>

          <button
            type="button"
            className={styles.secondaryButton || styles.primaryButton}
            onClick={handleDebugPayload}
            style={{ marginBottom: "0.75rem" }}
          >
            Print Payload
          </button>

          <button
            className={`${styles.primaryButton} ${
              !termsAccepted ? styles.disabled : ""
            }`}
            disabled={!termsAccepted}
            onClick={handleCreateAccount}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner} />
                Creating Account...
              </>
            ) : (
              "Get Started"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Enhanced buildEnhancedData function
  const buildEnhancedData = () => {
    const currentTime = new Date().toISOString();
    const completionTime = Date.now();
    const totalDuration = completionTime - sessionStartTime;

    return {
      businessRegistration: {
        companyInfo: {
          businessName: createAccountData.companyName || "My Business",
          website: createAccountData.website || "",
          description: createAccountData.description || "",
          adminPhone: createAccountData.adminPhone || "",
          industry: createAccountData.primary_type || "",
          businessType: "standard",
          primaryOperatingCountry: "Ireland",
        },
        subscription: {
          plan: createAccountData.selectedPlan || "free",
          billingCycle: "monthly",
          paymentMethod: "card",
        },
      },
      userProfile: {
        personalInfo: {
          fullName: createAccountData.adminName,
          email: createAccountData.adminEmail,
          phone: createAccountData.adminPhone || "",
          accountType: "owner",
          preferredTimezone: "Europe/Dublin",
          preferredCurrency: "EUR",
          emailVerified: false,
          phoneVerified: false,
        },
        securityInfo: {
          twoFactorEnabled: false,
          lastPasswordChange: currentTime,
          passwordStrength: passwordStrength,
        },
        preferences: {
          notifications: true,
          marketingEmails: false,
          language: "en",
        },
      },
      paymentInfo: {
        cardDetails: {
          cardName: cardDetails.cardName,
          billingAddress: cardDetails.billingAddress,
          city: cardDetails.city,
          postalCode: cardDetails.postalCode,
          country: cardDetails.country,
        },
        paymentMethodSetup: !!(
          cardDetails.cardNumber &&
          cardDetails.expiryDate &&
          cardDetails.cvv
        ),
        paymentProvider: "stripe",
        setupTimestamp: currentTime,
      },
      packageInfo: {
        packageVersion: "1.0.0",
        dataSource: "onboarding",
        packageType: "standard",
      },
      onboardingAnalytics: {
        sessionInfo: {
          sessionId: sessionStartTime.toString(),
          startTime: new Date(sessionStartTime).toISOString(),
          completionTime: currentTime,
          duration: totalDuration,
        },
        userBehavior: {
          stepsCompleted: currentStep,
          timeSpentPerStep: Object.entries(stepStartTimes).reduce(
            (acc, [step, startTime]) => {
              const nextStepTime =
                stepStartTimes[parseInt(step) + 1] || completionTime;
              acc[step] = nextStepTime - startTime;
              return acc;
            },
            {}
          ),
          formValidationErrors: formValidationErrors,
          selectedLocationsCount: locations.length,
          googlePlacesDataQuality: locations.map((loc) => ({
            locationName: loc.name,
            hasGooglePlaceData: !!loc.googlePlacesData,
            hasPhotos: loc.googlePlacesData?.photos?.length > 0,
            hasRatings: !!loc.googlePlacesData?.rating,
            hasBusinessHours: !!loc.googlePlacesData?.regular_opening_hours,
            hasContactInfo: !!(
              loc.googlePlacesData?.international_phone_number ||
              loc.googlePlacesData?.website_uri
            ),
            businessStatus: loc.googlePlacesData?.business_status,
            placeTypes: loc.googlePlacesData?.types || [],
          })),
          interactions: [
            ...formValidationErrors.map((error) => ({
              type: "validation_error",
              step: error.step,
              errors: error.errors,
              timestamp: error.timestamp,
            })),
            {
              type: "onboarding_completed",
              timestamp: currentTime,
              termsAccepted: termsAccepted,
            },
          ],
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          platform: navigator.platform,
        },
        businessIntelligence: {
          hasWebsite: !!createAccountData.website,
          locationTypes: locations.map(
            (loc) => loc.googlePlacesData?.primary_type || "unknown"
          ),
          totalLocations: locations.length,
          averageLocationRating:
            locations.length > 0
              ? locations.reduce(
                  (sum, loc) => sum + (loc.googlePlacesData?.rating || 0),
                  0
                ) / locations.length
              : 0,
        },
      },
      locations: locations.length
        ? locations.map((location) => ({
            ...location,
            setupTimestamp: currentTime,
            dataEnrichmentLevel: location.googlePlacesData
              ? "comprehensive"
              : "basic",
            enrichedData: location.googlePlacesData || null,
          }))
        : createAccountData.locations || [],
      connectedServices: {
        posTerminals:
          selectedPOSTerminals.length > 0 ? selectedPOSTerminals : [],
        connectedTerminals: Array.from(connectedTerminals),
        integrationSetup: connectedTerminals.size > 0,
      },
      metadata: {
        version: "2.0.0",
        apiVersion: "enhanced",
        createdAt: currentTime,
        source: "web_onboarding",
        completedSteps: currentStep,
        dataQualityScore: calculateDataQualityScore(),
      },
    };
  };

  // Calculate data quality score
  const calculateDataQualityScore = () => {
    let score = 0;
    let maxScore = 0;

    // Personal info completeness
    maxScore += 3;
    if (createAccountData.adminName) score += 1;
    if (createAccountData.adminEmail) score += 1;
    if (createAccountData.adminPassword) score += 1;

    // Business info completeness
    maxScore += 2;
    if (createAccountData.companyName) score += 1;
    if (createAccountData.website) score += 1;

    // Location data quality
    maxScore += 2;
    if (locations.length > 0) score += 1;
    if (locations.some((loc) => loc.googlePlacesData)) score += 1;

    // Payment info
    maxScore += 1;
    if (cardDetails.cardName && cardDetails.billingAddress) score += 1;

    return Math.round((score / maxScore) * 100);
  };

  // Helper functions for password strength
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "strengthWeak";
    if (passwordStrength <= 3) return "strengthFair";
    if (passwordStrength <= 4) return "strengthGood";
    return "strengthStrong";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  // Debug payload handler
  const handleDebugPayload = () => {
    const enhancedData = buildEnhancedData();
    console.log(
      "🖨️ ENHANCED SIGNUP PAYLOAD →",
      JSON.stringify(enhancedData, null, 2)
    );

    console.log("📊 PAYLOAD SUMMARY:");
    console.log(
      `- Business: ${enhancedData.businessRegistration.companyInfo.businessName}`
    );
    console.log(`- Locations: ${enhancedData.locations.length}`);
    console.log(
      `- Data Quality Score: ${enhancedData.metadata.dataQualityScore}%`
    );
    console.log(
      `- Session Duration: ${Math.round(
        enhancedData.onboardingAnalytics.sessionInfo.duration / 1000
      )}s`
    );
  };

  // Sign-in form
  const renderSignInForm = () => (
    <div
      className={`${styles.signInContainer} ${mounted ? styles.mounted : ""}`}
    >
      <div className={styles.signInCard}>
        <div className={styles.signInHeader}>
          <div className={styles.logoIcon}>
            <Shield size={24} />
          </div>
          <h1 className={styles.signInTitle}>Welcome back!</h1>
          <h5 className={styles.signInSubtitle}>
            Sign in to your Tapid account
          </h5>
        </div>

        <form onSubmit={handleSubmit} className={styles.signInForm}>
          {signInError && (
            <div className={styles.errorMessage}>
              <X size={16} />
              {signInError}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email address</label>
            <div className={styles.inputWithIcon}>
              <Mail size={18} className={styles.inputIconLeft} />
              <input
                type="email"
                value={signInData.email}
                onChange={(e) => {
                  setSignInData((prev) => ({ ...prev, email: e.target.value }));
                  if (formErrors.email) {
                    setFormErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                className={`${styles.modernInput} ${
                  styles.inputWithIconPadding
                } ${formErrors.email ? styles.inputError : ""}`}
                placeholder="Enter your email"
                required
              />
            </div>
            {formErrors.email && (
              <span className={styles.fieldError}>{formErrors.email}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWithIcon}>
              <Lock size={18} className={styles.inputIconLeft} />
              <input
                type={showPassword ? "text" : "password"}
                value={signInData.password}
                onChange={(e) => {
                  setSignInData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                  if (formErrors.password) {
                    setFormErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                className={`${styles.modernInput} ${
                  styles.inputWithIconPadding
                } ${styles.inputWithToggle} ${
                  formErrors.password ? styles.inputError : ""
                }`}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password && (
              <span className={styles.fieldError}>{formErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.primaryButton} ${
              isLoading ? styles.loading : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner} />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className={styles.signInFooter}>
          <span className={styles.footerText}>New to Tapid?</span>
          <button
            className={styles.switchViewButton}
            type="button"
            onClick={() => setCurrentView("onboarding")}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );

  // Get visual content based on current step
  const getVisualContent = () => {
    const getChartData = (step) => {
      const stepData = {
        1: [65, 45, 78, 52, 89, 67, 74],
        2: [42, 68, 55, 81, 47, 73, 66],
        3: [88, 76, 92, 84, 95, 87, 91],
        4: [25, 35, 48, 62, 75, 85, 95],
        signin: [58, 72, 45, 89, 67, 83, 71],
      };
      return stepData[step] || stepData[1];
    };

    if (currentView === "signin") {
      return {
        title: "Welcome Back to Tapid",
        description:
          "Access your dashboard to track customer engagement, analyze performance, and grow your business.",
        chartData: getChartData("signin"),
        cards: [
          {
            title: "Total Revenue",
            value: "€12,450",
            change: "+18%",
            trend: "up",
            color: "#3FBAC2",
          },
          {
            title: "Active Users",
            value: "2,847",
            change: "+12%",
            trend: "up",
            color: "#10B981",
          },
        ],
      };
    }

    switch (currentStep) {
      case 1:
        return {
          title: "Create Your Account",
          description:
            "Join thousands of businesses using Tapid to build stronger customer relationships and increase revenue.",
          chartData: getChartData(1),
          cards: [
            {
              title: "Average Revenue Increase",
              value: "32%",
              change: "first year",
              trend: "up",
              color: "#3FBAC2",
            },
            {
              title: "Customer Retention",
              value: "85%",
              change: "vs 65% industry avg",
              trend: "up",
              color: "#10B981",
            },
          ],
        };
      case 2:
        return {
          title: "Setup Your Business",
          description:
            "Tell us about your business and add locations to get personalized insights and recommendations.",
          chartData: getChartData(2),
          cards: [
            {
              title: "Businesses Onboarded",
              value: "2,500+",
              change: "successful setups",
              trend: "neutral",
              color: "#3FBAC2",
            },
            {
              title: "Average Setup Time",
              value: "5 mins",
              change: "quick & easy",
              trend: "up",
              color: "#10B981",
            },
          ],
        };
      case 3:
        return {
          title: "Secure Payment Setup",
          description:
            "Your payment information is encrypted and secure. Start processing transactions instantly.",
          chartData: getChartData(3),
          cards: [
            {
              title: "Transaction Success",
              value: "99.8%",
              change: "uptime",
              trend: "up",
              color: "#3FBAC2",
            },
            {
              title: "Processing Speed",
              value: "<2s",
              change: "average time",
              trend: "up",
              color: "#10B981",
            },
          ],
        };
      case 4:
        return {
          title: "Ready to Launch",
          description:
            "You're all set! Start engaging customers and watch your business grow with personalized rewards.",
          chartData: getChartData(4),
          cards: [
            {
              title: "Ready to Earn",
              value: "€0",
              change: "let's change this!",
              trend: "up",
              color: "#3FBAC2",
            },
            {
              title: "Growth Potential",
              value: "∞",
              change: "unlimited",
              trend: "up",
              color: "#10B981",
            },
          ],
        };
      default:
        return {
          title: "Transform Your Business",
          description:
            "Make better decisions with Tapid's powerful analytics and customer engagement tools.",
          chartData: getChartData(1),
          cards: [
            {
              title: "Revenue Growth",
              value: "25%",
              change: "average increase",
              trend: "up",
              color: "#3FBAC2",
            },
            {
              title: "Customer Satisfaction",
              value: "94%",
              change: "happy customers",
              trend: "up",
              color: "#10B981",
            },
          ],
        };
    }
  };

  const visualContent = getVisualContent();

  // Form submission handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignInError("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn(signInData.email, signInData.password);

      if (result.success) {
        if (result.needsBusinessSetup) {
          console.log(
            "⚠️ User needs business setup. Redirecting to onboarding flow..."
          );
          setCurrentView("onboarding");
          setCurrentStep(1);
          setIsLoading(false);
          return;
        }
        navigate("/dashboard");
      } else {
        setSignInError(formatFirebaseError(result.error));
      }
    } catch (signInError) {
      if (signInError.code === "auth/user-not-found") {
        console.log("👤 User not found, starting onboarding flow");
        setCurrentView("onboarding");
        setCurrentStep(1);
        setIsLoading(false);
        return;
      } else {
        setSignInError(formatFirebaseError(signInError));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setError("");
    setIsLoading(true);

    try {
      const enhancedData = buildEnhancedData();

      const result = await createAccount({
        email: createAccountData.adminEmail,
        password: createAccountData.adminPassword,
        displayName: createAccountData.adminName,
        enhancedData: enhancedData,
      });

      if (result.success) {
        navigate("/dashboard");
      } else {
        console.error("Create account error:", result.error);
        const errorMessage = formatFirebaseError(result.error);
        setError(errorMessage);

        if (result.error?.code === "auth/email-already-in-use") {
          setError(
            `${errorMessage}\n\nYou can:\n• Sign in with your existing password\n• Use a different email address\n• Reset your password if you forgot it`
          );
        }
      }
    } catch (error) {
      console.error("Create account error:", error);
      setError(formatFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // POS modal handlers

  const handleTerminalConnect = (terminalId, status) => {
    if (status === "connected") {
      setConnectedTerminals((prev) => new Set([...prev, terminalId]));
    }
  };

  // Main render with split layout
  return (
    <div className={styles.splitContainer}>
      <div className={styles.leftPanel}>
        {currentView === "onboarding" ? (
          <div className={styles.onboardingColumn}>
            {renderStepper()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            <button
              className={styles.switchViewButton}
              type="button"
              onClick={() => setCurrentView("signin")}
            >
              Already have an account?
            </button>
          </div>
        ) : (
          renderSignInForm()
        )}
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.visualPanel}>
          <div className={styles.visualContent}>
            <div className={styles.dashboardHeader}>
              <div className={styles.dashboardLogo}>
                <div className={styles.logoSquare}>T</div>
                <span>Tapid Dashboard</span>
              </div>
            </div>

            <h2 className={styles.visualTitle}>{visualContent.title}</h2>
            <p className={styles.visualDescription}>
              {visualContent.description}
            </p>

            <div className={styles.dashboardCards}>
              {visualContent.cards.map((card, index) => (
                <div
                  key={index}
                  className={`${styles.dashboardCard} ${styles.animateCard}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{card.title}</span>
                    {card.trend === "up" && (
                      <TrendingUp size={16} className={styles.trendIcon} />
                    )}
                  </div>
                  <div
                    className={styles.cardValue}
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </div>
                  <div className={styles.cardChange}>{card.change}</div>
                  {index === 0 && (
                    <div className={styles.miniChart}>
                      <div className={styles.chartBars}>
                        {visualContent.chartData.map((height, i) => (
                          <div
                            key={i}
                            className={styles.chartBar}
                            style={{
                              height: `${height}%`,
                              backgroundColor: card.color,
                              animationDelay: `${i * 0.1 + 1}s`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Location Modal */}
      {showLocationModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Location</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className={styles.modalClose}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Location Name</label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, name: e.target.value })
                    }
                    className={styles.modernInput}
                    placeholder="e.g. Downtown Cafe"
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Address</label>
                <AddressAutocomplete
                  value={newLocation.address}
                  onChange={(val) =>
                    setNewLocation({ ...newLocation, address: val })
                  }
                  onSelect={(address, placeData) => {
                    setNewLocation({ ...newLocation, address });
                    setSelectedPlaceData(placeData);

                    // Auto-populate company data from location
                    autoPopulateCompanyData(placeData);

                    console.log("🏠 Selected Place Address:", address);
                    console.log("📍 Detailed Place Data:", placeData);
                  }}
                  inputClassName={styles.modernInput}
                  placeholder="123 Main Street, Dublin, Ireland"
                />
              </div>

              <div className={styles.posSection}>
                <div className={styles.sectionHeader}>
                  <CreditCard size={20} />
                  <h3 className={styles.sectionTitle}>Connect POS System</h3>
                  <p className={styles.sectionSubtitle}>
                    Connect your point-of-sale system to automatically sync
                    transactions and customer data for this location
                  </p>
                </div>

                <div className={styles.posOptions}>
                  <div className={styles.posOption}>
                    <div className={styles.posOptionContent}>
                      <h4>Connect POS System</h4>
                      <p>
                        Set up POS integration for this location to sync
                        transactions and customer data
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowPOSModal(true);
                        console.log(
                          "🔗 Connecting POS for new location:",
                          newLocation.name
                        );
                      }}
                      className={styles.posConnectButton}
                      type="button"
                    >
                      <CreditCard size={16} />
                      Connect POS
                    </button>
                  </div>
                </div>
              </div>

              {locationError && (
                <div className={styles.errorMessage}>{locationError}</div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => {
                  if (!newLocation.name || !newLocation.address) {
                    setLocationError(
                      "Please enter a name and address for the location."
                    );
                    return;
                  }

                  const locationDataPackage = {
                    modalFormData: {
                      name: newLocation.name,
                      address: newLocation.address,
                      dateCreated: new Date().toISOString(),
                      createdBy: "user_id_placeholder",
                    },
                    googlePlacesData: selectedPlaceData,
                    timestamp: new Date().toISOString(),
                    source: "location_modal",
                  };

                  console.log("🎯 ===== CREATE LOCATION DATA PACKAGE =====");
                  console.log(
                    "📋 Modal Form Data:",
                    locationDataPackage.modalFormData
                  );
                  console.log(
                    "🌍 Google Places API Data:",
                    locationDataPackage.googlePlacesData
                  );

                  const completeLocationData = {
                    ...locationDataPackage.modalFormData,
                    googlePlacesData: locationDataPackage.googlePlacesData,
                    // Include website URI from Google Places data
                    website_uri: selectedPlaceData?.website_uri,
                  };
                  setLocations((prev) => [...prev, completeLocationData]);

                  setNewLocation({
                    name: "",
                    address: "",
                  });
                  setSelectedPlaceData(null);
                  setShowLocationModal(false);
                  setLocationError("");
                }}
              >
                Create Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Modal */}
      <POSModal
        isOpen={showPOSModal}
        onClose={() => setShowPOSModal(false)}
        selectedTerminals={selectedPOSTerminals}
        setSelectedTerminals={setSelectedPOSTerminals}
        connectedTerminals={connectedTerminals}
        setConnectedTerminals={setConnectedTerminals}
        onTerminalConnect={handleTerminalConnect}
      />
    </div>
  );
};

export default SignInScreen;
