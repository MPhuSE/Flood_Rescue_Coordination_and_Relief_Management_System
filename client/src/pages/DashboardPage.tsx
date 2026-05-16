import { useEffect, useState } from "react";
import { LifeBuoy, Users, Truck, Package, Shield, AlertTriangle, TrendingUp, Activity, HeartHandshake, CheckCircle, Zap } from "lucide-react";
import { adminApi, rescueApi, alertApi, reliefApi } from "../services/apiService";
import { useUserStore } from "../hooks/useUserStore";
import type { DashboardStats, RescueRequest, FloodAlert, ReliefDistribution } from "../types/rescue";

const statCards = [
  { key: "totalRescueRequests", label: "Yêu cầu cứu hộ", icon: <LifeBuoy size={20} />, color: "bg-tint-lavender text-primary" },
  { key: "totalTeams", label: "Đội cứu hộ", icon: <Users size={20} />, color: "bg-tint-sky text-link-blue" },
  { key: "totalVehicles", label: "Phương tiện", icon: <Truck size={20} />, color: "bg-tint-mint text-brand-green" },
  { key: "totalReliefItems", label: "Hàng cứu trợ", icon: <Package size={20} />, color: "bg-tint-peach text-brand-orange-deep" },
  { key: "totalShelters", label: "Điểm an toàn", icon: <Shield size={20} />, color: "bg-tint-yellow text-brand-yellow" },
  { key: "totalAlerts", label: "Cảnh báo lũ", icon: <AlertTriangle size={20} />, color: "bg-tint-rose text-error" },
] as const;

const statusColors: Record<string, string> = {
  PENDING: "badge-orange", 
  ASSIGNED: "badge-blue", 
  IN_PROGRESS: "badge-purple",
  COMPLETED: "badge-green", 
  CANCELLED: "badge-red", 
  CRITICAL: "badge-red",
  HIGH: "badge-orange", 
  MEDIUM: "badge-blue", 
  LOW: "badge-green",
  EMERGENCY: "badge-red", 
  WARNING: "badge-orange", 
  WATCH: "badge-blue", 
  ADVISORY: "badge-purple",
};

