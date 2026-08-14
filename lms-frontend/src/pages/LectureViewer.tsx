import { useState } from "react";
import { Button, Badge, Modal, Icons } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { slidesApi, coursesApi, aiApi, type ApiSlide } from "../services/api";
import type { Page } from "../components/Sidebar";

interface LectureViewerProps {
  courseId: string;
  lectureId: string;
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

interface AiSummary {
  summary: string;
  concepts?: string[];
  key_points?: string[];
  definitions?: Array<{ term: string; definition: string }>;
}

export default function LectureViewer({ courseId, lectureId, onNavigate }: LectureViewerProps) {
  const cId = Number(courseId);
  const lId = Number(lectureId);

  const { data: course } = useApi(() => coursesApi.show(cId), [courseId]);
  const { data: allSlides } = useApi(() => slidesApi.byCourse(cId), [courseId]);
  const { data: slide, loading, error } = useApi(() => slidesApi.show(lId), [lectureId]);

  const [completed, setCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<AiSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [copied, setCopied] = useState(false);

  // Navigation between slides
  const sortedSlides = (allSlides ?? []).sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
  const currentIndex = sortedSlides.findIndex(s => s.id === lId);
  const prevSlide = currentIndex > 0 ? sortedSlides[currentIndex - 1] : null;
  const nextSlide = currentIndex < sortedSlides.length - 1 ? sortedSlides[currentIndex + 1] : null;

  const handleSummarize = async () => {
    setShowSummary(true);
    if (summaryData) return; // already fetched
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const res = await aiApi.summarize({ slide_id: lId });
      setSummaryData({
        summary: res.summary,
        concepts: res.concepts,
        key_points: res.key_points,
        definitions: res.definitions,
      });
    } catch (e: unknown) {
      setSummaryError(e instanceof Error ? e.message : "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const text = [
      summaryData.summary,
      summaryData.key_points?.length ? `\nKey Points:\n${summaryData.key_points.map(p => `• ${p}`).join("\n")}` : "",
    ].join("");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-[#9BAABF]">
        <div className="w-10 h-10 rounded-xl bg-[#EEF2F8] animate-pulse" />
        <p className="text-sm">Loading slide…</p>
      </div>
    );
  }

  if (error || !slide) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <Icons.AlertCircle />
        <p className="text-sm text-red-600">{error ?? "Slide not found"}</p>
        <Button variant="secondary" size="sm" onClick={() => onNavigate("course-detail", { courseId })}>
          Back to course
        </Button>
      </div>
    );
  }

