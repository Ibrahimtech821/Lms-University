import { StatCard, Card, Badge, Icons } from "../../components/ui";
import { useApi } from "../../hooks/useApi";
import { coursesApi, slidesApi } from "../../services/api";
import type { Page } from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
}

const statusConfig = {
  done:       { label: "Done",       variant: "success" as const },
  processing: { label: "Processing", variant: "info"    as const },
  pending:    { label: "Pending",    variant: "warning"  as const },
  failed:     { label: "Failed",     variant: "error"   as const },
};

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { data: courses, loading: cLoading } = useApi(() => coursesApi.list(), []);
  const { data: slides,  loading: sLoading } = useApi(() => slidesApi.list(), []);

  const processing = (slides ?? []).filter(s => s.status === "processing").length;
  const failed     = (slides ?? []).filter(s => s.status === "failed").length;
  const done       = (slides ?? []).filter(s => s.status === "done").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-7 sm:px-6">
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <Icons.Admin />
          <span className="text-xs font-medium text-[#E07B39] uppercase tracking-wider">Admin</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0D1B2E]">Admin Dashboard</h1>
        <p className="text-sm text-[#5A6A82] mt-1">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
        <StatCard label="Courses"          value={cLoading ? "—" : courses?.length ?? 0} sub="Total" icon={<Icons.Courses />} />
        <StatCard label="Slides Uploaded"  value={sLoading ? "—" : slides?.length ?? 0}  sub={`${done} processed`} icon={<Icons.PDF />} />
        <StatCard label="AI Ready"         value={sLoading ? "—" : done}                 sub="Slides ready for AI" icon={<Icons.Sparkle />} />
      </div>

      {/* Processing alerts */}
      {(processing > 0 || failed > 0) && (
        <div className="mb-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {processing > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Icons.RefreshCw />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">{processing} slide{processing > 1 ? "s" : ""} processing</p>
                <p className="text-xs text-blue-600">AI is analyzing the content</p>
              </div>
            </div>
          )}
          {failed > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <Icons.AlertCircle />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900">{failed} slide{failed > 1 ? "s" : ""} failed</p>
                <p className="text-xs text-red-600">Re-upload needed</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#0D1B2E]">Courses</h2>
            <button onClick={() => onNavigate("admin-courses")} className="text-xs font-medium text-[#1C3D6E] hover:underline">
              Manage →
            </button>
          </div>
          <Card padding="none">
            {cLoading && [1,2,3].map(i => (
              <div key={i} className="h-14 border-b border-[#DEE5F0] animate-pulse bg-[#F8FAFB]" />
            ))}
            {!cLoading && (courses ?? []).length === 0 && (
              <div className="py-8 text-center text-sm text-[#9BAABF]">No courses yet</div>
            )}
            {(courses ?? []).map((c, i, arr) => (
              <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? "border-b border-[#DEE5F0]" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-[#1C3D6E] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {c.Name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0D1B2E] truncate">{c.Name}</p>
                  <p className="text-xs text-[#9BAABF]">{c.slides_count ?? 0} slides</p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Recent slides */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#0D1B2E]">Recent Slides</h2>
            <button onClick={() => onNavigate("admin-lectures")} className="text-xs font-medium text-[#1C3D6E] hover:underline">
              Manage →
            </button>
          </div>
          <Card padding="none">
            {sLoading && [1,2,3].map(i => (
              <div key={i} className="h-14 border-b border-[#DEE5F0] animate-pulse bg-[#F8FAFB]" />
            ))}
            {!sLoading && (slides ?? []).length === 0 && (
              <div className="py-8 text-center text-sm text-[#9BAABF]">No slides uploaded yet</div>
            )}
            {(slides ?? []).slice(0, 6).map((slide, i, arr) => {
              const cfg = statusConfig[slide.status];

              return (
                <div
                  key={slide.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < arr.length - 1 ? "border-b border-[#DEE5F0]" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded bg-[#EEF2F8] flex items-center justify-center text-[#1C3D6E] flex-shrink-0">
                    <Icons.PDF />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0D1B2E] truncate">
                      {slide.name}
                    </p>

                    <p className="text-xs text-[#9BAABF]">
                      Course #{slide.course_id}
                    </p>
                  </div>

                  <Badge variant={cfg.variant} dot>
                    {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0D1B2E]">User Management</p>
            <p className="text-xs text-[#5A6A82] mt-1">Create admin accounts and review all users.</p>
          </div>
          <button onClick={() => onNavigate("admin-users")} className="text-xs font-medium text-[#1C3D6E] hover:underline">
            Open Users →
          </button>
        </Card>
      </div>
    </div>
  );
}
