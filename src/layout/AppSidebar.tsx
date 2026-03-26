"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  ChatIcon,
  ChevronDownIcon,
  FileIcon,
  GridIcon,
  HorizontaLDots,
  TaskIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type SubNavItem =
  | { name: string; path: string; pro?: boolean; new?: boolean }
  | { name: string; logout: true };

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubNavItem[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <FileIcon />,
    name: "Resume screening",
    subItems: [
      { name: "Job openings", path: "/resume-screening/job-openings", pro: false },
    ],
  },
  {
    icon: <ChatIcon />,
    name: "AI interview",
    subItems: [
      { name: "Dashboard", path: "/ai-interview/dashboard", pro: false },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Assessment",
    subItems: [
      { name: "Dashboard", path: "/assessment/dashboard", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Account",
    subItems: [
      { name: "Profile", path: "/account/profile", pro: false },
      { name: "Team", path: "/account/team", pro: false },
      { name: "Careers page", path: "/account/careers", pro: false },
      { name: "Template", path: "/account/template", pro: false },
      { name: "Credit usage", path: "/account/credit-usage", pro: false },
      { name: "Reclaim credits", path: "/account/reclaim-credits", pro: false },
      { name: "Logout", logout: true },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { logout } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return pathname === "/";
      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname]
  );

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              type="button"
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group  ${
                openSubmenu?.type === "main" && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === "main" &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    {"logout" in subItem && subItem.logout ? (
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="menu-dropdown-item menu-dropdown-item-inactive w-full text-left"
                      >
                        {subItem.name}
                      </button>
                    ) : (
                      <Link
                        href={"path" in subItem ? subItem.path : "#"}
                        className={`menu-dropdown-item ${
                          "path" in subItem && isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {"new" in subItem && subItem.new && (
                            <span
                              className={`ml-auto ${
                                "path" in subItem && isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              new
                            </span>
                          )}
                          {"pro" in subItem && subItem.pro && (
                            <span
                              className={`ml-auto ${
                                "path" in subItem && isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if ("path" in subItem && isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === "main" &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: "main", index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link
          href="/"
          className={
            isExpanded || isHovered || isMobileOpen
              ? "flex flex-col gap-2 items-start"
              : "flex flex-col items-center gap-1"
          }
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex gap-3 items-center">
              <Image
                className="dark:hidden shrink-0"
                src="/images/logo/logo.svg"
                alt="ETIP"
                width={40}
                height={40}
              />
              <Image
                className="hidden dark:block shrink-0"
                src="/images/logo/logo.svg"
                alt="ETIP"
                width={40}
                height={40}
              />
              <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                eTIP
              </p>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <Image
                src="/images/logo/logo.svg"
                alt="ETIP"
                width={32}
                height={32}
              />
              {/* <p className="text-[10px] font-bold leading-tight text-center text-gray-700 dark:text-gray-300">
                ETIP
              </p> */}
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
