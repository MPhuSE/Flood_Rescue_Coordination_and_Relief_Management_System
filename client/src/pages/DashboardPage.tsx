import { useEffect, useState } from "react";
import { LifeBuoy, Users, Truck, Package, Shield, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { adminApi, rescueApi, alertApi } from "../services/apiService";
import { useUserStore } from "../hooks/useUserStore";
import type { DashboardStats, RescueRequest, FloodAlert } from "../types/rescue";

const statCards = [
  { key: "totalRescueRequests", label: "Yêu cầu cứu hộ", icon: <LifeBuoy size={20} />, color: "bg-primary/10 text-primary" },
  { key: "totalTeams", label: "Đội cứu hộ", icon: <Users size={20} />, color: "bg-tint-sky text-link" },
  { key: "totalVehicles", label: "Phương tiện", icon: <Truck size={20} />, color: "bg-tint-mint text-brand-green" },
  { key: "totalReliefItems", label: "Hàng cứu trợ", icon: <Package size={20} />, color: "bg-tint-peach text-brand-orange-deep" },
  { key: "totalShelters", label: "Điểm an toàn", icon: <Shield size={20} />, color: "bg-tint-lavender text-brand-purple-800" },
  { key: "totalAlerts", label: "Cảnh báo lũ", icon: <AlertTriangle size={20} />, color: "bg-tint-rose text-brand-pink-deep" },
] as const;

const statusColors: Record<string, string> = {
  PENDING: "badge-soft-orange", ASSIGNED: "badge-blue", IN_PROGRESS: "badge-purple",
  COMPLETED: "badge-green", CANCELLED: "badge-red", CRITICAL: "badge-red",
  HIGH: "badge-orange", MEDIUM: "badge-blue", LOW: "badge-soft-green",
  EMERGENCY: "badge-red", WARNING: "badge-orange", WATCH: "badge-blue", ADVISORY: "badge-soft-purple",
};

export function DashboardPage() {
  const profile = useUserStore(s => s.profile);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RescueRequest[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<FloodAlert[]>([]);
  const isAdmin = profile?.role === "ADMIN";

  useEffect(() => {
    if (isAdmin) adminApi.getDashboard().then(setStats).catch(() => {});
    rescueApi.getAll().then(r => setRecentRequests(r?.slice(0, 5) || [])).catch(() => {});
    alertApi.getAll().then(a => setActiveAlerts(a?.slice(0, 3) || [])).catch(() => {});
  }, [isAdmin]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink">Xin chào, {profile?.fullName || "User"} 👋</h1>
            <p className="text-sm text-slate mt-1">Tổng quan hoạt động cứu hộ – cứu trợ hôm nay</p>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-semantic-success" />
            <span className="text-sm font-medium text-semantic-success">Hệ thống hoạt động</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {isAdmin && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map(c => (
            <div key={c.key} className="card p-4 hover:shadow-mockup transition-shadow duration-200">
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
              <div key={req.id} className="flex items-center justify-between p-4 hover:bg-surface-soft transition-colors">
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
