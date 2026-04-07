export function recordUsage(eventName: string, tenantId: string, quantity = 1) {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    eventName,
    tenantId,
    quantity
  }));
}
