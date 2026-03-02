import { useState, useEffect, useMemo } from "react";

// ─── Persistent Storage via localStorage ───────────────────────────────────
const store = {
  get: (key, def = []) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

const today = () => new Date().toISOString().split("T")[0];
const fmt = (n) => Number(n || 0).toFixed(2);
const sum = (arr, key) => arr.reduce((a, b) => a + Number(b[key] || 0), 0);

// ─── Icons (SVG inline) ────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const paths = {
    home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    package: "M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 11a4 4 0 100-8 4 4 0 000 8z",
    shoppingCart: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18 M16 10a4 4 0 01-8 0",
    dollarSign: "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    barChart: "M12 20V10 M18 20V4 M6 20v-4",
    plus: "M12 5v14 M5 12h14",
    trash: "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    milk: "M8 2h8l1 4H7L8 2zM7 6v2a5 5 0 0010 0V6",
    chevronDown: "M6 9l6 6 6-6",
    x: "M18 6L6 18 M6 6l12 12",
    check: "M20 6L9 17l-5-5",
    calendar: "M3 4h18v18H3V4z M16 2v4 M8 2v4 M3 10h18",
    search: "M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35",
    trendingUp: "M23 6l-9.5 9.5-5-5L1 18",
    trendingDown: "M23 18l-9.5-9.5-5 5L1 6",
    building: "M3 21h18 M3 7l9-4 9 4v14H3V7z M9 21v-4h6v4",
    droplets: "M12 2C6.5 11 4 15.5 4 18a8 8 0 0016 0c0-2.5-2.5-7-8-16z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {(paths[name] || "").split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
};

// ─── Toast ─────────────────────────────────────────────────────────────────
let toastFn = null;
const Toast = () => {
  const [toasts, setToasts] = useState([]);
  toastFn = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "error" ? "#ef4444" : t.type === "warning" ? "#f59e0b" : "#10b981",
          color: "#fff", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", animation: "slideIn 0.3s ease",
          maxWidth: 280
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
};
const toast = (msg, type) => toastFn && toastFn(msg, type);

// ─── Modal ─────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: "#1e2433", borderRadius: 20, width: "100%", maxWidth: 440, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid #2d3547" }}>
        <h3 style={{ margin: 0, color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}><Icon name="x" size={18} /></button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </div>
);

// ─── Input Components ───────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "#0f1623", border: "1.5px solid #2d3547", borderRadius: 10,
  color: "#e2e8f0", padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
};
const labelStyle = { display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input style={inputStyle} {...props} onFocus={e => (e.target.style.borderColor = "#38bdf8")} onBlur={e => (e.target.style.borderColor = "#2d3547")} />
);

