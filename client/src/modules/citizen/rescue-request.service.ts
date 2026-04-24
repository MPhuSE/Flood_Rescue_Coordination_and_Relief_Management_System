export type RescueCondition =
  | "boat"
  | "medical"
  | "food"
  | "collapsed-house"
  | "flood-under-1m"
  | "flood-over-1m";

export type RescueCoordinates = {
  latitude: number;
  longitude: number;
};

export type RescueRequestPayload = {
  address: string;
  adultCount: number;
  childrenCount: number;
  conditions: RescueCondition[];
  coordinates?: RescueCoordinates;
  elderlyCount: number;
  location: string;
  notes?: string;
  phone: string;
  shareContact: boolean;
};

export type RescueRequestSubmission = {
  estimatedResponseTime: string;
  requestCode: string;
  submittedAt: string;
  totalPeople: number;
};

const fastestConditions: RescueCondition[] = ["boat", "medical"];
const highPriorityConditions: RescueCondition[] = [
  "collapsed-house",
  "flood-over-1m",
];

function getEstimatedResponseTime(payload: RescueRequestPayload) {
  if (payload.conditions.some((condition) => fastestConditions.includes(condition))) {
    return "10 - 15 phút";
  }

  if (payload.conditions.some((condition) => highPriorityConditions.includes(condition))) {
    return "15 - 30 phút";
  }

  if (payload.adultCount + payload.childrenCount + payload.elderlyCount >= 5) {
    return "20 - 35 phút";
  }

  return "30 - 60 phút";
}

export async function submitRescueRequest(
  payload: RescueRequestPayload
): Promise<RescueRequestSubmission> {
  // Mock submit until a public rescue-request API is available.
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 900);
  });

  const timestamp = Date.now().toString().slice(-6);

  return {
    estimatedResponseTime: getEstimatedResponseTime(payload),
    requestCode: `FR-${timestamp}`,
    submittedAt: new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date()),
    totalPeople:
      payload.adultCount + payload.childrenCount + payload.elderlyCount,
  };
}
