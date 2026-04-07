const FLOW = ["Accepted", "In Progress", "Stitching", "Ready", "Shipped"];

export async function advanceOrderStatus(currentStatus) {
  const idx = FLOW.indexOf(currentStatus);
  if (idx === -1 || idx === FLOW.length - 1) return currentStatus;
  return FLOW[idx + 1];
}
