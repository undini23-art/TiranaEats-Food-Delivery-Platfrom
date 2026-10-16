import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(() => {
    const stored = localStorage.getItem("cartRestaurant");
    return stored ? JSON.parse(stored) : null;
  });
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (restaurant) {
      localStorage.setItem("cartRestaurant", JSON.stringify(restaurant));
    } else {
      localStorage.removeItem("cartRestaurant");
    }
  }, [restaurant]);

  const addItem = (menuItem, nextRestaurant) => {
    if (restaurant && restaurant.id !== nextRestaurant.id) {
      setItems([{ ...menuItem, quantity: 1 }]);
    } else {
      setItems((current) => {
        const existing = current.find((item) => item.id === menuItem.id);
        if (existing) {
          return current.map((item) =>
            item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...current, { ...menuItem, quantity: 1 }];
      });
    }
    setRestaurant(nextRestaurant);
  };

  const updateQuantity = (id, quantity) => {
    setItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (items.length && restaurant ? restaurant.deliveryFee : 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      restaurant,
      items,
      subtotal,
      total,
      itemCount,
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    }),
    [restaurant, items, subtotal, total, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
