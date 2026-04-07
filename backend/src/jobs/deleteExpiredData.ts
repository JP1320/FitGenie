// Starter job: replace with real DB deletes by policy
export async function deleteExpiredData() {
  console.log("[retention-job] Run started", new Date().toISOString());
  // 1) Read policies
  // 2) Delete/anonymize expired rows
  // 3) Write audit log summary
  console.log("[retention-job] Run completed");
}
