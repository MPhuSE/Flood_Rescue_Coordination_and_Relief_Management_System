import { useEffect, useState } from "react";
import { Plus, Package, AlertTriangle, Archive, History, ArrowRight } from "lucide-react";
import { reliefApi } from "../services/apiService";
import type { ReliefItem, ReliefDistribution } from "../types/rescue";

export function ReliefPage() {
  const [activeTab, setActiveTab] = useState<"STOCK" | "DISTRIBUTIONS">("STOCK");
  const [items, setItems] = useState<ReliefItem[]>([]);
  const [distributions, setDistributions] = useState<ReliefDistribution[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDistForm, setShowDistForm] = useState(false);
  
  const [form, setForm] = useState({ name: "", category: "FOOD", unit: "Thùng", quantityInStock: 100, minimumStockLevel: 10, description: "" });
  const [distForm, setDistForm] = useState({ reliefItemId: 0, quantity: 1, recipientType: "RESCUE_TEAM", recipientId: 1, notes: "" });

  useEffect(() => { load(); }, []);
  
  async function load() { 
    try { 
      const [iData, dData] = await Promise.all([reliefApi.getItems(), reliefApi.getDistributions()]);
      setItems(iData || []); 
      setDistributions(dData || []);
    } catch { 
      setItems([]); 
      setDistributions([]);
    } 
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try { await reliefApi.createItem(form); setShowForm(false); load(); } catch {}
  }

  async function handleCreateDist(e: React.FormEvent) {
    e.preventDefault();
    if (distForm.reliefItemId === 0) {
      if (items.length > 0) distForm.reliefItemId = items[0].id;
      else { alert("Vui lòng thêm hàng vào kho trước."); return; }
    }
    try { 
      await reliefApi.distribute(distForm); 
      setShowDistForm(false); 
      load(); 
      alert("Xuất kho viện trợ thành công!");
    } catch {
      alert("Xuất kho thất bại (Có thể số lượng tồn kho không đủ).");
    }
  }

  async function updateStock(id: number, currentItem: ReliefItem, change: number) {
    const newStock = currentItem.quantityInStock + change;
    if (newStock < 0) return;
    try {
      await reliefApi.updateItem(id, { ...currentItem, quantityInStock: newStock });
      load();
    } catch {}
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Cứu trợ & Logistics</h1>
          <p className="text-sm text-slate">Quản lý kho hàng và nhật ký cấp phát viện trợ</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "STOCK" && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16} /> Nhập kho</button>
          )}
          {activeTab === "DISTRIBUTIONS" && (
            <button onClick={() => setShowDistForm(!showDistForm)} className="btn-primary !bg-brand-orange-deep"><Plus size={16} /> Xuất cấp phát</button>
          )}
        </div>
      </div>

      <div className="flex border-b border-hairline">
        <button onClick={() => setActiveTab("STOCK")} className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === "STOCK" ? "text-primary border-b-2 border-primary" : "text-slate hover:text-ink"}`}>
          <Archive size={16} className="inline mr-1.5" /> Kho hàng
        </button>
        <button onClick={() => setActiveTab("DISTRIBUTIONS")} className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === "DISTRIBUTIONS" ? "text-primary border-b-2 border-primary" : "text-slate hover:text-ink"}`}>
          <History size={16} className="inline mr-1.5" /> Nhật ký phân phối
        </button>
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

      {activeTab === "STOCK" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => {
              const lowStock = item.quantityInStock <= item.minimumStockLevel;
              return (
                <div key={item.id} className={`card p-5 hover:shadow-mockup transition-all duration-200 ${lowStock ? "border-semantic-error" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-tint-peach flex items-center justify-center">
                      <Package size={18} className="text-brand-orange-deep" />
                    </div>
                    {lowStock && <span className="badge-red flex items-center gap-1 animate-pulse"><AlertTriangle size={10} /> Sắp hết</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
                  <p className="text-xs text-slate mt-1">{item.category} · {item.unit}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-ink">{item.quantityInStock}</p>
                      <p className="text-xs text-slate">Tồn kho</p>
                    </div>
                    <div className="flex items-center gap-1 border border-hairline rounded p-1">
                      <button onClick={() => updateStock(item.id, item, -10)} className="w-6 h-6 rounded bg-surface hover:bg-surface-soft flex items-center justify-center text-slate font-medium" title="Trừ 10">-10</button>
                      <button onClick={() => updateStock(item.id, item, 10)} className="w-6 h-6 rounded bg-surface hover:bg-surface-soft flex items-center justify-center text-slate font-medium" title="Cộng 10">+10</button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate">{item.minimumStockLevel}</p>
                      <p className="text-xs text-slate">Tối thiểu</p>
                    </div>
                  </div>
                  {/* Stock bar */}
                  <div className="mt-4 h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${lowStock ? "bg-semantic-error" : "bg-semantic-success"}`}
                      style={{ width: `${Math.min((item.quantityInStock / Math.max(item.minimumStockLevel * 5, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "DISTRIBUTIONS" && (
        <>
          {showDistForm && (
            <div className="card p-6 animate-slide-up mb-4">
              <form onSubmit={handleCreateDist} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Mặt hàng</label>
                  <select className="input-field" value={distForm.reliefItemId} onChange={e => setDistForm({ ...distForm, reliefItemId: +e.target.value })}>
                    {items.length === 0 && <option value={0}>-- Kho trống --</option>}
                    {items.map(i => <option key={i.id} value={i.id}>{i.name} (Tồn: {i.quantityInStock} {i.unit})</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Số lượng xuất</label>
                  <input type="number" min="1" className="input-field" value={distForm.quantity} onChange={e => setDistForm({ ...distForm, quantity: +e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Đối tượng nhận (Loại)</label>
                  <select className="input-field" value={distForm.recipientType} onChange={e => setDistForm({ ...distForm, recipientType: e.target.value })}>
                    <option value="RESCUE_TEAM">Đội cứu hộ (Xuất lên xe/thuyền)</option>
                    <option value="CITIZEN">Hộ dân (Phát trực tiếp)</option>
                    <option value="SHELTER">Điểm an toàn (Tiếp tế)</option>
                  </select></div>
                <div><label className="block text-sm font-medium mb-1">Mã đối tượng nhận (ID)</label>
                  <input type="number" min="1" className="input-field" value={distForm.recipientId} onChange={e => setDistForm({ ...distForm, recipientId: +e.target.value })} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Ghi chú (Chiến dịch, Đợt cấp phát)</label>
                  <input className="input-field" value={distForm.notes} onChange={e => setDistForm({ ...distForm, notes: e.target.value })} placeholder="VD: Cứu trợ đợt 1 tại Xã A..." /></div>
                <div className="md:col-span-2 flex gap-2">
                  <button type="submit" className="btn-primary !bg-brand-orange-deep">Ghi nhận xuất kho</button>
                  <button type="button" onClick={() => setShowDistForm(false)} className="btn-secondary">Hủy</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-left text-xs font-medium text-slate uppercase tracking-wider">
                  <th className="px-4 py-3">Mặt hàng xuất</th><th className="px-4 py-3">Đối tượng nhận</th>
                  <th className="px-4 py-3">Số lượng</th><th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft">
                {distributions.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate">Chưa có nhật ký cấp phát</td></tr> :
                  distributions.map(d => {
                    const item = items.find(i => i.id === d.itemId);
                    return (
                      <tr key={d.id} className="hover:bg-surface-soft transition-colors">
                        <td className="px-4 py-3 font-medium text-ink flex items-center gap-2">
                          <ArrowRight size={14} className="text-brand-orange-deep" /> {d.itemName || item?.name || `Sản phẩm #${d.itemId}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge-soft-purple">{d.recipientName || '---'}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-semantic-error">-{d.quantity} {item?.unit}</td>
                        <td className="px-4 py-3 text-xs text-slate">{d.notes}</td>
                        <td className="px-4 py-3 text-xs text-slate">{d.distributedAt ? new Date(d.distributedAt).toLocaleString() : '---'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
