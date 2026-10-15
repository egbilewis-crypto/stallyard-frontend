import { useEffect, useRef, useState } from "react";

const paths = {
  browse: "/", dashboard: "/seller/dashboard", buyerHome: "/buyer/dashboard",
  orders: "/buyer/orders", wallet: "/wallet", messages: "/messages",
  watchlist: "/watchlist", sell: "/sell", help: "/help", categories: "/categories",
  "how-it-works": "/how-it-works", "create-account": "/create-account",
  "shipping-delivery": "/shipping-delivery", "become-seller": "/become-seller",
  signin: "/signin", signup: "/signup", admin: "/admin",
};
const buyerStatuses = new Set(["all", "active", "preparing", "shipped", "delivered", "completed", "returned", "refunded", "disputed"]);
const sellerStatuses = new Set(["all", "new", "preparing", "shipped", "delivered", "completed", "cancelled", "returned", "disputed"]);
export const PRIVATE_VIEWS = new Set(["dashboard", "buyerHome", "orders", "wallet", "messages", "watchlist"]);
const defaults = { view: "browse", orderSearch: "", orderStatus: "all", salesTab: "all", sellerSection: "overview", seller: null, thread: null, next: "", category: "All", subcategory: "All", search: "", condition: "All", sort: "featured", priceMin: "", priceMax: "", listingId: null, cart: false, ticket: null, listingsTab: "all" };
const safeDecode = (value) => { try { return decodeURIComponent(value); } catch { return ""; } };
export function readMarketplaceRoute(location = typeof window === "undefined" ? { pathname: "/", search: "" } : window.location) {
  const path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(location.search || "");
  const route = { ...defaults, view: Object.keys(paths).find((key) => paths[key] === path) || "browse" };
  if (route.view === "browse") {
    route.category = (params.get("category") || "All").slice(0, 150);
    route.subcategory = route.category !== "All" ? (params.get("subcategory") || "All").slice(0, 150) : "All";
    route.search = (params.get("search") || "").slice(0, 200);
    route.condition = (params.get("condition") || "All").slice(0, 80);
    const sort = params.get("sort");
    route.sort = ["featured", "newest", "price-asc", "price-desc", "rating"].includes(sort) ? sort : "featured";
    for (const key of ["priceMin", "priceMax"]) {
      const value = params.get(key);
      route[key] = value && Number.isFinite(Number(value)) && Number(value) >= 0 ? value : "";
    }
  }
  if (path === "/seller/orders") { route.view = "dashboard"; route.sellerSection = "orders"; }
  if (path === "/seller/listings") { route.view = "dashboard"; route.sellerSection = "listings"; }
  const store = path.match(/^\/store\/([^/]+)$/);
  if (store) { route.view = "storefront"; route.seller = safeDecode(store[1]); }
  if (route.view === "orders") {
    route.orderSearch = (params.get("search") || "").slice(0, 200);
    route.orderStatus = buyerStatuses.has(params.get("status")) ? params.get("status") : "all";
  }
  if (route.view === "dashboard") route.salesTab = sellerStatuses.has(params.get("status")) ? params.get("status") : "all";
  if (route.view === "messages") {
    const thread = params.get("thread");
    route.thread = thread && /^\d+$/.test(thread) ? Number(thread) : thread || null;
  }
  route.listingId = params.get("listing") || null;
  route.cart = params.get("cart") === "1";
  if (route.view === "help") route.ticket = params.get("ticket") ? Number(params.get("ticket")) || null : null;
  if (route.view === "dashboard" && route.sellerSection === "listings") route.listingsTab = ["all", "active", "draft", "pending", "rejected", "sold", "paused", "removed"].includes(params.get("status")) ? params.get("status") : "all";
  const next = params.get("next") || "";
  if (["signin", "signup"].includes(route.view) && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) route.next = next;
  return route;
}
export function marketplaceRouteUrl(route) {
  let path = paths[route.view] || "/";
  const params = new URLSearchParams();
  if (route.view === "browse") {
    if ((route.category && route.category !== "All") || route.search || (route.condition && route.condition !== "All") || (route.sort && route.sort !== "featured") || route.priceMin || route.priceMax) path = "/browse";
    if (route.category && route.category !== "All") params.set("category", route.category);
    if (route.category && route.category !== "All" && route.subcategory && route.subcategory !== "All") params.set("subcategory", route.subcategory);
    if (route.search) params.set("search", route.search);
    if (route.condition && route.condition !== "All") params.set("condition", route.condition);
    if (route.sort && route.sort !== "featured") params.set("sort", route.sort);
    if (route.priceMin !== "" && route.priceMin != null) params.set("priceMin", route.priceMin);
    if (route.priceMax !== "" && route.priceMax != null) params.set("priceMax", route.priceMax);
  }
  if (route.view === "dashboard" && route.sellerSection === "orders") path = "/seller/orders";
  if (route.view === "dashboard" && route.sellerSection === "listings") path = "/seller/listings";
  if (route.view === "storefront" && route.seller) path = `/store/${encodeURIComponent(route.seller)}`;
  if (route.view === "orders") {
    params.set("status", buyerStatuses.has(route.orderStatus) ? route.orderStatus : "all");
    if (route.orderSearch) params.set("search", route.orderSearch);
  }
  if (route.view === "dashboard" && route.sellerSection === "orders") params.set("status", sellerStatuses.has(route.salesTab) ? route.salesTab : "all");
  if (route.view === "messages" && route.thread) params.set("thread", route.thread);
  if (["signin", "signup"].includes(route.view) && route.next) params.set("next", route.next);
  if (route.listingId) params.set("listing", route.listingId);
  if (route.cart) params.set("cart", "1");
  if (route.view === "help" && route.ticket) params.set("ticket", route.ticket);
  if (route.view === "dashboard" && route.sellerSection === "listings") params.set("status", route.listingsTab || "all");
  return path + (params.size ? `?${params}` : "");
}
export function useMarketplaceRouting(disabled = false) {
  const [route, setRoute] = useState(() => disabled ? { ...defaults } : readMarketplaceRoute());
  const previous = useRef(route);
  useEffect(() => {
    if (disabled) return;
    const onPop = () => { const next = readMarketplaceRoute(); previous.current = next; setRoute(next); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [disabled]);
  useEffect(() => {
    if (disabled) return;
    // Leave payment-return parameters untouched until an actual in-app navigation.
    if (previous.current === route) return;
    const nextUrl = marketplaceRouteUrl(route);
    if (nextUrl !== window.location.pathname + window.location.search) {
      const old = previous.current;
      // Typing a search edits the current history entry; page and status changes are navigable.
      const typingFields = new Set(["orderSearch", "search", "priceMin", "priceMax"]);
      const onlySearchChanged = Object.keys(route).some((key) => typingFields.has(key) && old[key] !== route[key]) && Object.keys(route).every((key) => typingFields.has(key) || old[key] === route[key]);
      window.history[onlySearchChanged ? "replaceState" : "pushState"]({}, "", nextUrl);
    }
    previous.current = route;
  }, [route, disabled]);
  return [route, setRoute];
}
