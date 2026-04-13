import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/button";
import SectionLabel from "../components/common/section-label";
import SurfaceCard from "../components/common/surface-card";
import InputField from "../components/form/input-field";
import SelectField from "../components/form/select-field";
import TextareaField from "../components/form/textarea-field";
import { cn } from "../lib/cn";
import {
  submitRescueRequest,
  type FloodLevel,
  type RescueRequestSubmission,
  type SupportNeed,
  type UrgencyLevel,
} from "../modules/citizen/rescue-request.service";

type RescueRequestFormState = {
  address: string;
  agreeToShare: boolean;
  alternatePhone: string;
  childrenCount: string;
  description: string;
  district: string;
  elderlyCount: string;
  floodLevel: FloodLevel | "";
  fullName: string;
  hasPregnantWomen: boolean;
  landmark: string;
  medicalNeedsCount: string;
  peopleCount: string;
  phone: string;
  supportNeeds: SupportNeed[];
  urgencyLevel: UrgencyLevel | "";
  ward: string;
};

type RescueRequestField =
  | "address"
  | "childrenCount"
  | "description"
  | "district"
  | "elderlyCount"
  | "floodLevel"
  | "fullName"
  | "medicalNeedsCount"
  | "peopleCount"
  | "phone"
  | "urgencyLevel"
  | "ward";

type RescueRequestFormErrors = Partial<
  Record<RescueRequestField | "agreeToShare" | "supportNeeds" | "form", string>
>;

type SupportOption = {
  description: string;
  icon: ReactNode;
  label: string;
  value: SupportNeed;
};

const supportOptions: SupportOption[] = [
  {
    value: "evacuation",
    label: "Sơ tán khẩn cấp",
    description: "Ưu tiên đưa người ra khỏi vùng nước dâng hoặc dòng chảy mạnh.",
    icon: <BoatIcon />,
  },
  {
    value: "boat",
    label: "Thuyền hoặc xuồng",
    description: "Cần phương tiện tiếp cận khi đường bộ đã ngập sâu.",
    icon: <WaveIcon />,
  },
  {
    value: "medical",
    label: "Hỗ trợ y tế",
    description: "Có người bị thương, bệnh nền nặng hoặc cần thuốc gấp.",
    icon: <MedicalIcon />,
  },
  {
    value: "food",
    label: "Lương thực",
    description: "Thiếu đồ ăn, sữa, thực phẩm thiết yếu trong 24 giờ tới.",
    icon: <FoodIcon />,
  },
  {
    value: "water",
    label: "Nước sạch",
    description: "Thiếu nước uống an toàn hoặc cần bộ lọc khẩn cấp.",
    icon: <DropIcon />,
  },
  {
    value: "supplies",
    label: "Chăn áo và đèn",
    description: "Cần áo phao, đèn pin, chăn giữ ấm hoặc pin sạc.",
    icon: <SupplyIcon />,
  },
];

const urgencyOptions = [
  { value: "critical", label: "Rất khẩn cấp" },
  { value: "high", label: "Khẩn cấp" },
  { value: "medium", label: "Cần hỗ trợ sớm" },
];

const floodLevelOptions = [
  { value: "knee", label: "Nước ngập đến đầu gối" },
  { value: "waist", label: "Nước ngập đến thắt lưng" },
  { value: "chest", label: "Nước ngập đến ngực" },
  { value: "roof", label: "Mắc kẹt trên tầng cao hoặc mái" },
];

const responseChecklist = [
  "Giữ điện thoại luôn mở, ưu tiên sạc pin và bật chuông.",
  "Nếu có thể, di chuyển trẻ em và người già lên vị trí cao hơn.",
  "Ngắt cầu dao điện khu vực thấp nếu nước đã tràn vào nhà.",
  "Chuẩn bị giấy tờ, thuốc thiết yếu và đèn pin trong một túi gọn.",
];

