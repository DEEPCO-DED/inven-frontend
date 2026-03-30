import { useEffect, useState } from "react";
import styles from "./Wastage.module.css";

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  stock_qty: number;
};

const API_BASE = "http://127.0.0.1:8000/api";

export default function Wastage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientId, setIngredientId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/ingredients/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load ingredients");
        return res.json();
      })
      .then((data) => setIngredients(data))
      .catch(() => setError("Could not fetch ingredients"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ingredientId || quantity <= 0) {
      setError("Please select an ingredient and enter valid quantity");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const res = await fetch(`${API_BASE}/wastage/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient: Number(ingredientId), quantity, reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.detail || "Failed to add wastage");
      }
      setSuccess("Wastage recorded successfully");
      setQuantity(0);
      setReason("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        <p className={styles.eyebrow}>Kitchen ops</p>
        <h1 className={styles.title}>Wastage</h1>

        <div className={styles.badge}>
          <span className={styles.dot} />
          Tracking active
        </div>

        <form onSubmit={handleSubmit} className={styles.card}>
          <div className={styles.cardTop}>
            <p className={styles.cardSub}>New entry</p>
            <p className={styles.cardHeading}>Log wastage</p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.field}>
              <span className={styles.lbl}>Ingredient</span>
              <select
                className={styles.inp}
                value={ingredientId}
                onChange={(e) => setIngredientId(Number(e.target.value))}
              >
                <option value="">Select ingredient…</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} (Stock: {ing.stock_qty} {ing.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <span className={styles.lbl}>Quantity wasted</span>
              <input
                className={styles.inp}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.lbl}>
                Reason <span className={styles.optional}>(optional)</span>
              </span>
              <input
                className={styles.inp}
                type="text"
                placeholder="Expired / Spilled / Burnt"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => {
                setIngredientId("");
                setQuantity(0);
                setReason("");
                setSuccess(null);
                setError(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnSave} disabled={loading}>
              {loading ? "Saving..." : "Submit wastage"}
            </button>
          </div>
        </form>

        {success && <p className={styles.success}>✓ {success}</p>}
        {error && <p className={styles.error}>✕ {error}</p>}

      </div>
    </div>
  );
}