import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/button";
import SectionLabel from "../components/common/section-label";
import SurfaceCard from "../components/common/surface-card";
import InputField from "../components/form/input-field";
import { register } from "../modules/auth/auth.service";
import { getAuthErrorMessage } from "../modules/auth/auth.utils";
import AuthShell from "../modules/auth/components/auth-shell";
import AuthShowcase from "../modules/auth/components/auth-showcase";
import {
  ArrowRightIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  ProfileIcon,
  ShieldIcon,
  UserIcon,
} from "../modules/auth/components/auth-icons";

type RegisterFormState = {
  confirmPassword: string;
  email: string;
  fullName: string;
  password: string;
  phone: string;
  username: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterFormState, string>>;

const helperNotes = [
  {
    title: "Tạo tài khoản mới",
    description:
      "Khai báo đầy đủ thông tin để hệ thống cấp quyền và quản lý liên hệ hỗ trợ.",
  },
  {
    title: "Đăng nhập sau khi tạo",
    description:
      "Sau khi đăng ký thành công, bạn có thể quay lại trang đăng nhập để sử dụng hệ thống.",
  },
];

const showcaseMetrics = [
  { label: "Điểm hỗ trợ đang theo dõi", value: "18" },
  { label: "Nhóm cứu hộ sẵn sàng", value: "12" },
  { label: "Kênh tiếp nhận thông tin", value: "24/7" },
];

const showcaseHighlights = [
  "Tạo tài khoản mới cho nhân sự vận hành và hỗ trợ hiện trường.",
  "Lưu thông tin liên hệ để phối hợp nhanh khi có tình huống khẩn cấp.",
  "Giữ cùng ngôn ngữ giao diện với trang đăng nhập để dễ làm quen.",
];

const initialFormState: RegisterFormState = {
  confirmPassword: "",
  email: "",
  fullName: "",
  password: "",
  phone: "",
  username: "",
};

function validateForm(formState: RegisterFormState) {
  const errors: RegisterFormErrors = {};

  if (!formState.fullName.trim()) {
    errors.fullName = "Vui lòng nhập họ và tên.";
  }

  if (formState.username.trim().length < 4) {
    errors.username = "Tên đăng nhập phải có ít nhất 4 ký tự.";
  }

  if (!formState.phone.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại.";
  }

  const email = formState.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không đúng định dạng.";
  }

  if (formState.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (formState.confirmPassword !== formState.password) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  return errors;
}

function RegisterPage() {
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = <K extends keyof RegisterFormState>(
    field: K,
    value: RegisterFormState[K]
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formState);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSuccessMessage("");
      setErrorMessage("Vui lòng kiểm tra lại các trường thông tin.");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const authSession = await register({
        fullName: formState.fullName.trim(),
        username: formState.username.trim(),
        password: formState.password,
        phone: formState.phone.trim(),
        ...(formState.email.trim() ? { email: formState.email.trim() } : {}),
      });

      setSuccessMessage(
        authSession.message ||
          "Đăng ký thành công. Bạn có thể quay lại trang đăng nhập."
      );
      setFormState(initialFormState);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "Không thể đăng ký. Vui lòng kiểm tra lại thông tin."
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
          description="Trang đăng ký được thiết kế cùng phong cách với đăng nhập để người dùng mới có thể tạo tài khoản nhanh, rõ ràng và không bị rối."
          eyebrow="Đăng ký tài khoản vận hành"
          highlights={showcaseHighlights}
          metrics={showcaseMetrics}
          title={
            <>
              Tạo tài khoản mới cho{" "}
              <span className="text-gradient">hệ thống cứu hộ</span> và điều phối
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
              <SectionLabel label="Đăng ký tài khoản" />
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-2 text-sm text-muted-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary text-white">
                  <ShieldIcon />
                </span>
                <span>Xác thực bảo mật</span>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-[2.5rem]">
                Tạo tài khoản để bắt đầu sử dụng hệ thống.
              </h2>
              <p className="mt-3 max-w-lg text-base leading-7 text-muted-foreground">
                Điền thông tin cơ bản để tạo tài khoản mới. Sau khi đăng ký
                thành công, bạn có thể quay lại trang đăng nhập để truy cập hệ
                thống.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                error={fieldErrors.fullName}
                id="fullName"
                label="Họ và tên"
                leadingAdornment={<ProfileIcon />}
                name="fullName"
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Nhập họ và tên"
                type="text"
                value={formState.fullName}
              />

              <InputField
                error={fieldErrors.username}
                id="username"
                label="Tên đăng nhập"
                leadingAdornment={<UserIcon />}
                name="username"
                onChange={(event) => updateField("username", event.target.value)}
                placeholder="Tối thiểu 4 ký tự"
                type="text"
                value={formState.username}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                error={fieldErrors.phone}
                id="phone"
                label="Số điện thoại"
                leadingAdornment={<PhoneIcon />}
                name="phone"
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Nhập số điện thoại"
                type="tel"
                value={formState.phone}
              />

              <InputField
                error={fieldErrors.email}
                id="email"
                label="Email"
                leadingAdornment={<MailIcon />}
                name="email"
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Nhập email liên hệ"
                type="email"
                value={formState.email}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                error={fieldErrors.password}
                id="password"
                label="Mật khẩu"
                leadingAdornment={<LockIcon />}
                name="password"
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Ít nhất 6 ký tự"
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

              <InputField
                error={fieldErrors.confirmPassword}
                id="confirmPassword"
                label="Xác nhận mật khẩu"
                leadingAdornment={<LockIcon />}
                name="confirmPassword"
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                placeholder="Nhập lại mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                value={formState.confirmPassword}
                action={
                  <button
                    className="rounded-full px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    type="button"
                  >
                    {showConfirmPassword ? "Ẩn" : "Hiện"}
                  </button>
                }
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link
                  className="font-medium text-accent transition-colors hover:text-accent-secondary"
                  to="/login"
                >
                  Đăng nhập ngay
                </Link>
              </p>
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
              {isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}
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

export default RegisterPage;
