import { useEffect, useState } from "react";
import styles from "./Inventory.module.css";

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  stock_qty: number;
  low_stock_alert: number;
};

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filtered, setFiltered] = useState<Ingredient[]>([]);
  const [updates, setUpdates] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch ingredients on page load
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/ingredients/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load ingredients");
        return res.json();
      })
      .then((data: Ingredient[]) => {
        setIngredients(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load inventory. Is backend running?");
        setLoading(false);
      });
  }, []);

  const onSearch = (q: string) => {
    const query = q.toLowerCase();
    setFiltered(
      ingredients.filter((i) => i.name.toLowerCase().includes(query))
    );
  };

  const updateQty = (id: number, val: number) => {
    setUpdates((prev) => ({ ...prev, [id]: val }));
  };

  const saveStock = async (id: number) => {
    const add_qty = updates[id];
    if (!add_qty || add_qty <= 0) {
      alert("Enter quantity to add");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ingredients/add-stock/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, add_qty }),
      });

      if (!res.ok) throw new Error("Failed to update stock");

      const data = await res.json();

      const updated = ingredients.map((i) =>
        i.id === id ? { ...i, stock_qty: data.new_stock } : i
      );

      setIngredients(updated);
      setFiltered(updated);
      setUpdates((prev) => ({ ...prev, [id]: 0 }));
    } catch {
      alert("Error updating stock. Check backend.");
    }
  };

  if (loading) return <p>Loading inventory...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Inventory</h1>
        <input
          className={styles.search}
          placeholder="Search ingredient..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Table header */}
      <div className={styles.tableHeader}>
        <span>Name</span>
        <span>Stock</span>
        <span>Status</span>
        <span>Update</span>
      </div>

      {/* Rows */}
      <div className={styles.list}>
        {filtered.map((ing) => {
          const low = ing.stock_qty <= ing.low_stock_alert;

          return (
            <div
              key={ing.id}
              className={`${styles.card} ${low ? styles.low : ""}`}
            >
              <div className={styles.name}>{ing.name}</div>

              <div className={styles.stock}>
                {ing.stock_qty} {ing.unit}
              </div>

              <div>
                {low ? (
                  <span className={styles.alert}>Low stock</span>
                ) : (
                  <span className={styles.ok}>In stock</span>
                )}
              </div>

              <div className={styles.actions}>
                <input
                  type="number"
                  min="0"
                  placeholder={`+ ${ing.unit}`}
                  value={updates[ing.id] || ""}
                  onChange={(e) => updateQty(ing.id, Number(e.target.value))}
                />
                <button onClick={() => saveStock(ing.id)}>Add</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}