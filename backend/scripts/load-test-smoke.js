import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "2m"
};

export default function () {
  const payload = JSON.stringify({ userId: "u1", intent: "wedding" });
  const res = http.post("https://app.fitgenie.ai/recommendations", payload, {
    headers: { "Content-Type": "application/json" }
  });
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
