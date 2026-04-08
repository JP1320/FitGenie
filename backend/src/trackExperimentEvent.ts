export async function trackExperimentEvent(input: {
  experimentKey: string;
  variant: "A" | "B";
  eventName: string;
  userId?: string;
  tenantId?: string;
  eventValue?: number;
  metadata?: Record<string, unknown>;
}) {
  console.log("[experiment-event]", JSON.stringify(input));
  // TODO: insert into experiment_events table
}
