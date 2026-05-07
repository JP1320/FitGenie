import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import LoginEmail from "./pages/LoginEmail";
import LoginMobile from "./pages/LoginMobile";
import IntentPage from "./pages/IntentPage";
import BasicProfilePage from "./pages/BasicProfilePage";
import SizeBodyPage from "./pages/SizeBodyPage";
import Scanner from "./pages/Scanner";
import Store from "./pages/Store";
import ServiceTypePage from "./pages/ServiceTypePage";
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
      <Route path="/body-input" element={<SizeBodyPage />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/store" element={<Store />} />
      <Route path="/service-selection" element={<ServiceTypePage />} />
      <Route path="/expert-list" element={<ExpertsPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/fit-card" element={<FitCardPage />} />
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
    </Routes>
  );
}
