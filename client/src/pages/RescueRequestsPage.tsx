import { useEffect, useState } from "react";
import { Plus, Search, MapPin, CheckCircle, Clock, ArrowRight, UserPlus, XCircle, Navigation, Radio, HeartHandshake } from "lucide-react";
import { rescueApi, teamApi } from "../services/apiService";
import { useUserStore } from "../hooks/useUserStore";
import type { RescueRequest, CreateRescueRequest, RescueTeam } from "../types/rescue";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

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
  const isRescuer = profile?.role === "RESCUER";
  const isStaff = isAdmin || isRescuer || profile?.role === "MANAGER";
  
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);
  const [form, setForm] = useState<CreateRescueRequest>({ description: "", location: "", latitude: 0, longitude: 0, urgencyLevel: "MEDIUM", image: "", numberOfPeople: 1 });
  const [sosActive, setSosActive] = useState<Record<number, boolean>>({});
  const [teamLocationActive, setTeamLocationActive] = useState(false); // FR-3.3 Auto tracking
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    load(); 
    if (isStaff) teamApi.getAll().then(setTeams).catch(() => {});
  }, [isCitizen, isStaff]);

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
    if (!form.description || !form.location || form.latitude === 0) {
      alert("Vui lòng điền đầy đủ: Mô tả, Vị trí và bấm nút lấy Vĩ độ/Kinh độ GPS!");
      return;
    }
    try { 
      await rescueApi.create(form); 
      setShowForm(false); 
      setForm({ description: "", location: "", latitude: 0, longitude: 0, urgencyLevel: "MEDIUM", image: "", numberOfPeople: 1 });
      alert("Gửi yêu cầu cứu hộ thành công!");
      load(); 
    } catch (err: any) {
      alert("Lỗi khi gửi yêu cầu. Có thể nội dung quá dài hoặc lỗi kết nối. Chi tiết: " + (err.response?.data?.message || err.message));
    }
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      return;
    }
    
    // Thêm feedback đang tải
    alert("Đang lấy vị trí... Vui lòng chờ vài giây (nếu bạn dùng PC không có GPS có thể sẽ mất thời gian hoặc thất bại).");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm({
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        alert("Đã lấy được vị trí thành công!");
      },
      (error) => {
        console.error("Error getting location:", error);
        let msg = "Không thể lấy vị trí hiện tại.";
        if (error.code === 1) msg = "Trình duyệt hoặc hệ điều hành của bạn đang từ chối quyền truy cập vị trí. Vui lòng kiểm tra lại cài đặt.";
        if (error.code === 2) msg = "Không thể xác định được vị trí (Thiết bị không có GPS hoặc mạng không hỗ trợ định vị). Bạn có thể nhập tay số Vĩ độ/Kinh độ.";
        if (error.code === 3) msg = "Quá thời gian chờ định vị. Vui lòng thử lại hoặc nhập tay.";
        alert(`Lỗi: ${msg}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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

  async function handleUpdateUrgency(id: number, urgency: string) {
    if (!confirm(`Xác nhận đổi mức độ khẩn cấp sang ${urgency}?`)) return;
    try { await rescueApi.updateUrgency(id, urgency); load(); } 
    catch (err) { alert("Cập nhật mức độ thất bại."); }
  }

  async function handleConfirmRescued(id: number) {
    if (!confirm("Bạn xác nhận đã được cứu hộ an toàn / nhận đủ nhu yếu phẩm?")) return;
    try {
      await rescueApi.confirmRescued(id);
      load();
    } catch {}
  }

  function toggleSos(requestId: number) {
    setSosActive(prev => {
      const isActive = prev[requestId];
      if (isActive) {
        alert("Đã tắt chế độ SOS cho yêu cầu này.");
        return { ...prev, [requestId]: false };
      } else {
        if (!navigator.geolocation) {
          alert("Trình duyệt không hỗ trợ định vị GPS.");
          return prev;
        }
        alert("Đã bật chế độ SOS! Vị trí của bạn sẽ được cập nhật liên tục mỗi 30 giây.");
        pingLocation(requestId);
        return { ...prev, [requestId]: true };
      }
    });
  }

  function pingLocation(requestId: number) {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try { await rescueApi.updateLocation(requestId, { latitude: pos.coords.latitude, longitude: pos.coords.longitude }); } 
        catch (e) { console.error("SOS ping failed", e); }
      },
      (err) => console.error("SOS location error", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function toggleTeamLocation() {
    setTeamLocationActive(prev => {
      if (prev) {
         alert("Đã dừng phát vị trí đội cứu hộ.");
         return false;
      }
      if (!navigator.geolocation) {
         alert("Trình duyệt không hỗ trợ định vị GPS.");
         return false;
      }
      const myTeam = teams.find(t => t.teamLeaderId === profile?.id);
      if (!myTeam) {
         alert("Bạn không phải là đội trưởng hoặc chưa được phân công vào đội nào!");
         return false;
      }
      alert("Đã bật chia sẻ GPS thực địa! Tọa độ đội cứu hộ sẽ liên tục được báo cáo về Sở chỉ huy.");
      pingTeamLocation(myTeam.teamId);
      return true;
    });
  }

  function pingTeamLocation(teamId: number) {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try { await teamApi.updateLocation(teamId, { latitude: pos.coords.latitude, longitude: pos.coords.longitude }); } 
        catch (e) { console.error("Team location ping failed", e); }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  useEffect(() => {
    if (teamLocationActive) {
      const interval = setInterval(() => {
         const myTeam = teams.find(t => t.teamLeaderId === profile?.id);
         if (myTeam) pingTeamLocation(myTeam.teamId);
      }, 10000); // 10s cập nhật 1 lần
      return () => clearInterval(interval);
    }
  }, [teamLocationActive, teams, profile?.id]);

  useEffect(() => {
    const activeRequests = Object.keys(sosActive).filter(id => sosActive[Number(id)]);
    if (activeRequests.length === 0) return;
    const interval = setInterval(() => {
      activeRequests.forEach(id => pingLocation(Number(id)));
    }, 30000);
    return () => clearInterval(interval);
  }, [sosActive]);

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
              <label className="block text-sm font-medium text-ink mb-1">Số người cần cứu</label>
              <input type="number" min="1" className="input-field" value={form.numberOfPeople} onChange={e => setForm({ ...form, numberOfPeople: +e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">Hình ảnh đính kèm (có thể chọn nhiều ảnh)</label>
              <input type="file" accept="image/*" multiple className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-tint-mint file:text-brand-green hover:file:bg-brand-green hover:file:text-white"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  const newImages: string[] = [];
                  let processed = 0;
                  Array.from(files).forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement("canvas");
                        let { width, height } = img;
                        if (width > 800) { height = Math.round((height * 800) / width); width = 800; }
                        if (height > 800) { width = Math.round((width * 800) / height); height = 800; }
                        canvas.width = width; canvas.height = height;
                        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
                        newImages.push(canvas.toDataURL("image/jpeg", 0.7));
                        processed++;
                        if (processed === files.length) {
                          const current = form.image ? form.image.split("|||") : [];
                          setForm({ ...form, image: [...current, ...newImages].join("|||") });
                        }
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  });
                }} />
              {form.image && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {form.image.split("|||").map((img, i) => (
                    <div key={i} className="relative">
                       <img src={img} alt="Preview" className="w-16 h-16 object-cover rounded shadow border border-hairline" />
                       <button type="button" onClick={() => {
                          const imgs = form.image.split("|||");
                          imgs.splice(i, 1);
                          setForm({ ...form, image: imgs.join("|||") });
                       }} className="absolute -top-2 -right-2 bg-semantic-error text-white rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform">
                         <XCircle size={14} />
                       </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Vĩ độ</label>
              <input type="number" step="any" className="input-field" value={form.latitude} onChange={e => setForm({ ...form, latitude: +e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Kinh độ</label>
              <div className="flex gap-2">
                <input type="number" step="any" className="input-field" value={form.longitude} onChange={e => setForm({ ...form, longitude: +e.target.value })} />
                <button type="button" onClick={handleGetLocation} className="btn-secondary !px-3 shrink-0" title="Lấy vị trí hiện tại (GPS)">
                  <Navigation size={18} />
                </button>
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Gửi yêu cầu</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {isRescuer && (
          <button onClick={toggleTeamLocation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border ${teamLocationActive ? 'bg-error text-white border-error animate-pulse' : 'bg-surface text-slate border-hairline hover:bg-surface-soft'}`}>
            <Radio size={14} /> {teamLocationActive ? "Đang chia sẻ vị trí Đội" : "Bật chia sẻ GPS Đội"}
          </button>
        )}
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
              ) : filtered.map(req => {
                const r = req as any;
                const isSos = sosActive[r.requestId] || false;
                return (
                <tr key={r.requestId} className={`hover:bg-surface-soft transition-colors ${isSos ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">#{r.requestId}</td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {req.description}
                    {isCitizen && r.status !== "CANCELLED" && (
                      <div className="mt-2 text-[10px] text-slate flex gap-1 items-center font-medium">
                        <span className={r.status === "PENDING" ? "text-primary" : "text-brand-green"}>Chờ tiếp nhận</span>
                        <span>&rsaquo;</span>
                        <span className={r.status === "ASSIGNED" ? "text-primary" : (r.status === "IN_PROGRESS" || r.status === "COMPLETED" ? "text-brand-green" : "text-slate")}>Đã phân công</span>
                        <span>&rsaquo;</span>
                        <span className={r.status === "IN_PROGRESS" ? "text-primary" : (r.status === "COMPLETED" ? "text-brand-green" : "text-slate")}>Đang đến</span>
                        <span>&rsaquo;</span>
                        <span className={r.status === "COMPLETED" ? "text-brand-green" : "text-slate"}>Hoàn thành</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs"><MapPin size={12} className="inline mr-1" />{req.location}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select className={`text-xs font-semibold px-2 py-1 rounded-full cursor-pointer ${urgencyBadge[req.urgencyLevel] || "badge-soft-purple"}`}
                        value={req.urgencyLevel}
                        onChange={(e) => handleUpdateUrgency(r.requestId, e.target.value)}>
                        <option value="LOW" className="bg-white text-ink">LOW</option>
                        <option value="MEDIUM" className="bg-white text-ink">MEDIUM</option>
                        <option value="HIGH" className="bg-white text-ink">HIGH</option>
                        <option value="CRITICAL" className="bg-white text-ink">CRITICAL</option>
                      </select>
                    ) : (
                      <span className={urgencyBadge[req.urgencyLevel] || "badge-soft-purple"}>{req.urgencyLevel}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusBadge[req.status] || "badge-soft-purple"}>{req.status}</span>
                    <br/><span className="text-xs text-slate mt-1 block">{(req as any).numberOfPeople || 1} người</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">
                    {req.assignedTeamName || "---"}
                    {req.image && (
                      <div className="mt-1 flex gap-2 flex-wrap">
                        {req.image.split("|||").map((img, i) => (
                          <a key={i} href={img} target="_blank" rel="noreferrer" className="text-primary hover:underline">Ảnh {i+1}</a>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2 max-w-[150px] ml-auto">
                      {isCitizen && ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(r.status) && (
                        <button onClick={() => toggleSos(r.requestId)} 
                          className={`btn-secondary !py-1 !px-2 text-xs flex items-center gap-1 ${isSos ? 'bg-error text-white border-error animate-pulse' : 'text-error border-error'}`}>
                          <Radio size={14} /> {isSos ? "TẮT SOS" : "SOS"}
                        </button>
                      )}
                      {isCitizen && ["ASSIGNED", "IN_PROGRESS"].includes(r.status) && (
                        <button onClick={() => handleConfirmRescued(r.requestId)} 
                          className="btn-primary !bg-brand-green !py-1 !px-2 text-xs flex items-center gap-1">
                          <HeartHandshake size={14} /> Đã cứu
                        </button>
                      )}
                      {isAdmin && req.status === "PENDING" && (
                         <button onClick={() => setShowAssignModal(r.requestId)} 
                          className="btn-secondary !py-1 !px-2 text-xs border-primary text-primary hover:bg-tint-lavender">
                          <UserPlus size={14} /> Điều phối
                        </button>
                      )}
                      {isStaff && req.status === "ASSIGNED" && (
                        <>
                          <button onClick={() => updateStatus(r.requestId, "IN_PROGRESS")} 
                            className="btn-primary !py-1 !px-2 text-xs border-brand-teal bg-brand-teal">
                            <CheckCircle size={14} /> Tiếp nhận
                          </button>
                          <button onClick={() => {
                            const reason = prompt("Lý do từ chối nhiệm vụ (Hỏng xe, hết xăng...):");
                            if (reason) updateStatus(r.requestId, "CANCELLED");
                          }} className="btn-secondary !py-1 !px-2 text-xs border-error text-error hover:bg-tint-rose">
                            Từ chối
                          </button>
                        </>
                      )}
                      {isStaff && req.status === "IN_PROGRESS" && (
                        <button onClick={() => {
                          prompt("Bạn đã cứu hộ thành công! Vui lòng dán link hình ảnh minh chứng (nếu có):");
                          updateStatus(r.requestId, "COMPLETED");
                        }} 
                          className="btn-primary !py-1 !px-2 text-xs !bg-brand-green">
                          <CheckCircle size={14} /> Hoàn thành
                        </button>
                      )}
                      {(isStaff || isCitizen) && ["PENDING", "ASSIGNED"].includes(req.status) && (
                        <button onClick={() => updateStatus(r.requestId, "CANCELLED")} 
                          className="btn-secondary !py-1 !px-2 text-xs border-error text-error hover:bg-tint-rose">
                          <XCircle size={14} /> Hủy
                        </button>
                      )}
                      {/* FR-3.2 Navigation */}
                      {(isStaff || isCitizen) && ["ASSIGNED", "IN_PROGRESS"].includes(req.status) && req.latitude && req.longitude && (
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${req.latitude},${req.longitude}`} target="_blank" rel="noreferrer"
                          className="btn-secondary !py-1 !px-2 text-xs border-link text-link hover:bg-link hover:text-white flex items-center gap-1">
                          <Navigation size={14} /> Dẫn đường
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-ink mb-2">Điều phối đội cứu hộ</h3>
            <p className="text-xs text-slate mb-4">Hệ thống tính toán không gian và gợi ý các đội rảnh gần nhất.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(() => {
                const targetReq = requests.find(r => r.requestId === showAssignModal);
                const available = teams.filter(t => t.status === "ACTIVE").map(team => {
                  let distance = 99999;
                  if (targetReq?.latitude && targetReq?.longitude && team.latitude && team.longitude) {
                    distance = calculateDistance(targetReq.latitude, targetReq.longitude, team.latitude, team.longitude);
                  }
                  return { ...team, distance };
                }).sort((a, b) => a.distance - b.distance);

                if (available.length === 0) return <p className="text-sm text-slate py-4">Không có đội nào đang rảnh (ACTIVE)</p>;
                return available.map((t, index) => (
                  <button key={t.teamId} onClick={() => handleAssign(showAssignModal, t.teamId)}
                    className={`flex items-center justify-between w-full p-3 rounded-md border transition-colors ${index < 3 ? 'border-primary bg-primary/5 hover:bg-primary/10' : 'border-hairline hover:bg-surface'}`}>
                    <div className="text-left">
                      <p className="text-sm font-medium text-ink flex items-center gap-2">
                        {t.teamName} 
                        {index === 0 && t.distance < 99999 && <span className="badge-green !py-0.5 !px-1.5 !text-[9px]">Gần nhất</span>}
                      </p>
                      <p className="text-xs text-slate">{t.memberCount} thành viên · {t.contactPhone}</p>
                      {t.distance < 99999 && (
                        <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                          <MapPin size={12}/> Cách ~{t.distance.toFixed(1)} km
                        </p>
                      )}
                      {t.vehicleNames && t.vehicleNames.length > 0 && (
                        <p className="text-[10px] text-brand-teal font-medium mt-1">
                          🚛 {t.vehicleNames.join(", ")}
                        </p>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-slate shrink-0" />
                  </button>
                ));
              })()}
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
