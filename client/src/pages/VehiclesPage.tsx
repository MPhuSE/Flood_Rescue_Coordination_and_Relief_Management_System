import { useEffect, useState } from "react";
import { Plus, Truck } from "lucide-react";
import { vehicleApi } from "../services/apiService";
import type { RescueVehicle } from "../types/rescue";

const statusBadge: Record<string, string> = { AVAILABLE: "badge-green", IN_USE: "badge-purple", MAINTENANCE: "badge-orange", OUT_OF_SERVICE: "badge-red" };

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<RescueVehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "BOAT", licensePlate: "", capacity: 10, currentLocation: "", status: "AVAILABLE" });

  useEffect(() => { load(); }, []);
  async function load() { try { setVehicles(await vehicleApi.getAll() || []); } catch { setVehicles([]); } }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try { await vehicleApi.create(form); setShowForm(false); load(); } catch {}
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-ink">Phương tiện cứu hộ</h1>
          <p className="text-sm text-slate">Quản lý các phương tiện</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> Thêm phương tiện</button>
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Tên</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Loại</label>
              <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="BOAT">Thuyền</option><option value="TRUCK">Xe tải</option><option value="HELICOPTER">Trực thăng</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Biển số</label>
              <input className="input-field" value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} /></div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="btn-primary">Tạo</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="text-left text-xs font-medium text-slate uppercase tracking-wider">
              <th className="px-4 py-3">Tên</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Biển số</th>
              <th className="px-4 py-3">Sức chứa</th><th className="px-4 py-3">Vị trí</th><th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {vehicles.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate">Không có dữ liệu</td></tr> :
              vehicles.map(v => (
                <tr key={v.vehicleId} className="hover:bg-surface-soft transition-colors">
                  <td className="px-4 py-3 font-medium flex items-center gap-2"><Truck size={14} className="text-brand-teal" />{v.name}</td>
                  <td className="px-4 py-3">{v.type}</td><td className="px-4 py-3">{v.licensePlate}</td>
                  <td className="px-4 py-3">{v.capacity}</td><td className="px-4 py-3 text-xs">{v.currentLocation}</td>
                  <td className="px-4 py-3"><span className={statusBadge[v.status] || "badge-soft-purple"}>{v.status}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
