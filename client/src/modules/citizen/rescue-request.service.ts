export type UrgencyLevel = "critical" | "high" | "medium";
export type FloodLevel = "knee" | "waist" | "chest" | "roof";
export type SupportNeed =
  | "evacuation"
  | "boat"
  | "medical"
  | "food"
  | "water"
  | "supplies";

export type RescueRequestPayload = {
  address: string;
  agreeToShare: boolean;
  alternatePhone?: string;
  childrenCount: number;
  description: string;
  district: string;
  elderlyCount: number;
  floodLevel: FloodLevel;
  fullName: string;
  hasPregnantWomen: boolean;
  landmark?: string;
  medicalNeedsCount: number;
  peopleCount: number;
  phone: string;
  supportNeeds: SupportNeed[];
  urgencyLevel: UrgencyLevel;
  ward: string;
};

export type RescueRequestSubmission = {
  estimatedResponseTime: string;
  requestCode: string;
  submittedAt: string;
};

const responseTimeByUrgency: Record<UrgencyLevel, string> = {
  critical: "5 - 10 phút",
  high: "15 - 30 phút",
  medium: "30 - 60 phút",
};

export async function submitRescueRequest(
  payload: RescueRequestPayload
): Promise<RescueRequestSubmission> {
  // Temporary client-side mock until the rescue request API is available.
  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 1100);
  });

  const timestamp = Date.now().toString().slice(-6);
  const urgencyPrefix = payload.urgencyLevel === "critical" ? "K" : "R";

  return {
    estimatedResponseTime: responseTimeByUrgency[payload.urgencyLevel],
    requestCode: `FR-${urgencyPrefix}${timestamp}`,
    submittedAt: new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date()),
  };
}
