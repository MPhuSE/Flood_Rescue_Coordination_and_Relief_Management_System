import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LifeBuoy, Eye, EyeOff } from "lucide-react";
import { authActions } from "../store/authStore";
import { useAuthStore } from "../hooks/useAuthStore";

export function LoginPage() {
  const navigate = useNavigate();
  const status = useAuthStore(s => s.status);
  const error = useAuthStore(s => s.error);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await authActions.login(form);
      navigate("/dashboard");
    } catch { /* error is in store */ }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-navy-deep text-white flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <LifeBuoy size={22} />
            </div>
            <span className="text-lg font-semibold">Flood Rescue</span>
          </div>
          <h2 className="text-4xl font-semibold leading-tight mb-4">
            Hệ thống Điều phối<br />Cứu hộ Lũ lụt
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Quản lý tập trung hoạt động cứu hộ – cứu trợ, hỗ trợ tiếp nhận yêu cầu,
            định vị, phân loại mức độ khẩn cấp và điều phối lực lượng.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {["Cứu hộ nhanh", "Điều phối", "Bản đồ", "Cảnh báo lũ"].map(t => (
            <span key={t} className="px-3 py-1.5 rounded-full border border-white/20 text-xs text-white/70">{t}</span>
          ))}
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-canvas">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <LifeBuoy size={22} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-ink">Flood Rescue</span>
          </div>

          <h1 className="text-2xl font-semibold text-ink mb-1">Đăng nhập</h1>
          <p className="text-sm text-slate mb-8">Sử dụng tài khoản để truy cập hệ thống</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-md bg-semantic-error/10 text-semantic-error text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Tên đăng nhập</label>
              <input type="text" className="input-field" placeholder="admin" autoFocus
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} className="input-field pr-10" placeholder="••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={status === "loading"}
              className="btn-primary w-full h-11">
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : "Đăng nhập"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Đăng ký</Link>
          </p>

          {/* Quick login hints */}
          <div className="mt-8 p-4 rounded-lg bg-surface border border-hairline">
            <p className="text-xs font-medium text-slate mb-2">Tài khoản test:</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-ink">
              <span>admin / admin123</span>
              <span>demo / demo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
