type IconName = "brand" | "user" | "credential" | "mail" | "lock" | "phone" | "pin" | "role";

const textFields = [
  { name: "fullName", placeholder: "Họ và tên", type: "text", icon: "user" as const },
  { name: "username", placeholder: "Tên đăng nhập", type: "text", icon: "credential" as const },
  { name: "email", placeholder: "Email", type: "email", icon: "mail" as const },
  { name: "password", placeholder: "Mật khẩu", type: "password", icon: "lock" as const },
  { name: "phone", placeholder: "Số điện thoại", type: "tel", icon: "phone" as const },
  { name: "address", placeholder: "Địa chỉ", type: "text", icon: "pin" as const },
];

function Icon({ name }: { name: IconName }) {
  switch (name) {
    case "brand":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="6.75" />
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v5.25" />
          <path d="M12 16.75V22" />
          <path d="M2 12h5.25" />
          <path d="M16.75 12H22" />
          <path d="m5 5 3.75 3.75" />
          <path d="m15.25 15.25 3.75 3.75" />
          <path d="m19 5-3.75 3.75" />
          <path d="M8.75 15.25 5 19" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
    case "credential":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M7 10h4" />
          <path d="M7 14h2" />
          <circle cx="16.5" cy="12" r="2.25" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m5.5 7.5 6.5 5 6.5-5" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2.5" />
          <path d="M8 11V8.5a4 4 0 1 1 8 0V11" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.5 3.5h2.75l1.25 4.75-1.9 1.9a15.25 15.25 0 0 0 4.25 4.25l1.9-1.9 4.75 1.25v2.75a2 2 0 0 1-2 2A16.5 16.5 0 0 1 5.5 5.5a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "pin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s6-5.1 6-10.5a6 6 0 1 0-12 0C6 15.9 12 21 12 21Z" />
          <circle cx="12" cy="10.5" r="2.5" />
        </svg>
      );
    case "role":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
          <path d="M17 10a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 17 10Z" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M14.25 18.5a4.25 4.25 0 0 1 6.25-3.75" />
        </svg>
      );
    default:
      return null;
  }
}

function FormField({
  name,
  placeholder,
  type,
  icon,
}: {
  name: string;
  placeholder: string;
  type: string;
  icon: IconName;
}) {
  return (
    <label className="input-row" htmlFor={name}>
      <span className="field-icon">
        <Icon name={icon} />
      </span>
      <input id={name} name={name} className="field-control" type={type} placeholder={placeholder} />
    </label>
  );
}

export default function App() {
  return (
    <main className="register-shell">
      <div className="ambient-shape ambient-shape-left" aria-hidden="true" />
      <div className="ambient-shape ambient-shape-right" aria-hidden="true" />

      <section className="register-card reveal-up" aria-labelledby="register-title">
        <div className="brand-mark" aria-hidden="true">
          <Icon name="brand" />
        </div>

        <header className="register-header">
          <h1 id="register-title">Rescue System</h1>
          <p>Tạo tài khoản mới</p>
        </header>

        <form className="register-form" onSubmit={(event) => event.preventDefault()}>
          {textFields.map((field) => (
            <FormField key={field.name} {...field} />
          ))}

          <label className="input-row input-row-select" htmlFor="role">
            <span className="field-icon">
              <Icon name="role" />
            </span>
            <select id="role" name="role" className="field-control field-select" defaultValue="">
              <option value="" disabled>
                Chọn vai trò
              </option>
              <option value="citizen">Người dân</option>
              <option value="rescue-team">Đội cứu hộ</option>
              <option value="coordinator">Điều phối viên</option>
              <option value="manager">Quản lý cứu trợ</option>
            </select>
            <span className="select-arrow" aria-hidden="true">
              <svg viewBox="0 0 20 20">
                <path d="m5 7.5 5 5 5-5" />
              </svg>
            </span>
          </label>

          <button className="submit-button" type="submit">
            Đăng ký
          </button>
        </form>

        <p className="signin-copy">
          Đã có tài khoản? <a href="/">Đăng nhập</a>
        </p>
      </section>
    </main>
  );
}