const Select = ({ options, value, onChange, placeholder }) => (
  <select value={value} onChange={onChange} style={{ ...inputStyle, appearance: "none" }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
  </select>
);

const Btn = ({ children, onClick, variant = "primary", small, icon, full, type = "button" }) => {
  const styles = {
    primary: { background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", color: "#fff", border: "none" },
    danger: { background: "linear-gradient(135deg, #ef4444, #f87171)", color: "#fff", border: "none" },
    ghost: { background: "transparent", color: "#94a3b8", border: "1.5px solid #2d3547" },
    success: { background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none" },
  };
  return (
    <button type={type} onClick={onClick} style={{
      ...styles[variant], padding: small ? "7px 14px" : "11px 20px", borderRadius: 10, cursor: "pointer",
      fontSize: small ? 13 : 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6,
      width: full ? "100%" : "auto", justifyContent: full ? "center" : "flex-start", transition: "opacity 0.2s",
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      {icon && <Icon name={icon} size={small ? 15 : 17} />}
      {children}
    </button>
  );
};

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{ background: "#1e2433", borderRadius: 16, padding: "16px 18px", flex: 1, minWidth: 140, border: `1px solid ${color}22` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{label}</span>
      <div style={{ color, opacity: 0.8 }}><Icon name={icon} size={18} /></div>
    </div>
    <div style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 800 }}>{value}</div>
    {sub && <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>{sub}</div>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = ({ data }) => {
  const { purchases, sales, products, buyers } = data;
  const todayStr = today();

  const todaySales = sales.filter(s => s.date === todayStr);
  const todayPurchases = purchases.filter(p => p.date === todayStr);

  const totalRevenue = sum(todaySales, "totalPrice");
  const totalCost = sum(todayPurchases, "totalCost");
  const profit = totalRevenue - totalCost;

  const monthSales = sales.filter(s => s.date.startsWith(todayStr.slice(0, 7)));
  const monthRevenue = sum(monthSales, "totalPrice");

  // Recent activity
  const recent = [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 20, fontWeight: 800 }}>Dashboard</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Today Revenue" value={`₹${fmt(totalRevenue)}`} icon="trendingUp" color="#10b981" sub={`${todaySales.length} sales`} />
        <StatCard label="Today Cost" value={`₹${fmt(totalCost)}`} icon="shoppingCart" color="#f59e0b" sub={`${todayPurchases.length} purchases`} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Today Profit" value={`₹${fmt(profit)}`} icon="dollarSign" color={profit >= 0 ? "#38bdf8" : "#ef4444"} />
        <StatCard label="Month Revenue" value={`₹${fmt(monthRevenue)}`} icon="barChart" color="#a78bfa" sub={`${monthSales.length} sales`} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Products" value={products.length} icon="package" color="#38bdf8" />
        <StatCard label="Buyers" value={buyers.length} icon="users" color="#f472b6" />
      </div>

      {recent.length > 0 && (
        <div style={{ background: "#1e2433", borderRadius: 16, padding: 16 }}>
          <h3 style={{ margin: "0 0 14px", color: "#94a3b8", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Recent Sales</h3>
          {recent.map((s, i) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < recent.length - 1 ? "1px solid #2d3547" : "none" }}>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{s.buyerName}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{s.productName} · {s.date}</div>
              </div>
              <div style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>₹{fmt(s.totalPrice)}</div>
            </div>
          ))}
        </div>
      )}

      {recent.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          <Icon name="droplets" size={48} />
          <p style={{ marginTop: 12 }}>No sales yet today. Start adding entries!</p>
        </div>
      )}
    </div>
  );
};

// ── Products Page ──────────────────────────────────────────────────────────
const ProductsPage = ({ data, setData }) => {
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", type: "", company: "", unit: "Litre" });
  const companies = [...new Set(data.products.map(p => p.company).filter(Boolean))];

  const openAdd = () => { setEditItem(null); setForm({ name: "", type: "", company: "", unit: "Litre" }); setModal(true); };
  const openEdit = (p) => { setEditItem(p); setForm({ name: p.name, type: p.type, company: p.company, unit: p.unit || "Litre" }); setModal(true); };

  const save = () => {
    if (!form.name.trim() || !form.company.trim()) return toast("Fill all required fields", "error");
    if (editItem) {
      const updated = data.products.map(p => p.id === editItem.id ? { ...p, ...form } : p);
      setData(d => ({ ...d, products: updated }));
      store.set("products", updated);
      toast("Product updated!");
    } else {
      const newP = { id: Date.now(), ...form };
      const updated = [...data.products, newP];
      setData(d => ({ ...d, products: updated }));
      store.set("products", updated);
      toast("Product added!");
    }
    setModal(false);
  };

  const del = (id) => {
    if (!confirm("Delete this product?")) return;
    const updated = data.products.filter(p => p.id !== id);
    setData(d => ({ ...d, products: updated }));
    store.set("products", updated);
    toast("Deleted!", "warning");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 20, fontWeight: 800 }}>Products</h2>
        <Btn icon="plus" small onClick={openAdd}>Add</Btn>
      </div>

      {data.products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <Icon name="package" size={48} />
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        data.products.map(p => (
          <div key={p.id} style={{ background: "#1e2433", borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid #2d3547", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>{p.name}</div>
              <div style={{ color: "#38bdf8", fontSize: 12, marginTop: 2 }}>{p.company}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>Type: {p.type} · Unit: {p.unit}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openEdit(p)} style={{ background: "#2d3547", border: "none", color: "#94a3b8", padding: "7px", borderRadius: 8, cursor: "pointer" }}><Icon name="edit" size={15} /></button>
              <button onClick={() => del(p.id)} style={{ background: "#2d3547", border: "none", color: "#ef4444", padding: "7px", borderRadius: 8, cursor: "pointer" }}><Icon name="trash" size={15} /></button>
            </div>
          </div>
        ))
      )}

      {modal && (
        <Modal title={editItem ? "Edit Product" : "Add Product"} onClose={() => setModal(false)}>
          <Field label="Product Name *">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Full Cream Milk" />
          </Field>
          <Field label="Product Type *">
            <Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="e.g. Milk, Curd, Butter" />
          </Field>
          <Field label="Company Name *">
            <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Amul, Mother Dairy" list="companies-list" />
            <datalist id="companies-list">{companies.map(c => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Unit">
            <Select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} options={["Litre", "500ml", "250ml", "Kg", "Packet", "Piece"]} />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn full onClick={save} icon="check">{editItem ? "Update" : "Add Product"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Buyers Page ────────────────────────────────────────────────────────────
const BuyersPage = ({ data, setData }) => {
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ shopName: "", ownerName: "", phone: "", address: "" });

  const openAdd = () => { setEditItem(null); setForm({ shopName: "", ownerName: "", phone: "", address: "" }); setModal(true); };
  const openEdit = (b) => { setEditItem(b); setForm({ shopName: b.shopName, ownerName: b.ownerName, phone: b.phone, address: b.address }); setModal(true); };

  const save = () => {
    if (!form.shopName.trim()) return toast("Shop name is required", "error");
    if (editItem) {
      const updated = data.buyers.map(b => b.id === editItem.id ? { ...b, ...form } : b);
      setData(d => ({ ...d, buyers: updated }));
      store.set("buyers", updated);
      toast("Buyer updated!");
    } else {
      const updated = [...data.buyers, { id: Date.now(), ...form }];
      setData(d => ({ ...d, buyers: updated }));
      store.set("buyers", updated);
      toast("Buyer added!");
    }
    setModal(false);
  };

  const del = (id) => {
    if (!confirm("Delete this buyer?")) return;
    const updated = data.buyers.filter(b => b.id !== id);
    setData(d => ({ ...d, buyers: updated }));
    store.set("buyers", updated);
    toast("Deleted!", "warning");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 20, fontWeight: 800 }}>Buyers</h2>
        <Btn icon="plus" small onClick={openAdd}>Add</Btn>
      </div>

      {data.buyers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <Icon name="building" size={48} />
          <p>No buyers yet. Add your first buyer!</p>
        </div>
      ) : (
        data.buyers.map(b => (
          <div key={b.id} style={{ background: "#1e2433", borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid #2d3547" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>{b.shopName}</div>
                {b.ownerName && <div style={{ color: "#94a3b8", fontSize: 13 }}>{b.ownerName}</div>}
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                  {b.phone && <span>📞 {b.phone} </span>}
                  {b.address && <span>📍 {b.address}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => openEdit(b)} style={{ background: "#2d3547", border: "none", color: "#94a3b8", padding: "7px", borderRadius: 8, cursor: "pointer" }}><Icon name="edit" size={15} /></button>
                <button onClick={() => del(b.id)} style={{ background: "#2d3547", border: "none", color: "#ef4444", padding: "7px", borderRadius: 8, cursor: "pointer" }}><Icon name="trash" size={15} /></button>
              </div>
            </div>
          </div>
        ))
      )}

      {modal && (
        <Modal title={editItem ? "Edit Buyer" : "Add Buyer"} onClose={() => setModal(false)}>
          <Field label="Shop Name *">
            <Input value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} placeholder="e.g. Shree Dairy Shop" />
          </Field>
          <Field label="Owner Name">
            <Input value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} placeholder="Owner full name" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" type="tel" />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Shop address" />
          </Field>
          <Btn full onClick={save} icon="check">{editItem ? "Update" : "Add Buyer"}</Btn>
        </Modal>
      )}
    </div>
  );
};

