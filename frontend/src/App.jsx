import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Welcome from "./pages/Welcome";
import LoginEmail from "./pages/LoginEmail";
import LoginMobile from "./pages/LoginMobile";
import IntentPage from "./pages/IntentPage";
import BasicProfilePage from "./pages/BasicProfilePage";
import SizeBodyPage from "./pages/SizeBodyPage";
import Scanner from "./pages/Scanner";
import GuidedFiltersPage from "./pages/GuidedFiltersPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ServiceTypePage from "./pages/ServiceTypePage";
import QualityLocationPage from "./pages/QualityLocationPage";
import ExpertsPage from "./pages/ExpertsPage";
import DeliveryPage from "./pages/DeliveryPage";
import FitCardPage from "./pages/FitCardPage";
import TrackingPage from "./pages/TrackingPage";
import FeedbackPage from "./pages/FeedbackPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />

      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login/email" element={<LoginEmail />} />
      <Route path="/login/mobile" element={<LoginMobile />} />

      <Route path="/intent" element={<IntentPage />} />
      <Route path="/basic-profile" element={<BasicProfilePage />} />
      <Route path="/size-body" element={<SizeBodyPage />} />
      <Route path="/camera-scan" element={<Scanner />} />

      <Route path="/guided-filters" element={<GuidedFiltersPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />

      <Route path="/service-type" element={<ServiceTypePage />} />
      <Route path="/quality-location" element={<QualityLocationPage />} />
      <Route path="/experts" element={<ExpertsPage />} />

      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/fit-card" element={<FitCardPage />} />
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />

      <Route path="/store" element={<Navigate to="/guided-filters" replace />} />
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
