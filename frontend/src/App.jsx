import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import LoginEmail from "./pages/LoginEmail";
import LoginMobile from "./pages/LoginMobile";
import Intent from "./pages/Intent";
import BasicProfile from "./pages/BasicProfile";
import BodyInput from "./pages/BodyInput";
import Scanner from "./pages/Scanner";
import Store from "./pages/Store";
import ServiceSelection from "./pages/ServiceSelection";
import ExpertList from "./pages/ExpertList";
import Delivery from "./pages/Delivery";
import FitCard from "./pages/FitCard";
import Tracking from "./pages/Tracking";
import Feedback from "./pages/Feedback";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login/email" element={<LoginEmail />} />
      <Route path="/login/mobile" element={<LoginMobile />} />
      <Route path="/intent" element={<Intent />} />
      <Route path="/basic-profile" element={<BasicProfile />} />
      <Route path="/body-input" element={<BodyInput />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/store" element={<Store />} />
      <Route path="/service-selection" element={<ServiceSelection />} />
      <Route path="/expert-list" element={<ExpertList />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/fit-card" element={<FitCard />} />
      <Route path="/tracking" element={<Tracking />} />
      <Route path="/feedback" element={<Feedback />} />
    </Routes>
  );
}