// ── Purchase Page ──────────────────────────────────────────────────────────
const PurchasePage = ({ data, setData }) => {
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterDate, setFilterDate] = useState(today());
  const [form, setForm] = useState({ date: today(), productId: "", quantity: "", purchasePrice: "", maxSellPrice: "", note: "" });

  const selectedProduct = data.products.find(p => p.id === Number(form.productId));

  const openAdd = () => { setEditItem(null); setForm({ date: today(), productId: "", quantity: "", purchasePrice: "", maxSellPrice: "", note: "" }); setModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ date: item.date, productId: String(item.productId), quantity: item.quantity, purchasePrice: item.purchasePrice, maxSellPrice: item.maxSellPrice, note: item.note || "" }); setModal(true); };

  const save = () => {
    if (!form.productId || !form.quantity || !form.purchasePrice) return toast("Fill required fields", "error");
    const prod = data.products.find(p => p.id === Number(form.productId));
    const totalCost = Number(form.quantity) * Number(form.purchasePrice);
    const entry = { ...form, productId: Number(form.productId), productName: prod?.name, companyName: prod?.company, unit: prod?.unit, quantity: Number(form.quantity), purchasePrice: Number(form.purchasePrice), maxSellPrice: Number(form.maxSellPrice), totalCost };
    if (editItem) {
      const updated = data.purchases.map(p => p.id === editItem.id ? { ...p, ...entry } : p);
      setData(d => ({ ...d, purchases: updated }));
      store.set("purchases", updated);
      toast("Purchase updated!");
    } else {
      const updated = [...data.purchases, { id: Date.now(), ...entry }];
      setData(d => ({ ...d, purchases: updated }));
      store.set("purchases", updated);
      toast("Purchase added!");
    }
    setModal(false);
  };

  const del = (id) => {
    if (!confirm("Delete this purchase?")) return;
    const updated = data.purchases.filter(p => p.id !== id);
    setData(d => ({ ...d, purchases: updated }));
    store.set("purchases", updated);
    toast("Deleted!", "warning");
  };

  const filtered = data.purchases.filter(p => !filterDate || p.date === filterDate).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 20, fontWeight: 800 }}>Purchases</h2>
        <Btn icon="plus" small onClick={openAdd}>Add</Btn>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          <Icon name="shoppingCart" size={48} />
          <p>No purchases for this date.</p>
        </div>
      ) : (
        <>
          <div style={{ background: "#1e2433", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Total: {filtered.length} entries</span>
            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 14 }}>₹{fmt(sum(filtered, "totalCost"))}</span>
          </div>
          {filtered.map(p => (
            <div key={p.id} style={{ background: "#1e2433", borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid #2d3547" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e2e8f0", fontWeight: 700 }}>{p.productName}</div>
                  <div style={{ color: "#38bdf8", fontSize: 12 }}>{p.companyName}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                    Qty: {p.quantity} {p.unit} · Buy: ₹{p.purchasePrice} · MRP: ₹{p.maxSellPrice}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>{p.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 15 }}>₹{fmt(p.totalCost)}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button onClick={() => openEdit(p)} style={{ background: "#2d3547", border: "none", color: "#94a3b8", padding: "6px", borderRadius: 7, cursor: "pointer" }}><Icon name="edit" size={14} /></button>
                    <button onClick={() => del(p.id)} style={{ background: "#2d3547", border: "none", color: "#ef4444", padding: "6px", borderRadius: 7, cursor: "pointer" }}><Icon name="trash" size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {modal && (
        <Modal title={editItem ? "Edit Purchase" : "Add Purchase"} onClose={() => setModal(false)}>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </Field>
          <Field label="Company *">
            <Select value={form.productId ? String(data.products.find(p => p.id === Number(form.productId))?.company || "") : ""}
              onChange={e => { setForm(f => ({ ...f, productId: "" })); }}
              options={[...new Set(data.products.map(p => p.company))].map(c => ({ value: c, label: c }))}
              placeholder="Select Company" />
          </Field>
          <Field label="Product *">
            <Select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              options={data.products.map(p => ({ value: String(p.id), label: `${p.name} (${p.company})` }))}
              placeholder="Select Product" />
          </Field>
          {selectedProduct && (
            <div style={{ background: "#0f1623", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
              <span style={{ color: "#38bdf8", fontSize: 12 }}>{selectedProduct.company} · {selectedProduct.type} · {selectedProduct.unit}</span>
            </div>
          )}
          <Field label="Quantity *">
            <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" min="0" step="0.5" />
          </Field>
          <Field label="Purchase Price (per unit) *">
            <Input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} placeholder="₹ 0.00" min="0" step="0.01" />
          </Field>
          <Field label="Maximum Selling Price (MRP)">
            <Input type="number" value={form.maxSellPrice} onChange={e => setForm(f => ({ ...f, maxSellPrice: e.target.value }))} placeholder="₹ 0.00" min="0" step="0.01" />
          </Field>
          {form.quantity && form.purchasePrice && (
            <div style={{ background: "#0f1623", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>Total Cost: ₹{fmt(Number(form.quantity) * Number(form.purchasePrice))}</span>
            </div>
          )}
          <Field label="Note">
            <Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note" />
          </Field>
          <Btn full onClick={save} icon="check">{editItem ? "Update" : "Add Purchase"}</Btn>
        </Modal>
      )}
    </div>
  );
};

// ── Sales Page ─────────────────────────────────────────────────────────────
const SalesPage = ({ data, setData }) => {
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterDate, setFilterDate] = useState(today());
  const [form, setForm] = useState({ date: today(), buyerId: "", productId: "", quantity: "", sellPrice: "", note: "" });

  const openAdd = () => { setEditItem(null); setForm({ date: today(), buyerId: "", productId: "", quantity: "", sellPrice: "", note: "" }); setModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ date: item.date, buyerId: String(item.buyerId), productId: String(item.productId), quantity: item.quantity, sellPrice: item.sellPrice, note: item.note || "" }); setModal(true); };

  const save = () => {
    if (!form.buyerId || !form.productId || !form.quantity || !form.sellPrice) return toast("Fill all required fields", "error");
    const buyer = data.buyers.find(b => b.id === Number(form.buyerId));
    const prod = data.products.find(p => p.id === Number(form.productId));
    const totalPrice = Number(form.quantity) * Number(form.sellPrice);
    const entry = { ...form, buyerId: Number(form.buyerId), buyerName: buyer?.shopName, productId: Number(form.productId), productName: prod?.name, companyName: prod?.company, unit: prod?.unit, quantity: Number(form.quantity), sellPrice: Number(form.sellPrice), totalPrice };
    if (editItem) {
      const updated = data.sales.map(s => s.id === editItem.id ? { ...s, ...entry } : s);
      setData(d => ({ ...d, sales: updated }));
      store.set("sales", updated);
      toast("Sale updated!");
    } else {
      const updated = [...data.sales, { id: Date.now(), ...entry }];
      setData(d => ({ ...d, sales: updated }));
      store.set("sales", updated);
      toast("Sale added!");
    }
    setModal(false);
  };

  const del = (id) => {
    if (!confirm("Delete this sale?")) return;
    const updated = data.sales.filter(s => s.id !== id);
    setData(d => ({ ...d, sales: updated }));
    store.set("sales", updated);
    toast("Deleted!", "warning");
  };

  const filtered = data.sales.filter(s => !filterDate || s.date === filterDate).sort((a, b) => b.id - a.id);
  const purchasedProducts = [...new Set(data.purchases.map(p => p.productId))];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 20, fontWeight: 800 }}>Sales</h2>
        <Btn icon="plus" small onClick={openAdd}>Add</Btn>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
      </div>

      {filtered.length > 0 && (
        <div style={{ background: "#1e2433", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>Total: {filtered.length} sales</span>
          <span style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>₹{fmt(sum(filtered, "totalPrice"))}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          <Icon name="dollarSign" size={48} />
          <p>No sales for this date.</p>
        </div>
      ) : (
        filtered.map(s => (
          <div key={s.id} style={{ background: "#1e2433", borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid #2d3547" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 700 }}>{s.buyerName}</div>
                <div style={{ color: "#38bdf8", fontSize: 12 }}>{s.productName} ({s.companyName})</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>Qty: {s.quantity} {s.unit} · ₹{s.sellPrice}/unit</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{s.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#10b981", fontWeight: 700, fontSize: 15 }}>₹{fmt(s.totalPrice)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => openEdit(s)} style={{ background: "#2d3547", border: "none", color: "#94a3b8", padding: "6px", borderRadius: 7, cursor: "pointer" }}><Icon name="edit" size={14} /></button>
                  <button onClick={() => del(s.id)} style={{ background: "#2d3547", border: "none", color: "#ef4444", padding: "6px", borderRadius: 7, cursor: "pointer" }}><Icon name="trash" size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {modal && (
        <Modal title={editItem ? "Edit Sale" : "Add Sale"} onClose={() => setModal(false)}>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </Field>
          <Field label="Buyer *">
            <Select value={form.buyerId} onChange={e => setForm(f => ({ ...f, buyerId: e.target.value }))}
              options={data.buyers.map(b => ({ value: String(b.id), label: b.shopName }))}
              placeholder="Select Buyer" />
          </Field>
          <Field label="Product *">
            <Select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              options={data.products.map(p => ({ value: String(p.id), label: `${p.name} (${p.company})` }))}
              placeholder="Select Product" />
          </Field>
          <Field label="Quantity *">
            <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" min="0" step="0.5" />
          </Field>
          <Field label="Sell Price (per unit) *">
            <Input type="number" value={form.sellPrice} onChange={e => setForm(f => ({ ...f, sellPrice: e.target.value }))} placeholder="₹ 0.00" min="0" step="0.01" />
          </Field>
          {form.quantity && form.sellPrice && (
            <div style={{ background: "#0f1623", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
              <span style={{ color: "#10b981", fontWeight: 700 }}>Total: ₹{fmt(Number(form.quantity) * Number(form.sellPrice))}</span>
            </div>
          )}
          <Field label="Note">
            <Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note" />
          </Field>
          <Btn full onClick={save} icon="check">{editItem ? "Update" : "Add Sale"}</Btn>
        </Modal>
      )}
    </div>
  );
};

// ── Reports Page ───────────────────────────────────────────────────────────
const ReportsPage = ({ data }) => {
  const [tab, setTab] = useState("daily");
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [month, setMonth] = useState(today().slice(0, 7));
  const [year, setYear] = useState(today().slice(0, 4));

  const filterSales = useMemo(() => {
    if (tab === "daily") return data.sales.filter(s => s.date >= dateFrom && s.date <= dateTo);
    if (tab === "monthly") return data.sales.filter(s => s.date.startsWith(month));
    if (tab === "yearly") return data.sales.filter(s => s.date.startsWith(year));
    return data.sales;
  }, [tab, dateFrom, dateTo, month, year, data.sales]);

  const filterPurchases = useMemo(() => {
    if (tab === "daily") return data.purchases.filter(p => p.date >= dateFrom && p.date <= dateTo);
    if (tab === "monthly") return data.purchases.filter(p => p.date.startsWith(month));
    if (tab === "yearly") return data.purchases.filter(p => p.date.startsWith(year));
    return data.purchases;
  }, [tab, dateFrom, dateTo, month, year, data.purchases]);

  const totalRevenue = sum(filterSales, "totalPrice");
  const totalCost = sum(filterPurchases, "totalCost");
  const profit = totalRevenue - totalCost;

  // Product-wise sales
  const productWise = useMemo(() => {
    const map = {};
    filterSales.forEach(s => {
      const key = s.productName || "Unknown";
      if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0 };
      map[key].qty += s.quantity;
      map[key].revenue += s.totalPrice;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filterSales]);

  // Buyer-wise sales
  const buyerWise = useMemo(() => {
    const map = {};
    filterSales.forEach(s => {
      const key = s.buyerName || "Unknown";
      if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0, count: 0 };
      map[key].qty += s.quantity;
      map[key].revenue += s.totalPrice;
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filterSales]);

  // Daily breakdown
  const dailyBreakdown = useMemo(() => {
    const map = {};
    filterSales.forEach(s => {
      if (!map[s.date]) map[s.date] = { date: s.date, revenue: 0, count: 0 };
      map[s.date].revenue += s.totalPrice;
      map[s.date].count++;
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [filterSales]);

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: "10px 4px", background: tab === id ? "linear-gradient(135deg,#0ea5e9,#38bdf8)" : "#1e2433",
      border: "none", color: tab === id ? "#fff" : "#64748b", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer"
    }}>{label}</button>
  );

  const Section = ({ title, children }) => (
    <div style={{ background: "#1e2433", borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <h3 style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 16px", color: "#e2e8f0", fontSize: 20, fontWeight: 800 }}>Reports</h2>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#0f1623", borderRadius: 12, padding: 4 }}>
        {tabBtn("daily", "Date Range")}
        {tabBtn("monthly", "Monthly")}
        {tabBtn("yearly", "Yearly")}
      </div>

      {tab === "daily" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>From</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>To</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      )}
      {tab === "monthly" && (
        <div style={{ marginBottom: 16 }}>
          <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
        </div>
      )}
      {tab === "yearly" && (
        <div style={{ marginBottom: 16 }}>
          <Select value={year} onChange={e => setYear(e.target.value)}
            options={Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i))} />
        </div>
      )}

      {/* Summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <StatCard label="Revenue" value={`₹${fmt(totalRevenue)}`} icon="trendingUp" color="#10b981" sub={`${filterSales.length} sales`} />
        <StatCard label="Cost" value={`₹${fmt(totalCost)}`} icon="shoppingCart" color="#f59e0b" sub={`${filterPurchases.length} items`} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ background: profit >= 0 ? "#0f2a1a" : "#2a0f0f", border: `1px solid ${profit >= 0 ? "#10b981" : "#ef4444"}44`, borderRadius: 14, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Profit / Loss</div>
            <div style={{ color: profit >= 0 ? "#10b981" : "#ef4444", fontSize: 26, fontWeight: 800 }}>₹{fmt(Math.abs(profit))}</div>
          </div>
          <div style={{ color: profit >= 0 ? "#10b981" : "#ef4444" }}>
            <Icon name={profit >= 0 ? "trendingUp" : "trendingDown"} size={32} />
          </div>
        </div>
      </div>

      {/* Product wise */}
      {productWise.length > 0 && (
        <Section title="Product-wise Sales">
          {productWise.map(p => (
            <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #2d3547" }}>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>Qty: {p.qty}</div>
              </div>
              <div style={{ color: "#10b981", fontWeight: 700 }}>₹{fmt(p.revenue)}</div>
            </div>
          ))}
        </Section>
      )}

      {/* Buyer wise */}
      {buyerWise.length > 0 && (
        <Section title="Buyer-wise Sales">
          {buyerWise.map(b => (
            <div key={b.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #2d3547" }}>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{b.name}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{b.count} transactions</div>
              </div>
              <div style={{ color: "#38bdf8", fontWeight: 700 }}>₹{fmt(b.revenue)}</div>
            </div>
          ))}
        </Section>
      )}

      {/* Daily breakdown */}
      {dailyBreakdown.length > 0 && (
        <Section title="Daily Breakdown">
          {dailyBreakdown.map(d => (
            <div key={d.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #2d3547" }}>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>{d.date} <span style={{ color: "#64748b", fontSize: 11 }}>({d.count} sales)</span></div>
              <div style={{ color: "#a78bfa", fontWeight: 700 }}>₹{fmt(d.revenue)}</div>
            </div>
          ))}
        </Section>
      )}

      {filterSales.length === 0 && filterPurchases.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          <Icon name="barChart" size={48} />
          <p>No data for the selected period.</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState(() => ({
    products: store.get("products"),
    buyers: store.get("buyers"),
    purchases: store.get("purchases"),
    sales: store.get("sales"),
  }));

  const nav = [
    { id: "dashboard", icon: "home", label: "Home" },
    { id: "products", icon: "package", label: "Products" },
    { id: "buyers", icon: "building", label: "Buyers" },
    { id: "purchase", icon: "shoppingCart", label: "Purchase" },
    { id: "sales", icon: "dollarSign", label: "Sales" },
    { id: "reports", icon: "barChart", label: "Reports" },
  ];

  const pages = {
    dashboard: <Dashboard data={data} />,
    products: <ProductsPage data={data} setData={setData} />,
    buyers: <BuyersPage data={data} setData={setData} />,
    purchase: <PurchasePage data={data} setData={setData} />,
    sales: <SalesPage data={data} setData={setData} />,
    reports: <ReportsPage data={data} />,
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0f1a; font-family: 'Segoe UI', system-ui, sans-serif; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0f1a; } ::-webkit-scrollbar-thumb { background: #2d3547; border-radius: 2px; }
        input[type=date]::-webkit-calendar-picker-indicator, input[type=month]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0f1623", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Header */}
        <div style={{ background: "#1e2433", borderBottom: "1px solid #2d3547", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ background: "linear-gradient(135deg,#0ea5e9,#38bdf8)", borderRadius: 10, padding: 7, display: "flex" }}>
            <Icon name="droplets" size={18} />
          </div>
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>MilkTrack</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>Dairy Inventory Manager</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 90px" }}>
          {pages[page]}
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#1e2433", borderTop: "1px solid #2d3547", display: "flex", padding: "8px 4px 10px", gap: 2, zIndex: 200 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, padding: "6px 2px",
              color: page === n.id ? "#38bdf8" : "#64748b", transition: "color 0.2s"
            }}>
              {page === n.id && <div style={{ position: "absolute", width: 32, height: 2, background: "#38bdf8", borderRadius: 2, marginTop: -8 }} />}
              <Icon name={n.icon} size={page === n.id ? 20 : 18} />
              <span style={{ fontSize: 10, fontWeight: page === n.id ? 700 : 500 }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Toast />
    </>
  );
}
