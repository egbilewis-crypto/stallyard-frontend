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
const defaults = { view: "browse", orderSearch: "", orderStatus: "all", salesTab: "all", sellerSection: "overview", seller: null, thread: null, next: "" };
const safeDecode = (value) => { try { return decodeURIComponent(value); } catch { return ""; } };
export function readMarketplaceRoute(location = typeof window === "undefined" ? { pathname: "/", search: "" } : window.location) {
  const path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(location.search || "");
  const route = { ...defaults, view: Object.keys(paths).find((key) => paths[key] === path) || "browse" };
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
  const next = params.get("next") || "";
  if (["signin", "signup"].includes(route.view) && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) route.next = next;
  return route;
}
export function marketplaceRouteUrl(route) {
  let path = paths[route.view] || "/";
  const params = new URLSearchParams();
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
      const onlySearchChanged = old.orderSearch !== route.orderSearch && Object.keys(route).every((key) => key === "orderSearch" || old[key] === route[key]);
      window.history[onlySearchChanged ? "replaceState" : "pushState"]({}, "", nextUrl);
    }
    previous.current = route;
  }, [route, disabled]);
  return [route, setRoute];
}