const intakeMetrics = [
  { label: "Kênh tiếp nhận", value: "24/7" },
  { label: "Ưu tiên xử lý", value: "Mức 1-3" },
  { label: "Cập nhật trạng thái", value: "SMS/Điện thoại" },
];

const initialFormState: RescueRequestFormState = {
  address: "",
  agreeToShare: false,
  alternatePhone: "",
  childrenCount: "",
  description: "",
  district: "",
  elderlyCount: "",
  floodLevel: "",
  fullName: "",
  hasPregnantWomen: false,
  landmark: "",
  medicalNeedsCount: "",
  peopleCount: "",
  phone: "",
  supportNeeds: [],
  urgencyLevel: "",
  ward: "",
};

function parseCount(value: string) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function formatSupportLabel(value: SupportNeed) {
  return supportOptions.find((option) => option.value === value)?.label ?? value;
}

function validateForm(
  formState: RescueRequestFormState
): RescueRequestFormErrors {
  const errors: RescueRequestFormErrors = {};

  if (!formState.fullName.trim()) {
    errors.fullName = "Vui lòng nhập họ và tên người cần hỗ trợ.";
  }

  if (!/^\d{9,11}$/.test(formState.phone.trim())) {
    errors.phone = "Số điện thoại cần có từ 9 đến 11 chữ số.";
  }

  if (!formState.district.trim()) {
    errors.district = "Vui lòng nhập quận hoặc huyện.";
  }

  if (!formState.ward.trim()) {
    errors.ward = "Vui lòng nhập phường, xã hoặc khu vực.";
  }

  if (!formState.address.trim()) {
    errors.address = "Vui lòng nhập địa chỉ chi tiết để đội cứu hộ xác định vị trí.";
  }

  if (parseCount(formState.peopleCount) < 1) {
    errors.peopleCount = "Cần ít nhất 1 người tại điểm cần cứu hộ.";
  }

  if (!formState.urgencyLevel) {
    errors.urgencyLevel = "Vui lòng chọn mức độ khẩn cấp.";
  }

  if (!formState.floodLevel) {
    errors.floodLevel = "Vui lòng chọn mức ngập hiện tại.";
  }

  if (formState.supportNeeds.length === 0) {
    errors.supportNeeds = "Hãy chọn ít nhất một loại hỗ trợ đang cần.";
  }

  if (formState.description.trim().length < 20) {
    errors.description =
      "Mô tả cần rõ hơn một chút để đội điều phối đánh giá nhanh tình huống.";
  }

  if (!formState.agreeToShare) {
    errors.agreeToShare =
      "Bạn cần xác nhận chia sẻ thông tin để đội cứu hộ liên hệ và điều phối.";
  }

  return errors;
}

