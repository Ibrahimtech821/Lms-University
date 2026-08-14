import { useState } from "react";
import { Card, Button, Badge, Input, Icons } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { coursesApi, type ApiCourse } from "../services/api";
import type { Page } from "../components/Sidebar";

interface CoursesProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

const PALETTE = ["#1C3D6E", "#1A5C3A", "#5C1A1A", "#3D1A6E", "#1A4A5C"];
const ACCENT  = ["#3B72C4", "#2E8B57", "#B84040", "#7340C4", "#2A7A9B"];
const THUMBS  = [
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop&auto=format",
];

function instructorName(course: ApiCourse): string {
  if (!course.instructor) return "Instructor";
  if (typeof course.instructor === "string") return course.instructor;
  return course.instructor.name;
}

export default function Courses({ onNavigate }: CoursesProps) {
  const [query, setQuery] = useState("");
  const { data: courses, loading, error } = useApi(() => coursesApi.list(), []);

  const filtered = (courses ?? []).filter(c =>
    c.Name.toLowerCase().includes(query.toLowerCase()) ||
    instructorName(c).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-7 sm:px-6">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[#0D1B2E]">My Courses</h1>
        <p className="text-sm text-[#5A6A82] mt-1">
          {loading ? "Loading…" : `${courses?.length ?? 0} enrolled courses`}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search courses or instructors…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          icon={<Icons.Search />}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-6">
          <Icons.AlertCircle />
          <span>Failed to load courses: {error}</span>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[#DEE5F0] overflow-hidden animate-pulse">
              <div className="h-36 bg-[#EEF2F8]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[#EEF2F8] rounded w-3/4" />
                <div className="h-3 bg-[#EEF2F8] rounded w-1/2" />
                <div className="h-3 bg-[#EEF2F8] rounded w-full" />
                <div className="h-8 bg-[#EEF2F8] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-xl bg-[#EEF2F8] flex items-center justify-center text-[#9BAABF] mb-4">
            <Icons.Search />
          </div>
          <p className="text-base font-semibold text-[#0D1B2E]">
            {query ? "No courses found" : "No enrolled courses"}
          </p>
          <p className="text-sm text-[#5A6A82] mt-1">
            {query ? "Try a different search term" : "Your courses will appear here once enrolled"}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course, i) => {
            const color = PALETTE[i % PALETTE.length];
            const accentColor = ACCENT[i % ACCENT.length];
            const thumb = THUMBS[i % THUMBS.length];

            return (
              <Card key={course.id} hoverable padding="none" onClick={() => onNavigate("course-detail", { courseId: String(course.id) })}>
                {/* Thumbnail */}
                <div
                  className="h-36 rounded-t-xl relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${color} 0%, ${accentColor} 100%)` }}
                >
                  <img src={thumb} alt={course.Name} className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity" />
                  <div className="absolute inset-0 flex items-end p-4">
                    <Badge variant="neutral" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      Computer Science
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-[#0D1B2E] leading-snug mb-1 line-clamp-2">
                    {course.Name}
                  </h3>
                  <p className="text-xs text-[#5A6A82] mb-1">{instructorName(course)}</p>
                  <p className="text-xs text-[#9BAABF] leading-relaxed line-clamp-2 mb-3">
                    {course.Description || "No description available."}
                  </p>

                  {course.slides_count !== undefined && (
                    <div className="flex items-center gap-1 mb-3 text-xs text-[#5A6A82]">
                      <Icons.PDF />
                      <span>{course.slides_count} slides</span>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={e => { e.stopPropagation(); onNavigate("course-detail", { courseId: String(course.id) }); }}
                  >
                    Open Course
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
