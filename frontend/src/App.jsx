import React from "react";
import { Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav";
import WelcomePage from "./pages/WelcomePage";
import IntentPage from "./pages/IntentPage";
import BasicProfilePage from "./pages/BasicProfilePage";
import SizeBodyPage from "./pages/SizeBodyPage";
import CameraScanPage from "./pages/CameraScanPage";
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
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/intent" element={<IntentPage />} />
        <Route path="/basic-profile" element={<BasicProfilePage />} />
        <Route path="/size-body" element={<SizeBodyPage />} />
        <Route path="/camera-scan" element={<CameraScanPage />} />
        <Route path="/guided-filters" element={<GuidedFiltersPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/service-type" element={<ServiceTypePage />} />
        <Route path="/quality-location" element={<QualityLocationPage />} />
        <Route path="/experts" element={<ExpertsPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/fit-card" element={<FitCardPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </>
  );
}
