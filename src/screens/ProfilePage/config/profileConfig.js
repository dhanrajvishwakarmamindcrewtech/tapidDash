import { Building, MapPin, CreditCard } from "lucide-react";

export const PROFILE_TABS = [
  {
    key: "profile",
    label: "Profile",
    icon: Building,
  },
  {
    key: "locations",
    label: "Locations",
    icon: MapPin,
  },
  {
    key: "billing",
    label: "Billing",
    icon: CreditCard,
  },
];

export const INDUSTRY_OPTIONS = [
  { value: "", label: "Select Industry" },
  { value: "coffeeshop", label: "Coffee Shop" },
  { value: "restaurant", label: "Restaurant" },
  { value: "retail", label: "Retail" },
  { value: "services", label: "Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Other" },
];

export const FORM_VALIDATION = {
  businessName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  website: {
    required: false,
    pattern: /^https?:\/\/.+/,
  },
  phone: {
    required: false,
    pattern: /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/,
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  description: {
    required: false,
    maxLength: 500,
  },
};
