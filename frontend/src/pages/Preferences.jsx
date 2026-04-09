import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "../components/layout/StepLayout";
import SearchMultiSelect from "../components/ui/SearchMultiSelect";
import styles from "../data/options/styles.json";
import occasions from "../data/options/occasions.json";
import { useFlowStore } from "../app/store";

export default function Preferences() {
  const nav = useNavigate();
  const { preferences, setPreferences, markStepCompleted, markStepSkipped } = useFlowStore();

  const [styleSel, setStyleSel] = useState(preferences.styles || []);
  const [occasionSel, setOccasionSel] = useState(preferences.occasions || []);

  function continueNext() {
    setPreferences({ styles: styleSel, occasions: occasionSel });
    markStepCompleted("preferences");
    nav("/scan");
  }

  function skip() {
    markStepSkipped("preferences");
    nav("/scan");
  }

  return (
    <StepLayout
      step={2}
      total={8}
      title="Step 2 · Preferences"
      subtitle="Pick any number of options or skip."
      actions={
        <>
          <button className="btn" onClick={continueNext}>Continue</button>
          <button className="btn ghost" onClick={skip}>Skip for now</button>
        </>
      }
    >
      <SearchMultiSelect label="Styles" options={styles} value={styleSel} onChange={setStyleSel} />
      <SearchMultiSelect label="Occasions" options={occasions} value={occasionSel} onChange={setOccasionSel} />
    </StepLayout>
  );
}
