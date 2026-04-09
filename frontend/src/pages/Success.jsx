import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function Success() {
  const location = useLocation();
  const booking = location.state?.booking;

  return (
    <section className="card hero">
      <h2>✅ Booking Confirmed</h2>
      <pre>{JSON.stringify(booking, null, 2)}</pre>
      <Link to="/" className="btn">Back to Home</Link>
    </section>
  );
}
