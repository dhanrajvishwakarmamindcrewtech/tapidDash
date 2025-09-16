import { useState } from "react";

export const useTabManager = (initialTab = "profile") => {
  const [currentTab, setCurrentTab] = useState(initialTab);

  return {
    currentTab,
    setCurrentTab,
  };
};
