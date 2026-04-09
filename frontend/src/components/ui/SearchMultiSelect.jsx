import React, { useMemo, useState } from "react";

export default function SearchMultiSelect({
  label,
  options = [],
  value = [],
  onChange
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return options
      .filter((o) => o.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 140);
  }, [q, options]);

  function toggle(item) {
    if (value.includes(item)) onChange(value.filter((v) => v !== item));
    else onChange([...value, item]);
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <label>{label}</label>
      <input
        placeholder={`Search ${label}`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="chips">
        {filtered.map((item) => (
          <span
            key={item}
            className={`chip ${value.includes(item) ? "active" : ""}`}
            onClick={() => toggle(item)}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
