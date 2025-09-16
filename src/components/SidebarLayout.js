import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  Zap,
  Settings,
  Target,
  Shield,
  FileText,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Rocket,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  CreditCard,
  Link2,
} from "lucide-react";
import { useAuth } from "../context/CoreContext";

const SidebarLayout = ({ children, healthStatus }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [launchPadOpen, setLaunchPadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, signOut } = useAuth();

  // Updated navigation items with Settings as collapsible category
  const navigationItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "insights", label: "Insights", icon: BarChart3, path: "/insights" },
    {
      id: "connect",
      label: "Connect",
      icon: Link2,
      path: "/connect",
      disabled: true,
    },
    {
      id: "launch-pad",
      label: "Launch Pad",
      icon: Rocket,
      path: "/control-center",
      // children: [
      //   {
      //     id: "booster",
      //     label: "Booster",
      //     icon: Zap,
      //     path: "/booster",
      //     disabled: true,
      //   },
      // ],
    },
    {
      id: "referral",
      label: "Referral",
      icon: Users,
      path: "/referral",
      disabled: true,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      path: "/reports",
      disabled: true,
    },
    // {
    //   id: "settings",
    //   label: "Settings",
    //   icon: Settings,
    //   path: "/settings",
    //   children: [
    //     {
    //       id: "billing",
    //       label: "Billing",
    //       icon: CreditCard,
    //       path: "/settings/billing",
    //     },
    //   ],
    // },
    // { id: "profile", label: "Profile", icon: UserIcon, path: "/profile" },
  ];

  const handleNavigation = (path) => {
    // Don't navigate to disabled routes
    if (
      path === "/reports" ||
      path === "/referral" ||
      path === "/connect" ||
      path === "/booster"
    ) {
      return; // These pages are disabled
    }
    navigate(path);
    setIsMobileMenuOpen(false);
    // Scroll to top after navigation
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePage = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getCurrentPageInfo = () => {
    // Flatten children for mobile title
    const flat = navigationItems.flatMap((item) => [
      item,
      ...(item.children || []),
    ]);
    const currentItem = flat.find((item) => isActivePage(item.path));
    return currentItem || navigationItems[0];
  };

  // Auto scroll to top when route changes (e.g., via browser back/forward)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar ${isMobileMenuOpen ? "sidebar-mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Home size={24} color="white" />
            </div>
            <span className="logo-text">Tapid</span>
          </div>
          <button className="mobile-close-btn" onClick={toggleMobileMenu}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map((item) => {
              // Handle collapsible items (Launch Pad and Settings)
              if (item.children) {
                const IconComponent = item.icon;
                const isActive =
                  isActivePage(item.path) ||
                  (item.children &&
                    item.children.some((child) => isActivePage(child.path)));
                const isOpen =
                  item.id === "launch-pad" ? launchPadOpen : settingsOpen;
                const setOpen =
                  item.id === "launch-pad" ? setLaunchPadOpen : setSettingsOpen;

                return (
                  <li key={item.id}>
                    <button
                      className={`nav-item ${
                        isActive ? "nav-item-active" : ""
                      }`}
                      onClick={() => handleNavigation(item.path)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <IconComponent size={20} />
                        <span className="nav-label" style={{ marginLeft: 14 }}>
                          {item.label}
                        </span>
                      </span>
                      <span
                        className="chevron-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen((v) => !v);
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={
                          isOpen
                            ? `Collapse ${item.label}`
                            : `Expand ${item.label}`
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpen((v) => !v);
                          }
                        }}
                        style={{
                          marginLeft: 8,
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        {isOpen ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </span>
                    </button>
                    {isOpen && item.children && (
                      <ul className="nav-sub-list">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = isActivePage(child.path);
                          return (
                            <li key={child.id}>
                              <button
                                className={`nav-item nav-item-sub ${
                                  isChildActive ? "nav-item-active" : ""
                                } ${child.disabled ? "disabled" : ""}`}
                                onClick={() => handleNavigation(child.path)}
                              >
                                <ChildIcon size={22} />
                                <span
                                  className="nav-label"
                                  style={{ marginLeft: 1, marginRight: 18 }}
                                >
                                  {child.label}
                                </span>
                                {child.id === "booster" && (
                                  <span className="soon-pill">SOON</span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              // Handle regular navigation items
              const IconComponent = item.icon;
              const isActive = isActivePage(item.path);
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${isActive ? "nav-item-active" : ""} ${
                      item.disabled ? "disabled" : ""
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <IconComponent size={20} />
                    <span className="nav-label">{item.label}</span>
                    {item.id === "connect" && (
                      <span className="soon-pill">SOON</span>
                    )}
                    {item.id === "referral" && (
                      <span className="soon-pill">SOON</span>
                    )}
                    {item.id === "reports" && (
                      <span className="soon-pill">SOON</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Health Status Display */}
        {healthStatus && (
          <div className="health-status">
            <div className={`status-indicator status-${healthStatus.status}`}>
              <span className="status-dot"></span>
              {healthStatus.message}
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          {/* <div className="user-info">
            <div className="user-avatar">
              {user && user.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <UserIcon size={18} />
              )}
            </div>
            <div className="user-details">
              <p className="user-name">{user && user.name ? user.name : ""}</p>
              <p className="user-email">
                {user && user.email ? user.email : ""}
              </p>
            </div>
          </div> */}

          <button
            className={`nav-item profile-btn ${
              location.pathname === "/profile" ? "nav-item-active" : ""
            }`}
            onClick={() => navigate("/profile")}
            style={{
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <UserIcon size={16} />
            <span style={{ marginLeft: "6px" }}>Profile</span>
          </button>

          <button className="signout-btn" onClick={signOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}

      {/* Main content area */}
      <div className="main-content">
        {/* Top bar for mobile */}
        <header className="mobile-header">
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <Menu size={24} />
          </button>
          <h1 className="mobile-title">{getCurrentPageInfo().label}</h1>
          <div className="mobile-user">
            <div className="mobile-avatar">
              {user && user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default SidebarLayout;
