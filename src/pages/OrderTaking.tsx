import { useEffect, useState, useCallback } from "react";
import styles from "./OrderTaking.module.css";

// --- TYPES ---
type Category = { id: number; name: string };

type Food = {
  id: number;
  name: string;
  price: string;
  category: { id: number; name: string };
  is_available: boolean;
  stock_qty: number;
  image_url: string | null;
  image: string | null;
};

type Sales = {
  total: number;
  dineIn: number;
  takeAway: number;
  cod: number;
};

export default function OrderTaking() {
  const [categories, setCategories]             = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [foods, setFoods]                       = useState<Food[]>([]);
  const [cart, setCart]                         = useState<Record<number, Food & { qty: number }>>({});
  const [sales, setSales]                       = useState<Sales>({ total: 0, dineIn: 0, takeAway: 0, cod: 0 });
  const [orderStatus, setOrderStatus]           = useState<"idle" | "placing" | "success" | "error">("idle");
  const [bumpId, setBumpId]                     = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/categories/")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) setActiveCategoryId(data[0].id);
      })
      .catch(console.error);
  }, []);

  // ✅ refreshSales defined first
  const refreshSales = useCallback(() => {
    fetch("/api/today-sales/")
      .then((r) => r.json())
      .then((data: Sales) => setSales(data))
      .catch(console.error);
  }, []);

  // ✅ refreshFoods defined after refreshSales
  const refreshFoods = useCallback(() => {
    if (!activeCategoryId) return;
    fetch(`/api/foods/?category_id=${activeCategoryId}`)
      .then((r) => r.json())
      .then((data: Food[]) => setFoods(data))
      .catch(console.error);
  }, [activeCategoryId]);

  // ✅ fetch foods when category changes
  useEffect(() => {
    refreshFoods();
  }, [refreshFoods]);

  // ✅ fetch sales on mount
  useEffect(() => { refreshSales(); }, [refreshSales]);

  // ✅ refetch when user switches back to this tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshFoods();
        refreshSales();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [refreshFoods, refreshSales]);

  const addToCart = (id: number) => {
    const item = foods.find((f) => f.id === id);
    setCart((prev) => {
      const existing = prev[id];
      const itemToUse = item || existing;
      if (!itemToUse) return prev;
      const currentQty = existing ? existing.qty : 0;
      if (currentQty >= itemToUse.stock_qty) return prev;
      return { ...prev, [id]: { ...itemToUse, qty: currentQty + 1 } };
    });
    setBumpId(id);
    setTimeout(() => setBumpId(null), 320);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...existing, qty: existing.qty - 1 } };
    });
  };

  const clearCart = () => setCart({});
  const cartItems = Object.values(cart);
  const total = cartItems.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);

  const placeOrder = async () => {
    if (cartItems.length === 0 || orderStatus === "placing") return;
    setOrderStatus("placing");
    try {
      const res = await fetch("/api/orders/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          order_type: "DINE_IN",
          payment_mode: "COD",
          total_amount: total,
          items: cartItems.map((i) => ({ food_id: i.id, qty: i.qty })),
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      setCart({});
      setOrderStatus("success");
      setTimeout(() => setOrderStatus("idle"), 2500);
      refreshSales();
    } catch {
      setOrderStatus("error");
      setTimeout(() => setOrderStatus("idle"), 2000);
    }
  };

  const getFallback = () => `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400`;
  const getImageSrc = (item: Food) => item.image ?? item.image_url ?? getFallback();

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          {categories.map((c) => (
            <button
              key={c.id}
              className={activeCategoryId === c.id ? styles.active : ""}
              onClick={() => setActiveCategoryId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </aside>

        <section className={styles.grid}>
          {foods.map((item) => {
            const inCart = cart[item.id]?.qty || 0;
            const isOOS = item.stock_qty <= 0;

            return (
              <div
                key={item.id}
                className={`${styles.card} ${isOOS ? styles.disabled : ""} ${bumpId === item.id ? styles.bump : ""}`}
                onClick={() => !isOOS && addToCart(item.id)}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={getImageSrc(item)}
                    alt={item.name}
                    className={styles.foodImg}
                  />
                  {!isOOS && <div className={styles.topRightPlus}>+</div>}
                  {inCart > 0 && <div className={styles.middleBadge}>{inCart}</div>}
                  {isOOS && <div className={styles.soldOutOverlay}>SOLD OUT</div>}
                </div>

                <div className={styles.cardLabel}>
                  <h4>{item.name}</h4>
                  <p>₹{item.price}</p>
                </div>
              </div>
            );
          })}
        </section>

        <aside className={styles.cart}>
          <div className={styles.cartHeader}>
            <h3>Order</h3>
            {cartItems.length > 0 && <button className={styles.clearBtn} onClick={clearCart}>Clear</button>}
          </div>

          <div className={styles.cartList}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <span className={styles.cartItemName}>{item.name}</span>
                  <span className={styles.cartItemPrice}>₹{Number(item.price) * item.qty}</span>
                </div>
                <div className={styles.qtyControls}>
                  <button className={styles.qtyBtn} onClick={() => removeFromCart(item.id)}>−</button>
                  <span className={styles.qtyNum}>{item.qty}</span>
                  <button className={styles.qtyBtn} onClick={() => addToCart(item.id)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>₹{total}</span>
            </div>
            <button
              className={`${styles.placeBtn} ${styles[orderStatus]}`}
              onClick={placeOrder}
              disabled={cartItems.length === 0}
            >
              {orderStatus === "placing" ? "Placing..." : `Place Order · ₹${total}`}
            </button>
          </div>
        </aside>
      </div>

      <footer className={styles.footer}>
        <div><strong>₹{sales.total}</strong><span>Total Sales</span></div>
        <div><strong>₹{sales.dineIn}</strong><span>Dine-In</span></div>
        <div><strong>₹{sales.takeAway}</strong><span>Take Away</span></div>
        <div><strong>₹{sales.cod}</strong><span>COD</span></div>
        <div><strong>LIVE</strong><span>Today's Stats</span></div>
      </footer>
    </div>
  );
}