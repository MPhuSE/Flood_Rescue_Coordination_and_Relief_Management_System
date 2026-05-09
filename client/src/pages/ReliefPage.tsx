import { useEffect, useState } from "react";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { reliefApi } from "../services/apiService";
import type { ReliefItem } from "../types/rescue";

export function ReliefPage() {
  const [items, setItems] = useState<ReliefItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "FOOD", unit: "Thùng", quantityInStock: 100, minimumStockLevel: 10, description: "" });

  useEffect(() => { load(); }, []);
  async function load() { try { setItems(await reliefApi.getItems() || []); } catch { setItems([]); } }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try { await reliefApi.createItem(form); setShowForm(false); load(); } catch {}
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-ink">Hàng cứu trợ</h1>
          <p className="text-sm text-slate">Quản lý kho hàng cứu trợ</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> Thêm hàng</button>
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Tên</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Loại</label>
              <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="FOOD">Thực phẩm</option><option value="WATER">Nước</option><option value="MEDICINE">Thuốc</option>
                <option value="CLOTHING">Quần áo</option><option value="EQUIPMENT">Trang thiết bị</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Đơn vị</label>
              <input className="input-field" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Tồn kho</label>
              <input type="number" className="input-field" value={form.quantityInStock} onChange={e => setForm({ ...form, quantityInStock: +e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Tồn kho tối thiểu</label>
              <input type="number" className="input-field" value={form.minimumStockLevel} onChange={e => setForm({ ...form, minimumStockLevel: +e.target.value })} /></div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary">Tạo</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const lowStock = item.quantityInStock <= item.minimumStockLevel;
          return (
            <div key={item.id} className={`card p-5 hover:shadow-mockup transition-all duration-200 ${lowStock ? "border-semantic-error/30" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-tint-peach flex items-center justify-center">
                  <Package size={18} className="text-brand-orange-deep" />
                </div>
                {lowStock && <span className="badge-red flex items-center gap-1"><AlertTriangle size={10} /> Sắp hết</span>}
              </div>
              <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
              <p className="text-xs text-slate mt-1">{item.category} · {item.unit}</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-ink">{item.quantityInStock}</p>
                  <p className="text-xs text-slate">Tồn kho</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate">{item.minimumStockLevel}</p>
                  <p className="text-xs text-slate">Tối thiểu</p>
                </div>
              </div>
              {/* Stock bar */}
              <div className="mt-3 h-1.5 bg-surface rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${lowStock ? "bg-semantic-error" : "bg-semantic-success"}`}
                  style={{ width: `${Math.min((item.quantityInStock / Math.max(item.minimumStockLevel * 5, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
