import { useState, useEffect } from "react";
import API from "../Services/api";

interface OrderItem {
  id: number;
  ingredient: number;        // ✅ was ingredient_id — backend sends "ingredient"
  ingredient_name: string;
  unit: string;
  quantity_ordered: number;
  quantity_received: number;
}

interface PurchaseOrder {
  id: number;
  status: string;
  notes: string;
  created_by: number;        // ✅ was string — it's a user id number
  created_by_name: string;   // ✅ ADD this — this has the actual name
  created_at: string;
  items: OrderItem[];
}
const Receiving = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

const fetchOrders = async () => {
  try {
    const response = await API.get("/orders/purchase/?status=DISPATCHED");
    const orders = response.data.map((order: PurchaseOrder) => ({
      ...order,
      items: order.items.map((item: OrderItem) => ({
        ...item,
        quantity_received: item.quantity_ordered, // ✅ pre-fill with ordered qty
      })),
    }));
    setOrders(orders);
  } catch (err) {
    setError("Failed to load orders");
  }
};
  // ---------------------------
  // Update received quantity
  // ---------------------------
  const updateReceivedQty = (
    orderId: number,
    itemId: number,
    qty: number
  ) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                item.id === itemId
                  ? { ...item, quantity_received: qty }
                  : item
              ),
            }
          : order
      )
    );
  };

  // ---------------------------
  // Confirm received
  // Stock auto updates after this!
  // ---------------------------
  const handleConfirmReceived = async (order: PurchaseOrder) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.post(`/orders/purchase/${order.id}/receive/`, {
        status: "RECEIVED",
        items: order.items.map((item) => ({
  item_id: item.id,
  quantity_received: item.quantity_received ?? item.quantity_ordered,
})),
      });

      setSuccess(
        `Order PO-${order.id} confirmed! Stock has been updated automatically.`
      );
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to confirm order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Receiving</h2>
      <p style={styles.subtitle}>
        Confirm received orders to automatically update stock levels
      </p>

      {success && <div style={styles.success}>{success}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {orders.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.emptyText}>No dispatched orders waiting to be received</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <div>
                <h3 style={styles.orderId}>PO-{order.id}</h3>
                <p style={styles.orderMeta}>
                 Created by {order.created_by_name} •{" "}
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                {order.notes && (
                  <p style={styles.notes}>Note: {order.notes}</p>
                )}
              </div>
              <span style={styles.dispatchedBadge}>Dispatched</span>
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Ingredient</th>
                  <th style={styles.th}>Ordered</th>
                  <th style={styles.th}>Received</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} style={styles.tableRow}>
                    <td style={styles.td}>{item.ingredient_name}</td>
                    <td style={styles.td}>
                      {item.quantity_ordered} {item.unit}
                    </td>
                    <td style={styles.td}>
                      <input
  type="number"
  min="0"
  value={item.quantity_received || item.quantity_ordered}  // ✅ controlled input
  onChange={(e) =>
    updateReceivedQty(
      order.id,
      item.id,
      parseFloat(e.target.value)
    )
  }
  style={styles.qtyInput}
/>
                      <span style={styles.unit}>{item.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              style={loading ? styles.btnDisabled : styles.confirmBtn}
              onClick={() => handleConfirmReceived(order)}
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm Received — Update Stock"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
container: {
  padding: "24px",
  paddingBottom: "4rem",
  maxWidth: "900px",
  margin: "0 auto",
  height: "100vh",
  overflowY: "auto",
  boxSizing: "border-box",
},
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: "14px",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  orderId: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
  },
  orderMeta: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
  },
  notes: {
    fontSize: "13px",
    color: "#9ca3af",
    marginTop: "4px",
    fontStyle: "italic",
  },
  dispatchedBadge: {
    padding: "4px 12px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "16px",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
  },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "10px 16px",
    fontSize: "14px",
    color: "#1f2937",
  },
  qtyInput: {
    width: "80px",
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    textAlign: "center",
  },
  unit: {
    fontSize: "12px",
    color: "#6b7280",
    marginLeft: "6px",
  },
  confirmBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
  },
  btnDisabled: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#6ee7b7",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "not-allowed",
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

export default Receiving;