import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import MeasurementsPage from "./pages/MeasurementsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import TailorsPage from "./pages/TailorsPage";
import BookingPage from "./pages/BookingPage";
import FitCardPage from "./pages/FitCardPage";
import TrackingPage from "./pages/TrackingPage";
import FeedbackPage from "./pages/FeedbackPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/measurements" element={<MeasurementsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/tailors" element={<TailorsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/fit-card" element={<FitCardPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}
