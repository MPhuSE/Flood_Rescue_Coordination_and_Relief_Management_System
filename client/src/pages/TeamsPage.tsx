import { useEffect, useState } from "react";
import { Plus, Users, Phone, MapPin, User as UserIcon } from "lucide-react";
import { teamApi, adminApi } from "../services/apiService";
import type { RescueTeam } from "../types/rescue";
import type { UserProfile } from "../types/user";

const statusBadge: Record<string, string> = { 
  ACTIVE: "badge-green", 
  INACTIVE: "badge-red", 
  ON_DUTY: "badge-purple" 
};

export function TeamsPage() {
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    teamName: "",
    memberCount: 5,
    contactPhone: "",
    status: "ACTIVE",
    currentLocation: "",
    description: "",
    teamLeaderId: ""
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [teamsData, usersData] = await Promise.all([
        teamApi.getAll(),
        adminApi.getAllUsers().catch(() => []) // Fallback if not admin
      ]);
      setTeams(teamsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error("Load teams/users failed:", err);
      setTeams([]);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.teamLeaderId) {
      alert("Vui lòng chọn đội trưởng");
      return;
    }
    try {
      await teamApi.create({
        ...form,
        teamLeaderId: parseInt(form.teamLeaderId)
      });
      setShowForm(false);
      load();
      setForm({ teamName: "", memberCount: 5, contactPhone: "", status: "ACTIVE", currentLocation: "", description: "", teamLeaderId: "" });
    } catch (err) {
      console.error("Create team failed:", err);
      alert("Tạo đội thất bại. Vui lòng kiểm tra lại thông tin.");
    }
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
            <div>
              <label className="block text-sm font-medium mb-1">Tên đội</label>
              <input className="input-field" value={form.teamName} onChange={e => setForm({ ...form, teamName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đội trưởng</label>
              <select className="input-field" value={form.teamLeaderId} onChange={e => setForm({ ...form, teamLeaderId: e.target.value })} required>
                <option value="">{users.filter(u => u.role === "RESCUER").length === 0 ? "-- Không có nhân viên cứu hộ nào --" : "-- Chọn đội trưởng --"}</option>
                {users.filter(u => u.role === "RESCUER").map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.username})</option>
                ))}
              </select>
              {users.length === 0 && (
                <p className="text-[10px] text-semantic-error mt-1">
                  * Bạn cần đăng nhập tài khoản ADMIN (admin/admin123) để xem danh sách và tạo đội.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số thành viên</label>
              <input type="number" className="input-field" value={form.memberCount} onChange={e => setForm({ ...form, memberCount: +e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SĐT liên hệ</label>
              <input className="input-field" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Vị trí hiện tại</label>
              <input className="input-field" value={form.currentLocation} onChange={e => setForm({ ...form, currentLocation: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="md:col-span-2 flex gap-2 mt-2">
              <button type="submit" className="btn-primary">Tạo đội</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.length === 0 ? (
          <div className="md:col-span-3 card p-8 text-center text-slate">Chưa có đội cứu hộ nào</div>
        ) : teams.map(team => (
          <div key={team.teamId} className="card p-5 hover:shadow-mockup transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-tint-sky flex items-center justify-center">
                <Users size={18} className="text-link" />
              </div>
              <span className={statusBadge[team.status] || "badge-soft-purple"}>{team.status}</span>
            </div>
            <h3 className="text-sm font-semibold text-ink mb-2">{team.teamName}</h3>
            <div className="space-y-1.5 text-xs text-slate">
              <p className="flex items-center gap-2"><UserIcon size={12} className="text-primary" /> Đội trưởng: <span className="font-medium text-ink">{team.teamLeaderName || "---"}</span></p>
              <p className="flex items-center gap-2"><Users size={12} /> {team.memberCount} thành viên</p>
              <p className="flex items-center gap-2"><Phone size={12} /> {team.contactPhone || "---"}</p>
              <p className="flex items-center gap-2"><MapPin size={12} /> {team.currentLocation || "---"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
