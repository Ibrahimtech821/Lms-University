import { useEffect, useState } from "react";

import { useAuth } from "./context/AuthContext";

import {
  Sidebar,
  type Page,
} from "./components/Sidebar";

import { Icons } from "./components/ui";

/* Student pages */
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LectureViewer from "./pages/LectureViewer";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";

/* Admin pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminLectures from "./pages/admin/AdminLectures";
import AdminUsers from "./pages/admin/AdminUsers";

/* Auth pages */
import Login from "./pages/auth/Login";
import RegisterStudent from "./pages/auth/RegisterStudent";

interface NavState {
  page: Page;
  courseId?: string;
  lectureId?: string;
  scope?: string;
}

/*
 * Pages that only admins are allowed to access.
 */
const adminPages: Page[] = [
  "admin",
  "admin-courses",
  "admin-lectures",
  "admin-users",
];

function isAdminOnlyPage(
  page: Page
): boolean {
  return adminPages.includes(page);
}

/*
 * ---------------------------------------------------------
 * Loading screen
 * ---------------------------------------------------------
 */

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">

        <div className="w-10 h-10 rounded-xl bg-[#E07B39] flex items-center justify-center text-white">
          <Icons.GraduationCap />
        </div>

        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[#1C3D6E]/30"
              style={{
                animation:
                  `bounce 1s ease-in-out ${
                    i * 0.15
                  }s infinite`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }

            40% {
              transform: translateY(-6px);
              opacity: 1;
            }
          }
        `}</style>

      </div>
    </div>
  );
}

/*
 * ---------------------------------------------------------
 * APP
 * ---------------------------------------------------------
 */

export default function App() {
  const {
    user,
    loading,
    isAdmin,
    logout,
  } = useAuth();

  /*
   * Navigation always has a valid page.
   *
   * This is important.
   *
   * DON'T initialize this with null.
   */
  const [nav, setNav] =
    useState<NavState>({
      page: "dashboard",
    });

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /*
   * Login / Register page
   */
  const [authPage, setAuthPage] =
    useState<"login" | "register">(
      "login"
    );

  /*
   * ---------------------------------------------------------
   * Set correct dashboard after authentication
   * ---------------------------------------------------------
   *
   * Admin:
   *
   *     Admin Dashboard
   *
   * Student:
   *
   *     Student Dashboard
   */

  useEffect(() => {
    if (!user) {
      return;
    }

    if (isAdmin) {
      setNav({
        page: "admin",
      });
    } else {
      setNav({
        page: "dashboard",
      });
    }
  }, [user?.id, isAdmin]);

  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
   * ---------------------------------------------------------
   * NOT LOGGED IN
   * ---------------------------------------------------------
   */

  if (!user) {
    if (authPage === "login") {
      return (
        <Login
          onRegister={() =>
            setAuthPage("register")
          }
        />
      );
    }

    return (
      <RegisterStudent
        onLogin={() =>
          setAuthPage("login")
        }
      />
    );
  }

  /*
   * ---------------------------------------------------------
   * AUTHENTICATED
   * ---------------------------------------------------------
   */

  /*
   * What should happen if somebody somehow tries
   * to access an admin page as a student?
   */
  const fallbackPage: Page =
    isAdmin
      ? "admin"
      : "dashboard";

  /*
   * Make sure nav always exists.
   */
  const requestedPage =
    nav?.page ?? fallbackPage;

  /*
   * Students cannot access admin pages.
   */
  const activePage: Page =
    !isAdmin &&
    isAdminOnlyPage(requestedPage)
      ? "dashboard"
      : requestedPage;

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  const navigate = (
    page: Page,
    extra?: Record<string, string>
  ) => {
    /*
     * Prevent students from entering admin pages.
     */
    if (
      !isAdmin &&
      isAdminOnlyPage(page)
    ) {
      setNav({
        page: "dashboard",
      });

      setSidebarOpen(false);

      return;
    }

    setNav({
      page,
      ...extra,
    });

    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ---------------------------------------------------------
   * Full-height pages
   * ---------------------------------------------------------
   */

  const fullHeight =
    activePage === "lecture" ||
    activePage === "ai";

  /*
   * ---------------------------------------------------------
   * MAIN UI
   * ---------------------------------------------------------
   */

  return (
    <div className="flex min-h-screen bg-[#F4F6FA]">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        isAdmin={isAdmin}
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        user={user}
      />

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">

        {/* ================================================= */}
        {/* MOBILE HEADER */}
        {/* ================================================= */}

        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-[#DEE5F0] px-4 h-14 flex-shrink-0 sticky top-0 z-20">

          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            className="w-8 h-8 rounded-lg hover:bg-[#EEF2F8] flex items-center justify-center text-[#5A6A82] transition-colors"
          >
            <Icons.Menu />
          </button>

          <div className="flex items-center gap-2">

            <div className="w-6 h-6 rounded bg-[#E07B39] flex items-center justify-center text-white">
              <Icons.GraduationCap />
            </div>

            <span
              className="text-sm font-bold text-[#0D1B2E]"
              style={{
                fontFamily:
                  "Instrument Sans, sans-serif",
              }}
            >
              AI University LMS
            </span>

          </div>

          <div className="ml-auto flex items-center gap-2">

            {isAdmin && (
              <span className="text-xs font-medium text-[#E07B39] bg-[#E07B39]/10 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}

            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-[#9BAABF] hover:text-red-500 transition-colors"
              title="Log out"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />

                <polyline points="16 17 21 12 16 7" />

                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                />
              </svg>
            </button>

          </div>

        </header>

        {/* ================================================= */}
        {/* MAIN */}
        {/* ================================================= */}

        <main
          className={`flex-1 ${
            fullHeight
              ? "overflow-hidden flex flex-col"
              : "overflow-y-auto"
          }`}
        >

          {/* ================================================= */}
          {/* STUDENT PAGES */}
          {/* ================================================= */}

          {activePage === "dashboard" && (
            <Dashboard
              onNavigate={navigate}
            />
          )}

          {activePage === "courses" && (
            <Courses
              onNavigate={navigate}
            />
          )}

          {activePage === "course-detail" && (
            <CourseDetail
              courseId={
                nav.courseId ?? ""
              }
              onNavigate={navigate}
            />
          )}

          {activePage === "lecture" && (
            <LectureViewer
              courseId={
                nav.courseId ?? ""
              }
              lectureId={
                nav.lectureId ?? ""
              }
              onNavigate={navigate}
            />
          )}

          {activePage === "ai" && (
            <AIAssistant
              initialCourseId={
                nav.courseId
              }
              initialLectureId={
                nav.lectureId
              }
              initialScope={
                nav.scope
              }
            />
          )}

          {activePage === "profile" && (
            <Profile />
          )}

          {/* ================================================= */}
          {/* ADMIN PAGES */}
          {/* ================================================= */}

          {isAdmin &&
            activePage === "admin" && (
              <AdminDashboard
                onNavigate={navigate}
              />
            )}

          {isAdmin &&
            activePage ===
              "admin-courses" && (
              <AdminCourses />
            )}

          {isAdmin &&
            activePage ===
              "admin-lectures" && (
              <AdminLectures />
            )}

          {isAdmin &&
            activePage ===
              "admin-users" && (
              <AdminUsers />
            )}

        </main>
      </div>
    </div>
  );
}