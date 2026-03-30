import { useState, useEffect } from "react";
import API from "../Services/api";

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  stock_qty: number;
  low_stock_alert: number;
}

interface OrderItem {
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  quantity_ordered: number;
}

const Ordering = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await API.get("/ingredients/");
      setIngredients(response.data);
    } catch (err) {
      setError("Failed to load ingredients");
    }
  };

  const addItem = (ingredient: Ingredient) => {
    const exists = orderItems.find(
      (item) => item.ingredient_id === ingredient.id
    );
    if (exists) return;

    setOrderItems([
      ...orderItems,
      {
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        unit: ingredient.unit,
        quantity_ordered: 1,
      },
    ]);
  };

  const updateQuantity = (ingredient_id: number, quantity: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.ingredient_id === ingredient_id
          ? { ...item, quantity_ordered: quantity }
          : item
      )
    );
  };

  const removeItem = (ingredient_id: number) => {
    setOrderItems(orderItems.filter((item) => item.ingredient_id !== ingredient_id));
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      setError("Please add at least one item");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.post("/orders/purchase/create/", {
        notes,
        items: orderItems.map((item) => ({
          ingredient: item.ingredient_id,
          quantity_ordered: item.quantity_ordered,
        })),
      });

      setSuccess(
        `Order PO-${response.data.id} submitted to warehouse!`
      );
      setOrderItems([]);
      setNotes("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Purchase Order</h2>

      {success && <div style={styles.success}>{success}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.layout}>
        {/* Left — Ingredient list */}
        <div style={styles.ingredientCard}>
          <h3 style={styles.cardTitle}>Select Ingredients</h3>
          <div style={styles.ingredientList}>
            {ingredients.map((ing) => (
              <div key={ing.id} style={styles.ingredientRow}>
                <div>
                  <div style={styles.ingName}>{ing.name}</div>
                  <div style={styles.ingStock}>
                    Stock: {ing.stock_qty} {ing.unit}
                    {ing.stock_qty <= ing.low_stock_alert && (
                      <span style={styles.lowStock}> ⚠ Low</span>
                    )}
                  </div>
                </div>
                <button
                  style={
                    orderItems.find((i) => i.ingredient_id === ing.id)
                      ? styles.addedBtn
                      : styles.addBtn
                  }
                  onClick={() => addItem(ing)}
                  disabled={!!orderItems.find((i) => i.ingredient_id === ing.id)}
                >
                  {orderItems.find((i) => i.ingredient_id === ing.id)
                    ? "Added"
                    : "+ Add"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Order summary */}
        <div style={styles.orderCard}>
          <h3 style={styles.cardTitle}>
            Order Summary ({orderItems.length} items)
          </h3>

          <div style={styles.orderSummaryContent}>
            {orderItems.length === 0 ? (
              <p style={styles.emptyText}>No items added yet</p>
            ) : (
              <>
                {/* Scrollable Area for Items */}
                <div style={styles.scrollableItems}>
                  {orderItems.map((item) => (
                    <div key={item.ingredient_id} style={styles.orderRow}>
                      <div style={styles.orderItemName}>{item.ingredient_name}</div>
                      <div style={styles.orderItemControls}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity_ordered}
                          onChange={(e) =>
                            updateQuantity(
                              item.ingredient_id,
                              parseFloat(e.target.value) || 1
                            )
                          }
                          style={styles.qtyInput}
                        />
                        <span style={styles.unit}>{item.unit}</span>
                        <button
                          style={styles.removeBtn}
                          onClick={() => removeItem(item.ingredient_id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fixed Footer Area (Notes + Button) */}
                <div style={styles.orderFooter}>
                  <div style={styles.notesField}>
                    <label style={styles.label}>Notes (optional)</label>
                    <textarea
                      style={styles.textarea}
                      placeholder="Add any notes for warehouse..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <button
                    style={loading ? styles.submitBtnDisabled : styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Order to Warehouse"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    paddingBottom: "100px", 
    // Extra space for mobile view when keyboard is open
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "20px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "start",
  },
  ingredientCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    height: "600px",
    display: "flex",
    flexDirection: "column",
    paddingBottom:150,
  },
  ingredientList: {
    flex: 1,
    overflowY: "auto",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    height: "600px", // Fixed height to ensure scrolling works
    display: "flex",
    flexDirection: "column",
    paddingBottom:100
  },
  orderSummaryContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden", // Prevents the whole card from growing
  },
  scrollableItems: {
    flex: 1, // Takes up available space
    overflowY: "auto", // This enables the scroll for items ONLY
    paddingRight: "8px",
  },
  orderFooter: {
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
    marginTop: "10px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1f2937",
  },
  ingredientRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  ingName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
  },
  ingStock: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
  },
  lowStock: {
    color: "#ef4444",
    fontWeight: "600",
  },
  addBtn: {
    padding: "6px 14px",
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  addedBtn: {
    padding: "6px 14px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "not-allowed",
    fontSize: "13px",
  },
  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  orderItemName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
  },
  orderItemControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  qtyInput: {
    width: "60px",
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    textAlign: "center",
  },
  unit: {
    fontSize: "12px",
    color: "#6b7280",
    minWidth: "40px",
  },
  removeBtn: {
    padding: "4px 8px",
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  notesField: {
    marginBottom: "12px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    display: "block",
    marginBottom: "6px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "none",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#e67e22",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
  },
  submitBtnDisabled: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#f0a868",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "not-allowed",
  },
  emptyText: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: "40px",
    fontSize: "14px",
  },
  success: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
};

export default Ordering;