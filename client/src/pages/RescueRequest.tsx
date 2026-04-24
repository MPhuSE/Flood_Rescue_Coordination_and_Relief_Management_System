import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/button";
import {
  submitRescueRequest,
  type RescueCondition,
  type RescueCoordinates,
  type RescueRequestSubmission,
} from "../modules/citizen/rescue-request.service";

type RescueRequestFormState = {
  address: string;
  adultCount: string;
  childrenCount: string;
  conditions: RescueCondition[];
  elderlyCount: string;
  location: string;
  notes: string;
  phone: string;
  shareContact: boolean;
};

type RescueRequestFieldError = Partial<
  Record<"address" | "location" | "people" | "phone" | "shareContact" | "form", string>
>;

type RescueConditionOption = {
  description: string;
  label: string;
  value: RescueCondition;
};

type NoticeTone = "success" | "warning";

type InlineNotice = {
  text: string;
  tone: NoticeTone;
};

const addressMaxLength = 500;
const notesMaxLength = 500;

const conditionOptions: RescueConditionOption[] = [
  {
    value: "boat",
    label: "Cần thuyền",
    description: "Lối tiếp cận bằng đường bộ đã ngập hoặc bị chia cắt.",
  },
  {
    value: "medical",
    label: "Cần y tế khẩn",
    description: "Có người bị thương, khó thở hoặc cần sơ cứu gấp.",
  },
  {
    value: "food",
    label: "Hết thức ăn",
    description: "Gia đình thiếu thực phẩm thiết yếu trong thời gian ngắn.",
  },
  {
    value: "collapsed-house",
    label: "Nhà sập",
    description: "Nơi ở không còn an toàn hoặc có nguy cơ đổ sập thêm.",
  },
  {
    value: "flood-under-1m",
    label: "Ngập < 1m",
    description: "Nước đang lên nhưng vẫn còn khả năng tiếp cận hạn chế.",
  },
  {
    value: "flood-over-1m",
    label: "Ngập > 1m",
    description: "Mực nước sâu, di chuyển rất khó hoặc nguy hiểm.",
  },
];

const smsGuide = [
  "Ưu tiên nhắn ngắn gọn: số điện thoại, địa chỉ, số người và tình trạng nguy hiểm nhất.",
  "Ví dụ: CUUHO 09xxxxxxx, 17 Trần Nguyên Hãn, 2 người lớn 1 trẻ em, cần thuyền, ngập > 1m.",
  "Nếu không gọi được, hãy giữ điện thoại mở và nhắn lại khi có thay đổi về vị trí hoặc số người.",
];

const initialFormState: RescueRequestFormState = {
  address: "",
  adultCount: "0",
  childrenCount: "0",
  conditions: [],
  elderlyCount: "0",
  location: "",
  notes: "",
  phone: "",
  shareContact: true,
};

function parseCount(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function parseCoordinates(value: string): RescueCoordinates | undefined {
  const matches = value.trim().match(
    /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/
  );

  if (!matches) {
    return undefined;
  }

  const latitude = Number(matches[1]);
  const longitude = Number(matches[2]);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return undefined;
  }

  return { latitude, longitude };
}

function RescueRequestPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<RescueRequestFieldError>({});
  const [locationNotice, setLocationNotice] = useState<InlineNotice | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submission, setSubmission] =
    useState<RescueRequestSubmission | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adultCount = parseCount(formState.adultCount);
  const childrenCount = parseCount(formState.childrenCount);
  const elderlyCount = parseCount(formState.elderlyCount);
  const totalPeople = adultCount + childrenCount + elderlyCount;

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
      [field]:
        field === "address" ||
        field === "location" ||
        field === "phone" ||
        field === "shareContact"
          ? undefined
          : current[field as keyof RescueRequestFieldError],
      people: undefined,
      form: undefined,
    }));

    setErrorMessage("");
  };

  const handleCountChange =
    (field: "adultCount" | "childrenCount" | "elderlyCount") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, event.target.value.replace(/[^\d]/g, ""));
    };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField("address", event.target.value.slice(0, addressMaxLength));
  };

  const handleNotesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateField("notes", event.target.value.slice(0, notesMaxLength));
  };

  const toggleCondition = (value: RescueCondition) => {
    setFormState((current) => ({
      ...current,
      conditions: current.conditions.includes(value)
        ? current.conditions.filter((item) => item !== value)
        : [...current.conditions, value],
    }));
  };

  const handleRefreshLocation = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors((current) => ({
      ...current,
      location: undefined,
      form: undefined,
    }));

    if (!("geolocation" in navigator)) {
      setLocationNotice({
        tone: "warning",
        text: "Trình duyệt không hỗ trợ lấy vị trí tự động. Hãy nhập tọa độ thủ công.",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setFormState((current) => ({
          ...current,
          location: nextLocation,
        }));
        setLocationNotice({
          tone: "success",
          text: "Đã cập nhật tọa độ từ thiết bị. Hãy kiểm tra lại địa chỉ gần nhất.",
        });
        setIsLocating(false);
      },
      (error) => {
        const nextText =
          error.code === error.PERMISSION_DENIED
            ? "Bạn đã từ chối quyền truy cập vị trí. Hãy nhập tọa độ thủ công."
            : "Không lấy được vị trí lúc này. Hãy thử lại hoặc nhập tọa độ thủ công.";
        setLocationNotice({
          tone: "warning",
          text: nextText,
        });
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleOpenMap = () => {
    const query = formState.address.trim() || formState.location.trim();

    if (!query) {
      setErrorMessage("Hãy nhập địa chỉ hoặc tọa độ trước khi mở bản đồ.");
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/login");
  };

  const scrollToSmsGuide = () => {
    document.getElementById("huong-dan-nhan-tin")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: RescueRequestFieldError = {};

    if (!/^0\d{8,10}$/.test(formState.phone.trim())) {
      nextErrors.phone = "Vui lòng nhập số điện thoại hợp lệ, bắt đầu bằng số 0.";
    }

    if (totalPeople < 1) {
      nextErrors.people = "Cần ít nhất 1 người tại điểm cần cứu trợ.";
    }

    if (!formState.location.trim()) {
      nextErrors.location = "Vui lòng nhập tọa độ hoặc bấm lấy lại vị trí.";
    }

    if (!formState.address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ để đội cứu hộ dễ tìm hơn.";
    }

    if (!formState.shareContact) {
      nextErrors.shareContact =
        "Bạn cần đồng ý chia sẻ thông tin để đội cứu hộ liên hệ và điều phối.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setSubmission(null);
      setSuccessMessage("");
      setErrorMessage("Vui lòng kiểm tra lại các trường bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await submitRescueRequest({
        address: formState.address.trim(),
        adultCount,
        childrenCount,
        conditions: formState.conditions,
        coordinates: parseCoordinates(formState.location),
        elderlyCount,
        location: formState.location.trim(),
        notes: formState.notes.trim() || undefined,
        phone: formState.phone.trim(),
        shareContact: formState.shareContact,
      });

      setSubmission(result);
      setSuccessMessage(
        `Đã tiếp nhận ${result.requestCode}. Tổng đài sẽ ưu tiên liên hệ lại trong khoảng ${result.estimatedResponseTime}.`
      );
      setFormState((current) => ({
        ...initialFormState,
        address: current.address,
        location: current.location,
        phone: current.phone,
        shareContact: current.shareContact,
      }));
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
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900">
              Báo cáo cần cứu hộ
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Gửi nhanh thông tin cơ bản để đội cứu hộ định vị, gọi lại và ưu
              tiên điều phối.
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
          <form className="space-y-8" onSubmit={handleSubmit}>
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
              <div className="space-y-3">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="phone"
                >
                  Số điện thoại *
                </label>
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  id="phone"
                  inputMode="tel"
                  name="phone"
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="Ví dụ: 09xxxxxxxx"
                  value={formState.phone}
                />
                {fieldErrors.phone ? (
                  <p className="text-sm text-rose-600">{fieldErrors.phone}</p>
                ) : null}
              </div>

              <div className="lg:pt-8">
                <Button
                  className="w-full"
                  onClick={scrollToSmsGuide}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <span className="mr-1 inline-flex">
                    <MessageIcon />
                  </span>
                  Hướng dẫn nhắn tin
                </Button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="space-y-3">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="adultCount"
                >
                  Người lớn
                </label>
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  id="adultCount"
                  inputMode="numeric"
                  onChange={handleCountChange("adultCount")}
                  value={formState.adultCount}
                />
              </div>

              <div className="space-y-3">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="childrenCount"
                >
                  Trẻ em
                </label>
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  id="childrenCount"
                  inputMode="numeric"
                  onChange={handleCountChange("childrenCount")}
                  value={formState.childrenCount}
                />
              </div>

              <div className="space-y-3">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="elderlyCount"
                >
                  Người già
                </label>
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  id="elderlyCount"
                  inputMode="numeric"
                  onChange={handleCountChange("elderlyCount")}
                  value={formState.elderlyCount}
                />
              </div>
            </section>

            {fieldErrors.people ? (
              <p className="-mt-4 text-sm text-rose-600">{fieldErrors.people}</p>
            ) : null}

            <section className="space-y-3">
              <label
                className="block text-sm font-medium text-slate-900"
                htmlFor="location"
              >
                Vị trí *
              </label>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
                <div className="flex h-18 items-center gap-3 rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-200">
                  <span className="text-emerald-600">
                    <MapPinIcon />
                  </span>
                  <input
                    className="h-14 w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                    id="location"
                    name="location"
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="Ví dụ: 21.028500, 105.854200"
                    value={formState.location}
                  />
                </div>

                <Button
                  className="w-full"
                  disabled={isLocating}
                  onClick={handleRefreshLocation}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <span className="mr-1 inline-flex">
                    <NavigationIcon />
                  </span>
                  {isLocating ? "Đang lấy vị trí..." : "Lấy lại vị trí"}
                </Button>
              </div>

              {fieldErrors.location ? (
                <p className="text-sm text-rose-600">{fieldErrors.location}</p>
              ) : null}

              {locationNotice ? (
                <p
                  className={`text-sm ${
                    locationNotice.tone === "success"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {locationNotice.text}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Bạn có thể bấm lấy vị trí tự động hoặc nhập tọa độ thủ công.
                </p>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="address"
                >
                  Địa chỉ *
                </label>
                <Button
                  onClick={handleOpenMap}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <span className="mr-1 inline-flex">
                    <MapPinIcon />
                  </span>
                  Chọn trên bản đồ
                </Button>
              </div>

              <input
                className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                id="address"
                name="address"
                onChange={handleAddressChange}
                placeholder="Ví dụ: 17 Trần Nguyên Hãn, Hoàn Kiếm, Hà Nội"
                value={formState.address}
              />

              <div className="space-y-2">
                <p className="text-sm leading-6 text-slate-500">
                  Nhập địa chỉ gần nhất để đội cứu hộ dễ tìm hơn. Nếu chưa chắc,
                  hãy giữ lại tọa độ ở trên và mô tả thêm ở cuối biểu mẫu.
                </p>
                <p className="text-sm text-slate-500">
                  {formState.address.length}/{addressMaxLength} ký tự
                </p>
              </div>

              {fieldErrors.address ? (
                <p className="text-sm text-rose-600">{fieldErrors.address}</p>
              ) : null}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                  Tình trạng
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Chọn các tình trạng phù hợp nhất để đội điều phối ưu tiên đúng.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {conditionOptions.map((option) => {
                  const checked = formState.conditions.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-4 transition ${
                        checked
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                        <input
                          checked={checked}
                          className="peer absolute inset-0 opacity-0"
                          onChange={() => toggleCondition(option.value)}
                          type="checkbox"
                        />
                        <span
                          className={`h-5 w-5 rounded-md border transition ${
                            checked
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300 bg-white"
                          }`}
                        />
                        {checked ? (
                          <span className="pointer-events-none absolute text-white">
                            <CheckIcon />
                          </span>
                        ) : null}
                      </span>

                      <span>
                        <span className="block text-sm font-medium text-slate-900">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <label
                className="block text-sm font-medium text-slate-900"
                htmlFor="notes"
              >
                Ghi chú thêm
              </label>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                id="notes"
                name="notes"
                onChange={handleNotesChange}
                placeholder="Ví dụ: Có 1 người già đi lại khó khăn, lối vào hẹp, nhà gần biển hiệu màu xanh..."
                value={formState.notes}
              />
              <p className="text-sm text-slate-500">
                {formState.notes.length}/{notesMaxLength} ký tự
              </p>
            </section>

            <section className="rounded-2xl bg-slate-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                  <input
                    checked={formState.shareContact}
                    className="peer absolute inset-0 opacity-0"
                    onChange={(event) =>
                      updateField("shareContact", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="h-5 w-5 rounded-md border border-slate-300 bg-white transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500" />
                  {formState.shareContact ? (
                    <span className="pointer-events-none absolute text-white">
                      <CheckIcon />
                    </span>
                  ) : null}
                </span>

                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    Tôi đồng ý chia sẻ thông tin này cho đội cứu hộ để liên hệ và
                    điều phối.
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">
                    Thông tin chỉ nên đủ để xác minh vị trí, số người và nhu cầu
                    hỗ trợ khẩn cấp.
                  </span>
                </span>
              </label>

              {fieldErrors.shareContact ? (
                <p className="mt-3 text-sm text-rose-600">
                  {fieldErrors.shareContact}
                </p>
              ) : null}
            </section>

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

            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Tổng số người cần hỗ trợ: {totalPeople}
                </p>
                <p className="text-sm text-slate-500">
                  Tập trung nhập đủ số người và địa chỉ để đội cứu hộ ưu tiên nhanh
                  hơn.
                </p>
              </div>

              <Button
                aria-busy={isSubmitting}
                className="sm:min-w-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu cứu trợ"}
              </Button>
            </section>
          </form>

          <section
            className="mt-8 rounded-3xl bg-slate-50 p-5 sm:p-6"
            id="huong-dan-nhan-tin"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <MessageIcon />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                  Hướng dẫn nhắn tin
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Dùng khi mạng yếu hoặc không mở được biểu mẫu đầy đủ.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {smsGuide.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>

            {submission ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <p className="font-medium">
                  Yêu cầu gần nhất: {submission.requestCode}
                </p>
                <p className="mt-2">
                  Đã ghi nhận {submission.totalPeople} người vào lúc{" "}
                  {submission.submittedAt}.
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
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

function MapPinIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 21s-6-5.33-6-11a6 6 0 1 1 12 0c0 5.67-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 10h8M8 14h5m-7 6 2.8-2H18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2v2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function NavigationIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m21 3-8.5 18-2.7-7.8L2 10.5 21 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default RescueRequestPage;
