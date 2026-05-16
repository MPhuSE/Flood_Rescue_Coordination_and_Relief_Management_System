import { useEffect, useState } from "react";
import { Plus, Search, MapPin, CheckCircle, Clock, ArrowRight, UserPlus, XCircle } from "lucide-react";
import { rescueApi, teamApi } from "../services/apiService";
import { useUserStore } from "../hooks/useUserStore";
import type { RescueRequest, CreateRescueRequest, RescueTeam } from "../types/rescue";

const urgencyBadge: Record<string, string> = { 
  CRITICAL: "badge-red", 
  HIGH: "badge-orange", 
  MEDIUM: "badge-blue", 
  LOW: "badge-green" 
};
const statusBadge: Record<string, string> = { 
  PENDING: "badge-orange", 
  ASSIGNED: "badge-blue", 
  IN_PROGRESS: "badge-purple", 
  COMPLETED: "badge-green", 
  CANCELLED: "badge-red" 
};

export function RescueRequestsPage() {
  const profile = useUserStore(s => s.profile);
  const isCitizen = profile?.role === "CITIZEN";
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "COORDINATOR";
  const isStaff = isAdmin || profile?.role === "RESCUER";
  
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);
  const [form, setForm] = useState<CreateRescueRequest>({ description: "", location: "", latitude: 0, longitude: 0, urgencyLevel: "MEDIUM" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    load(); 
    if (isAdmin) teamApi.getAll().then(setTeams).catch(() => {});
  }, [isCitizen, isAdmin]);

  async function load() {
    setLoading(true);
    try {
      const data = isCitizen ? await rescueApi.getMyRequests() : await rescueApi.getAll();
      console.log("Rescue requests data:", data);
      setRequests(data || []);
    } catch (err) { 
      console.error("Load requests failed:", err);
      setRequests([]); 
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try { await rescueApi.create(form); setShowForm(false); load(); } catch {}
  }

  async function updateStatus(id: number, status: string) {
    if (!confirm(`Xác nhận chuyển trạng thái sang ${status}?`)) return;
    try { 
      await rescueApi.updateStatus(id, status); 
      load(); 
    } catch (err) {
      console.error("Update status failed:", err);
      alert("Cập nhật trạng thái thất bại. Vui lòng kiểm tra lại.");
    }
  }

  async function handleAssign(requestId: number, teamId: number) {
    try { 
      await rescueApi.assignTeam(requestId, teamId); 
      setShowAssignModal(null); 
      load(); 
    } catch (err) {
      console.error("Assign team failed:", err);
      alert("Phân công đội thất bại.");
    }
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
                <th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Đội cứu hộ</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate">Không có dữ liệu</td></tr>
              ) : filtered.map(req => (
                <tr key={req.requestId || (req as any).id} className="hover:bg-surface-soft transition-colors">
                  <td className="px-4 py-3 font-medium">#{(req as any).requestId || (req as any).id}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{req.description}</td>
                  <td className="px-4 py-3 text-xs"><MapPin size={12} className="inline mr-1" />{req.location}</td>
                  <td className="px-4 py-3"><span className={urgencyBadge[req.urgencyLevel] || "badge-soft-purple"}>{req.urgencyLevel}</span></td>
                  <td className="px-4 py-3"><span className={statusBadge[req.status] || "badge-soft-purple"}>{req.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate">{req.assignedTeamName || "---"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && req.status === "PENDING" && (
                         <button onClick={() => setShowAssignModal(req.requestId)} 
                          className="btn-secondary !py-1 !px-2 text-xs border-primary text-primary hover:bg-tint-lavender">
                          <UserPlus size={14} /> Điều phối
                        </button>
                      )}
                      {isStaff && req.status === "ASSIGNED" && (
                        <button onClick={() => updateStatus(req.requestId, "IN_PROGRESS")} 
                          className="btn-primary !py-1 !px-2 text-xs">
                          <Clock size={14} /> Bắt đầu
                        </button>
                      )}
                      {(isStaff || isCitizen) && req.status === "IN_PROGRESS" && (
                        <button onClick={() => updateStatus(req.requestId, "COMPLETED")} 
                          className="btn-primary !py-1 !px-2 text-xs !bg-brand-green">
                          <CheckCircle size={14} /> Hoàn thành
                        </button>
                      )}
                      {(isStaff || isCitizen) && ["PENDING", "ASSIGNED"].includes(req.status) && (
                        <button onClick={() => updateStatus(req.requestId, "CANCELLED")} 
                          className="btn-secondary !py-1 !px-2 text-xs border-error text-error hover:bg-tint-rose">
                          <XCircle size={14} /> Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-ink mb-4">Điều phối đội cứu hộ</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {teams.filter(t => t.status === "ACTIVE").length === 0 ? (
                <p className="text-sm text-slate py-4">Không có đội nào đang rảnh (ACTIVE)</p>
              ) : teams.filter(t => t.status === "ACTIVE").map(t => (
                <button key={t.teamId} onClick={() => handleAssign(showAssignModal, t.teamId)}
                  className="flex items-center justify-between w-full p-3 rounded-md border border-hairline hover:bg-surface transition-colors">
                  <div className="text-left">
                    <p className="text-sm font-medium text-ink">{t.teamName}</p>
                    <p className="text-xs text-slate">{t.memberCount} thành viên · {t.contactPhone}</p>
                    {t.vehicleNames && t.vehicleNames.length > 0 && (
                      <p className="text-[10px] text-brand-teal font-medium mt-1">
                        🚛 {t.vehicleNames.join(", ")}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={14} className="text-slate" />
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button onClick={() => setShowAssignModal(null)} className="btn-secondary w-full">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
