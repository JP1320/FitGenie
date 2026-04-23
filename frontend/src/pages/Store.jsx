import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../store/useFlowStore";

const PRODUCTS = [
  { id: 1, name: "Classic Casual Shirt", style: "Casual", budget: "₹1,000-₹2,000", fabric: "Cotton", fit: "Regular", sleeve: "Full", length: "Regular", price: "₹1499", match: 92, why: "Matches your fit and lifestyle", img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop" },
  { id: 2, name: "Ethnic Kurta Set", style: "Ethnic", budget: "₹2,000-₹5,000", fabric: "Linen", fit: "Regular", sleeve: "Full", length: "Long", price: "₹2899", match: 88, why: "Great for festive and comfort", img: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1200&auto=format&fit=crop" }
];

export default function Store() {
  const nav = useNavigate();
  const { filters, patchFilters, patch } = useFlowStore();

  const items = useMemo(() => PRODUCTS.filter(p =>
    (!filters.style || p.style === filters.style) &&
    (!filters.budget || p.budget === filters.budget) &&
    (!filters.fabric || p.fabric === filters.fabric) &&
    (!filters.fit || p.fit === filters.fit) &&
    (!filters.sleeve || p.sleeve === filters.sleeve) &&
    (!filters.length || p.length === filters.length)
  ), [filters]);

  return (
    <main className="storePage">
      <section className="storeWrap">
        <div className="step dark">Step 6 of 12</div>
        <h1 className="dark">AI Clothing Store</h1>

        <div className="filters">
          <select onChange={(e) => patchFilters({ style: e.target.value })}><option value="">Style</option><option>Ethnic</option><option>Western</option><option>Indo-Western</option><option>Casual</option><option>Formal</option><option>Sportswear</option></select>
          <select onChange={(e) => patchFilters({ budget: e.target.value })}><option value="">Budget</option><option>Under ₹500</option><option>₹500-₹1,000</option><option>₹1,000-₹2,000</option><option>₹2,000-₹5,000</option><option>Above ₹5,000</option></select>
          <select onChange={(e) => patchFilters({ fabric: e.target.value })}><option value="">Fabric</option><option>Cotton</option><option>Linen</option><option>Silk</option><option>Wool</option><option>Denim</option></select>
          <select onChange={(e) => patchFilters({ fit: e.target.value })}><option value="">Fit</option><option>Slim</option><option>Regular</option><option>Oversized</option></select>
          <input placeholder="Sleeve type" onChange={(e) => patchFilters({ sleeve: e.target.value })} />
          <input placeholder="Length" onChange={(e) => patchFilters({ length: e.target.value })} />
        </div>

        <div className="gridProducts">
          {items.map(p => (
            <article key={p.id} className="product" onClick={() => patch({ selectedProduct: p })}>
              <img src={p.img} alt={p.name} />
              <h3>{p.name}</h3>
              <p>{p.price}</p>
              <p>Match: {p.match}%</p>
              <small>{p.why}</small>
            </article>
          ))}
        </div>

        <div className="row">
          <button className="btn darkBtn" onClick={() => nav("/service-selection")}>Continue</button>
        </div>
      </section>
    </main>
  );
}
