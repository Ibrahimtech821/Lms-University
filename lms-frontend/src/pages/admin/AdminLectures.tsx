import { useState, useRef } from "react";
import { Card, Button, Badge, Modal, Icons } from "../../components/ui";
import { useApi } from "../../hooks/useApi";
import { slidesApi, coursesApi, type ApiSlide } from "../../services/api";

const statusConfig = {
  done:       { label: "Done",       variant: "success" as const },
  processing: { label: "Processing", variant: "info"    as const },
  pending:    { label: "Pending",    variant: "warning"  as const },
  failed:     { label: "Failed",     variant: "error"   as const },
};

function ProcessingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0,1,2].map(i => (
        <span key={i} className="w-1 h-3 rounded-full bg-blue-400"
          style={{ animation: `pulse-bar 1s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      <style>{`
        @keyframes pulse-bar {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function AdminLectures() {
  const { data: slides, loading, error, refetch } = useApi(() => slidesApi.list(), []);
  const { data: courses } = useApi(() => coursesApi.list(), []);

  const [showUpload, setShowUpload] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [slideTitle, setSlideTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ApiSlide | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Set default course when courses load
  const effectiveCourse = selectedCourse || (courses?.[0]?.id ? String(courses[0].id) : "");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setSelectedFile(file);
      if (!slideTitle) setSlideTitle(file.name.replace(".pdf", "").replace(/_/g, " "));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!slideTitle) setSlideTitle(file.name.replace(".pdf", "").replace(/_/g, " "));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !slideTitle.trim() || !effectiveCourse) return;
    setUploading(true); setUploadError(""); setUploadProgress(0);

    // Simulate progress to 90% while uploading
    const progressInterval = setInterval(() => {
      setUploadProgress(p => Math.min(90, p + 10));
    }, 150);

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("name", slideTitle);
      fd.append("course_id", effectiveCourse);

      await slidesApi.create(fd);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setShowUpload(false);
        setSelectedFile(null);
        setSlideTitle("");
        setUploadProgress(0);
        setUploading(false);
        refetch();
      }, 400);
    } catch (e: unknown) {
      clearInterval(progressInterval);
      setUploadError(e instanceof Error ? e.message : "Upload failed");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await slidesApi.destroy(deleteTarget.id);
      refetch();
      setDeleteTarget(null);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const statusCounts = Object.fromEntries(
    (["done","processing","pending","failed"] as const).map(s => [s, (slides ?? []).filter(x => x.status === s).length])
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-7 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2E]">Manage Slides</h1>
          <p className="text-sm text-[#5A6A82] mt-1">
            {loading ? "Loading…" : `${slides?.length ?? 0} slides uploaded`}
          </p>
        </div>
        <Button icon={<Icons.Upload />} onClick={() => { setShowUpload(true); setUploadError(""); }}>
          Upload Slide
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-5">
          <Icons.AlertCircle />{error}
        </div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(["done","processing","pending","failed"] as const).map(s => (
          <div key={s} className="bg-white rounded-xl border border-[#DEE5F0] p-3 text-center">
            <p className="text-lg font-bold text-[#0D1B2E]">{statusCounts[s]}</p>
            <Badge variant={statusConfig[s].variant} dot className="mt-1">{statusConfig[s].label}</Badge>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="hidden sm:grid grid-cols-[2fr_1.5fr_100px_90px] gap-4 px-5 py-3 border-b border-[#DEE5F0]">
          {["Slide", "Course", "Status", "Actions"].map(h => (
            <p key={h} className="text-xs font-semibold text-[#9BAABF] uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {loading && [1,2,3,4].map(i => (
          <div key={i} className="h-16 border-b border-[#DEE5F0] animate-pulse bg-[#F8FAFB]" />
        ))}

        {!loading && (slides ?? []).length === 0 && (
          <div className="py-14 text-center text-sm text-[#9BAABF]">No slides uploaded yet.</div>
        )}

        {(slides ?? []).map((slide, i, arr) => {
          const cfg = statusConfig[slide.status];
          const course = (courses ?? []).find(c => c.id === slide.course_id);
          return (
            <div
              key={slide.id}
              className={`flex flex-col sm:grid sm:grid-cols-[2fr_1.5fr_100px_90px] gap-2 sm:gap-4 items-start sm:items-center px-5 py-4 ${i < arr.length - 1 ? "border-b border-[#DEE5F0]" : ""} hover:bg-[#F8FAFB] transition-colors`}
            >
              <div className="flex items-center gap-2.5 w-full">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1C3D6E] flex-shrink-0">
                  <Icons.PDF />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0D1B2E] truncate">{slide.name}</p>
                  {slide.page_count && <p className="text-xs text-[#9BAABF]">{slide.page_count} pages</p>}
                </div>
              </div>
              <p className="text-sm text-[#5A6A82] hidden sm:block truncate">
                {course?.Name ?? `Course #${slide.course_id}`}
              </p>
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                {slide.status === "processing" && <ProcessingDots />}
              </div>
              <div className="flex items-center gap-1 ml-auto sm:ml-0">
                {slide.status === "failed" && (
                  <button
                    className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-500 transition-colors"
                    title="Retry"
                    onClick={() => refetch()}
                  >
                    <Icons.RefreshCw />
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(slide)}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-[#5A6A82] hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Upload Modal */}
      <Modal
        open={showUpload}
        onClose={() => { if (!uploading) { setShowUpload(false); setSelectedFile(null); setSlideTitle(""); } }}
        title="Upload Slide PDF"
        footer={
          <>
            <Button variant="ghost" disabled={uploading} onClick={() => { setShowUpload(false); setSelectedFile(null); setSlideTitle(""); }}>
              Cancel
            </Button>
            <Button
              icon={<Icons.Upload />}
              disabled={!selectedFile || !slideTitle.trim() || !effectiveCourse || uploading}
              onClick={handleUpload}
            >
              {uploading ? `Uploading ${uploadProgress}%` : "Upload Slide"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragging ? "border-[#1C3D6E] bg-[#EEF2F8]" : selectedFile ? "border-green-300 bg-green-50" : "border-[#DEE5F0] hover:border-[#1C3D6E]/40 hover:bg-[#F8FAFB]"}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
            {selectedFile ? (
              <div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-3">
                  <Icons.PDF />
                </div>
                <p className="text-sm font-semibold text-[#0D1B2E]">{selectedFile.name}</p>
                <p className="text-xs text-[#5A6A82] mt-1">{formatSize(selectedFile.size)}</p>
                <button className="mt-2 text-xs text-[#1C3D6E] hover:underline"
                  onClick={e => { e.stopPropagation(); setSelectedFile(null); }}>Remove</button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EEF2F8] flex items-center justify-center text-[#9BAABF] mx-auto mb-3">
                  <Icons.Upload />
                </div>
                <p className="text-sm font-semibold text-[#0D1B2E]">Drop your PDF here</p>
                <p className="text-xs text-[#9BAABF] mt-1">or click to browse · PDF files only</p>
              </div>
            )}
          </div>

          {/* Upload progress */}
          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-[#5A6A82] mb-1.5">
                <span>Uploading…</span><span>{uploadProgress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Slide Title *</label>
            <input
              className="w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              placeholder="e.g., Introduction to Neural Networks"
              value={slideTitle}
              onChange={e => setSlideTitle(e.target.value)}
            />
          </div>

          {/* Course selector */}
          <div>
            <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Assign to Course *</label>
            <select
              className="w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
            >
              {(courses ?? []).map(c => (
                <option key={c.id} value={String(c.id)}>{c.Name}</option>
              ))}
              {(!courses || courses.length === 0) && (
                <option value="" disabled>No courses available</option>
              )}
            </select>
          </div>

          {/* AI note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <span className="text-blue-500 mt-0.5 flex-shrink-0"><Icons.Sparkle /></span>
            <p className="text-xs text-blue-800 leading-relaxed">
              After uploading, AI will process the PDF to enable Q&A and summarization.
              Processing typically takes 2–5 minutes.
            </p>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              <Icons.AlertCircle />{uploadError}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Slide"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting…" : "Delete Slide"}
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-3">
            <Icons.Trash />
          </div>
          <p className="text-sm font-medium text-[#0D1B2E]">Delete "{deleteTarget?.name}"?</p>
          <p className="text-sm text-[#5A6A82] mt-1">All AI-generated content for this slide will also be removed.</p>
        </div>
      </Modal>
    </div>
  );
}
