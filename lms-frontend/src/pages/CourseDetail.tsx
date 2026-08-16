import { useState } from "react";
import { Card, Button, Badge, Modal, Icons } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { coursesApi, slidesApi, aiApi, type ApiCourse, type ApiSlide } from "../services/api";
import type { Page } from "../components/Sidebar";
import ReactMarkdown from "react-markdown";

interface CourseDetailProps {
  courseId: string;
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

function instructorName(course: ApiCourse): string {
  if (!course.instructor) return "Instructor";
  if (typeof course.instructor === "string") return course.instructor;
  return course.instructor.name;
}

function instructorInitials(course: ApiCourse): string {
  return instructorName(course).split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const STATUS_COLOR = ["#1C3D6E", "#1A5C3A", "#5C1A1A", "#3D1A6E", "#1A4A5C"];
const STATUS_ACCENT = ["#3B72C4", "#2E8B57", "#B84040", "#7340C4", "#2A7A9B"];

export default function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const id = Number(courseId);
  const { data: course, loading: courseLoading, error: courseError } = useApi(() => coursesApi.show(id), [courseId]);
  const { data: slides, loading: slidesLoading } = useApi(() => slidesApi.byCourse(id), [courseId]);
  const [selectedSlide, setSelectedSlide] = useState<ApiSlide | null>(null);

  // Per-slide summarize state
  const [summarizingId, setSummarizingId] = useState<number | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ slide: ApiSlide; summary: string } | null>(null);
  const [summaryError, setSummaryError] = useState<{ slide: ApiSlide; message: string } | null>(null);

  const color = STATUS_COLOR[id % STATUS_COLOR.length];
  const accentColor = STATUS_ACCENT[id % STATUS_ACCENT.length];

  const doneSlides = (slides ?? []).filter(s => s.status === "done").length;
  const totalSlides = (slides ?? []).length;

  const handleSummarizeSlide = async (slide: ApiSlide, e: React.MouseEvent) => {
    e.stopPropagation();
    setSummarizingId(slide.id);
    setSummaryError(null);
    try {
      const res = await aiApi.summarize({ course_id: id, slide_id: slide.id });
      setSummaryResult({ slide, summary: res.summary });
    } catch (err: unknown) {
      setSummaryError({
        slide,
        message: err instanceof Error ? err.message : "Failed to summarize this slide.",
      });
    } finally {
      setSummarizingId(null);
    }
  };

