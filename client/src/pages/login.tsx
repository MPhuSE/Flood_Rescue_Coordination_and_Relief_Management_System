import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/button";
import SectionLabel from "../components/common/section-label";
import SurfaceCard from "../components/common/surface-card";
import InputField from "../components/form/input-field";
import { getAuthErrorMessage } from "../modules/auth/auth.utils";
import { login, persistAuthSession } from "../modules/auth/auth.service";
import AuthShell from "../modules/auth/components/auth-shell";
import AuthShowcase from "../modules/auth/components/auth-showcase";
import {
  ArrowRightIcon,
  LockIcon,
  ShieldIcon,
  UserIcon,
} from "../modules/auth/components/auth-icons";

type LoginFormState = {
  password: string;
  rememberMe: boolean;
  username: string;
};

const helperNotes = [
  {
    title: "Đăng nhập an toàn",
    description: "Thông tin được gửi trực tiếp đến hệ thống qua API bảo mật.",
  },
  {
    title: "Lưu phiên làm việc",
    description:
      "Bạn có thể ghi nhớ phiên trên thiết bị này để thao tác nhanh hơn.",
  },
];

const showcaseMetrics = [
  { label: "Điểm hỗ trợ đang theo dõi", value: "18" },
  { label: "Nhóm cứu hộ sẵn sàng", value: "12" },
  { label: "Trạng thái hệ thống", value: "Ổn định" },
];

const showcaseHighlights = [
  "Cập nhật nhanh thông tin mưa lũ và yêu cầu hỗ trợ.",
  "Theo dõi tình hình điều phối cứu hộ trên một giao diện thống nhất.",
  "Đảm bảo truy cập an toàn cho người trực hệ thống.",
];

const initialFormState: LoginFormState = {
  password: "",
  rememberMe: true,
  username: "",
};

function LoginPage() {
  const [formState, setFormState] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const updateField = <K extends keyof LoginFormState>(
    field: K,
    value: LoginFormState[K]
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const username = formState.username.trim();
    const password = formState.password.trim();

    if (!username || !password) {
      setSuccessMessage("");
      setErrorMessage("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const authSession = await login({ username, password });
      persistAuthSession(authSession, formState.rememberMe);

      setSuccessMessage(
        authSession.message ||
          "Đăng nhập thành công. Phiên làm việc đã được khởi tạo."
      );
      setFormState((current) => ({
        ...current,
        password: "",
      }));
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      showcase={
        <AuthShowcase
          badgeLabel="Flood Rescue"
          description="Giao diện được thiết kế gọn gàng, dễ nhìn và phù hợp cho môi trường vận hành thực tế, nơi thông tin cần rõ ràng và truy cập phải nhanh chóng."
          eyebrow="Hệ thống hỗ trợ điều phối cứu hộ"
          highlights={showcaseHighlights}
          metrics={showcaseMetrics}
          title={
            <>
              Đăng nhập hệ thống{" "}
              <span className="text-gradient">cứu hộ lũ lụt</span> và quản lý
              hỗ trợ thiên tai.
            </>
          }
        />
      }
    >
      <SurfaceCard className="overflow-hidden" contentClassName="p-0">
        <div className="h-1.5 w-full bg-gradient-to-r from-accent to-accent-secondary" />
        <div className="space-y-7 px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <SectionLabel label="Đăng nhập hệ thống" />
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-2 text-sm text-muted-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary text-white">
                  <ShieldIcon />
                </span>
                <span>Bảo mật JWT</span>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-[2.5rem]">
                Đăng nhập để truy cập trung tâm điều phối cứu hộ.
              </h2>
              <p className="mt-3 max-w-lg text-base leading-7 text-muted-foreground">
                Sử dụng tài khoản được cấp để tiếp nhận thông tin khẩn cấp, theo
                dõi tình hình và cập nhật tiến độ xử lý cứu trợ.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <InputField
              autoComplete="username"
              id="username"
              label="Tên đăng nhập"
              leadingAdornment={<UserIcon />}
              name="username"
              onChange={(event) => updateField("username", event.target.value)}
              placeholder="Nhập tên đăng nhập"
              type="text"
              value={formState.username}
            />

            <InputField
              autoComplete="current-password"
              id="password"
              label="Mật khẩu"
              leadingAdornment={<LockIcon />}
              name="password"
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              value={formState.password}
              action={
                <button
                  className="rounded-full px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              }
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-3 text-sm text-muted-foreground">
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <input
                    checked={formState.rememberMe}
                    className="peer absolute inset-0 cursor-pointer opacity-0"
                    onChange={(event) =>
                      updateField("rememberMe", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="h-5 w-5 rounded-md border border-border bg-background transition peer-checked:border-accent peer-checked:bg-gradient-to-br peer-checked:from-accent peer-checked:to-accent-secondary" />
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition peer-checked:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m5 12 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                    />
                  </svg>
                </span>
                <span className="font-medium text-foreground">
                  Nhớ phiên đăng nhập trên máy này
                </span>
              </label>

              <Link
                className="text-sm font-medium text-accent transition-colors hover:text-accent-secondary"
                to="/register"
              >
                Chưa có tài khoản? Đăng ký
              </Link>
            </div>

            {errorMessage ? (
              <div
                aria-live="polite"
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div
                aria-live="polite"
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                {successMessage}
              </div>
            ) : null}

            <Button
              aria-busy={isSubmitting}
              className="w-full"
              disabled={isSubmitting}
              trailingIcon={<ArrowRightIcon />}
              type="submit"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            {helperNotes.map((item) => (
              <SurfaceCard
                key={item.title}
                className="h-full"
                contentClassName="p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />
                  <div>
                    <p className="font-medium tracking-[-0.01em] text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </SurfaceCard>
    </AuthShell>
  );
}

export default LoginPage;
