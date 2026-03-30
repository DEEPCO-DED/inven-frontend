import { useEffect, useState } from "react";
import styles from "./WarehouseOrders.module.css";

type OrderItem = {
  id: number;
  ingredient: number;
  ingredient_name: string;
  unit: string;
  quantity_ordered: number;
  quantity_received: number;
};

type PurchaseOrder = {
  id: number;
  status: string;
  notes: string;
  created_by_name: string;
  created_at: string;
  items: OrderItem[];
};

const API_BASE = "http://127.0.0.1:8000/api";

export default function WarehouseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"PENDING" | "DISPATCHED" | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<Record<number, number>>({});
  const [dispatching, setDispatching] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url =
        activeTab === "ALL"
          ? `${API_BASE}/orders/purchase/`
          : `${API_BASE}/orders/purchase/?status=${activeTab}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data);

      // Pre-fill adjustments with ordered quantities
      const initial: Record<number, number> = {};
      data.forEach((order: PurchaseOrder) => {
        order.items.forEach((item) => {
          initial[item.id] = item.quantity_ordered;
        });
      });
      setAdjustments(initial);
    } catch {
      setError("Could not load orders. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (orderId: number, items: OrderItem[]) => {
    setDispatching(orderId);
    setError(null);
    try {
      const adjustedItems = items.map((item) => ({
        item_id: item.id,
        quantity_ordered: adjustments[item.id] ?? item.quantity_ordered,
      }));

      const res = await fetch(`${API_BASE}/orders/purchase/${orderId}/dispatch/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: adjustedItems }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Dispatch failed");
      }

      // Remove from current list after dispatch
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDispatching(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div>
          <p className={styles.eyebrow}>Warehouse</p>
          <h1 className={styles.title}>Orders</h1>
        </div>
        {activeTab === "PENDING" && pendingCount > 0 && (
          <div className={styles.badge}>
            <span className={`${styles.dot} ${styles.pending}`} />
            {pendingCount} pending
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        {(["PENDING", "DISPATCHED", "ALL"] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "ALL" ? "All orders" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>✕ {error}</p>}

      {loading ? (
        <p className={styles.empty}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className={styles.empty}>No {activeTab.toLowerCase()} orders.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHead}>
              <div>
                <div className={styles.orderId}>PO-{order.id}</div>
                <div className={styles.orderMeta}>
                  {order.created_by_name} · {formatDate(order.created_at)}
                </div>
              </div>
              <span className={`${styles.statusPill} ${styles[order.status.toLowerCase()]}`}>
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </span>
            </div>

            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Unit</th>
                  <th>Qty requested</th>
                  {order.status === "PENDING" && <th>Qty to dispatch</th>}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.ingredient_name}</td>
                    <td>{item.unit}</td>
                    <td>{item.quantity_ordered}</td>
                    {order.status === "PENDING" && (
                      <td>
                        <input
                          className={styles.qtyInput}
                          type="number"
                          min="0"
                          value={adjustments[item.id] ?? item.quantity_ordered}
                          onChange={(e) =>
                            setAdjustments((prev) => ({
                              ...prev,
                              [item.id]: Number(e.target.value),
                            }))
                          }
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.orderFoot}>
              <span className={styles.notes}>
                {order.notes ? `Note: ${order.notes}` : "No notes"}
              </span>
              {order.status === "PENDING" && (
                <button
                  className={styles.btnDispatch}
                  disabled={dispatching === order.id}
                  onClick={() => handleDispatch(order.id, order.items)}
                >
                  {dispatching === order.id ? "Dispatching..." : "Dispatch"}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}