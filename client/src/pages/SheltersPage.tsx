import { useEffect, useState } from "react";
import { Plus, Shield, MapPin, Users as UsersIcon } from "lucide-react";
import { shelterApi } from "../services/apiService";
import type { Shelter } from "../types/rescue";

export function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", latitude: 0, longitude: 0, capacity: 100, currentOccupancy: 0, status: "OPEN", contactInfo: "" });

  useEffect(() => { load(); }, []);
  async function load() { try { setShelters(await shelterApi.getAll() || []); } catch { setShelters([]); } }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try { await shelterApi.create(form); setShowForm(false); load(); } catch {}
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-ink">Điểm an toàn</h1>
          <p className="text-sm text-slate">Quản lý các điểm trú ẩn an toàn</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> Thêm điểm</button>
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Tên</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <input className="input-field" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Sức chứa</label>
              <input type="number" className="input-field" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Vĩ độ</label>
              <input type="number" step="any" className="input-field" value={form.latitude} onChange={e => setForm({ ...form, latitude: +e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Kinh độ</label>
              <input type="number" step="any" className="input-field" value={form.longitude} onChange={e => setForm({ ...form, longitude: +e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Liên hệ</label>
              <input className="input-field" value={form.contactInfo} onChange={e => setForm({ ...form, contactInfo: e.target.value })} /></div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="btn-primary">Tạo</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shelters.map(s => {
          const occupancyPct = s.capacity > 0 ? (s.currentOccupancy / s.capacity) * 100 : 0;
          const isFull = occupancyPct >= 90;
          return (
            <div key={s.id} className="card p-5 hover:shadow-mockup transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-tint-mint flex items-center justify-center">
                  <Shield size={18} className="text-brand-green" />
                </div>
                <span className={s.status === "OPEN" ? "badge-green" : "badge-red"}>{s.status}</span>
              </div>
              <h3 className="text-sm font-semibold text-ink">{s.name}</h3>
              <p className="text-xs text-slate mt-1 flex items-center gap-1"><MapPin size={12} />{s.location}</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs">
                  <UsersIcon size={12} className="text-slate" />
                  <span className="font-medium">{s.currentOccupancy}/{s.capacity}</span>
                </div>
                <span className="text-xs text-slate">Còn trống: {s.capacity - s.currentOccupancy}</span>
              </div>
              <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${isFull ? "bg-semantic-error" : "bg-brand-green"}`}
                  style={{ width: `${Math.min(occupancyPct, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
