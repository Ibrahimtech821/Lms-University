import { useState } from "react";
import { Card, Button, Badge, Modal, Icons } from "../../components/ui";
import { useApi } from "../../hooks/useApi";
import { coursesApi, type ApiCourse } from "../../services/api";

export default function AdminCourses() {
  const { data: courses, loading, error, refetch } = useApi(() => coursesApi.list(), []);

  const [showCreate, setShowCreate] = useState(false);
  const [editCourse, setEditCourse] = useState<ApiCourse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiCourse | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const resetForm = () => { setFormTitle(""); setFormInstructor(""); setFormDescription(""); setFormError(""); };

  const openEdit = (c: ApiCourse) => {
    setEditCourse(c);
    setFormTitle(c.Name);
    setFormInstructor(typeof c.instructor === "string" ? c.instructor : c.instructor?.name ?? "");
    setFormDescription(c.Description ?? "");
    setFormError("");
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) { setFormError("Title is required"); return; }
    setFormLoading(true); setFormError("");
    try {
      await coursesApi.create({Name: formTitle, Description: formDescription });
      refetch();
      setShowCreate(false);
      resetForm();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create course");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editCourse || !formTitle.trim()) return;
    setFormLoading(true); setFormError("");
    try {
      await coursesApi.update(editCourse.id, { Name: formTitle, Description: formDescription });
      refetch();
      setEditCourse(null);
      resetForm();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to update course");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);
    try {
      await coursesApi.destroy(deleteTarget.id);
      refetch();
      setDeleteTarget(null);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setFormLoading(false);
    }
  };

   const courseFormFields = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Course Title *</label>
        <input
          className="w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
          placeholder="e.g., Advanced Machine Learning"
          value={formTitle}
          onChange={e => setFormTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Description</label>
        <textarea
          className="w-full h-24 rounded-lg border border-[#DEE5F0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all resize-none"
          placeholder="Course description…"
          value={formDescription}
          onChange={e => setFormDescription(e.target.value)}
        />
      </div>
      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <Icons.AlertCircle />
          {formError}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-7 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2E]">Manage Courses</h1>
          <p className="text-sm text-[#5A6A82] mt-1">
            {loading ? "Loading…" : `${courses?.length ?? 0} courses total`}
          </p>
        </div>
        <Button icon={<Icons.Plus />} onClick={() => { resetForm(); setShowCreate(true); }}>
          Create Course
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-5">
          <Icons.AlertCircle />{error}
        </div>
      )}

      <Card padding="none">
        {/* Header row */}
        <div className="hidden sm:grid grid-cols-[2fr_80px_120px] gap-4 px-5 py-3 border-b border-[#DEE5F0]">
          {["Course", "Slides", "Actions"].map(h => (
            <p key={h} className="text-xs font-semibold text-[#9BAABF] uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {loading && [1,2,3,4].map(i => (
          <div key={i} className="h-16 border-b border-[#DEE5F0] animate-pulse bg-[#F8FAFB]" />
        ))}

        {!loading && (courses ?? []).length === 0 && (
          <div className="py-12 text-center text-sm text-[#9BAABF]">No courses yet. Create one to get started.</div>
        )}

        {(courses ?? []).map((course, i, arr) => (
          <div
            key={course.id}
            className={`flex flex-col sm:grid sm:grid-cols-[2fr_80px_120px] gap-2 sm:gap-4 items-start sm:items-center px-5 py-4 ${i < arr.length - 1 ? "border-b border-[#DEE5F0]" : ""} hover:bg-[#F8FAFB] transition-colors`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-[#1C3D6E] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {course.Name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0D1B2E] truncate">{course.Name}</p>
                <p className="text-xs text-[#9BAABF] truncate line-clamp-1">{course.Description || "No description"}</p>
              </div>
            </div>
            <p className="text-sm text-[#5A6A82] hidden sm:block">{course.slides_count ?? 0}</p>
            <div className="flex items-center gap-1 ml-auto sm:ml-0">
              <button
                onClick={() => openEdit(course)}
                className="w-7 h-7 rounded-lg hover:bg-[#EEF2F8] flex items-center justify-center text-[#5A6A82] hover:text-[#1C3D6E] transition-colors"
                title="Edit"
              >
                <Icons.Edit />
              </button>
              <button
                onClick={() => setDeleteTarget(course)}
                className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-[#5A6A82] hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        ))}
      </Card>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Course"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={formLoading || !formTitle.trim()}>
              {formLoading ? "Creating…" : "Create Course"}
            </Button>
          </>
        }
      >
        {courseFormFields}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editCourse}
        onClose={() => setEditCourse(null)}
        title="Edit Course"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditCourse(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={formLoading || !formTitle.trim()}>
              {formLoading ? "Saving…" : "Save Changes"}
            </Button>
          </>
        }
      >
        {courseFormFields}
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Course"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? "Deleting…" : "Delete Course"}
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-3">
            <Icons.Trash />
          </div>
          <p className="text-sm font-medium text-[#0D1B2E]">Delete "{deleteTarget?.Name}"?</p>
          <p className="text-sm text-[#5A6A82] mt-1">This will remove the course and all its slides permanently.</p>
        </div>
      </Modal>
    </div>
  );
}
