import { Card, Button, StatCard, SectionHeader, Icons } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { coursesApi, type ApiCourse } from "../services/api";
import type { Page } from "../components/Sidebar";

interface DashboardProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

const PALETTE = ["#1C3D6E", "#1A5C3A", "#5C1A1A", "#3D1A6E", "#1A4A5C"];
const ACCENT = ["#3B72C4", "#2E8B57", "#B84040", "#7340C4", "#2A7A9B"];

function courseColor(index: number) {
  return { color: PALETTE[index % PALETTE.length], accentColor: ACCENT[index % ACCENT.length] };
}

function instructorName(course: ApiCourse): string {
  if (!course.instructor) return "Unknown Instructor";
  if (typeof course.instructor === "string") return course.instructor;
  return course.instructor.name;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { data: courses, loading, error } = useApi(() => coursesApi.list(), []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-5xl mx-auto px-4 py-7 sm:px-6">
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-sm text-[#5A6A82] font-medium mb-1">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-[#0D1B2E]">Welcome back, {firstName}</h1>
        <p className="text-sm text-[#5A6A82] mt-1">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <StatCard label="Enrolled Courses" value={loading ? "—" : courses?.length ?? 0} sub="This semester" icon={<Icons.Courses />} />
        <StatCard label="Completed Slides" value="38" sub="Across all courses" icon={<Icons.Check />} />
        <StatCard label="Avg. Progress" value="40%" sub="Across all courses" icon={<Icons.BookOpen />} />
      </div>

      {/* AI Quick Action */}
      <div
        className="relative mb-8 rounded-xl overflow-hidden cursor-pointer"
        onClick={() => onNavigate("ai")}
        style={{ background: "linear-gradient(135deg, #1C3D6E 0%, #2952A3 100%)" }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10"
          style={{ background: "radial-gradient(circle at right center, #E07B39 0%, transparent 70%)" }} />
        <div className="relative px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Icons.Sparkle />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">AI Assistant</p>
            <p className="text-xs text-white/70 mt-0.5">Ask about your courses, get summaries, or explore concepts</p>
          </div>
          <Button variant="accent" size="sm" className="flex-shrink-0" onClick={e => { e.stopPropagation(); onNavigate("ai"); }}>
            Open
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <SectionHeader
              title="My Courses"
              action={
                <button onClick={() => onNavigate("courses")} className="text-xs font-medium text-[#1C3D6E] hover:text-[#162f55] transition-colors">
                  All courses →
                </button>
              }
            />

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-xl bg-white border border-[#DEE5F0] animate-pulse" />
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <Icons.AlertCircle />
                <span>Failed to load courses: {error}</span>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-3">
                {(courses ?? []).slice(0, 4).map((course, i) => {
                  const { color, accentColor } = courseColor(i);
                  return (
                    <Card
                      key={course.id}
                      hoverable
                      padding="sm"
                      onClick={() => onNavigate("course-detail", { courseId: String(course.id) })}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-lg font-bold"
                          style={{ background: `linear-gradient(135deg, ${color}, ${accentColor})` }}
                        >
                          {course.Name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0D1B2E] truncate">{course.Name}</p>
                          <p className="text-xs text-[#5A6A82] mt-0.5">{instructorName(course)}</p>
                          {course.slides_count !== undefined && (
                            <p className="text-xs text-[#9BAABF] mt-0.5">{course.slides_count} slides</p>
                          )}
                        </div>
                        <Icons.ChevronRight />
                      </div>
                    </Card>
                  );
                })}

                {courses?.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#EEF2F8] flex items-center justify-center text-[#9BAABF] mb-3">
                      <Icons.Courses />
                    </div>
                    <p className="text-sm font-semibold text-[#0D1B2E]">No courses yet</p>
                    <p className="text-xs text-[#5A6A82] mt-1">Your enrolled courses will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar intentionally left empty for live database-only data */}
        <div />
      </div>
    </div>
  );
}