  if (courseLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-7 sm:px-6 space-y-4">
        <div className="h-5 w-48 bg-[#EEF2F8] rounded animate-pulse" />
        <div className="h-48 bg-[#EEF2F8] rounded-2xl animate-pulse" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-[#EEF2F8] rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-7 sm:px-6">
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <Icons.AlertCircle />
          <span>{courseError ?? "Course not found"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-7 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#5A6A82] mb-5">
        <button onClick={() => onNavigate("courses")} className="hover:text-[#1C3D6E] transition-colors">
          My Courses
        </button>
        <Icons.ChevronRight />
        <span className="text-[#0D1B2E] font-medium truncate max-w-[200px]">{course.Name}</span>
      </div>

      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden text-white"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${accentColor} 100%)` }}
      >
        <div className="relative">
          <h1 className="text-xl font-bold mb-2 leading-snug">{course.Name}</h1>
          <p className="text-sm text-white/80 mb-4 max-w-xl leading-relaxed">
            {course.Description || "No description available."}
          </p>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {instructorInitials(course)}
            </div>
            <span className="text-sm text-white/90">{instructorName(course)}</span>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider">Slides</p>
              <p className="text-2xl font-bold">{totalSlides}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider">Processed</p>
              <p className="text-2xl font-bold">{doneSlides}<span className="text-sm font-normal text-white/60">/{totalSlides}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant="accent"
          icon={<Icons.Sparkle />}
          onClick={() => onNavigate("ai", { courseId, scope: "course" })}
        >
          Ask AI About This Course
        </Button>
      </div>

      {/* Slides */}
      <div>
        <h2 className="text-base font-semibold text-[#0D1B2E] mb-4">
          Course Slides
          {slidesLoading && <span className="ml-2 text-xs font-normal text-[#9BAABF]">Loading…</span>}
        </h2>

        {!slidesLoading && (slides ?? []).length === 0 && (
          <Card>
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2F8] flex items-center justify-center text-[#9BAABF] mb-3">
                <Icons.PDF />
              </div>
              <p className="text-sm font-semibold text-[#0D1B2E]">No slides uploaded yet</p>
              <p className="text-xs text-[#5A6A82] mt-1">The instructor hasn{"'"}t uploaded any slides for this course</p>
            </div>
          </Card>
        )}

        {!slidesLoading && (slides ?? []).length > 0 && (
          <Card padding="none">
            {(slides ?? []).map((slide, i) => (
              <div
                key={slide.id}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#F4F6FA] transition-colors group ${i < (slides ?? []).length - 1 ? "border-b border-[#DEE5F0]" : ""}`}
                onClick={() => {
                  if (slide.status === "done") {
                    onNavigate("lecture", { courseId, lectureId: String(slide.id) });
                  }
                }}
              >
                {/* Status icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  slide.status === "done"
                    ? "bg-green-100 text-green-600"
                    : slide.status === "failed"
                    ? "bg-red-100 text-red-500"
                    : "bg-[#EEF2F8] text-[#9BAABF]"
                }`}>
                  {slide.status === "done" ? <Icons.Check /> : <Icons.PDF />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0D1B2E]">
                    Slide {slide.order ?? i + 1} — {slide.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {slide.duration && (
                      <span className="text-xs text-[#9BAABF] flex items-center gap-1">
                        <Icons.Clock />
                        {slide.duration}
                      </span>
                    )}
                    {slide.page_count && (
                      <span className="text-xs text-[#9BAABF]">{slide.page_count} pages</span>
                    )}
                  </div>
                </div>

                {/* Status badge + AI actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {slide.status === "done" && (
                    <>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-[#1C3D6E] hover:underline disabled:opacity-50"
                        onClick={e => handleSummarizeSlide(slide, e)}
                        disabled={summarizingId === slide.id}
                      >
                        {summarizingId === slide.id ? "Summarizing…" : "Summarize"}
                      </button>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-[#E07B39] hover:underline"
                        onClick={e => {
                          e.stopPropagation();
                          onNavigate("ai", { courseId, lectureId: String(slide.id), scope: "lecture" });
                        }}
                      >
                        Ask AI
                      </button>
                      <Badge variant="success">Ready</Badge>
                    </>
                  )}
                  {slide.status === "processing" && (
                    <Badge variant="info" dot>Processing</Badge>
                  )}
                  {slide.status === "pending" && (
                    <Badge variant="warning" dot>Pending</Badge>
                  )}
                  {slide.status === "failed" && (
                    <Badge variant="error" dot>Failed</Badge>
                  )}
                  {slide.status === "done" && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#5A6A82]">
                      <Icons.ChevronRight />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Summary result modal */}
      <Modal
        open={!!summaryResult}
        onClose={() => setSummaryResult(null)}
        title={summaryResult ? `Summary — ${summaryResult.slide.name}` : "Summary"}
        footer={<Button variant="ghost" onClick={() => setSummaryResult(null)}>Close</Button>}
      >
        {summaryResult && (
          <div className="text-sm text-[#3A4A5E] leading-relaxed max-h-[60vh] overflow-y-auto">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-[#0D1B2E]">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              }}
            >
              {summaryResult.summary}
            </ReactMarkdown>
          </div>
        )}
      </Modal>

      {/* Summary error modal */}
      <Modal
        open={!!summaryError}
        onClose={() => setSummaryError(null)}
        title="Couldn't summarize slide"
        footer={<Button variant="ghost" onClick={() => setSummaryError(null)}>Close</Button>}
      >
        {summaryError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            <Icons.AlertCircle />
            {summaryError.message}
          </div>
        )}
      </Modal>
    </div>
  );
}
