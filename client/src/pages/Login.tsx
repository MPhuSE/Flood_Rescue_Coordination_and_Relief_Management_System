import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/button";
import { getAuthErrorMessage } from "../modules/auth/auth.utils";
import { login, persistAuthSession } from "../modules/auth/auth.service";

type LoginFormState = {
  password: string;
  rememberMe: boolean;
  username: string;
};

const initialFormState: LoginFormState = {
  password: "",
  rememberMe: true,
  username: "",
};

function LoginPage() {
  const navigate = useNavigate();
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
    setErrorMessage("");
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/rescue-request");
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
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900">
              Đăng nhập hệ thống
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Sử dụng tài khoản được cấp để truy cập hệ thống điều phối cứu hộ và
              quản lý hỗ trợ.
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
            <SimpleInput
              autoComplete="username"
              id="username"
              label="Tên đăng nhập *"
              onChange={(event) => updateField("username", event.target.value)}
              placeholder="Nhập tên đăng nhập"
              value={formState.username}
            />

            <PasswordField
              autoComplete="current-password"
              id="password"
              label="Mật khẩu *"
              onChange={(event) => updateField("password", event.target.value)}
              onToggleVisibility={() => setShowPassword((current) => !current)}
              placeholder="Nhập mật khẩu"
              showPassword={showPassword}
              value={formState.password}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <input
                    checked={formState.rememberMe}
                    className="peer absolute inset-0 opacity-0"
                    onChange={(event) =>
                      updateField("rememberMe", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="h-5 w-5 rounded-md border border-slate-300 bg-white transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500" />
                  {formState.rememberMe ? (
                    <span className="pointer-events-none absolute text-white">
                      <CheckIcon />
                    </span>
                  ) : null}
                </span>
                Nhớ phiên đăng nhập trên máy này
              </label>

              <p className="text-sm text-slate-500">
                Chưa có tài khoản?{" "}
                <Link
                  className="font-medium text-emerald-700 transition hover:text-emerald-800"
                  to="/register"
                >
                  Đăng ký
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
              className="w-full rounded-2xl"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

type SimpleInputProps = {
  autoComplete?: string;
  id: string;
  label: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  type?: string;
  value: string;
};

function SimpleInput({
  autoComplete,
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
        autoComplete={autoComplete}
        className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  );
}

type PasswordFieldProps = Omit<SimpleInputProps, "type"> & {
  onToggleVisibility: () => void;
  showPassword: boolean;
};

function PasswordField({
  autoComplete,
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
      <div className="flex h-14 items-center rounded-2xl border border-slate-200 px-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
        <input
          autoComplete={autoComplete}
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
    </div>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
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

export default LoginPage;
