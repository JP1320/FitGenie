"use client";
import { useParams } from "next/navigation";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import IntentScreen from "@/components/screens/IntentScreen";
import BasicProfileScreen from "@/components/screens/BasicProfileScreen";
import BodyInputScreen from "@/components/screens/BodyInputScreen";
import ScannerScreen from "@/components/screens/ScannerScreen";
import StoreScreen from "@/components/screens/StoreScreen";
import ServiceSelectionScreen from "@/components/screens/ServiceSelectionScreen";
import ExpertListScreen from "@/components/screens/ExpertListScreen";
import DeliveryScreen from "@/components/screens/DeliveryScreen";
import FitCardScreen from "@/components/screens/FitCardScreen";
import TrackingScreen from "@/components/screens/TrackingScreen";
import FeedbackScreen from "@/components/screens/FeedbackScreen";

export default function FlowPage() {
  const { step } = useParams<{ step: string }>();
  const n = Number(step);

  if (n === 1) return <WelcomeScreen />;
  if (n === 2) return <IntentScreen />;
  if (n === 3) return <BasicProfileScreen />;
  if (n === 4) return <BodyInputScreen />;
  if (n === 5) return <ScannerScreen />;
  if (n === 6) return <StoreScreen />;
  if (n === 7) return <ServiceSelectionScreen />;
  if (n === 8) return <ExpertListScreen />;
  if (n === 9) return <DeliveryScreen />;
  if (n === 10) return <FitCardScreen />;
  if (n === 11) return <TrackingScreen />;
  if (n === 12) return <FeedbackScreen />;
  return <WelcomeScreen />;
}
