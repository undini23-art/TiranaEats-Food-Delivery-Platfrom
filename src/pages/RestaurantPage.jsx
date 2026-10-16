import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, Mail, MapPin, Phone, Star, Trash2 } from "lucide-react";
import { api } from "../api";
import FoodImage from "../components/FoodImage";
import MapEmbed from "../components/MapEmbed";
import MenuItemCard from "../components/MenuItemCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const { addItem, itemCount } = useCart();
  const { user } = useAuth();

  const loadRestaurant = () =>
    api
      .restaurant(id)
      .then(setRestaurant)
      .finally(() => setLoading(false));

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setSubmittingReview(true);

    try {
      await api.addRestaurantReview(id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setReviewForm({ rating: 5, comment: "" });
      setReviewSuccess("Review added successfully.");
      await loadRestaurant();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async (reviewId) => {
    setReviewError("");
    setReviewSuccess("");
    setDeletingReviewId(reviewId);

    try {
      await api.deleteRestaurantReview(id, reviewId);
      setReviewSuccess("Review deleted successfully.");
      await loadRestaurant();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const categories = useMemo(() => {
    if (!restaurant) return ["All"];
    return ["All", ...new Set(restaurant.menuItems.map((item) => item.category))];
  }, [restaurant]);

  const items = restaurant
    ? restaurant.menuItems.filter((item) => activeCategory === "All" || item.category === activeCategory)
    : [];

  if (loading) {
    return <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />;
  }

  if (!restaurant) {
    return <p>Restaurant not found.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200">
        <div className="h-64 bg-zinc-200 sm:h-80">
          <FoodImage
            src={restaurant.image}
            alt={restaurant.name}
            label={restaurant.cuisine}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-black uppercase tracking-wide text-basil">{restaurant.cuisine}</p>
            <h1 className="mt-1 text-4xl font-black">{restaurant.name}</h1>
            <p className="mt-2 max-w-3xl text-zinc-600">{restaurant.description}</p>
            <div className="mt-4 grid gap-2 text-sm font-bold text-zinc-700">
              <a
                href={`tel:${restaurant.phone?.replace(/\s/g, "") || ""}`}
                className="flex items-center gap-2 hover:text-basil"
              >
                <Phone size={17} className="text-basil" />
                <span>Phone: {restaurant.phone}</span>
              </a>
              <a href={`mailto:${restaurant.email}`} className="flex min-w-0 items-center gap-2 hover:text-basil">
                <Mail size={17} className="shrink-0 text-basil" />
                <span className="break-words">Email: {restaurant.email}</span>
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            <span className="flex items-center gap-1 rounded-full bg-limewash px-3 py-2 text-basil">
              <Star size={16} fill="currentColor" />
              {restaurant.rating}
              {restaurant.reviewCount > 0 && (
                <span className="text-xs text-basil/80">({restaurant.reviewCount})</span>
              )}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-2">
              <Clock size={16} />
              {restaurant.deliveryTime}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-2">
              <MapPin size={16} />
              {restaurant.location}
            </span>
          </div>
        </div>
      </section>

      <MapEmbed
        title={`${restaurant.name} location`}
        subtitle={restaurant.location}
        lat={restaurant.coordinates?.lat}
        lng={restaurant.coordinates?.lng}
        query={`${restaurant.name}, ${restaurant.location}`}
      />

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-xl font-black">Customer reviews</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {restaurant.reviewCount
              ? `${restaurant.reviewCount} reviews with an average of ${restaurant.rating}/5 stars.`
              : "No customer reviews yet."}
          </p>

          {user?.role === "customer" ? (
            <form onSubmit={submitReview} className="mt-5 space-y-3">
              <div>
                <label className="text-sm font-black">Your rating</label>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm((current) => ({ ...current, rating }))}
                      className={`grid h-10 w-10 place-items-center rounded-full ${
                        rating <= reviewForm.rating
                          ? "bg-leaf text-white"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                      aria-label={`${rating} stars`}
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm((current) => ({ ...current, comment: event.target.value }))
                }
                placeholder="Write your comment about food, delivery, packaging..."
                rows="4"
                className="w-full resize-none rounded border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none ring-leaf focus:ring-2"
                required
              />
              {reviewError && (
                <p className="rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{reviewError}</p>
              )}
              {reviewSuccess && (
                <p className="rounded bg-limewash p-3 text-sm font-semibold text-basil">{reviewSuccess}</p>
              )}
              <button
                disabled={submittingReview}
                className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingReview ? "Adding review..." : "Submit review"}
              </button>
            </form>
          ) : (
            <p className="mt-5 rounded bg-zinc-50 p-3 text-sm font-semibold text-zinc-600">
              Login as a customer to leave a review.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {(restaurant.reviews || []).map((review) => (
            <article key={review.id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">{review.userName}</h3>
                  <p className="text-xs font-semibold text-zinc-500">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-limewash px-3 py-1 text-sm font-black text-basil">
                    <Star size={15} fill="currentColor" />
                    {review.rating}/5
                  </span>
                  {(user?.role === "admin" || user?.id === review.userId) && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={deletingReviewId === review.id}
                      className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete review"
                      title="Delete review"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-700">{review.comment}</p>
            </article>
          ))}
          {(!restaurant.reviews || restaurant.reviews.length === 0) && (
            <article className="rounded-lg bg-white p-5 text-center shadow-sm ring-1 ring-zinc-200">
              <h3 className="font-black">No reviews yet</h3>
              <p className="mt-1 text-sm text-zinc-600">Be the first customer to review this restaurant.</p>
            </article>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                activeCategory === category ? "bg-ink text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {itemCount > 0 && (
          <Link to="/cart" className="rounded-full bg-leaf px-5 py-2 font-black text-white hover:bg-basil">
            View cart
          </Link>
        )}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} restaurant={restaurant} onAdd={addItem} />
        ))}
      </section>
    </div>
  );
}
