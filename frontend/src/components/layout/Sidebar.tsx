import React, { useState } from "react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface MenuItem {
  to?: string;
  label: string;
  children?: MenuItem[];
}



const links: MenuItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/trainings", label: "Trainings" },
  { to: "/assignments", label: "Assignments" },

  {
    label: "Reports",
    children: [
      { to: "/reports/individual", label: "Individual Report" },
      { to: "/reports/assigner", label: "Assigner Report" },
      { to: "/reports/dmt", label: "DMT Report" },
      { to: "/reports/export", label: "Export Report" },
    ],
  },

  {
    label: "Master Data",
    children: [
      { to: "/master/users", label: "Users" },
      { to: "/master/positions", label: "Positions" },
      { to: "/master/ksa", label: "KSA" },
      { to: "/master/dmt", label: "DMT" },
      { to: "/master/categories", label: "Categories" },
      { to: "/master/venues", label: "Venues" },
      { to: "/master/trainers", label: "Trainers" },
    ],
  },
  { to: "/suggestions", label: "Suggestions" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <h2 className="text-lg font-semibold text-primary-600">Navigation</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="px-4 py-6 space-y-2">
        {links.map((link) => {
          const hasChildren = link.children && link.children.length > 0;

          // Parent items WITH submenu
          if (hasChildren) {
            return (
              <div key={link.label}>
                <button
                  className="flex justify-between items-center w-full px-3 py-2 text-left rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => toggleMenu(link.label)}
                >
                  <span>{link.label}</span>
                  <span>{openMenus[link.label] ? "▲" : "▼"}</span>
                </button>

                {/* Child Menu */}
                {openMenus[link.label] && (
                  <div className="pl-6 mt-2 space-y-1">
                    {link.children!.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to!}
                        className={({ isActive }) =>
                          `block px-3 py-1 rounded-md text-sm ${isActive
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50"
                          }`
                        }
                        onClick={onClose}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Normal non-nested items
          return (
            <NavLink
              key={link.to}
              to={link.to!}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
                }`
              }
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