  // Build a PDF viewer URL from file_path if available
  const pdfUrl = slide.storage_path
  ? (
      slide.storage_path.startsWith("http")
        ? slide.storage_path
        : `${import.meta.env.VITE_STORAGE_URL || ""}/${slide.storage_path}`
    )
  : null;

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-[#DEE5F0] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => onNavigate("course-detail", { courseId })}
          className="flex items-center gap-1.5 text-sm text-[#5A6A82] hover:text-[#1C3D6E] transition-colors"
        >
          <Icons.ChevronLeft />
          Back to Course
        </button>
        <div className="h-4 w-px bg-[#DEE5F0]" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0D1B2E] truncate">{slide.name}</p>
          <p className="text-xs text-[#5A6A82] truncate">{course?.Name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {completed ? (
            <Badge variant="success" dot>Completed</Badge>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setCompleted(true)}>
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PDF viewer */}
        <div className="flex-1 overflow-auto bg-[#E8EDF5] flex flex-col items-center py-6 px-4 gap-4">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={slide.name}
              className="w-full max-w-3xl rounded-xl shadow-lg bg-white"
              style={{ minHeight: "75vh", border: "none" }}
            />
          ) : (
            /* Placeholder when no PDF URL */
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="px-8 pt-10 pb-6 border-b border-[#DEE5F0]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-1 w-8 rounded bg-[#1C3D6E]" />
                  <p className="text-xs font-medium text-[#5A6A82] uppercase tracking-widest">{course?.Name}</p>
                </div>
                <h2 className="text-2xl font-bold text-[#0D1B2E] mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                  {slide.name}
                </h2>
                {slide.page_count && (
                  <p className="text-sm text-[#5A6A82]">{slide.page_count} pages</p>
                )}
              </div>
              <div className="px-8 py-10 flex flex-col items-center gap-4 text-center min-h-64">
                <div className="w-14 h-14 rounded-xl bg-[#EEF2F8] flex items-center justify-center text-[#9BAABF]">
                  <Icons.PDF />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D1B2E]">PDF document</p>
                  <p className="text-xs text-[#9BAABF] mt-1">
                    {slide.status === "done"
                      ? "Slide is ready — file preview not configured (set VITE_STORAGE_URL)"
                      : slide.status === "processing"
                      ? "Slide is being processed by AI…"
                      : slide.status === "pending"
                      ? "Slide is queued for processing"
                      : "Processing failed — please re-upload"}
                  </p>
                </div>
                {slide.status !== "done" && (
                  <Badge
                    variant={slide.status === "processing" ? "info" : slide.status === "failed" ? "error" : "warning"}
                    dot
                  >
                    {slide.status.charAt(0).toUpperCase() + slide.status.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-64 bg-white border-l border-[#DEE5F0] hidden lg:flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-[#DEE5F0]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-[#EEF2F8] flex items-center justify-center text-[#1C3D6E]">
                <Icons.PDF />
              </div>
              <span className="text-xs text-[#5A6A82] font-medium">PDF Slide</span>
            </div>
            {slide.page_count && <p className="text-xs text-[#9BAABF]">{slide.page_count} pages · {slide.duration ?? "—"}</p>}
          </div>

          {/* AI Actions — only when processed */}
          <div className="p-4 border-b border-[#DEE5F0] space-y-2">
            <p className="text-xs font-semibold text-[#5A6A82] uppercase tracking-wider mb-3">AI Actions</p>
            <button
              disabled={slide.status !== "done"}
              onClick={handleSummarize}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#EEF2F8] hover:bg-[#DDE6F5] text-[#1C3D6E] text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icons.Sparkle />
              Summarize Slide
            </button>
            <button
              disabled={slide.status !== "done"}
              onClick={() => onNavigate("ai", { courseId, lectureId, scope: "lecture" })}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#E07B39]/10 hover:bg-[#E07B39]/20 text-[#C46828] text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icons.AI />
              Ask AI About This
            </button>
            {slide.status !== "done" && (
              <p className="text-xs text-[#9BAABF] text-center pt-1">
                AI features available after processing
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="p-4 flex-1">
            <p className="text-xs font-semibold text-[#5A6A82] uppercase tracking-wider mb-3">Navigation</p>
            {prevSlide && (
              <button
                onClick={() => onNavigate("lecture", { courseId, lectureId: String(prevSlide.id) })}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-[#F4F6FA] text-left group transition-colors mb-1"
              >
                <Icons.ChevronLeft />
                <div className="min-w-0">
                  <p className="text-xs text-[#5A6A82] group-hover:text-[#1C3D6E]">Previous</p>
                  <p className="text-xs font-medium text-[#0D1B2E] truncate">{prevSlide.name}</p>
                </div>
              </button>
            )}
            {nextSlide && (
              <button
                onClick={() => onNavigate("lecture", { courseId, lectureId: String(nextSlide.id) })}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-[#EEF2F8] text-left group transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#5A6A82] group-hover:text-[#1C3D6E]">Next</p>
                  <p className="text-xs font-medium text-[#0D1B2E] truncate">{nextSlide.name}</p>
                </div>
                <Icons.ChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="lg:hidden flex items-center gap-2 bg-white border-t border-[#DEE5F0] px-4 py-3 flex-shrink-0">
        <Button
          variant="secondary" size="sm" icon={<Icons.Sparkle />}
          disabled={slide.status !== "done"}
          onClick={handleSummarize}
        >
          Summarize
        </Button>
        <Button
          variant="accent" size="sm" icon={<Icons.AI />}
          disabled={slide.status !== "done"}
          onClick={() => onNavigate("ai", { courseId, lectureId, scope: "lecture" })}
        >
          Ask AI
        </Button>
        {!completed && (
          <Button variant="primary" size="sm" className="ml-auto" onClick={() => setCompleted(true)}>
            Mark Complete
          </Button>
        )}
      </div>

      {/* Summary Modal */}
      <Modal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        title="AI Slide Summary"
        width="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("ai", { courseId, lectureId, scope: "lecture" })}>
              Ask AI About Summary
            </Button>
            <Button variant="secondary" size="sm" icon={<Icons.Copy />} onClick={handleCopy} disabled={!summaryData}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </>
        }
      >
        {summaryLoading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1C3D6E]/10 flex items-center justify-center text-[#1C3D6E] animate-pulse">
              <Icons.Sparkle />
            </div>
            <p className="text-sm text-[#5A6A82]">Generating summary…</p>
          </div>
        )}

        {summaryError && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <Icons.AlertCircle />
            <span>{summaryError}</span>
          </div>
        )}

        {summaryData && !summaryLoading && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#1C3D6E]/10 flex items-center justify-center text-[#1C3D6E]">
                <Icons.Sparkle />
              </div>
              <span className="text-xs font-medium text-[#5A6A82]">Generated by AI · {slide.name}</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0D1B2E] mb-2">Summary</p>
              <p className="text-sm text-[#3A4A5E] leading-relaxed">{summaryData.summary}</p>
            </div>

            {summaryData.concepts && summaryData.concepts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#0D1B2E] mb-2">Main Concepts</p>
                <ul className="space-y-1.5">
                  {summaryData.concepts.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#3A4A5E]">
                      <span className="w-5 h-5 rounded-full bg-[#EEF2F8] text-[#1C3D6E] text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">{i + 1}</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summaryData.definitions && summaryData.definitions.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#0D1B2E] mb-2">Key Definitions</p>
                <div className="space-y-2">
                  {summaryData.definitions.map((d, i) => (
                    <div key={i} className="p-3 bg-[#F4F6FA] rounded-lg">
                      <p className="text-xs font-semibold text-[#1C3D6E] mb-0.5">{d.term}</p>
                      <p className="text-xs text-[#3A4A5E] leading-relaxed">{d.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summaryData.key_points && summaryData.key_points.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#0D1B2E] mb-2">Points to Remember</p>
                <ul className="space-y-1.5">
                  {summaryData.key_points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#3A4A5E]">
                      <span className="text-[#E07B39] font-bold mt-0.5 flex-shrink-0">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
