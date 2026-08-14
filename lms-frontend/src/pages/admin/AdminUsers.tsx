import { useState } from "react";
import { Badge, Button, Card, Icons, Modal } from "../../components/ui";
import { useApi } from "../../hooks/useApi";
import { adminApi, type ApiUser } from "../../services/api";

export default function AdminUsers() {
  const { data: users, loading, error, refetch } = useApi(() => adminApi.listUsers(), []);

  const [showCreate, setShowCreate] = useState(false);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const { data: selectedUser, loading: loadingUser, error: selectedUserError } = useApi(
    () => (viewUserId ? adminApi.showUser(viewUserId) : Promise.resolve(null)),
    [viewUserId]
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setFormError("");
  };

  const handleCreateAdmin = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("Name, email, and password are required.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setFormError("Passwords do not match.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await adminApi.registerAdmin({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirm,
      });
      setShowCreate(false);
      resetForm();
      refetch();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create admin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-7 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2E]">Users</h1>
          <p className="text-sm text-[#5A6A82] mt-1">{loading ? "Loading…" : `${users?.length ?? 0} users`}</p>
        </div>
        <Button icon={<Icons.Plus />} onClick={() => { resetForm(); setShowCreate(true); }}>
          Create Admin
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-5">
          <Icons.AlertCircle />{error}
        </div>
      )}

      <Card padding="none">
        <div className="hidden sm:grid grid-cols-[80px_2fr_2fr_120px_80px] gap-4 px-5 py-3 border-b border-[#DEE5F0]">
          {["ID", "Name", "Email", "Role", "Actions"].map(h => (
            <p key={h} className="text-xs font-semibold text-[#9BAABF] uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {loading && [1, 2, 3, 4].map(i => (
          <div key={i} className="h-14 border-b border-[#DEE5F0] animate-pulse bg-[#F8FAFB]" />
        ))}

        {!loading && (users ?? []).length === 0 && (
          <div className="py-12 text-center text-sm text-[#9BAABF]">No users found.</div>
        )}

        {(users ?? []).map((u, i, arr) => {
          const role = (u.role ?? "").toLowerCase();
          const badgeVariant = role === "admin" ? "error" : "info";
          return (
            <div
              key={u.id}
              className={`grid grid-cols-1 sm:grid-cols-[80px_2fr_2fr_120px_80px] gap-2 sm:gap-4 items-start sm:items-center px-5 py-3 ${i < arr.length - 1 ? "border-b border-[#DEE5F0]" : ""}`}
            >
              <p className="text-sm text-[#5A6A82]">#{u.id}</p>
              <p className="text-sm font-medium text-[#0D1B2E] truncate">{u.name}</p>
              <p className="text-sm text-[#5A6A82] truncate">{u.email}</p>
              <Badge variant={badgeVariant}>{role === "admin" ? "Admin" : "Student"}</Badge>
              <button
                onClick={() => setViewUserId(u.id)}
                className="w-7 h-7 rounded-lg hover:bg-[#EEF2F8] flex items-center justify-center text-[#5A6A82] hover:text-[#1C3D6E] transition-colors"
                title="View user"
              >
                <Icons.Eye />
              </button>
            </div>
          );
        })}
      </Card>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Admin Account"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreateAdmin} disabled={saving}>
              {saving ? "Creating…" : "Create Admin"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Full name</label>
            <input
              className="w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Admin Name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Email</label>
            <input
              className="w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@university.edu"
              type="email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Password</label>
            <input
              className="w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              type="password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Confirm password</label>
            <input
              className="w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="Repeat password"
              type="password"
            />
          </div>
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              <Icons.AlertCircle />{formError}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={viewUserId !== null}
        onClose={() => setViewUserId(null)}
        title="User Details"
        footer={<Button variant="ghost" onClick={() => setViewUserId(null)}>Close</Button>}
      >
        {loadingUser && <p className="text-sm text-[#5A6A82]">Loading user…</p>}
        {!loadingUser && selectedUserError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            <Icons.AlertCircle />{selectedUserError}
          </div>
        )}
        {!loadingUser && selectedUser && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#5A6A82]">ID</span>
              <span className="font-medium text-[#0D1B2E]">#{selectedUser.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#5A6A82]">Name</span>
              <span className="font-medium text-[#0D1B2E]">{selectedUser.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#5A6A82]">Email</span>
              <span className="font-medium text-[#0D1B2E]">{selectedUser.email}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#5A6A82]">Role</span>
              <Badge variant={(selectedUser.role ?? "").toLowerCase() === "admin" ? "error" : "info"}>
                {(selectedUser.role ?? "Student").toLowerCase() === "admin" ? "Admin" : "Student"}
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
