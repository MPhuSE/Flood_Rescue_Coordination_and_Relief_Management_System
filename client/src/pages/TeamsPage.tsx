import { useEffect, useState } from "react";
import { Plus, Users, Phone, MapPin } from "lucide-react";
import { teamApi } from "../services/apiService";
import type { RescueTeam } from "../types/rescue";

const statusBadge: Record<string, string> = { ACTIVE: "badge-green", STANDBY: "badge-blue", ON_MISSION: "badge-purple", UNAVAILABLE: "badge-red" };

export function TeamsPage() {
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teamName: "", memberCount: 5, contactPhone: "", status: "ACTIVE", currentLocation: "", description: "" });

  useEffect(() => { load(); }, []);
  async function load() { try { setTeams(await teamApi.getAll() || []); } catch { setTeams([]); } }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try { await teamApi.create(form); setShowForm(false); load(); } catch {}
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Đội cứu hộ</h1>
          <p className="text-sm text-slate">Quản lý các đội cứu hộ trong hệ thống</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> Thêm đội</button>
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-ink mb-4">Thêm đội cứu hộ mới</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Tên đội</label>
              <input className="input-field" value={form.teamName} onChange={e => setForm({ ...form, teamName: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Số thành viên</label>
              <input type="number" className="input-field" value={form.memberCount} onChange={e => setForm({ ...form, memberCount: +e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">SĐT liên hệ</label>
              <input className="input-field" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Vị trí hiện tại</label>
              <input className="input-field" value={form.currentLocation} onChange={e => setForm({ ...form, currentLocation: e.target.value })} /></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Tạo đội</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.teamId} className="card p-5 hover:shadow-mockup transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-tint-sky flex items-center justify-center">
                <Users size={18} className="text-link" />
              </div>
              <span className={statusBadge[team.status] || "badge-soft-purple"}>{team.status}</span>
            </div>
            <h3 className="text-sm font-semibold text-ink mb-2">{team.teamName}</h3>
            <div className="space-y-1 text-xs text-slate">
              <p className="flex items-center gap-1"><Users size={12} /> {team.memberCount} thành viên</p>
              <p className="flex items-center gap-1"><Phone size={12} /> {team.contactPhone}</p>
              <p className="flex items-center gap-1"><MapPin size={12} /> {team.currentLocation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
