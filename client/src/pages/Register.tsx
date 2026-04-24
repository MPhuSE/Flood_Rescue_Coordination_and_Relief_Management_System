import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/button";
import { register } from "../modules/auth/auth.service";
import { getAuthErrorMessage } from "../modules/auth/auth.utils";

type RegisterFormState = {
  confirmPassword: string;
  email: string;
  fullName: string;
  password: string;
  phone: string;
  username: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterFormState, string>>;

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
  const navigate = useNavigate();
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
    setErrorMessage("");
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/login");
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
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900">
              Đăng ký tài khoản
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Điền các thông tin cần thiết để tạo tài khoản mới cho hệ thống cứu
              hộ và điều phối hỗ trợ.
            </p>
          </div>

          <button
            aria-label="Đóng"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={handleClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <SimpleInput
                error={fieldErrors.fullName}
                id="fullName"
                label="Họ và tên *"
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Nhập họ và tên"
                value={formState.fullName}
              />

              <SimpleInput
                error={fieldErrors.username}
                id="username"
                label="Tên đăng nhập *"
                onChange={(event) => updateField("username", event.target.value)}
                placeholder="Tối thiểu 4 ký tự"
                value={formState.username}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SimpleInput
                error={fieldErrors.phone}
                id="phone"
                label="Số điện thoại *"
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Nhập số điện thoại"
                type="tel"
                value={formState.phone}
              />

              <SimpleInput
                error={fieldErrors.email}
                id="email"
                label="Email"
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Nhập email liên hệ"
                type="email"
                value={formState.email}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <PasswordField
                error={fieldErrors.password}
                id="password"
                label="Mật khẩu *"
                onChange={(event) => updateField("password", event.target.value)}
                onToggleVisibility={() => setShowPassword((current) => !current)}
                placeholder="Ít nhất 6 ký tự"
                showPassword={showPassword}
                value={formState.password}
              />

              <PasswordField
                error={fieldErrors.confirmPassword}
                id="confirmPassword"
                label="Xác nhận mật khẩu *"
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                onToggleVisibility={() =>
                  setShowConfirmPassword((current) => !current)
                }
                placeholder="Nhập lại mật khẩu"
                showPassword={showConfirmPassword}
                value={formState.confirmPassword}
              />
            </div>

            <p className="text-sm text-slate-500">
              Đã có tài khoản?{" "}
              <Link
                className="font-medium text-emerald-700 transition hover:text-emerald-800"
                to="/login"
              >
                Đăng nhập
              </Link>
            </p>

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
              className="w-full rounded-2xl"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

type SimpleInputProps = {
  error?: string;
  id: string;
  label: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  type?: string;
  value: string;
};

function SimpleInput({
  error,
  id,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: SimpleInputProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-900" htmlFor={id}>
        {label}
      </label>
      <input
        className={`h-14 w-full rounded-2xl border px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
        }`}
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

type PasswordFieldProps = Omit<SimpleInputProps, "type"> & {
  onToggleVisibility: () => void;
  showPassword: boolean;
};

function PasswordField({
  error,
  id,
  label,
  onChange,
  onToggleVisibility,
  placeholder,
  showPassword,
  value,
}: PasswordFieldProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-900" htmlFor={id}>
        {label}
      </label>
      <div
        className={`flex h-14 items-center rounded-2xl border px-4 transition focus-within:ring-4 ${
          error
            ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100"
            : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-100"
        }`}
      >
        <input
          className="h-full w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
          id={id}
          onChange={onChange}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          value={value}
        />
        <button
          className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          onClick={onToggleVisibility}
          type="button"
        >
          {showPassword ? "Ẩn" : "Hiện"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 6 18 18M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default RegisterPage;