export function DashboardPage() {
  const profile = useUserStore(s => s.profile);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RescueRequest[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<FloodAlert[]>([]);
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "COORDINATOR";

  // Analytics State
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState("0h");

  useEffect(() => {
    if (isAdmin) {
      adminApi.getDashboard().then(setStats).catch(() => {});
      reliefApi.getDistributions().then(d => {
         const total = d?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
         setTotalDistributed(total);
      }).catch(() => {});
    }
    rescueApi.getAll().then(r => {
      setRecentRequests(r?.slice(0, 5) || []);
      const completed = r?.filter(req => req.status === "COMPLETED") || [];
      const saved = completed.reduce((sum, req) => sum + (req.numberOfPeople || 1), 0);
      setTotalSaved(saved);
      
      let totalHours = 0;
      let validCount = 0;
      completed.forEach(req => {
        if (req.createdTime && req.updatedTime) {
           const cTime = new Date(req.createdTime).getTime();
           const uTime = new Date(req.updatedTime).getTime();
           const hours = (uTime - cTime) / (1000 * 60 * 60);
           if (hours > 0 && hours < 24*30) { totalHours += hours; validCount++; } // Avoid negative or crazy values
        }
      });
      if (validCount > 0) setAvgResponseTime((totalHours / validCount).toFixed(1) + "h");
      else setAvgResponseTime("< 1h");
    }).catch(() => {});
    alertApi.getAll().then(a => setActiveAlerts(a?.slice(0, 3) || [])).catch(() => {});
  }, [isAdmin]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Welcome Section */}
      <div className="card !bg-brand-navy !border-none p-10 relative overflow-hidden shadow-mockup">
        <div className="absolute top-0 right-0 p-8 opacity-20 hidden md:block">
           <LifeBuoy size={200} className="text-white rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-2 py-0.5 rounded bg-primary text-[10px] font-bold text-white uppercase tracking-wider">Hệ thống cứu hộ v1.0</div>
            <div className="flex items-center gap-1">
               <Activity size={12} className="text-brand-green" />
               <span className="text-[10px] font-semibold text-brand-green uppercase tracking-wider">Trực tuyến</span>
            </div>
          </div>
          <h1 className="hero-display !text-4xl lg:!text-5xl text-white mb-2 leading-tight">
            Xin chào, {profile?.fullName || "User"}.
          </h1>
          <p className="text-lg text-white/70 max-w-xl font-medium mb-6">
            Cùng nỗ lực điều phối và cứu hộ để giảm thiểu thiệt hại do thiên tai gây ra.
          </p>
          <div className="flex items-center gap-3">
            <button className="btn-primary">
              Xem báo cáo chi tiết
            </button>
            <button className="btn-secondary !text-white !border-white/20 !bg-white/5 hover:!bg-white/10">
              Hướng dẫn sử dụng
            </button>
          </div>
        </div>
      </div>

      {/* FR-5.2 Analytics Advanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-brand-green/20 to-brand-green/5 border-none shadow-mockup relative overflow-hidden">
          <HeartHandshake className="absolute right-[-20px] bottom-[-20px] text-brand-green/20" size={120} />
          <h3 className="text-sm font-semibold text-brand-green mb-1 uppercase tracking-wider">Tổng số người đã cứu</h3>
          <p className="text-4xl font-bold text-ink mt-2">{totalSaved} <span className="text-base font-medium text-slate">người</span></p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-brand-green bg-white/50 w-fit px-2 py-1 rounded-md">
            <CheckCircle size={14} /> An toàn
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-brand-orange-deep/20 to-brand-orange-deep/5 border-none shadow-mockup relative overflow-hidden">
          <Package className="absolute right-[-20px] bottom-[-20px] text-brand-orange-deep/20" size={120} />
          <h3 className="text-sm font-semibold text-brand-orange-deep mb-1 uppercase tracking-wider">Nhu yếu phẩm đã phát</h3>
          <p className="text-4xl font-bold text-ink mt-2">{totalDistributed} <span className="text-base font-medium text-slate">đơn vị</span></p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-brand-orange-deep bg-white/50 w-fit px-2 py-1 rounded-md">
            <TrendingUp size={14} /> Cứu trợ đến tay dân
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-none shadow-mockup relative overflow-hidden">
          <Zap className="absolute right-[-20px] bottom-[-20px] text-primary/20" size={120} />
          <h3 className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Hiệu suất phản ứng TB</h3>
          <p className="text-4xl font-bold text-ink mt-2">{avgResponseTime}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary bg-white/50 w-fit px-2 py-1 rounded-md">
            <Activity size={14} /> Thời gian từ SOS tới lúc Cứu xong
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {isAdmin && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map(c => (
            <div key={c.key} className="card p-4 hover:shadow-mockup transition-shadow duration-200 bg-white">
              <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
                {c.icon}
              </div>
              <p className="text-2xl font-semibold text-ink">{(stats as unknown as Record<string, number>)[c.key] ?? 0}</p>
              <p className="text-xs text-slate mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-4 border-b border-hairline">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> Yêu cầu cứu hộ gần đây
            </h3>
          </div>
          <div className="divide-y divide-hairline-soft">
            {recentRequests.length === 0 ? (
              <p className="p-4 text-sm text-slate">Chưa có yêu cầu nào</p>
            ) : recentRequests.map(req => (
              <div key={req.requestId} className="flex items-center justify-between p-4 hover:bg-surface-soft transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{req.description}</p>
                  <p className="text-xs text-slate mt-0.5">📍 {req.location}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className={statusColors[req.urgencyLevel] || "badge-soft-purple"}>{req.urgencyLevel}</span>
                  <span className={statusColors[req.status] || "badge-soft-purple"}>{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-hairline">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <AlertTriangle size={16} className="text-semantic-error" /> Cảnh báo thiên tai
            </h3>
          </div>
          <div className="divide-y divide-hairline-soft">
            {activeAlerts.length === 0 ? (
              <p className="p-4 text-sm text-slate">Không có cảnh báo</p>
            ) : activeAlerts.map(alert => (
              <div key={alert.id} className="p-4 hover:bg-surface-soft transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className={statusColors[alert.severity] || "badge-red"}>{alert.severity}</span>
                </div>
                <p className="text-sm font-medium text-ink">{alert.title}</p>
                <p className="text-xs text-slate mt-1">📍 {alert.locationArea}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Status Chart (simple bar visualization) */}
      {isAdmin && stats?.requestsByStatus && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">Phân bố trạng thái yêu cầu</h3>
          <div className="space-y-3">
            {Object.entries(stats.requestsByStatus).map(([status, count]) => {
              const total = Object.values(stats.requestsByStatus).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate w-24 shrink-0">{status}</span>
                  <div className="flex-1 h-6 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-ink w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
