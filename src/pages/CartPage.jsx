import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, CreditCard, Gift, Minus, Plus, Trash2, WalletCards } from "lucide-react";
import { api } from "../api";
import FoodImage from "../components/FoodImage";
import MapEmbed from "../components/MapEmbed";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";

const paymentMethods = [
  {
    id: "card",
    name: "Credit / debit card",
    description: "Visa or Mastercard simulation"
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "PayPal checkout simulation"
  },
  {
    id: "digital-wallet",
    name: "Digital wallet",
    description: "Apple Pay, Google Pay, Paysera, or Revolut"
  },
  {
    id: "cash-on-delivery",
    name: "Cash on delivery",
    description: "Pay after the food arrives"
  }
];

const toDateTimeLocal = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function CartPage() {
  const { user } = useAuth();
  const isArtaDemo = user?.email === "arta@example.com";
  const { restaurant, items, subtotal, total, updateQuantity, removeItem, clearCart } = useCart();
  const { formatCurrency } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentDetails, setPaymentDetails] = useState(() => ({
    cardName: isArtaDemo ? "Arta Hoxha" : "",
    cardNumber: isArtaDemo ? "4242 4242 4242 4242" : "",
    expiry: isArtaDemo ? "12/30" : "",
    cvv: isArtaDemo ? "123" : "",
    paypalEmail: isArtaDemo ? "arta@example.com" : "",
    walletProvider: "apple-pay",
    walletId: isArtaDemo ? "arta@example.com" : ""
  }));
  const [paymentOptions, setPaymentOptions] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(() => ({
    customerName: user?.name || "",
    phone: user?.phone || (isArtaDemo ? "+355 69 123 4567" : ""),
    address: user?.address || "",
    building: isArtaDemo ? "Tirana Garden Building" : "",
    apartment: isArtaDemo ? "12" : "",
    floor: isArtaDemo ? "3" : "",
    city: "Tirana",
    notes: isArtaDemo ? "Please call when the order arrives." : ""
  }));
  const [rewards, setRewards] = useState(null);
  const [rewardRedemptionId, setRewardRedemptionId] = useState("");
  const [scheduleMode, setScheduleMode] = useState("now");
  const [scheduledFor, setScheduledFor] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setRewards(null);
      setRewardRedemptionId("");
      return;
    }

    api
      .rewards()
      .then(setRewards)
      .catch(() => setRewards(null));
    api
      .paymentOptions()
      .then(setPaymentOptions)
      .catch(() => setPaymentOptions(null));
  }, [user]);

  const selectedReward = rewards?.options?.find((option) => option.id === rewardRedemptionId);
  const deliveryDiscount = selectedReward?.type === "free-delivery" ? restaurant.deliveryFee : 0;
  const orderDiscount = selectedReward?.type === "order-discount" ? Math.min(selectedReward.value, subtotal) : 0;
  const totalDiscount = deliveryDiscount + orderDiscount;
  const checkoutTotal = Math.max(0, total - totalDiscount);
  const normalizedPromoCode = promoCode.trim().toUpperCase();
  const promo = paymentOptions?.promoCodes?.find((item) => item.code === normalizedPromoCode);
  const promoBase = checkoutTotal;
  const promoAmount = promo
    ? Math.min(Math.round((promoBase * promo.value) / 100), promo.maxDiscount || Number.MAX_SAFE_INTEGER)
    : 0;
  const promoDiscount = promo?.type === "percent" ? promoAmount : 0;
  const cashbackEarned = promo?.type === "cashback" && paymentMethod === "digital-wallet" ? promoAmount : 0;
  const finalTotal = Math.max(0, checkoutTotal - promoDiscount);
  const estimatedPointsEarned = Math.floor(finalTotal / 100) * 10;
  const estimatedCalories = items.reduce((sum, item) => sum + Number(item.calories || 0) * item.quantity, 0);
  const minimumScheduleTime = toDateTimeLocal(new Date(Date.now() + 10 * 60 * 1000));

  const showOrderSchedule = () => {
    const lunch = new Date();
    lunch.setHours(12, 30, 0, 0);
    if (lunch.getTime() < Date.now() + 10 * 60 * 1000) {
      lunch.setDate(lunch.getDate() + 1);
    }
    setScheduleMode("later");
    setScheduledFor(toDateTimeLocal(lunch));
  };

  const updateDeliveryDetails = (event) => {
    setDeliveryDetails((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const updatePaymentDetails = (event) => {
    setPaymentDetails((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const validatePayment = () => {
    if (paymentMethod === "card") {
      const cardNumber = paymentDetails.cardNumber.replace(/\D/g, "");
      if (
        !paymentDetails.cardName.trim() ||
        cardNumber.length < 12 ||
        !paymentDetails.expiry.trim() ||
        paymentDetails.cvv.replace(/\D/g, "").length < 3
      ) {
        return "Please enter cardholder name, card number, expiry date, and CVV.";
      }
    }

    if (paymentMethod === "paypal" && !paymentDetails.paypalEmail.trim()) {
      return "Please enter your PayPal email before confirming the order.";
    }

    if (paymentMethod === "digital-wallet" && !paymentDetails.walletId.trim()) {
      return "Please enter the wallet account, phone, or email before confirming the order.";
    }

    if (promo?.walletOnly && paymentMethod !== "digital-wallet") {
      return "This cashback promo works only with digital wallet payments.";
    }

    return "";
  };

  const validateDelivery = () => {
    if (!deliveryDetails.customerName.trim()) {
      return "Please enter the customer name for delivery.";
    }

    if (deliveryDetails.phone.replace(/\D/g, "").length < 8) {
      return "Please enter a valid phone number for delivery.";
    }

    if (!deliveryDetails.address.trim()) {
      return "Please enter the house or building address.";
    }

    if (!deliveryDetails.city.trim()) {
      return "Please enter the delivery city.";
    }

    return "";
  };

  const buildDeliveryDetails = () => ({
    customerName: deliveryDetails.customerName.trim(),
    phone: deliveryDetails.phone.trim(),
    address: deliveryDetails.address.trim(),
    building: deliveryDetails.building.trim(),
    apartment: deliveryDetails.apartment.trim(),
    floor: deliveryDetails.floor.trim(),
    city: deliveryDetails.city.trim(),
    notes: deliveryDetails.notes.trim()
  });

  const buildPaymentDetails = () => {
    if (paymentMethod === "card") {
      const last4 = paymentDetails.cardNumber.replace(/\D/g, "").slice(-4);
      return {
        provider: "Visa / Mastercard",
        cardholder: paymentDetails.cardName.trim(),
        last4
      };
    }

    if (paymentMethod === "paypal") {
      return {
        provider: "PayPal",
        email: paymentDetails.paypalEmail.trim()
      };
    }

    if (paymentMethod === "digital-wallet") {
      return {
        provider: "Digital wallet",
        walletProvider: paymentDetails.walletProvider,
        walletId: paymentDetails.walletId.trim()
      };
    }

    return {
      provider: "Cash on delivery"
    };
  };

  const confirmOrder = async () => {
    if (!user) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const deliveryError = validateDelivery();
      if (deliveryError) {
        setError(deliveryError);
        return;
      }

      const paymentError = validatePayment();
      if (paymentError) {
        setError(paymentError);
        return;
      }

      if (scheduleMode === "later" && !scheduledFor) {
        setError("Please choose the scheduled delivery time.");
        return;
      }

      await api.createOrder({
        restaurantId: restaurant.id,
        paymentMethod,
        paymentDetails: buildPaymentDetails(),
        deliveryDetails: buildDeliveryDetails(),
        rewardRedemptionId,
        scheduledFor: scheduleMode === "later" ? scheduledFor : "",
        promoCode: normalizedPromoCode,
        items: items.map((item) => ({ menuItemId: item.id, quantity: item.quantity }))
      });
      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <p className="mt-2 text-zinc-600">Choose a restaurant and add menu items to start the transaction flow.</p>
        <Link to="/" className="mt-5 inline-block rounded-full bg-ink px-5 py-3 font-black text-white">
          Browse restaurants
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-black">Shopping cart</h1>
          <p className="text-zinc-600">Ordering from {restaurant.name}</p>
        </div>

        {items.map((item) => (
          <article key={item.id} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-zinc-200">
            <FoodImage
              src={item.image}
              alt={item.name}
              label={item.category}
              className="h-24 w-24 rounded object-cover"
            />
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <h2 className="font-black">{item.name}</h2>
                <p className="text-sm text-zinc-600">{formatCurrency(item.price)} each</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center rounded-full bg-zinc-100 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-9 text-center font-black">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-white"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                  aria-label="Remove item"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
        <h2 className="text-xl font-black">Checkout</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <strong>{formatCurrency(restaurant.deliveryFee)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Approx. calories</span>
            <strong>{estimatedCalories} kcal</strong>
          </div>
          {selectedReward && (
            <div className="flex justify-between text-basil">
              <span>{selectedReward.label}</span>
              <strong>-{formatCurrency(totalDiscount)}</strong>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-basil">
              <span>Promo {promo.code}</span>
              <strong>-{formatCurrency(promoDiscount)}</strong>
            </div>
          )}
          {cashbackEarned > 0 && (
            <div className="flex justify-between text-basil">
              <span>Cashback after payment</span>
              <strong>{formatCurrency(cashbackEarned)}</strong>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-200 pt-3 text-lg">
            <span className="font-black">Total</span>
            <strong>{formatCurrency(finalTotal)}</strong>
          </div>
          <div className="rounded bg-limewash p-3 font-semibold text-basil">
            Earn about {estimatedPointsEarned} reward points with this order.
          </div>
        </div>

        {user?.role === "customer" && rewards && (
          <div className="mt-5">
            <h3 className="flex items-center gap-2 text-sm font-black">
              <Gift size={17} />
              Rewards
            </h3>
            <div className="mt-2 rounded bg-zinc-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-zinc-600">Available points</span>
                <strong>{rewards.points} pts</strong>
              </div>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => setRewardRedemptionId("")}
                  className={`rounded border p-3 text-left text-sm font-bold ${
                    rewardRedemptionId === ""
                      ? "border-leaf bg-limewash text-basil"
                      : "border-zinc-200 bg-white text-zinc-700"
                  }`}
                >
                  No reward for this order
                </button>
                {rewards.options.map((option) => {
                  const disabled = rewards.points < option.pointsCost;
                  return (
                    <button
                      type="button"
                      key={option.id}
                      disabled={disabled}
                      onClick={() => setRewardRedemptionId(option.id)}
                      className={`rounded border p-3 text-left text-sm transition ${
                        rewardRedemptionId === option.id
                          ? "border-leaf bg-limewash text-basil"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span className="block font-black">{option.label}</span>
                      <span className="block text-xs font-semibold">
                        {option.pointsCost} pts - {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {user?.role === "customer" && paymentOptions && (
          <div className="mt-5">
            <h3 className="text-sm font-black">Promo codes & cashback</h3>
            <div className="mt-2 rounded bg-zinc-50 p-3">
              <input
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Try FOOD10, LUNCH20, or WALLET5"
                className="w-full rounded border border-zinc-200 bg-white p-3 text-sm font-bold uppercase outline-none ring-leaf focus:ring-2"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {paymentOptions.promoCodes.map((option) => (
                  <button
                    type="button"
                    key={option.code}
                    onClick={() => setPromoCode(option.code)}
                    className="rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-700 ring-1 ring-zinc-200 hover:bg-limewash hover:text-basil"
                  >
                    {option.code}
                  </button>
                ))}
              </div>
              {normalizedPromoCode && !promo && (
                <p className="mt-2 text-xs font-bold text-red-600">This promo code is not available.</p>
              )}
              {promo?.walletOnly && paymentMethod !== "digital-wallet" && (
                <p className="mt-2 text-xs font-bold text-amber-700">WALLET5 cashback requires digital wallet payment.</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-5">
          <h3 className="flex items-center gap-2 text-sm font-black">
            <Clock size={17} />
            Smart scheduling
          </h3>
          <div className="mt-2 grid gap-2 rounded bg-zinc-50 p-3">
            <button
              type="button"
              onClick={() => setScheduleMode("now")}
              className={`rounded border p-3 text-left text-sm ${
                scheduleMode === "now"
                  ? "border-leaf bg-limewash text-basil"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              <span className="block font-black">Deliver as soon as possible</span>
              <span className="block text-xs font-semibold">The order goes directly to pending.</span>
            </button>
            <button
              type="button"
              onClick={showOrderSchedule}
              className={`rounded border p-3 text-left text-sm font-bold ${
                scheduleMode === "later"
                  ? "border-leaf bg-limewash text-basil"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Schedule order
            </button>
            {scheduleMode === "later" && (
              <input
                type="datetime-local"
                aria-label="Order date and time"
                min={minimumScheduleTime}
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
                className="w-full rounded border border-leaf bg-white p-3 font-semibold text-ink outline-none ring-leaf focus:ring-2"
              />
            )}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-black">Delivery details</h3>
          <div className="mt-2 grid gap-3 rounded bg-zinc-50 p-3">
            <input
              name="customerName"
              value={deliveryDetails.customerName}
              onChange={updateDeliveryDetails}
              placeholder="Customer name"
              required
              className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
            />
            <input
              name="phone"
              value={deliveryDetails.phone}
              onChange={updateDeliveryDetails}
              placeholder="Phone number"
              required
              className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
            />
            <input
              name="address"
              value={deliveryDetails.address}
              onChange={updateDeliveryDetails}
              placeholder="House/building address"
              required
              className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="building"
                value={deliveryDetails.building}
                onChange={updateDeliveryDetails}
                placeholder="Building"
                className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
              />
              <input
                name="apartment"
                value={deliveryDetails.apartment}
                onChange={updateDeliveryDetails}
                placeholder="Apartment"
                className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="floor"
                value={deliveryDetails.floor}
                onChange={updateDeliveryDetails}
                placeholder="Floor"
                className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
              />
              <input
                name="city"
                value={deliveryDetails.city}
                onChange={updateDeliveryDetails}
                placeholder="City"
                required
                className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
              />
            </div>
            <textarea
              name="notes"
              value={deliveryDetails.notes}
              onChange={updateDeliveryDetails}
              placeholder="Order notes, allergies, entrance instructions..."
              rows="3"
              className="resize-none rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
            />
          </div>
        </div>

        <MapEmbed
          title="Delivery map"
          subtitle={deliveryDetails.address || "Tirana delivery area"}
          lat={41.3275}
          lng={19.8189}
          query={`${deliveryDetails.address || "Tirana"}, ${deliveryDetails.city || "Tirana"}, Albania`}
          className="mt-5"
        />

        <div className="mt-5">
          <label className="block text-sm font-black">Payment method</label>
          <div className="mt-2 grid gap-2">
            {paymentMethods.map((method) => (
              <button
                type="button"
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex items-center gap-3 rounded border p-3 text-left transition ${
                  paymentMethod === method.id
                    ? "border-leaf bg-limewash text-basil"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white">
                  {method.id === "paypal" ? <WalletCards size={18} /> : <CreditCard size={18} />}
                </span>
                <span>
                  <span className="block font-black">{method.name}</span>
                  <span className="block text-xs font-semibold">{method.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === "card" && (
          <div className="mt-4 grid gap-3 rounded bg-zinc-50 p-3">
            <input
              name="cardName"
              value={paymentDetails.cardName}
              onChange={updatePaymentDetails}
              placeholder="Cardholder name"
              required
              className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
            />
            <input
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={updatePaymentDetails}
              placeholder="Card number: 4242 4242 4242 4242"
              required
              className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="expiry"
                value={paymentDetails.expiry}
                onChange={updatePaymentDetails}
                placeholder="MM/YY"
                required
                className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
              />
              <input
                name="cvv"
                value={paymentDetails.cvv}
                onChange={updatePaymentDetails}
                placeholder="CVV"
                required
                className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
              />
            </div>
          </div>
        )}

        {paymentMethod === "paypal" && (
          <div className="mt-4 rounded bg-zinc-50 p-3">
            <input
              type="email"
              name="paypalEmail"
              value={paymentDetails.paypalEmail}
              onChange={updatePaymentDetails}
              placeholder="PayPal email"
              required
              className="w-full rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
            />
          </div>
        )}

        {paymentMethod === "digital-wallet" && (
          <div className="mt-4 grid gap-3 rounded bg-zinc-50 p-3">
            <select
              name="walletProvider"
              value={paymentDetails.walletProvider}
              onChange={updatePaymentDetails}
              className="rounded border border-zinc-200 bg-white p-3 text-sm font-bold outline-none ring-leaf focus:ring-2"
            >
              {(paymentOptions?.digitalWallets || [
                { id: "apple-pay", label: "Apple Pay" },
                { id: "google-pay", label: "Google Pay" },
                { id: "paysera", label: "Paysera" },
                { id: "revolut", label: "Revolut" }
              ]).map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label}
                </option>
              ))}
            </select>
            <input
              name="walletId"
              value={paymentDetails.walletId}
              onChange={updatePaymentDetails}
              placeholder="Wallet email, phone, or ID"
              required
              className="rounded border border-zinc-200 bg-white p-3 text-sm outline-none ring-leaf focus:ring-2"
            />
          </div>
        )}

        {error && <p className="mt-3 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        <button
          onClick={confirmOrder}
          disabled={loading}
          className="mt-5 w-full rounded-full bg-leaf px-5 py-3 font-black text-white hover:bg-basil disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Confirming order..." : "Confirm order"}
        </button>
      </aside>
    </div>
  );
}
