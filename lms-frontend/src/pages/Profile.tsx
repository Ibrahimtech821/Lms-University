import { Card, Badge, Avatar, Icons, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { coursesApi } from "../services/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: courses } = useApi(() => coursesApi.list(), []);
  const role = user?.role?.toLowerCase();

  const initials = user?.name
    ?.split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  return (
    <div className="max-w-3xl mx-auto px-4 py-7 sm:px-6">
      <h1 className="text-2xl font-bold text-[#0D1B2E] mb-6">Profile</h1>

      {/* Profile Card */}
      <Card className="mb-5">
        <div className="flex items-start gap-5">
          <Avatar initials={initials} size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0D1B2E]">{user?.name}</h2>
                <p className="text-sm text-[#5A6A82]">{user?.email}</p>
              </div>
              <Badge variant={role === "admin" ? "error" : "info"}>
                {role === "admin" ? "Admin" : "Student"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <p className="text-xs text-[#9BAABF] uppercase tracking-wider">User ID</p>
                <p className="text-sm font-medium text-[#0D1B2E] mt-0.5">#{user?.id}</p>
              </div>
              <div>
                <p className="text-xs text-[#9BAABF] uppercase tracking-wider">Enrolled Courses</p>
                <p className="text-sm font-medium text-[#0D1B2E] mt-0.5">{courses?.length ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enrolled Courses */}
      {courses && courses.length > 0 && (
        <Card className="mb-5">
          <h3 className="text-sm font-semibold text-[#0D1B2E] mb-4">Enrolled Courses</h3>
          <div className="space-y-3">
            {courses.map(course => (
              <div key={course.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1C3D6E] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {course.Name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0D1B2E] truncate">{course.Name}</p>
                  {course.slides_count !== undefined && (
                    <p className="text-xs text-[#9BAABF]">{course.slides_count} slides</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Logout */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#0D1B2E]">Sign out</p>
            <p className="text-xs text-[#5A6A82] mt-0.5">You{"'"}ll need to log in again to access your courses</p>
          </div>
          <Button variant="danger" size="sm" onClick={logout} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          }>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