function RescueRequestPage() {
  const [formState, setFormState] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<RescueRequestFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submission, setSubmission] =
    useState<RescueRequestSubmission | null>(null);

  const totalPeople = parseCount(formState.peopleCount);
  const vulnerablePeople =
    parseCount(formState.childrenCount) +
    parseCount(formState.elderlyCount) +
    parseCount(formState.medicalNeedsCount) +
    (formState.hasPregnantWomen ? 1 : 0);

  const selectedUrgency = urgencyOptions.find(
    (option) => option.value === formState.urgencyLevel
  );

  const updateField = <K extends keyof RescueRequestFormState>(
    field: K,
    value: RescueRequestFormState[K]
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const handleNumericChange =
    (
      field:
        | "childrenCount"
        | "elderlyCount"
        | "medicalNeedsCount"
        | "peopleCount"
    ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = event.target.value.replace(/[^\d]/g, "");
      updateField(field, sanitizedValue);
    };

  const toggleSupportNeed = (value: SupportNeed) => {
    setFormState((current) => {
      const nextValues = current.supportNeeds.includes(value)
        ? current.supportNeeds.filter((item) => item !== value)
        : [...current.supportNeeds, value];

      return {
        ...current,
        supportNeeds: nextValues,
      };
    });

    setFieldErrors((current) => ({
      ...current,
      supportNeeds: undefined,
      form: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formState);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSuccessMessage("");
      setErrorMessage("Vui lòng kiểm tra lại các trường thông tin đang còn thiếu.");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!formState.floodLevel || !formState.urgencyLevel) {
        throw new Error("Thiếu thông tin mức ngập hoặc mức độ khẩn cấp.");
      }

      const result = await submitRescueRequest({
        address: formState.address.trim(),
        agreeToShare: formState.agreeToShare,
        alternatePhone: formState.alternatePhone.trim() || undefined,
        childrenCount: parseCount(formState.childrenCount),
        description: formState.description.trim(),
        district: formState.district.trim(),
        elderlyCount: parseCount(formState.elderlyCount),
        floodLevel: formState.floodLevel,
        fullName: formState.fullName.trim(),
        hasPregnantWomen: formState.hasPregnantWomen,
        landmark: formState.landmark.trim() || undefined,
        medicalNeedsCount: parseCount(formState.medicalNeedsCount),
        peopleCount: parseCount(formState.peopleCount),
        phone: formState.phone.trim(),
        supportNeeds: formState.supportNeeds,
        urgencyLevel: formState.urgencyLevel,
        ward: formState.ward.trim(),
      });

      setSubmission(result);
      setSuccessMessage(
        `Đã tiếp nhận yêu cầu ${result.requestCode}. Trung tâm sẽ ưu tiên liên hệ lại trong ${result.estimatedResponseTime}.`
      );
      setFormState(initialFormState);
    } catch (error) {
      setSubmission(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu lúc này. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.18),_transparent_32%)]" />
      <div className="absolute left-0 top-20 h-80 w-80 rounded-full bg-cyan-300/20 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-400/15 blur-[160px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
        <header className="grid gap-5 rounded-[2rem] border border-border/80 bg-white/78 p-5 shadow-panel backdrop-blur-xl lg:grid-cols-[minmax(0,1.2fr)_360px] lg:p-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <SectionLabel label="Rescue Request" />
              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                Ưu tiên tiếp nhận tình huống nguy hiểm đến tính mạng
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                Gửi yêu cầu cứu hộ nhanh cho{" "}
                <span className="text-gradient">người dân đang mắc kẹt</span> do
                ngập lụt.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                Trang này dành cho người dân hoặc người thân khai báo vị trí cần
                cứu hộ, số lượng người bị ảnh hưởng và nhu cầu hỗ trợ khẩn cấp.
                Thông tin càng rõ, đội điều phối càng phân tuyến nhanh hơn.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {intakeMetrics.map((item) => (
                <SurfaceCard
                  key={item.label}
                  className="h-full"
                  contentClassName="p-4"
                >
                  <p className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.label}
                  </p>
                </SurfaceCard>
              ))}
            </div>
          </div>

          <SurfaceCard
            className="h-full overflow-hidden bg-gradient-to-br from-sky-950 via-blue-950 to-slate-950 text-white"
            contentClassName="relative p-6"
          >
            <div className="absolute inset-0 dot-grid opacity-20" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-6">
              <div className="space-y-4">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-sky-100/75">
                  Điều phối hiện trường
                </p>
                <div>
                  <p className="text-3xl font-semibold tracking-[-0.03em]">
                    112
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200/78">
                    Nếu có người bị cuốn trôi, chấn thương nặng hoặc mất liên lạc
                    hoàn toàn, hãy gọi ngay số khẩn cấp song song với việc gửi
                    biểu mẫu này.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="text-sm font-medium text-white">
                    Kênh công khai cho người dân
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200/78">
                    Trang nhập liệu đơn giản, tối ưu cho điện thoại và mạng yếu.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100"
                    to="/login"
                  >
                    Đăng nhập điều phối
                  </Link>
                  <Link
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-white/12 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    to="/register"
                  >
                    Tạo tài khoản
                  </Link>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <SurfaceCard className="overflow-hidden" contentClassName="p-0">
            <div className="h-1.5 w-full bg-gradient-to-r from-accent via-sky-400 to-accent-secondary" />
            <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionLabel label="Khai báo yêu cầu cứu hộ" />
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                    Cung cấp thông tin liên hệ, vị trí và nhu cầu hỗ trợ.
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                    Ưu tiên mô tả ngắn gọn nhưng rõ ràng: nước đang dâng tới đâu,
                    có bao nhiêu người mắc kẹt, ai đang cần sơ cứu và đội cứu hộ
                    nên tiếp cận bằng đường nào.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                  {selectedUrgency ? (
                    <>
                      <span className="font-medium text-foreground">
                        Mức ưu tiên hiện chọn:
                      </span>{" "}
                      {selectedUrgency.label}
                    </>
                  ) : (
                    "Chọn mức độ khẩn cấp để hệ thống sắp xếp thứ tự xử lý."
                  )}
                </div>
              </div>

              <form className="space-y-7" onSubmit={handleSubmit}>
                <section className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <ProfileIcon />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                        Thông tin liên hệ
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Người khai báo hoặc người có thể nhận cuộc gọi từ đội cứu
                        hộ.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      error={fieldErrors.fullName}
                      id="fullName"
                      label="Họ và tên"
                      leadingAdornment={<ProfileIcon />}
                      name="fullName"
                      onChange={(event) => updateField("fullName", event.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      type="text"
                      value={formState.fullName}
                    />
                    <InputField
                      error={fieldErrors.phone}
                      id="phone"
                      inputMode="numeric"
                      label="Số điện thoại chính"
                      leadingAdornment={<PhoneIcon />}
                      name="phone"
                      onChange={(event) =>
                        updateField(
                          "phone",
                          event.target.value.replace(/[^\d]/g, "")
                        )
                      }
                      placeholder="Nhập số đang liên lạc được"
                      type="tel"
                      value={formState.phone}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      id="alternatePhone"
                      inputMode="numeric"
                      label="Số điện thoại dự phòng"
                      leadingAdornment={<PhoneIcon />}
                      name="alternatePhone"
                      onChange={(event) =>
                        updateField(
                          "alternatePhone",
                          event.target.value.replace(/[^\d]/g, "")
                        )
                      }
                      placeholder="Nếu số chính mất sóng"
                      type="tel"
                      value={formState.alternatePhone}
                    />
                    <SelectField
                      error={fieldErrors.urgencyLevel}
                      id="urgencyLevel"
                      label="Mức độ khẩn cấp"
                      leadingAdornment={<AlertIcon />}
                      name="urgencyLevel"
                      onChange={(event) =>
                        updateField(
                          "urgencyLevel",
                          event.target.value as UrgencyLevel | ""
                        )
                      }
                      options={urgencyOptions}
                      placeholder="Chọn mức độ"
                      value={formState.urgencyLevel}
                    />
                  </div>
                </section>

                <section className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <PinIcon />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                        Vị trí cần cứu hộ
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Càng chi tiết càng tốt: tên hẻm, trường học, trạm xăng,
                        nhà văn hóa hoặc điểm nhận diện gần nhất.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      error={fieldErrors.district}
                      id="district"
                      label="Quận/Huyện"
                      leadingAdornment={<PinIcon />}
                      name="district"
                      onChange={(event) => updateField("district", event.target.value)}
                      placeholder="Ví dụ: Ninh Kiều"
                      type="text"
                      value={formState.district}
                    />
                    <InputField
                      error={fieldErrors.ward}
                      id="ward"
                      label="Phường/Xã/Khu vực"
                      leadingAdornment={<PinIcon />}
                      name="ward"
                      onChange={(event) => updateField("ward", event.target.value)}
                      placeholder="Ví dụ: An Bình"
                      type="text"
                      value={formState.ward}
                    />
                  </div>

                  <InputField
                    error={fieldErrors.address}
                    id="address"
                    label="Địa chỉ chi tiết"
                    leadingAdornment={<PinIcon />}
                    name="address"
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="Số nhà, tên đường, hẻm hoặc mô tả vị trí"
                    type="text"
                    value={formState.address}
                  />

                  <InputField
                    id="landmark"
                    label="Mốc nhận diện gần đó"
                    leadingAdornment={<CompassIcon />}
                    name="landmark"
                    onChange={(event) => updateField("landmark", event.target.value)}
                    placeholder="Ví dụ: gần chợ, trường học, trạm xăng..."
                    type="text"
                    value={formState.landmark}
                  />
                </section>

                <section className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <UsersIcon />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                        Tình trạng tại điểm mắc kẹt
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Thông tin này giúp hệ thống quyết định cần thuyền, y tế hay
                        sơ tán ngay.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <InputField
                      error={fieldErrors.peopleCount}
                      id="peopleCount"
                      inputMode="numeric"
                      label="Tổng số người"
                      leadingAdornment={<UsersIcon />}
                      name="peopleCount"
                      onChange={handleNumericChange("peopleCount")}
                      placeholder="0"
                      type="text"
                      value={formState.peopleCount}
                    />
                    <InputField
                      error={fieldErrors.childrenCount}
                      id="childrenCount"
                      inputMode="numeric"
                      label="Trẻ em"
                      leadingAdornment={<ChildIcon />}
                      name="childrenCount"
                      onChange={handleNumericChange("childrenCount")}
                      placeholder="0"
                      type="text"
                      value={formState.childrenCount}
                    />
                    <InputField
                      error={fieldErrors.elderlyCount}
                      id="elderlyCount"
                      inputMode="numeric"
                      label="Người cao tuổi"
                      leadingAdornment={<ElderlyIcon />}
                      name="elderlyCount"
                      onChange={handleNumericChange("elderlyCount")}
                      placeholder="0"
                      type="text"
                      value={formState.elderlyCount}
                    />
                    <InputField
                      error={fieldErrors.medicalNeedsCount}
                      id="medicalNeedsCount"
                      inputMode="numeric"
                      label="Người cần y tế"
                      leadingAdornment={<MedicalIcon />}
                      name="medicalNeedsCount"
                      onChange={handleNumericChange("medicalNeedsCount")}
                      placeholder="0"
                      type="text"
                      value={formState.medicalNeedsCount}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      error={fieldErrors.floodLevel}
                      id="floodLevel"
                      label="Mức ngập hiện tại"
                      leadingAdornment={<WaveIcon />}
                      name="floodLevel"
                      onChange={(event) =>
                        updateField(
                          "floodLevel",
                          event.target.value as FloodLevel | ""
                        )
                      }
                      options={floodLevelOptions}
                      placeholder="Chọn mức ngập"
                      value={formState.floodLevel}
                    />

                    <div className="space-y-3 rounded-[1.5rem] border border-border bg-muted/45 p-4">
                      <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                        Nhóm cần ưu tiên đặc biệt
                      </p>
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-accent/30">
                        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                          <input
                            checked={formState.hasPregnantWomen}
                            className="peer absolute inset-0 cursor-pointer opacity-0"
                            onChange={(event) =>
                              updateField("hasPregnantWomen", event.target.checked)
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
                        <span>
                          <span className="font-medium text-foreground">
                            Có phụ nữ mang thai tại điểm này
                          </span>
                          <span className="mt-1 block">
                            Đánh dấu để hệ thống tăng mức ưu tiên điều phối y tế.
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                </section>

                <section className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <SupportIcon />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                        Nhu cầu hỗ trợ
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Chọn nhiều mục nếu điểm mắc kẹt đang cần phối hợp nhiều loại
                        hỗ trợ cùng lúc.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {supportOptions.map((option) => {
                      const isSelected = formState.supportNeeds.includes(
                        option.value
                      );

                      return (
                        <button
                          key={option.value}
                          className={cn(
                            "rounded-[1.5rem] border px-4 py-4 text-left transition-all duration-200",
                            isSelected
                              ? "border-accent/40 bg-accent/10 shadow-accent"
                              : "border-border bg-card/75 hover:border-accent/25 hover:bg-muted/60"
                          )}
                          onClick={() => toggleSupportNeed(option.value)}
                          type="button"
                        >
                          <div className="flex items-start gap-4">
                            <span
                              className={cn(
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                                isSelected
                                  ? "bg-gradient-to-br from-accent to-accent-secondary text-white"
                                  : "bg-muted text-accent"
                              )}
                            >
                              {option.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="font-semibold tracking-[-0.01em] text-foreground">
                                  {option.label}
                                </p>
                                {isSelected ? (
                                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-emerald-700">
                                    Đã chọn
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {fieldErrors.supportNeeds ? (
                    <p className="text-sm text-rose-600">
                      {fieldErrors.supportNeeds}
                    </p>
                  ) : null}
                </section>

                <TextareaField
                  error={fieldErrors.description}
                  id="description"
                  label="Mô tả nhanh tình huống thực tế"
                  leadingAdornment={<ClipboardIcon />}
                  name="description"
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Ví dụ: nước đã ngập đến ngực, có 1 người già khó thở, lối vào chỉ tiếp cận được bằng xuồng từ hẻm bên trái..."
                  value={formState.description}
                />

                <div className="space-y-3 rounded-[1.5rem] border border-border bg-muted/40 p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                    <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                      <input
                        checked={formState.agreeToShare}
                        className="peer absolute inset-0 cursor-pointer opacity-0"
                        onChange={(event) =>
                          updateField("agreeToShare", event.target.checked)
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
                    <span>
                      <span className="font-medium text-foreground">
                        Tôi đồng ý chia sẻ thông tin này cho đội cứu hộ và đơn vị
                        điều phối liên quan.
                      </span>
                      <span className="mt-1 block">
                        Dữ liệu được dùng để xác minh vị trí, liên hệ, sắp tuyến và
                        ưu tiên cứu hộ trong tình huống khẩn cấp.
                      </span>
                    </span>
                  </label>
                  {fieldErrors.agreeToShare ? (
                    <p className="text-sm text-rose-600">
                      {fieldErrors.agreeToShare}
                    </p>
                  ) : null}
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-muted-foreground">
                    Nếu không gửi được biểu mẫu, hãy gọi trực tiếp tổng đài khẩn
                    cấp hoặc liên hệ chính quyền địa phương gần nhất.
                  </p>
                  <Button
                    aria-busy={isSubmitting}
                    className="sm:min-w-56"
                    disabled={isSubmitting}
                    trailingIcon={<ArrowRightIcon />}
                    type="submit"
                  >
                    {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu cứu hộ"}
                  </Button>
                </div>
              </form>
            </div>
          </SurfaceCard>

          <div className="space-y-6">
            <SurfaceCard className="overflow-hidden" contentClassName="p-0">
              <div className="bg-gradient-to-r from-accent to-accent-secondary px-5 py-4 text-white">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-white/80">
                  Tóm tắt nhanh
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                  Thông tin ưu tiên điều phối
                </p>
              </div>
              <div className="space-y-5 p-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <InfoStat
                    label="Tổng số người"
                    value={totalPeople > 0 ? `${totalPeople}` : "Chưa nhập"}
                  />
                  <InfoStat
                    label="Nhóm cần ưu tiên"
                    value={vulnerablePeople > 0 ? `${vulnerablePeople}` : "0"}
                  />
                  <InfoStat
                    label="Mức khẩn cấp"
                    value={selectedUrgency?.label ?? "Chưa chọn"}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                    Loại hỗ trợ đã chọn
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formState.supportNeeds.length > 0 ? (
                      formState.supportNeeds.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-accent/20 bg-accent/8 px-3 py-2 text-sm text-accent"
                        >
                          {formatSupportLabel(item)}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Chưa chọn nhu cầu hỗ trợ.
                      </span>
                    )}
                  </div>
                </div>

                {submission ? (
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                    <p className="font-medium text-emerald-800">
                      Yêu cầu gần nhất đã tiếp nhận
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-emerald-700">
                      <p>Mã yêu cầu: {submission.requestCode}</p>
                      <p>Thời gian gửi: {submission.submittedAt}</p>
                      <p>Ước lượng phản hồi: {submission.estimatedResponseTime}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </SurfaceCard>

            <SurfaceCard contentClassName="p-5">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent">
                    Hướng dẫn an toàn
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">
                    Trong lúc chờ đội cứu hộ
                  </h3>
                </div>

                <div className="space-y-3">
                  {responseChecklist.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-muted/45 px-4 py-3"
                    >
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard
              className="overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950 to-blue-950 text-white"
              contentClassName="relative p-5"
            >
              <div className="absolute inset-0 water-lines opacity-20" />
              <div className="relative z-10 space-y-4">
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-sky-100/70">
                    Liên hệ thay thế
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">
                    Khi mạng yếu hoặc mất dữ liệu
                  </h3>
                </div>

                <div className="space-y-3 text-sm leading-6 text-slate-200/82">
                  <p>1. Gọi số khẩn cấp hoặc ban chỉ huy phòng chống thiên tai địa phương.</p>
                  <p>2. Nhắn tin SMS với nội dung gồm tên, địa chỉ, số người và tình trạng.</p>
                  <p>3. Treo khăn sáng màu hoặc bật đèn pin ở vị trí cao để dễ nhận diện.</p>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </section>
      </div>
    </main>
  );
}

type InfoStatProps = {
  label: string;
  value: string;
};

function InfoStat({ label, value }: InfoStatProps) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground">
        {value}
      </p>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function BoatIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 14h16M7 14l2-7h6l2 7m-9 0 4 4 4-4M5 18c1 .67 2 .67 3 0s2-.67 3 0 2 .67 3 0 2-.67 3 0 2 .67 3 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ChildIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-4 7 2-3 2 2 2-2 2 3m-8 7 1-5h6l1 5m-5-8v8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 4h6m-5 0a1 1 0 0 0-1 1v1h6V5a1 1 0 0 0-1-1m-4 0h4m-9 4h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m14.5 9.5-5 5 2-7 7-2-4 4ZM22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function DropIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3s5 5.36 5 9a5 5 0 0 1-10 0c0-3.64 5-9 5-9Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ElderlyIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M13 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-2 14 1-5h4m-4 0-1-4 3-2 2 3h3m-7 3-3 5m4-10 1 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 3v8m3-8v8M5 7h4m5-4v18m0-10h4a2 2 0 0 0 2-2V3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function MedicalIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5v14M5 12h14m-9-8h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12.8 19.79 19.79 0 0 1 2.08 4.09 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.79.62 2.64a2 2 0 0 1-.45 2.11L8 9.94a16 16 0 0 0 6.06 6.06l1.47-1.23a2 2 0 0 1 2.11-.45c.85.29 1.74.5 2.64.62A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 21s-6-5.33-6-11a6 6 0 1 1 12 0c0 5.67-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function SupplyIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-14 0h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Zm6 4h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 12h8m-8 4h5m-2-9h.01M6 4h12a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm7 14v-2a4 4 0 0 0-3-3.87M17 11a4 4 0 0 0 0-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M2 16c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1.5-2 3-2 1.5 2 3 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M2 11c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1.5-2 3-2 1.5 2 3 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default RescueRequestPage;
