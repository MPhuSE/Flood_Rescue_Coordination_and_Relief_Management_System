import { useEffect, useState } from "react";
import { Plus, Search, MapPin } from "lucide-react";
import { rescueApi } from "../services/apiService";
import { useUserStore } from "../hooks/useUserStore";
import type { RescueRequest, CreateRescueRequest } from "../types/rescue";

const urgencyBadge: Record<string, string> = { CRITICAL: "badge-red", HIGH: "badge-orange", MEDIUM: "badge-blue", LOW: "badge-soft-green" };
const statusBadge: Record<string, string> = { PENDING: "badge-soft-orange", ASSIGNED: "badge-blue", IN_PROGRESS: "badge-purple", COMPLETED: "badge-green", CANCELLED: "badge-red" };

export function RescueRequestsPage() {
  const profile = useUserStore(s => s.profile);
  const isCitizen = profile?.role === "CITIZEN";
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateRescueRequest>({ description: "", location: "", latitude: 0, longitude: 0, urgencyLevel: "MEDIUM" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [isCitizen]);

  async function load() {
    setLoading(true);
    try {
      const data = isCitizen ? await rescueApi.getMyRequests() : await rescueApi.getAll();
      setRequests(data || []);
    } catch { setRequests([]); }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try { await rescueApi.create(form); setShowForm(false); load(); } catch {}
  }

  const filtered = requests.filter(r => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase()) && !r.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Yêu cầu cứu hộ</h1>
          <p className="text-sm text-slate">{isCitizen ? "Các yêu cầu bạn đã gửi" : "Tất cả yêu cầu trong hệ thống"}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> Tạo yêu cầu
        </button>
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-ink mb-4">Tạo yêu cầu cứu hộ mới</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">Mô tả tình huống</label>
              <textarea className="input-field h-20" placeholder="Mô tả chi tiết..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Vị trí</label>
              <input className="input-field" placeholder="Địa chỉ..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Mức độ khẩn cấp</label>
              <select className="input-field" value={form.urgencyLevel} onChange={e => setForm({ ...form, urgencyLevel: e.target.value })}>
                <option value="LOW">Thấp</option><option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option><option value="CRITICAL">Khẩn cấp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Vĩ độ</label>
              <input type="number" step="any" className="input-field" value={form.latitude} onChange={e => setForm({ ...form, latitude: +e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Kinh độ</label>
              <input type="number" step="any" className="input-field" value={form.longitude} onChange={e => setForm({ ...form, longitude: +e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Gửi yêu cầu</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input className="input-field pl-9" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-xs font-medium text-slate uppercase tracking-wider">
                <th className="px-4 py-3">ID</th><th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Vị trí</th><th className="px-4 py-3">Khẩn cấp</th>
                <th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate">Không có dữ liệu</td></tr>
              ) : filtered.map(req => (
                <tr key={req.id} className="hover:bg-surface-soft transition-colors">
                  <td className="px-4 py-3 font-medium">#{req.id}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{req.description}</td>
                  <td className="px-4 py-3 text-xs"><MapPin size={12} className="inline mr-1" />{req.location}</td>
                  <td className="px-4 py-3"><span className={urgencyBadge[req.urgencyLevel] || "badge-soft-purple"}>{req.urgencyLevel}</span></td>
                  <td className="px-4 py-3"><span className={statusBadge[req.status] || "badge-soft-purple"}>{req.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate">{new Date(req.createdTime).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
