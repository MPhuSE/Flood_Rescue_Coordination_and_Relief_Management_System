import { useEffect, useState } from "react";
import { Plus, AlertTriangle, Clock } from "lucide-react";
import { alertApi } from "../services/apiService";
import type { FloodAlert } from "../types/rescue";

import { useUserStore } from "../hooks/useUserStore";

const severityBadge: Record<string, string> = { EMERGENCY: "badge-red", WARNING: "badge-orange", WATCH: "badge-blue", ADVISORY: "badge-soft-purple" };
const severityBg: Record<string, string> = { EMERGENCY: "border-l-semantic-error", WARNING: "border-l-brand-orange-deep", WATCH: "border-l-link", ADVISORY: "border-l-brand-purple" };

export function AlertsPage() {
  const profile = useUserStore(s => s.profile);
  const userRole = profile?.role || "";
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "WARNING", locationArea: "" });

  useEffect(() => { load(); }, []);
  async function load() { try { setAlerts(await alertApi.getAll() || []); } catch { setAlerts([]); } }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try { 
      await alertApi.create(form); 
      setShowForm(false); 
      setForm({ title: "", description: "", severity: "WARNING", locationArea: "" });
      alert("Phát cảnh báo thành công!");
      load(); 
    } catch (err: any) {
      alert("Lỗi phát cảnh báo: " + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-ink">Cảnh báo lũ lụt</h1>
          <p className="text-sm text-slate">Quản lý cảnh báo thiên tai</p></div>
        {(userRole === "ADMIN" || userRole === "COORDINATOR" || userRole === "MANAGER") && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> Tạo cảnh báo</button>
        )}
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea className="input-field h-20" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Mức độ</label>
              <select className="input-field" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                <option value="ADVISORY">Tư vấn</option><option value="WATCH">Theo dõi</option>
                <option value="WARNING">Cảnh báo</option><option value="EMERGENCY">Khẩn cấp</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Khu vực</label>
              <input className="input-field" value={form.locationArea} onChange={e => setForm({ ...form, locationArea: e.target.value })} /></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-danger"><AlertTriangle size={14} /> Phát cảnh báo</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {alerts.length === 0 ? <div className="card p-8 text-center text-slate">Không có cảnh báo nào</div> :
          alerts.map(alert => (
            <div key={alert.id} className={`card p-5 border-l-4 ${severityBg[alert.severity] || "border-l-slate"} hover:shadow-card transition-all`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={alert.severity === "EMERGENCY" ? "text-semantic-error" : "text-brand-orange-deep"} />
                  <span className={severityBadge[alert.severity] || "badge-soft-purple"}>{alert.severity}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate">
                  <Clock size={12} />
                  {new Date(alert.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-ink mb-1">{alert.title}</h3>
              <p className="text-sm text-slate">{alert.description}</p>
              <p className="text-xs text-slate mt-2">📍 {alert.locationArea}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
