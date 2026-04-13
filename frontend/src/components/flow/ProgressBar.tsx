export default function ProgressBar({ step, total }: { step:number; total:number }) {
  const pct = (step / total) * 100;
  return (
    <div>
      <p className="text-sm text-white/80">Step {step} of {total}</p>
      <div className="h-2 bg-white/20 rounded-full mt-2">
        <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
