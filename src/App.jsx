import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Store, LayoutGrid, Pencil, Trash2, X, PackageOpen, ShoppingBag, Minus, User, LogOut, Receipt, Shield, HelpCircle, Wallet, MessageCircle, Send, Heart, Bell, Image as ImageIcon, Flag } from "lucide-react";

const INK = "#1B2430";
const CANVAS = "#F6F3EC";
const MARIGOLD = "#E8A94D";
const BERRY = "#C1443C";
const SAGE = "#6B8F71";
const SLATE = "#667085";

const BACKEND_URL = "https://stallyard-backend-production.up.railway.app";

// `window.storage` only exists inside Claude's own preview tool. On the real
// deployed site it doesn't exist, so we back it with the browser's own
// localStorage instead — same shape (get/set/delete/list), so nothing else
// in this file has to change.
if (typeof window !== "undefined" && !window.storage) {
  const PREFIX = "stallyard-storage:";
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? null : { key, value: raw };
    },
    async set(key, value) {
      localStorage.setItem(PREFIX + key, value);
      return { key, value };
    },
    async delete(key) {
      const existed = localStorage.getItem(PREFIX + key) !== null;
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: existed };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
      }
      return { keys };
    },
  };
}

const CATEGORIES = ["Handmade", "Home", "Vintage", "Electronics", "Clothing", "Books", "Art", "Outdoors", "Auto Parts", "Groceries", "Other"];

const CONDITIONS = ["New", "Used", "Like New", "Good", "Fair", "Refurbished", "For parts / not working"];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "FCT (Abuja)",
];

const SHIPPING_METHODS = [
  { value: "self_delivery", label: "Self delivery" },
  { value: "dhl", label: "DHL" },
  { value: "sea_shipping", label: "Sea shipping" },
];

const RETURN_POLICIES = ["No returns", "7-day returns", "14-day returns", "30-day returns"];

const POLICY_LABELS = {
  seller_rules: "Seller rules",
  prohibited_items: "Prohibited items",
  fees: "Fees",
  payment_rules: "Payment rules",
  shipping_rules: "Shipping rules",
  returns_disputes: "Returns & disputes",
};
const POLICY_ORDER = ["seller_rules", "prohibited_items", "fees", "payment_rules", "shipping_rules", "returns_disputes"];

const TICKET_STATUS_LABEL = { open: "Open", in_progress: "In progress", resolved: "Resolved" };

// The admin panel's entrance is this obscure path instead of a guessable
// /admin — a supplementary deterrent only, not real security on its own.
// Anyone who sees the URL once (over your shoulder, in browser history,
// in a screen share) knows it from then on, so this doesn't replace the
// password + mandatory 2FA + generic-error protections already in place.
// Change this string any time — treat it like a password, don't share it
// publicly, and rotate it if you think it's leaked.
const ADMIN_SECRET_PATH = "/0936746admin";

const ADMIN_ROLE_LABELS = {
  super_admin: "Super Admin",
  seller_verification: "Seller Verification",
  listing_moderator: "Listing Moderator",
  order_dispute: "Order/Dispute Admin",
  finance: "Finance Admin",
  customer_support: "Customer Support",
};
const ADMIN_ROLE_ORDER = [
  "super_admin", "seller_verification", "listing_moderator", "order_dispute", "finance", "customer_support",
];

// Mirrors the backend's permission matrix exactly, so the UI only shows
// what a role can actually do — the backend is still the real enforcement,
// this just keeps the interface from being confusing/misleading.
const ADMIN_ROLE_PERMISSIONS = {
  seller_verification: new Set(["seller_verification"]),
  listing_moderator: new Set(["listing_moderation"]),
  order_dispute: new Set(["dispute_resolution"]),
  finance: new Set(["finance"]),
  customer_support: new Set(["support_tickets"]),
};
function hasAdminPermission(member, permission) {
  if (!member?.isAdmin) return false;
  if (!member.adminRole || member.adminRole === "super_admin") return true;
  const allowed = ADMIN_ROLE_PERMISSIONS[member.adminRole];
  return allowed ? allowed.has(permission) : false;
}

const LISTING_MANAGE_TABS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "pending", label: "Pending" },
  { key: "paused", label: "Paused" },
  { key: "sold", label: "Sold out" },
  { key: "rejected", label: "Rejected" },
  { key: "removed", label: "Taken down" },
];

const CURRENCIES = {
  USD: { symbol: "$", label: "US Dollar (USD)" },
  NGN: { symbol: "₦", label: "Nigerian Naira (NGN)" },
};

function formatMoney(amount, currency) {
  const symbol = CURRENCIES[currency]?.symbol || "$";
  const num = Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${num}`;
}

const CONDITION_COLOR = {
  New: "#6B8F71",
  Used: "#667085",
  "Like New": "#3B6E8F",
  Good: "#8A6D3B",
  Fair: "#B8862E",
  Refurbished: "#A6567A",
  "For parts / not working": "#C1443C",
};

const CATEGORY_COLOR = {
  Handmade: "#C1443C",
  Home: "#6B8F71",
  Vintage: "#8A6D3B",
  Electronics: "#3B6E8F",
  Clothing: "#A6567A",
  Books: "#4B5D67",
  Art: "#B8862E",
  Outdoors: "#3E7A4E",
  "Auto Parts": "#4A4E58",
  Groceries: "#7A9E5C",
  Other: "#667085",
};

const CATEGORY_ICON = {
  Handmade: "🧶",
  Home: "🏠",
  Vintage: "🕰️",
  Electronics: "🔌",
  Clothing: "👕",
  Books: "📚",
  Art: "🎨",
  Outdoors: "🥾",
  "Auto Parts": "🚗",
  Groceries: "🛒",
  Other: "📦",
};

const EMOJI_CHOICES = ["📦", "🧶", "🕯️", "📚", "🪴", "👕", "🎨", "⌚", "🛠️", "🎧", "🧸", "🥾", "☕", "💍", "🪑", "🎸", "🚗", "⚙️", "🔧", "🛞", "🔋", "🛒", "🥕", "🍎"];

const FULFILLMENT_LABEL = {
  new: "New",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const FULFILLMENT_COLOR = {
  new: "#3B6E8F",
  preparing: "#B8862E",
  shipped: "#6B8F71",
  delivered: "#2F6B3A",
  cancelled: "#C1443C",
  returned: "#B8862E",
};

const SHIPPING_CARRIERS = ["Self delivery", "DHL", "GIG Logistics", "NIPOST", "UPS", "FedEx", "Other"];

const RETURN_REASONS = [
  "Not as described",
  "Damaged or defective",
  "Wrong item received",
  "Changed my mind",
  "Other",
];

const RETURN_STATUS_LABEL = {
  requested: "Return requested",
  approved: "Return approved",
  denied: "Return denied",
};

const RETURN_STATUS_COLOR = {
  requested: "#B8862E",
  approved: "#6B8F71",
  denied: "#C1443C",
};

function useFonts() {
  useEffect(() => {
    const id = "stallyard-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

// Permissive check: allows international formats, just makes sure it's
// mostly digits of a plausible length rather than enforcing one country's format.
function isValidPhone(phone) {
  const trimmed = (phone || "").trim();
  const digits = trimmed.replace(/[^0-9]/g, "");
  return trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15;
}

const US_COUNTRY_ALIASES = ["united states", "united states of america", "usa", "us", "u.s.", "u.s.a."];
function isUnitedStates(country) {
  return US_COUNTRY_ALIASES.includes((country || "").trim().toLowerCase());
}

// US-based members skip ID verification at signup, but once a seller's
// cumulative USD sales cross this, they must add ID to keep listing.
const ID_VERIFICATION_SALES_THRESHOLD = 10000;

function orderNumber(id) {
  return "STL-" + id.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
}

function formatTimeRemaining(endTime, now) {
  const ms = endTime - now;
  if (ms <= 0) return null;
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

// Converts the backend's snake_case /signup and /login response into the
// camelCase member shape the rest of this app expects. `existing` (if the
// username already has a local record) is merged in for fields the backend
// doesn't track yet — vacation mode, ID verification details, etc. — so
// logging in again doesn't wipe out local-only data.
function backendListingToFrontend(row, existing) {
  return {
    ...existing,
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description || "",
    price: Number(row.price),
    category: row.category,
    condition: row.condition,
    shippingFee: Number(row.shipping_fee) || 0,
    emoji: row.emoji || "📦",
    fitMake: row.fit_make || "",
    fitModel: row.fit_model || "",
    fitYear: row.fit_year || "",
    images: row.images || [],
    listingType: row.listing_type || "fixed",
    currency: row.currency || "USD",
    status: row.status || "pending",
    isFeatured: !!row.is_featured,
    auctionEndTime: row.auction_end_time ? new Date(row.auction_end_time).getTime() : null,
    bidHistory: row.bid_history || [],
    highestBidderUsername: row.highest_bidder_username || null,
    quantity: row.quantity ?? "",
    sku: row.sku || "",
    brand: row.brand || "",
    state: row.state || "",
    shippingMethods: row.shipping_methods || [],
    returnPolicy: row.return_policy || "",
    vin: row.vin || "",
    sellerName: row.seller_name,
    ownerUsername: row.owner_username,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : existing?.createdAt || Date.now(),
  };
}

function backendMessageToFrontend(row, members) {
  const sender = members.find((m) => m.backendId === row.sender_id);
  return {
    id: row.id,
    type: row.message_type,
    senderUsername: sender?.username,
    text: row.body || "",
    amount: row.offer_amount != null ? Number(row.offer_amount) : undefined,
    status: row.offer_status,
    imageUrl: row.image_url || "",
    orderId: row.order_id || null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function backendThreadToFrontend(row, messageRows, members, listings) {
  const buyer = members.find((m) => m.backendId === row.buyer_id);
  const seller = members.find((m) => m.backendId === row.seller_id);
  const listing = listings.find((l) => l.id === row.listing_id);
  const messages = messageRows.map((m) => backendMessageToFrontend(m, members));
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: listing?.title || "Listing",
    listingEmoji: listing?.emoji || "📦",
    buyerUsername: buyer?.username,
    buyerName: buyer?.displayName,
    sellerUsername: seller?.username,
    sellerName: seller?.displayName,
    messages,
    updatedAt: messages.length > 0 ? Math.max(...messages.map((m) => m.createdAt)) : (row.created_at ? new Date(row.created_at).getTime() : Date.now()),
  };
}

function backendReviewToFrontend(row, members) {
  const buyer = members.find((m) => m.backendId === row.buyer_id);
  const seller = members.find((m) => m.backendId === row.seller_id);
  return {
    id: row.id,
    orderId: row.order_id,
    listingId: row.listing_id,
    sellerUsername: seller?.username,
    buyerUsername: buyer?.username,
    buyerName: buyer?.displayName,
    rating: row.rating,
    comment: row.comment || "",
    sellerResponse: row.seller_response || "",
    sellerResponseAt: row.seller_response_at ? new Date(row.seller_response_at).getTime() : null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function backendOrderToFrontend(row) {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    buyerUsername: row.buyer_username,
    buyerName: row.buyer_name || row.buyer_username,
    shippingAddress: row.shipping_address || {},
    currency: row.currency || "USD",
    subtotal: Number(row.subtotal) || 0,
    shippingTotal: Number(row.shipping_total) || 0,
    total: Number(row.total) || 0,
    commissionRate: row.commission_rate !== undefined ? Number(row.commission_rate) : 0.05,
    commissionAmount: Number(row.commission_amount) || 0,
    paymentStatus: row.payment_status || "held",
    isDisputed: !!row.is_disputed,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    items: (row.items || []).map((i) => ({
      id: i.id,
      listingId: i.listing_id,
      title: i.title,
      emoji: i.emoji || "📦",
      price: Number(i.price),
      qty: i.qty,
      shippingFee: Number(i.shipping_fee) || 0,
      sellerName: i.seller_name,
      ownerUsername: i.seller_username,
      fulfillmentStatus: i.fulfillment_status || "new",
      trackingNumber: i.tracking_number || "",
      carrier: i.carrier || "",
      buyerConfirmedAt: i.buyer_confirmed_at ? new Date(i.buyer_confirmed_at).getTime() : null,
      shippedAt: i.shipped_at ? new Date(i.shipped_at).getTime() : null,
      proofOfDeliveryUrl: i.proof_of_delivery_url || "",
      returnStatus: i.return_status || null,
      returnReason: i.return_reason || "",
      returnNote: i.return_note || "",
      returnRequestedAt: i.return_requested_at ? new Date(i.return_requested_at).getTime() : null,
      returnTrackingNumber: i.return_tracking_number || "",
      returnEvidenceUrls: i.return_evidence_urls || [],
      statusHistory: [{ status: i.fulfillment_status || "new", at: row.created_at ? new Date(row.created_at).getTime() : Date.now() }],
    })),
  };
}

function backendUserToMember(user, existing) {
  return {
    ...existing,
    backendId: user.id,
    username: user.username,
    displayName: user.display_name || user.username,
    email: user.email,
    phone: user.phone || existing?.phone || "",
    firstName: user.first_name || existing?.firstName || "",
    lastName: user.last_name || existing?.lastName || "",
    officeLocation: user.office_location || existing?.officeLocation || "",
    avatarUrl: user.avatar_url ?? existing?.avatarUrl ?? "",
    storeBio: user.store_bio ?? existing?.storeBio ?? "",
    storePolicies: user.store_policies ?? existing?.storePolicies ?? "",
    twoFactorEnabled: user.two_factor_enabled ?? existing?.twoFactorEnabled ?? false,
    adminRole: user.admin_role ?? existing?.adminRole ?? null,
    isEmailVerified: user.is_email_verified ?? existing?.isEmailVerified ?? false,
    isPhoneVerified: user.is_phone_verified ?? existing?.isPhoneVerified ?? false,
    country: user.country || existing?.country || "",
    isAdmin: !!user.is_admin,
    isApproved: !!user.is_approved,
    isVerified: !!user.is_verified,
    isSuspended: !!user.is_suspended,
    joinedAt: user.created_at ? new Date(user.created_at).getTime() : existing?.joinedAt || Date.now(),
    accountType: user.account_type || existing?.accountType || "personal",
    licenseNumber: user.license_number || existing?.licenseNumber || "",
    idType: user.id_type || existing?.idType || "Passport",
    idCountry: user.id_country || existing?.idCountry || "",
    licensePhotos: user.license_photos || existing?.licensePhotos || [],
    idVerificationExempt:
      user.id_verification_exempt ?? existing?.idVerificationExempt ?? isUnitedStates(user.country),
    hasAppliedToSell: user.has_applied_to_sell || existing?.hasAppliedToSell || false,
    verificationStatus:
      user.verification_status ||
      existing?.verificationStatus ||
      (user.is_approved ? "approved" : user.has_applied_to_sell ? "pending" : "none"),
    bankStatementUrl: user.bank_statement_url ?? existing?.bankStatementUrl ?? null,
    rejectionReason: user.rejection_reason ?? existing?.rejectionReason ?? "",
    phoneVerified: existing?.phoneVerified || true,
    vacationMode: existing?.vacationMode || false,
  };
}

// Basic, non-exhaustive filter to discourage sharing emails/phone numbers in chat.
// It catches common patterns but a determined user could still obfuscate around it
// (e.g. "call me at five five five..."), so this is a nudge, not a guarantee.
function containsContactInfo(text) {
  const emailPattern = /[a-z0-9._%+-]+\s*(@|\bat\b)\s*[a-z0-9.-]+\s*(\.|\bdot\b)\s*[a-z]{2,}/i;
  const digitsOnly = text.replace(/[^0-9]/g, "");
  const phonePattern = /(\+?\d[\s.\-()]*){7,}/;
  const hasManyDigitsClustered = phonePattern.test(text) && digitsOnly.length >= 7;
  return emailPattern.test(text) || hasManyDigitsClustered;
}

// Best-effort carrier detection from common tracking number formats.
// Falls back to a general web search if the format isn't recognized —
// this app has no live carrier API integration, so it can't confirm
// the number is valid or show real-time scan events itself.
// Lightweight, dependency-free parsing — just enough to show something
// readable like "Chrome on Windows" rather than a raw user-agent string.
function describeUserAgent(ua) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
    ? "Chrome"
    : /Firefox\//.test(ua)
    ? "Firefox"
    : /Safari\//.test(ua)
    ? "Safari"
    : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
    ? "Mac"
    : /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
    ? "iOS"
    : /Linux/.test(ua)
    ? "Linux"
    : "an unknown device";
  return `${browser} on ${os}`;
}

function buildTrackingUrl(raw) {
  const num = raw.trim();
  const digits = num.replace(/[^0-9]/g, "");
  if (/^1Z[0-9A-Z]{16}$/i.test(num.replace(/\s/g, ""))) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(num.replace(/\s/g, ""))}`;
  }
  if (/^\d{12}$/.test(digits) || /^\d{15}$/.test(digits) || /^\d{20}$/.test(digits)) {
    return `https://www.fedex.com/fedextrack/?trknbr=${digits}`;
  }
  if (/^(94|93|92|95)\d{20}$/.test(digits) || /^\d{20,22}$/.test(digits)) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${digits}`;
  }
  if (/^\d{10,11}$/.test(digits) || /^(GM|JJD|JVGL)[0-9A-Z]{8,}$/i.test(num.replace(/\s/g, ""))) {
    return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(num.replace(/\s/g, ""))}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent("track package " + num)}`;
}

function resizeImageFile(file, maxDim = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read file"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Derives a single order-level status bucket (for tab filtering) from just
// one seller's items within an order, since an order can span multiple
// sellers and each item tracks its own fulfillment status independently.
function getSellerOrderStatus(order, username) {
  const myItems = order.items.filter((i) => i.ownerUsername === username);
  if (myItems.length === 0) return "new";
  if (myItems.every((i) => i.fulfillmentStatus === "cancelled")) return "cancelled";
  const relevant = myItems.filter((i) => i.fulfillmentStatus !== "cancelled");
  if (relevant.length > 0 && relevant.every((i) => ["delivered", "returned"].includes(i.fulfillmentStatus))) {
    return "completed";
  }
  if (myItems.some((i) => (i.fulfillmentStatus || "new") === "new")) return "new";
  if (myItems.some((i) => i.fulfillmentStatus === "preparing")) return "preparing";
  return "shipped";
}

const SALES_TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function Tag({ children, color }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + "20", color }}
    >
      {children}
    </span>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="text-xl leading-none"
          style={{ color: n <= value ? "#E8A94D" : "#DDD8CC" }}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value, size = "text-sm" }) {
  return (
    <span className={size} style={{ color: "#E8A94D", letterSpacing: "1px" }}>
      {"★".repeat(Math.round(value))}
      <span style={{ color: "#DDD8CC" }}>{"★".repeat(5 - Math.round(value))}</span>
    </span>
  );
}

const TRACKING_STEPS = [
  { status: "new", label: "Order placed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

function TrackingTimeline({ item, orderCreatedAt, ink, slate, sage, berry }) {
  const history = item.statusHistory && item.statusHistory.length > 0
    ? item.statusHistory
    : [{ status: "new", at: orderCreatedAt }];
  const isTerminalIssue = item.fulfillmentStatus === "cancelled" || item.fulfillmentStatus === "returned";
  const findAt = (status) => history.find((h) => h.status === status)?.at;

  if (isTerminalIssue) {
    const at = findAt(item.fulfillmentStatus) || history[history.length - 1]?.at;
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: berry }}>
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: berry }} />
        {FULFILLMENT_LABEL[item.fulfillmentStatus]}
        {at && (
          <span style={{ color: slate }}>
            ·{" "}
            {new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {TRACKING_STEPS.map((step, idx) => {
        const at = findAt(step.status);
        const done = !!at;
        return (
          <div key={step.status} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: done ? sage : "#DDD8CC" }}
              />
              <span className="text-[10px] mt-1 whitespace-nowrap" style={{ color: done ? ink : slate }}>
                {step.label}
              </span>
              {at && (
                <span className="text-[10px]" style={{ color: slate }}>
                  {new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            {idx < TRACKING_STEPS.length - 1 && (
              <div
                className="h-0.5 w-8"
                style={{ backgroundColor: findAt(TRACKING_STEPS[idx + 1].status) ? sage : "#DDD8CC" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PriceTagCard({ listing, onOpen, onAddToCart, rating, isSaved, onToggleWatchlist, onOpenStorefront, now, onVacation }) {
  const color = CATEGORY_COLOR[listing.category] || SLATE;
  const isAuction = listing.listingType === "auction";
  const timeLeft = isAuction ? formatTimeRemaining(listing.auctionEndTime, now || Date.now()) : null;
  const auctionEnded = isAuction && !timeLeft;
  return (
    <div
      className="text-left relative bg-white rounded-r-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 motion-reduce:transform-none overflow-visible w-full"
      style={{ borderLeft: `6px solid ${color}` }}
    >
      {/* punched hole */}
      <div
        className="absolute -left-[15px] top-4 w-5 h-5 rounded-full border-2 z-10"
        style={{ backgroundColor: CANVAS, borderColor: color }}
      />
      {listing.isFeatured && (
        <div
          className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[11px] font-semibold z-10 shadow-sm"
          style={{ backgroundColor: MARIGOLD, color: INK }}
        >
          Featured
        </div>
      )}
      {isAuction && !listing.isFeatured && (
        <div
          className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[11px] font-semibold z-10 shadow-sm text-white"
          style={{ backgroundColor: "#3B6E8F" }}
        >
          🔨 Auction
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWatchlist(listing.id);
        }}
        className="absolute top-2 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 shadow-sm"
        aria-label={isSaved ? "Remove from watchlist" : "Save to watchlist"}
      >
        <Heart
          size={16}
          style={{ color: isSaved ? BERRY : SLATE }}
          fill={isSaved ? BERRY : "none"}
        />
      </button>
      <button onClick={() => onOpen(listing)} className="text-left w-full">
        {listing.images && listing.images.length > 0 ? (
          <div className="relative">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-36 object-cover rounded-tr-2xl"
            />
            <span
              className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-sm font-semibold bg-white/90"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
            >
              {formatMoney(listing.price, listing.currency)}
            </span>
            {listing.images.length > 1 && (
              <span
                className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-medium text-white"
                style={{ backgroundColor: "rgba(27,36,48,0.75)" }}
              >
                +{listing.images.length - 1} more
              </span>
            )}
          </div>
        ) : null}
        <div className="p-5 pl-6">
          {!(listing.images && listing.images.length > 0) && (
            <div className="flex items-start justify-between gap-2">
              <div className="text-3xl leading-none">{listing.emoji}</div>
              <div
                className="font-semibold text-lg"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
              >
                {formatMoney(listing.price, listing.currency)}
              </div>
            </div>
          )}
          <h3
            className="mt-3 text-lg leading-snug"
            style={{ fontFamily: "'DM Serif Display', serif", color: INK }}
          >
            {listing.title}
          </h3>
          <p className="mt-1 text-sm line-clamp-2" style={{ color: SLATE }}>
            {listing.description}
          </p>
          {isAuction && (
            <p className="mt-1 text-xs font-medium" style={{ color: "#3B6E8F" }}>
              Current bid: {formatMoney(listing.price, listing.currency)}
              {(listing.bidHistory || []).length > 0 ? ` (${listing.bidHistory.length} bid${listing.bidHistory.length !== 1 ? "s" : ""})` : " (no bids yet)"}
              {" · "}
              {auctionEnded ? "Ended" : timeLeft}
            </p>
          )}
          {listing.category === "Auto Parts" && (listing.fitMake || listing.fitModel) && (
            <p className="mt-1 text-xs font-medium" style={{ color: CATEGORY_COLOR["Auto Parts"] }}>
              Fits: {[listing.fitMake, listing.fitModel, listing.fitYear].filter(Boolean).join(" ")}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: SLATE }}>
            {listing.shippingFee ? `+ ${formatMoney(listing.shippingFee, listing.currency)} shipping` : "Free shipping"}
          </p>
        </div>
      </button>
      <div className="px-5 pl-6 pb-4">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tag color={color}>{listing.category}</Tag>
            {listing.condition && listing.condition !== "New" && (
              <Tag color={CONDITION_COLOR[listing.condition] || SLATE}>{listing.condition}</Tag>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenStorefront(listing.ownerUsername);
            }}
            className="text-xs flex items-center gap-1 underline"
            style={{ color: SLATE }}
          >
            {rating && <StarDisplay value={rating.avg} size="text-xs" />}
            by {listing.sellerName}
          </button>
        </div>
        {onVacation && (
          <p className="text-xs mb-2" style={{ color: MARIGOLD }}>
            🌴 Seller on vacation
            {onVacation.returnDate
              ? ` until ${new Date(onVacation.returnDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
              : ""}
          </p>
        )}
        {isAuction ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(listing);
            }}
            className="w-full py-2 rounded-lg text-sm font-medium border flex items-center justify-center gap-2"
            style={{ borderColor: color, color }}
          >
            {auctionEnded ? "View auction" : "Place a bid"}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(listing);
            }}
            className="w-full py-2 rounded-lg text-sm font-medium border flex items-center justify-center gap-2"
            style={{ borderColor: color, color }}
          >
            <ShoppingBag size={14} />
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}

export default function Stallyard() {
  useFonts();
  const [view, setView] = useState("browse");
  const [adminLoginMode, setAdminLoginMode] = useState(
    () => typeof window !== "undefined" && window.location.pathname === ADMIN_SECRET_PATH
  );
  const [adminLoginForm, setAdminLoginForm] = useState({ username: "", password: "" });
  const [adminLoginStep, setAdminLoginStep] = useState("credentials"); // "credentials" | "code" | "code-email"
  const [adminLoginCode, setAdminLoginCode] = useState("");
  const [adminLoginPendingUserId, setAdminLoginPendingUserId] = useState(null);
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminLoginSubmitting, setAdminLoginSubmitting] = useState(false);
  const [authReturnView, setAuthReturnView] = useState("browse");
  const [adminTab, setAdminTab] = useState("overview");
  const [adminUnlockedUntil, setAdminUnlockedUntil] = useState(null);
  const [adminReauthStep, setAdminReauthStep] = useState(null); // null | "password" | "code" | "code-email"
  const [adminReauthPassword, setAdminReauthPassword] = useState("");
  const [adminReauthCode, setAdminReauthCode] = useState("");
  const [adminReauthSubmitting, setAdminReauthSubmitting] = useState(false);
  const [adminReauthError, setAdminReauthError] = useState("");
  const ADMIN_SESSION_IDLE_MS = 30 * 60 * 1000;
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [expandedDocsUsername, setExpandedDocsUsername] = useState(null);
  const [adminEditContext, setAdminEditContext] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    officeLocation: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [contentTab, setContentTab] = useState("banners");
  const [bannerForm, setBannerForm] = useState({
    message: "",
    tone: "info",
    mediaType: "none",
    imageUrl: "",
    videoUrl: "",
  });
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [authImageUploading, setAuthImageUploading] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [articleForm, setArticleForm] = useState({ title: "", body: "" });
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [listings, setListings] = useState([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  // True only once the saved session (if any) has actually been read back
  // from storage — distinct from membersLoaded, which flips true slightly
  // earlier in the same startup sequence, before currentUser is resolved.
  // Anything that redirects based on "is someone logged in" needs to wait
  // for this, not just membersLoaded, or it acts on a stale null.
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authMode, setAuthMode] = useState("register");
  const [pendingPasswordReset, setPendingPasswordReset] = useState(null);
  const [resetCodeInput, setResetCodeInput] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [newPasswordForm, setNewPasswordForm] = useState({ password: "", confirm: "" });
  const [authError, setAuthError] = useState("");
  const [pendingTwoFactor, setPendingTwoFactor] = useState(null);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState("");
  const [savingTwoFactorToggle, setSavingTwoFactorToggle] = useState(false);
  // Turning 2FA ON now requires emailing + confirming a code first, tracked
  // separately from savingTwoFactorToggle (which still covers turning OFF).
  const [enable2FAStep, setEnable2FAStep] = useState("idle"); // "idle" | "code"
  const [enable2FACodeInput, setEnable2FACodeInput] = useState("");
  const [enable2FAError, setEnable2FAError] = useState("");
  const [sendingEnable2FACode, setSendingEnable2FACode] = useState(false);
  const [verifyingEnable2FACode, setVerifyingEnable2FACode] = useState(false);
  // Admin accounts use an authenticator app instead of email codes — this
  // holds the in-progress QR/secret from /admin/totp/setup until confirmed.
  const [adminTotpSetup, setAdminTotpSetup] = useState(null); // { secret, otpauthUrl, qrCodeUrl } | null
  const [adminTotpCodeInput, setAdminTotpCodeInput] = useState("");
  const [adminTotpError, setAdminTotpError] = useState("");
  const [startingAdminTotpSetup, setStartingAdminTotpSetup] = useState(false);
  const [confirmingAdminTotpSetup, setConfirmingAdminTotpSetup] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    displayName: "",
    firstName: "",
    lastName: "",
    officeLocation: "",
    country: "",
    licenseNumber: "",
    idType: "Passport",
    idCountry: "",
    accountType: "personal",
    licensePhotos: [],
  });
  const [selected, setSelected] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [toast, setToast] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [cart, setCart] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [saveShippingAddress, setSaveShippingAddress] = useState(true);
  const [shippingError, setShippingError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ commissionRate: 0.05, authImage: "" });
  const [content, setContent] = useState({ banners: [], articles: [], faqs: [] });
  const [policies, setPolicies] = useState({
    seller_rules: "", prohibited_items: "", fees: "",
    payment_rules: "", shipping_rules: "", returns_disputes: "",
  });
  const [myTickets, setMyTickets] = useState([]);
  const [adminTickets, setAdminTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [loadingTicketMessages, setLoadingTicketMessages] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ subject: "", message: "" });
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [newTicketMessageInput, setNewTicketMessageInput] = useState("");
  const [sendingTicketMessage, setSendingTicketMessage] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [editingPolicyCategory, setEditingPolicyCategory] = useState(null);
  const [policyDraft, setPolicyDraft] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [follows, setFollows] = useState([]);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [returnDrafts, setReturnDrafts] = useState({});
  const [returnTrackingDrafts, setReturnTrackingDrafts] = useState({});
  const [trackingDrafts, setTrackingDrafts] = useState({});
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankList, setBankList] = useState([]);
  const [bankForm, setBankForm] = useState({ bankCode: "", accountNumber: "" });
  const [pendingBankChange, setPendingBankChange] = useState(false);
  const [accountEmailCodeSent, setAccountEmailCodeSent] = useState(false);
  const [accountEmailCodeInput, setAccountEmailCodeInput] = useState("");
  const [verifyingAccountEmail, setVerifyingAccountEmail] = useState(false);
  const [accountPhoneInput, setAccountPhoneInput] = useState("");
  const [accountPhoneCodeSent, setAccountPhoneCodeSent] = useState(false);
  const [accountPhoneCodeInput, setAccountPhoneCodeInput] = useState("");
  const [verifyingAccountPhone, setVerifyingAccountPhone] = useState(false);
  const [bankChangeCodeInput, setBankChangeCodeInput] = useState("");
  const [changePasswordForm, setChangePasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOutOtherDevices, setSigningOutOtherDevices] = useState(false);
  const [suspiciousActivityMessage, setSuspiciousActivityMessage] = useState("");
  const [submittingSuspiciousReport, setSubmittingSuspiciousReport] = useState(false);
  const [accountReports, setAccountReports] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loadingAuditLog, setLoadingAuditLog] = useState(false);
  const [myWarnings, setMyWarnings] = useState([]);
  const [adminWarningsTarget, setAdminWarningsTarget] = useState(null);
  const [adminWarningsList, setAdminWarningsList] = useState([]);
  const [newWarningMessage, setNewWarningMessage] = useState("");
  const [issuingWarning, setIssuingWarning] = useState(false);
  const [loginHistory, setLoginHistory] = useState(null);
  const [loadingLoginHistory, setLoadingLoginHistory] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [threads, setThreads] = useState([]);
  const [messageReports, setMessageReports] = useState([]);
  const [reviewReports, setReviewReports] = useState([]);
  const [reviewResponseDrafts, setReviewResponseDrafts] = useState({});
  const [reportReviewId, setReportReviewId] = useState(null);
  const [reviewReportReasonDraft, setReviewReportReasonDraft] = useState("");
  const [sellerSalesCounts, setSellerSalesCounts] = useState({});
  const [editingStoreProfile, setEditingStoreProfile] = useState(false);
  const [storeProfileDraft, setStoreProfileDraft] = useState({ storeBio: "", storePolicies: "" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [activeThreadOrderId, setActiveThreadOrderId] = useState(null);
  const [messageReadState, setMessageReadState] = useState({});
  const [viewingSeller, setViewingSeller] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());
  const [messageInput, setMessageInput] = useState("");
  const [messageError, setMessageError] = useState("");
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Handmade",
    condition: "New",
    emoji: "📦",
    fitMake: "",
    fitModel: "",
    fitYear: "",
    images: [],
    listingType: "fixed",
    auctionDurationDays: "3",
    currency: "NGN",
    shippingFee: "0.00",
    quantity: "",
    sku: "",
    brand: "",
    state: "",
    shippingMethods: [],
    returnPolicy: "",
    vin: "",
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [manageListingsTab, setManageListingsTab] = useState("all");
  const [salesTab, setSalesTab] = useState("all");
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickEditDraft, setQuickEditDraft] = useState({ price: "", quantity: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [idVerifyOpen, setIdVerifyOpen] = useState(false);
  const [idVerifyForm, setIdVerifyForm] = useState({ idType: "Passport", idCountry: "", licenseNumber: "" });
  const [bankStatementDraft, setBankStatementDraft] = useState(null);
  const [uploadingBankStatement, setUploadingBankStatement] = useState(false);
  const [uploadingPodKey, setUploadingPodKey] = useState(null);
  const [uploadingReturnEvidenceKey, setUploadingReturnEvidenceKey] = useState(null);
  const [packingSlipOrder, setPackingSlipOrder] = useState(null);
  const [deliveryTokens, setDeliveryTokens] = useState({});
  const [generatingTokenKey, setGeneratingTokenKey] = useState(null);
  const [redeemTokenDrafts, setRedeemTokenDrafts] = useState({});
  const [redeemingTokenKey, setRedeemingTokenKey] = useState(null);
  const [uploadingMessagePhoto, setUploadingMessagePhoto] = useState(false);
  const [reportMessageId, setReportMessageId] = useState(null);
  const [reportReasonDraft, setReportReasonDraft] = useState("");
  const [rejectModalUsername, setRejectModalUsername] = useState(null);
  const [rejectReasonDraft, setRejectReasonDraft] = useState("");
  const [vacationOpen, setVacationOpen] = useState(false);
  const [vacationForm, setVacationForm] = useState({ returnDate: "", message: "" });
  // Email verification (stage one of sign-up) — mirrors the phone
  // verification pattern above, but for email since SMS is paused for now.
  const [pendingEmailVerification, setPendingEmailVerification] = useState(null);
  const [emailCodeInput, setEmailCodeInput] = useState("");
  const [emailVerifyError, setEmailVerifyError] = useState("");
  // Stage two of sign-up — the fuller profile form, shown right after a
  // fresh account is created OR whenever a logged-in user's profile isn't
  // complete yet, so they can always resume where they left off.
  const [profileStageOpen, setProfileStageOpen] = useState(false);
  const [profileStageError, setProfileStageError] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("stallyard-listings", true);
        const localListings = res ? JSON.parse(res.value) : [];
        setListings(localListings);
        try {
          const listingsRes = await fetch(`${BACKEND_URL}/listings`);
          if (listingsRes.ok) {
            const { listings: rows } = await listingsRes.json();
            const merged = rows.map((row) =>
              backendListingToFrontend(row, localListings.find((l) => l.id === row.id))
            );
            setListings(merged);
            await window.storage.set("stallyard-listings", JSON.stringify(merged), true);
          }
        } catch {
          // couldn't reach backend for listings — keep local copy
        }
      } catch {
        setListings([]);
      }
      let bootstrapToken = null;
      try {
        const tokenRes = await window.storage.get("stallyard-auth-token", false);
        if (tokenRes) setAuthToken(tokenRes.value);
        bootstrapToken = tokenRes?.value || null;
      } catch {
        // no saved token — user will need to log in again for anything protected
      }
      let resolvedMembers = [];
      try {
        const membersRes = await window.storage.get("stallyard-members", true);
        const localMembers = membersRes ? JSON.parse(membersRes.value) : [];
        resolvedMembers = localMembers;
        setMembers(localMembers);
        try {
          const usersRes = await fetch(`${BACKEND_URL}/users`, {
            headers: bootstrapToken ? { Authorization: `Bearer ${bootstrapToken}` } : {},
          });
          if (usersRes.ok) {
            const { users } = await usersRes.json();
            const merged = users.map((u) =>
              backendUserToMember(u, localMembers.find((m) => m.username === u.username))
            );
            resolvedMembers = merged;
            setMembers(merged);
            await window.storage.set("stallyard-members", JSON.stringify(merged), true);
          }
        } catch {
          // couldn't reach backend for member list — keep local copy
        }
      } catch {
        setMembers([]);
      }
      setMembersLoaded(true);
      try {
        const sessionRes = await window.storage.get("stallyard-session", false);
        if (sessionRes) setCurrentUser(sessionRes.value);
      } catch {
        // not logged in yet
      }
      setSessionChecked(true);
      try {
        const cartRes = await window.storage.get("stallyard-cart", false);
        setCart(cartRes ? JSON.parse(cartRes.value) : []);
      } catch {
        setCart([]);
      }
      try {
        const watchlistRes = await window.storage.get("stallyard-watchlist", false);
        setWatchlist(watchlistRes ? JSON.parse(watchlistRes.value) : []);
      } catch {
        setWatchlist([]);
      }
      try {
        const readRes = await window.storage.get("stallyard-message-reads", false);
        setMessageReadState(readRes ? JSON.parse(readRes.value) : {});
      } catch {
        setMessageReadState({});
      }
      setOrders([]);
      try {
        const settingsRes = await fetch(`${BACKEND_URL}/settings`);
        if (settingsRes.ok) {
          const raw = await settingsRes.json();
          setSettings({ commissionRate: raw.commissionRate, authImage: raw.authImage || "" });
        }
      } catch {
        // keep default settings
      }
      try {
        const contentRes = await fetch(`${BACKEND_URL}/content`);
        if (contentRes.ok) {
          const raw = await contentRes.json();
          setContent({
            banners: raw.banners.map((b) => ({
              id: b.id,
              message: b.message,
              tone: b.tone,
              isActive: b.is_active,
              mediaType: b.media_type,
              imageUrl: b.image_url || "",
              videoUrl: b.video_url || "",
            })),
            articles: raw.articles.map((a) => ({
              id: a.id,
              title: a.title,
              body: a.body,
              updatedAt: a.updated_at ? new Date(a.updated_at).getTime() : Date.now(),
            })),
            faqs: raw.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
          });
        }
      } catch {
        // keep default empty content
      }
      try {
        const policiesRes = await fetch(`${BACKEND_URL}/policies`);
        if (policiesRes.ok) {
          const { policies: rows } = await policiesRes.json();
          const next = {};
          rows.forEach((p) => {
            next[p.category] = p.body || "";
          });
          setPolicies(next);
        }
      } catch {
        // keep default empty policies
      }
      setWithdrawals([]);
      setThreads([]); // loaded fresh once we know who's logged in, see the effect below
      try {
        const reviewsRes = await fetch(`${BACKEND_URL}/reviews`);
        if (reviewsRes.ok) {
          const { reviews: rows } = await reviewsRes.json();
          setReviews(rows.map((r) => backendReviewToFrontend(r, resolvedMembers)));
        }
      } catch {
        // couldn't reach backend for reviews — leave empty
      }
      try {
        const followsRes = await fetch(`${BACKEND_URL}/follows`);
        if (followsRes.ok) {
          const { follows: rows } = await followsRes.json();
          setFollows(
            rows.map((r) => ({ followerUsername: r.follower_username, followedUsername: r.followed_username }))
          );
        }
      } catch {
        // couldn't reach backend for follows — leave empty, follow button will still work
      }
      setLoaded(true);
    })();
  }, []);

  // Orders and withdrawals are private, per-user data — load them fresh from
  // the real backend whenever the signed-in user (or their token) changes,
  // rather than during the anonymous initial load above.
  useEffect(() => {
    (async () => {
      if (!currentUser || !authToken) {
        setOrders([]);
        setWithdrawals([]);
        setNotifications([]);
        setMyWarnings([]);
        setMyTickets([]);
        setAdminTickets([]);
        return;
      }
      const isAdmin = members.find((m) => m.username === currentUser)?.isAdmin;
      try {
        const notifRes = await authFetch(`${BACKEND_URL}/notifications/mine`);
        if (notifRes.ok) {
          const { notifications: rows } = await notifRes.json();
          setNotifications(
            rows.map((n) => ({
              id: n.id,
              type: n.type,
              message: n.message,
              read: n.read,
              createdAt: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
            }))
          );
        }
      } catch {
        // couldn't reach backend for notifications — leave empty
      }
      try {
        const [mineRes, sellingRes, adminRes] = await Promise.all([
          authFetch(`${BACKEND_URL}/orders/mine`),
          authFetch(`${BACKEND_URL}/orders/selling`),
          isAdmin ? authFetch(`${BACKEND_URL}/orders`) : Promise.resolve(null),
        ]);
        const byId = new Map();
        for (const res of [mineRes, sellingRes, adminRes]) {
          if (!res || !res.ok) continue;
          const { orders: rows } = await res.json();
          for (const row of rows) byId.set(row.id, backendOrderToFrontend(row));
        }
        setOrders([...byId.values()].sort((a, b) => b.createdAt - a.createdAt));
      } catch {
        // couldn't reach backend for orders — leave empty rather than show stale/fake data
      }
      try {
        const [mineWRes, adminWRes] = await Promise.all([
          authFetch(`${BACKEND_URL}/withdrawals/mine`),
          isAdmin ? authFetch(`${BACKEND_URL}/withdrawals`) : Promise.resolve(null),
        ]);
        const byId = new Map();
        for (const res of [mineWRes, adminWRes]) {
          if (!res || !res.ok) continue;
          const { withdrawals: rows } = await res.json();
          for (const row of rows) {
            byId.set(row.id, {
              id: row.id,
              sellerUsername: row.seller_username,
              sellerId: row.seller_id,
              amount: Number(row.amount),
              status: row.status,
              failureReason: row.failure_reason,
              requestedAt: row.requested_at ? new Date(row.requested_at).getTime() : Date.now(),
              processedAt: row.processed_at ? new Date(row.processed_at).getTime() : null,
            });
          }
        }
        setWithdrawals([...byId.values()].sort((a, b) => b.requestedAt - a.requestedAt));
      } catch {
        // couldn't reach backend for withdrawals — leave empty
      }
      if (isAdmin) {
        try {
          const reportsRes = await authFetch(`${BACKEND_URL}/message-reports`);
          if (reportsRes.ok) {
            const { reports } = await reportsRes.json();
            setMessageReports(reports);
          }
        } catch {
          // couldn't reach backend for message reports — leave empty
        }
        try {
          const reviewReportsRes = await authFetch(`${BACKEND_URL}/review-reports`);
          if (reviewReportsRes.ok) {
            const { reports } = await reviewReportsRes.json();
            setReviewReports(reports);
          }
        } catch {
          // couldn't reach backend for review reports — leave empty
        }
        try {
          const accountReportsRes = await authFetch(`${BACKEND_URL}/account-reports`);
          if (accountReportsRes.ok) {
            const { reports } = await accountReportsRes.json();
            setAccountReports(reports);
          }
        } catch {
          // couldn't reach backend for account reports — leave empty
        }
      }
      try {
        const warningsRes = await authFetch(`${BACKEND_URL}/warnings/mine`);
        if (warningsRes.ok) {
          const { warnings } = await warningsRes.json();
          setMyWarnings(warnings);
        }
      } catch {
        // couldn't reach backend for warnings — leave empty
      }
      try {
        const ticketsRes = await authFetch(`${BACKEND_URL}/support-tickets/mine`);
        if (ticketsRes.ok) {
          const { tickets } = await ticketsRes.json();
          setMyTickets(tickets);
        }
      } catch {
        // couldn't reach backend for tickets — leave empty
      }
      if (isAdmin) {
        try {
          const adminTicketsRes = await authFetch(`${BACKEND_URL}/support-tickets`);
          if (adminTicketsRes.ok) {
            const { tickets } = await adminTicketsRes.json();
            setAdminTickets(tickets);
          }
        } catch {
          // couldn't reach backend for admin tickets — leave empty
        }
      }
      try {
        const cartRes = await authFetch(`${BACKEND_URL}/cart`);
        if (cartRes.ok) {
          const { items } = await cartRes.json();
          const mapped = items.map((i) => ({
            id: i.listing_id,
            qty: i.qty,
            ...(i.offer_price != null ? { offerPrice: Number(i.offer_price) } : {}),
          }));
          setCart(mapped);
          await window.storage.set("stallyard-cart", JSON.stringify(mapped), false);
        }
      } catch {
        // couldn't reach backend for cart — keep whatever loaded locally
      }
      try {
        const watchlistRes = await authFetch(`${BACKEND_URL}/watchlist`);
        if (watchlistRes.ok) {
          const { listingIds } = await watchlistRes.json();
          setWatchlist(listingIds);
          await window.storage.set("stallyard-watchlist", JSON.stringify(listingIds), false);
        }
      } catch {
        // couldn't reach backend for watchlist — keep whatever loaded locally
      }
      const myBackendId = members.find((m) => m.username === currentUser)?.backendId;
      if (myBackendId) {
        try {
          const threadsRes = await authFetch(`${BACKEND_URL}/threads/${myBackendId}`);
          if (threadsRes.ok) {
            const { threads: threadRows } = await threadsRes.json();
            const withMessages = await Promise.all(
              threadRows.map(async (t) => {
                const msgRes = await authFetch(`${BACKEND_URL}/messages/${t.id}`);
                const messageRows = msgRes.ok ? (await msgRes.json()).messages : [];
                return backendThreadToFrontend(t, messageRows, members, listings);
              })
            );
            setThreads(withMessages.sort((a, b) => b.updatedAt - a.updatedAt));
          }
        } catch {
          // couldn't reach backend for threads — leave empty
        }
      } else {
        setThreads([]);
      }
    })();
  }, [currentUser, authToken, members, listings]);

  useEffect(() => {
    if (view !== "messages") return;
    const interval = setInterval(async () => {
      try {
        const threadsRes = await window.storage.get("stallyard-messages", true);
        if (threadsRes) setThreads(JSON.parse(threadsRes.value));
      } catch {
        // ignore polling errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [view]);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!cartOpen) return;
    const saved = members.find((m) => m.username === currentUser)?.shippingAddress;
    const isBlank = !shippingForm.street && !shippingForm.city && !shippingForm.zip;
    if (saved && isBlank) {
      setShippingForm(saved);
    } else if (!shippingForm.fullName && currentMember) {
      setShippingForm((f) => ({ ...f, fullName: currentMember.displayName }));
    }
  }, [cartOpen]);

  const persistListings = async (next) => {
    setListings(next);
    try {
      await window.storage.set("stallyard-listings", JSON.stringify(next), true);
    } catch {
      showToast("Couldn't save — try again");
    }
  };

  const persistMembers = async (next) => {
    setMembers(next);
    try {
      await window.storage.set("stallyard-members", JSON.stringify(next), true);
    } catch {
      showToast("Couldn't save — try again");
    }
  };

  const submitIdVerification = async () => {
    if (!idVerifyForm.idCountry.trim()) {
      showToast("Enter the country that issued your ID or passport");
      return;
    }
    await persistMembers(
      members.map((m) =>
        m.username === currentUser
          ? {
              ...m,
              idType: idVerifyForm.idType,
              idCountry: idVerifyForm.idCountry.trim(),
              licenseNumber: idVerifyForm.licenseNumber.trim(),
            }
          : m
      )
    );
    setIdVerifyOpen(false);
    setIdVerifyForm({ idType: "Passport", idCountry: "", licenseNumber: "" });
    showToast("ID verification added — you can keep selling");
  };

  const applyToSell = async () => {
    const target = members.find((m) => m.username === currentUser);
    if (target?.backendId) {
      try {
        const res = await authFetch(`${BACKEND_URL}/profile/apply-to-sell`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bankStatementUrl: bankStatementDraft || null }),
        });
        if (!res.ok) {
          showToast("Couldn't submit application — try again");
          return;
        }
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
    }
    await persistMembers(
      members.map((m) =>
        m.username === currentUser
          ? {
              ...m,
              hasAppliedToSell: true,
              verificationStatus: "pending",
              rejectionReason: "",
              bankStatementUrl: bankStatementDraft || m.bankStatementUrl,
            }
          : m
      )
    );
    setBankStatementDraft(null);
    showToast("Seller application submitted — you'll be notified once reviewed");
  };

  const saveVacationSettings = async () => {
    await persistMembers(
      members.map((m) =>
        m.username === currentUser
          ? {
              ...m,
              vacationMode: true,
              vacationReturnDate: vacationForm.returnDate,
              vacationMessage: vacationForm.message.trim(),
            }
          : m
      )
    );
    setVacationOpen(false);
    showToast("Vacation mode turned on — buyers will see a notice on your listings");
  };

  const endVacation = async () => {
    await persistMembers(
      members.map((m) => (m.username === currentUser ? { ...m, vacationMode: false } : m))
    );
    showToast("Vacation mode turned off — welcome back!");
  };

  const setSession = async (username) => {
    setCurrentUser(username);
    try {
      if (username) await window.storage.set("stallyard-session", username, false);
      else await window.storage.delete("stallyard-session", false);
    } catch {
      // session save failed silently; user stays logged in for this visit
    }
  };

  const saveAuthToken = async (token) => {
    setAuthToken(token);
    try {
      if (token) await window.storage.set("stallyard-auth-token", token, false);
      else await window.storage.delete("stallyard-auth-token", false);
    } catch {
      // token save failed silently; user stays logged in for this visit only
    }
  };

  // fetch wrapper that attaches the signed-in user's token — use this for any
  // request that requires being logged in (creating/editing listings, admin
  // actions, follows). Plain fetch is still fine for public GET endpoints.
  const authFetch = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

  const register = async () => {
    setAuthError("");
    const username = authForm.username.trim().toLowerCase();
    if (!username || !authForm.password) {
      setAuthError("Enter a username and password");
      return;
    }
    if (authForm.password.length < 8) {
      setAuthError("Password should be at least 8 characters");
      return;
    }
    if (!authForm.email.trim() || !isValidEmail(authForm.email)) {
      setAuthError("Enter a valid email address");
      return;
    }
    const signupDraft = {
      username,
      email: authForm.email.trim(),
      password: authForm.password,
    };
    let sendRes;
    try {
      sendRes = await fetch(`${BACKEND_URL}/email-verify/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupDraft.email }),
      });
    } catch {
      setAuthError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const sendData = await sendRes.json();
    if (!sendRes.ok) {
      setAuthError(sendData.error || "Couldn't send a verification code to that email.");
      return;
    }
    setPendingEmailVerification({ signupDraft });
    setEmailVerifyError("");
    setEmailCodeInput("");
  };

  const resendEmailCode = async () => {
    if (!pendingEmailVerification) return;
    let res;
    try {
      res = await fetch(`${BACKEND_URL}/email-verify/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmailVerification.signupDraft.email }),
      });
    } catch {
      setEmailVerifyError("Couldn't reach the server — try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setEmailVerifyError(data.error || "Couldn't resend the code — try again.");
      return;
    }
    setEmailVerifyError("");
    showToast("New code sent");
  };

  const confirmEmailCode = async () => {
    if (!pendingEmailVerification) return;
    const draft = pendingEmailVerification.signupDraft;
    let checkRes;
    try {
      checkRes = await fetch(`${BACKEND_URL}/email-verify/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: draft.email, code: emailCodeInput.trim() }),
      });
    } catch {
      setEmailVerifyError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const checkData = await checkRes.json();
    if (!checkRes.ok) {
      setEmailVerifyError(checkData.error || "Couldn't check that code — try again.");
      return;
    }
    if (!checkData.valid) {
      setEmailVerifyError("That code doesn't match — check and try again.");
      return;
    }
    let res;
    try {
      res = await fetch(`${BACKEND_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: draft.username,
          email: draft.email,
          password: draft.password,
          emailVerified: true,
        }),
      });
    } catch {
      setEmailVerifyError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setEmailVerifyError(data.error || "Something went wrong creating your account.");
      return;
    }
    const newMember = backendUserToMember(data.user);
    await persistMembers([...members, newMember]);
    await saveAuthToken(data.token);
    await setSession(newMember.username);
    setPendingEmailVerification(null);
    setEmailCodeInput("");
    setEmailVerifyError("");
    setAuthForm({
      username: "",
      password: "",
      email: "",
      phone: "",
      displayName: "",
      firstName: "",
      lastName: "",
      officeLocation: "",
      country: "",
      licenseNumber: "",
      idType: "Passport",
      idCountry: "",
      accountType: "personal",
      licensePhotos: [],
    });
    showToast(
      newMember.isAdmin
        ? `Welcome, ${newMember.displayName} — you're the marketplace admin`
        : `You're in! Let's finish setting up your account.`
    );
    // Straight into stage two — but this can always be closed and resumed
    // later, since profile_complete stays false until it's actually done.
    setProfileStageOpen(true);
  };

  // Stage two: fill in name, phone, country, account type, and (if selling
  // outside the US) ID documents. Can be submitted partially — nothing here
  // is required to keep using the account — and re-opened any time from
  // wherever we surface the "finish your profile" prompt.
  const completeProfile = async () => {
    setProfileStageError("");
    if (!authForm.firstName.trim() || !authForm.lastName.trim()) {
      setProfileStageError("Enter your first and last name");
      return;
    }
    if (!authForm.country.trim()) {
      setProfileStageError("Enter your country of residence");
      return;
    }
    if (isUnitedStates(authForm.country)) {
      setProfileStageError("US sign-ups are coming soon — Stallyard is Nigeria-only for now");
      return;
    }
    if (authForm.phone.trim() && !isValidPhone(authForm.phone)) {
      setProfileStageError("That phone number doesn't look right — check it and try again");
      return;
    }
    const skipOfficeLocation = authForm.accountType === "personal";
    if (!skipOfficeLocation && !authForm.officeLocation.trim()) {
      setProfileStageError("Enter your office location");
      return;
    }
    const skipId = isUnitedStates(authForm.country);
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/profile/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: authForm.firstName.trim(),
          lastName: authForm.lastName.trim(),
          phone: authForm.phone.trim(),
          officeLocation: authForm.officeLocation.trim(),
          country: authForm.country.trim(),
          accountType: authForm.accountType,
          idType: skipId ? "" : authForm.idType,
          idCountry: skipId ? "" : authForm.country.trim(),
          licenseNumber: skipId ? "" : authForm.licenseNumber.trim(),
          licensePhotos: skipId ? [] : authForm.licensePhotos,
          idVerificationExempt: skipId,
        }),
      });
    } catch {
      setProfileStageError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setProfileStageError(data.error || "Something went wrong saving your profile.");
      return;
    }
    const existing = members.find((m) => m.username === currentUser);
    const updatedMember = backendUserToMember(data.user, existing);
    await persistMembers(members.map((m) => (m.username === currentUser ? updatedMember : m)));
    setProfileStageOpen(false);
    setView(authReturnView);
    showToast(
      updatedMember.profileComplete
        ? "Profile complete — you're all set!"
        : "Saved — you can finish the rest whenever you're ready."
    );
  };

    const login = async () => {
    setAuthError("");
    const username = authForm.username.trim().toLowerCase();
    let res;
    try {
      res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: authForm.password }),
      });
    } catch {
      setAuthError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || "Something went wrong logging in.");
      return;
    }
    if (data.twoFactorRequired) {
      setPendingTwoFactor({ userId: data.userId, username, method: data.method || "email" });
      setTwoFactorCodeInput("");
      return;
    }
    await completeLogin(data, username);
  };

  // Handles both steps of admin login (authenticator app, then the
  // auto-sent email code) as well as the single-step email flow for
  // non-admin accounts, based on pendingTwoFactor.method.
  const verifyTwoFactorCode = async () => {
    if (!pendingTwoFactor) return;
    setAuthError("");
    const endpoint = pendingTwoFactor.method === "totp-email" ? "/login/verify-2fa-email" : "/login/verify-2fa";
    let res;
    try {
      res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingTwoFactor.userId, code: twoFactorCodeInput.trim() }),
      });
    } catch {
      setAuthError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || "That code didn't work.");
      return;
    }
    if (data.emailStepRequired) {
      // Authenticator step passed — now the mandatory email step.
      setPendingTwoFactor((p) => ({ ...p, method: "totp-email" }));
      setTwoFactorCodeInput("");
      showToast("Authenticator code confirmed — check your email for the next code");
      return;
    }
    const username = pendingTwoFactor.username;
    setPendingTwoFactor(null);
    setTwoFactorCodeInput("");
    await completeLogin(data, username);
  };

  const completeLogin = async (data, username) => {
    const existing = members.find((m) => m.username === username);
    const member = backendUserToMember(data.user, existing);
    const nextMembers = existing
      ? members.map((m) => (m.username === username ? member : m))
      : [...members, member];
    await persistMembers(nextMembers);
    await saveAuthToken(data.token);
    await setSession(username);
    setAuthForm({
      username: "",
      password: "",
      email: "",
      phone: member.phone || "",
      displayName: "",
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      officeLocation: member.officeLocation || "",
      country: member.country || "",
      licenseNumber: member.licenseNumber || "",
      idType: member.idType || "Passport",
      idCountry: member.idCountry || "",
      accountType: member.accountType || "personal",
      licensePhotos: member.licensePhotos || [],
    });
    if (!member.profileComplete) {
      // Picks up exactly where they left off — stage two opens pre-filled
      // with whatever they already saved, instead of starting fresh.
      setProfileStageOpen(true);
      showToast(`Welcome back, ${member.displayName} — let's finish your profile`);
    } else {
      setView(authReturnView);
      showToast(`Welcome back, ${member.displayName}`);
    }
  };

  const requestPasswordReset = async () => {
    setResetError("");
    const username = resetIdentifier.trim().toLowerCase();
    if (!username) {
      setResetError("Enter your username");
      return;
    }
    let res;
    try {
      res = await fetch(`${BACKEND_URL}/password-reset/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
    } catch {
      setResetError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setResetError(data.error || "Couldn't send a reset code.");
      return;
    }
    setPendingPasswordReset({ username, maskedEmail: data.maskedEmail, verified: false, resetToken: null });
    setResetCodeInput("");
  };

  const resendResetCode = async () => {
    if (!pendingPasswordReset) return;
    let res;
    try {
      res = await fetch(`${BACKEND_URL}/password-reset/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: pendingPasswordReset.username }),
      });
    } catch {
      setResetError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setResetError(data.error || "Couldn't resend the code.");
      return;
    }
    setResetError("");
    showToast("New code sent");
  };

  const confirmResetCode = async () => {
    if (!pendingPasswordReset) return;
    let res;
    try {
      res = await fetch(`${BACKEND_URL}/password-reset/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: pendingPasswordReset.username, code: resetCodeInput.trim() }),
      });
    } catch {
      setResetError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setResetError(data.error || "That code doesn't match — check and try again.");
      return;
    }
    setPendingPasswordReset({ ...pendingPasswordReset, verified: true, resetToken: data.resetToken });
    setResetError("");
  };

  const submitNewPassword = async () => {
    if (newPasswordForm.password.length < 8) {
      setResetError("Password should be at least 8 characters");
      return;
    }
    if (newPasswordForm.password !== newPasswordForm.confirm) {
      setResetError("Passwords don't match");
      return;
    }
    let res;
    try {
      res = await fetch(`${BACKEND_URL}/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken: pendingPasswordReset.resetToken,
          newPassword: newPasswordForm.password,
        }),
      });
    } catch {
      setResetError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setResetError(data.error || "Couldn't update your password — try starting over.");
      return;
    }
    showToast("Password updated — you can log in now");
    setPendingPasswordReset(null);
    setResetIdentifier("");
    setResetCodeInput("");
    setNewPasswordForm({ password: "", confirm: "" });
    setResetError("");
    setAuthMode("login");
  };

  const logout = async () => {
    await setSession(null);
    await saveAuthToken(null);
    setActiveThreadId(null);
    setActiveThreadOrderId(null);
    setSelected(null);
    setView("browse");
    setAdminLoginMode(false);
    if (window.location.pathname === ADMIN_SECRET_PATH) window.history.pushState({}, "", "/");
    showToast("Logged out");
  };

  const currentMember = members.find((m) => m.username === currentUser) || null;
  useEffect(() => {
    if (!currentMember?.isAdmin) return;
    const isSuperAdmin = !currentMember.adminRole || currentMember.adminRole === "super_admin";
    if (adminTab === "overview" && !isSuperAdmin) {
      setAdminTab("members");
    }
  }, [currentMember?.isAdmin, currentMember?.adminRole]);

  useEffect(() => {
    if (view !== "admin") return;
    const interval = setInterval(() => {
      if (!adminUnlockedUntil || Date.now() > adminUnlockedUntil) {
        setAdminUnlockedUntil(null);
        showToast("Your admin session locked — re-enter your password to continue");
        openAdminPanel();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [view, adminUnlockedUntil]);

  // Gives the admin panel its own address rather than living as just
  // another tab — reflects the current view in the URL. Deliberately
  // one-directional: it only ever pushes TOWARD the admin path when `view`
  // becomes "admin". Leaving that URL is handled explicitly at each actual
  // exit point (logout, session timeout, the home/logo buttons) instead of
  // reactively here — a reactive "kick away" version of this effect used to
  // sit right next to the detection effect below, and because React batches
  // state updates from one effect into a *later* render rather than
  // reflecting them immediately for a sibling effect in the same commit,
  // it kept winning the race and pushing the URL back to "/" a beat before
  // the detection effect below had a chance to show the re-auth modal —
  // making an already-logged-in admin look signed out on every refresh.
  useEffect(() => {
    if (view === "admin" && window.location.pathname !== ADMIN_SECRET_PATH) {
      window.history.pushState({}, "", ADMIN_SECRET_PATH);
    }
  }, [view]);

  useEffect(() => {
    if (window.location.pathname !== ADMIN_SECRET_PATH) return;
    if (!sessionChecked) return; // wait until we actually know who's logged in
    if (!currentUser) {
      setAdminLoginMode(true);
      // already on ADMIN_SECRET_PATH, no session found — show the login form
      return;
    }
    if (!currentMember?.isAdmin) {
      window.history.replaceState({}, "", "/");
      setAdminLoginMode(false);
      return;
    }
    // Already logged in as an admin (e.g. this is a refresh, not a fresh
    // visit) — skip the raw username/password form entirely and go
    // straight to the normal re-auth gate for opening the panel.
    setAdminLoginMode(false);
    openAdminPanel();
  }, [sessionChecked, currentUser, currentMember?.isAdmin]);

  const persistCart = async (next) => {
    setCart(next);
    try {
      await window.storage.set("stallyard-cart", JSON.stringify(next), false);
    } catch {
      showToast("Couldn't update your cart — try again");
    }
    if (authToken) {
      try {
        await authFetch(`${BACKEND_URL}/cart`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: next.map((c) => ({ listingId: c.id, qty: c.qty, offerPrice: c.offerPrice })),
          }),
        });
      } catch {
        // couldn't reach backend — local copy still saved, will resync next load
      }
    }
  };

  const persistWatchlist = async (next) => {
    setWatchlist(next);
    try {
      await window.storage.set("stallyard-watchlist", JSON.stringify(next), false);
    } catch {
      showToast("Couldn't update your watchlist — try again");
    }
    if (authToken) {
      try {
        await authFetch(`${BACKEND_URL}/watchlist`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingIds: next }),
        });
      } catch {
        // couldn't reach backend — local copy still saved, will resync next load
      }
    }
  };

  const markNotificationRead = async (id) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await authFetch(`${BACKEND_URL}/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // non-critical, fail silently — local state already updated
    }
  };

  const markNotificationsRead = async () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    try {
      await authFetch(`${BACKEND_URL}/notifications/mark-all-read`, { method: "PATCH" });
    } catch {
      // non-critical, fail silently — local state already updated
    }
  };

  const toggleWatchlist = (listingId) => {
    if (!currentUser) {
      setAuthMode("login");
      setAuthError("");
      setAuthReturnView(view);
      setView("signin");
      showToast("Log in to save items");
      return;
    }
    const isSaved = watchlist.includes(listingId);
    const next = isSaved ? watchlist.filter((id) => id !== listingId) : [...watchlist, listingId];
    persistWatchlist(next);
    showToast(isSaved ? "Removed from watchlist" : "Saved to watchlist");
  };

  const addToCart = (listing) => {
    if (cart.length > 0) {
      const firstItem = listings.find((l) => l.id === cart[0].id);
      const cartCurrency = firstItem?.currency || "USD";
      const itemCurrency = listing.currency || "USD";
      if (cartCurrency !== itemCurrency) {
        showToast(
          `Your cart has ${CURRENCIES[cartCurrency]?.symbol || "$"} items — check out or clear your cart before adding ${CURRENCIES[itemCurrency]?.symbol || "$"} items`
        );
        return;
      }
    }
    const existing = cart.find((c) => c.id === listing.id);
    const next = existing
      ? cart.map((c) => (c.id === listing.id ? { ...c, qty: c.qty + 1 } : c))
      : [...cart, { id: listing.id, qty: 1 }];
    persistCart(next);
    const vacation = getSellerVacationInfo(listing.ownerUsername);
    if (vacation) {
      const backText = vacation.returnDate
        ? ` The seller is away until ${new Date(vacation.returnDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}.`
        : " The seller is currently away.";
      showToast(`Added "${listing.title}" to cart —${backText} Shipping may be delayed.`);
    } else {
      showToast(`Added "${listing.title}" to cart`);
    }
  };

  const addToCartAtPrice = (listing, price) => {
    if (cart.length > 0 && !cart.find((c) => c.id === listing.id)) {
      const firstItem = listings.find((l) => l.id === cart[0].id);
      const cartCurrency = firstItem?.currency || "USD";
      const itemCurrency = listing.currency || "USD";
      if (cartCurrency !== itemCurrency) {
        showToast(
          `Your cart has ${CURRENCIES[cartCurrency]?.symbol || "$"} items — check out or clear your cart before adding ${CURRENCIES[itemCurrency]?.symbol || "$"} items`
        );
        return;
      }
    }
    const existing = cart.find((c) => c.id === listing.id);
    const next = existing
      ? cart.map((c) => (c.id === listing.id ? { ...c, offerPrice: price } : c))
      : [...cart, { id: listing.id, qty: 1, offerPrice: price }];
    persistCart(next);
    showToast(`Added "${listing.title}" to cart at your offer price`);
  };

  const patchListingOnBackend = async (id, body) => {
    if (typeof id !== "number") return true; // legacy local-only listing, nothing to sync
    try {
      const res = await authFetch(`${BACKEND_URL}/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        showToast("Couldn't save that change — try again");
        return false;
      }
      return true;
    } catch {
      showToast("Couldn't reach the server — try again");
      return false;
    }
  };

  const placeBid = async (listing, amount) => {
    if (!currentUser) {
      setAuthMode("login");
      setAuthError("");
      setAuthReturnView(view);
      setView("signin");
      showToast("Log in to place a bid");
      return;
    }
    if (listing.ownerUsername === currentUser) {
      showToast("You can't bid on your own listing");
      return;
    }
    const amt = Math.round(Number(amount) * 100) / 100;
    const minNext = Math.round((Number(listing.price) + 1) * 100) / 100;
    if (!amt || amt < minNext) {
      showToast(`Bid must be at least $${minNext.toFixed(2)}`);
      return;
    }
    if (listing.auctionEndTime && listing.auctionEndTime <= Date.now()) {
      showToast("This auction has already ended");
      return;
    }
    const bid = { bidderUsername: currentUser, bidderName: currentMember.displayName, amount: amt, at: Date.now() };
    const nextBidHistory = [...(listing.bidHistory || []), bid];
    const ok = await patchListingOnBackend(listing.id, {
      price: amt,
      highestBidderUsername: currentUser,
      bidHistory: nextBidHistory,
    });
    if (!ok) return;
    await persistListings(
      listings.map((l) =>
        l.id === listing.id
          ? { ...l, price: amt, highestBidderUsername: currentUser, bidHistory: nextBidHistory }
          : l
      )
    );
    setBidAmount("");
    showToast(`Bid placed — $${amt.toFixed(2)}`);
  };

  const updateCartQty = (id, qty) => {
    if (qty <= 0) {
      persistCart(cart.filter((c) => c.id !== id));
      return;
    }
    persistCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
  };

  const removeFromCart = (id) => persistCart(cart.filter((c) => c.id !== id));

  const cartItems = cart
    .map((c) => {
      const listing = listings.find((l) => l.id === c.id);
      return listing
        ? { ...listing, qty: c.qty, price: c.offerPrice ?? listing.price, isOfferPrice: c.offerPrice != null }
        : null;
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartShipping = cartItems.reduce((s, i) => s + (Number(i.shippingFee) || 0), 0);
  const cartTotal = cartSubtotal + cartShipping;
  const cartCurrency = cartItems[0]?.currency || "USD";

  const persistOrders = async (next) => {
    setOrders(next);
    try {
      await window.storage.set("stallyard-orders", JSON.stringify(next), true);
    } catch {
      showToast("Couldn't save your order — try again");
    }
  };

  const persistSettings = async (next) => {
    const body = {};
    if (next.commissionRate !== settings.commissionRate) body.commissionRate = next.commissionRate;
    if (next.authImage !== settings.authImage) body.authImage = next.authImage;
    if (Object.keys(body).length === 0) {
      setSettings(next);
      return;
    }
    try {
      const res = await authFetch(`${BACKEND_URL}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't save settings — try again");
        return;
      }
      setSettings({ commissionRate: data.commissionRate, authImage: data.authImage || "" });
      showToast("Settings saved");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const persistWithdrawals = async (next) => {
    setWithdrawals(next);
    try {
      await window.storage.set("stallyard-withdrawals", JSON.stringify(next), true);
    } catch {
      showToast("Couldn't save — try again");
    }
  };

  const persistThreads = async (next) => {
    setThreads(next);
    try {
      await window.storage.set("stallyard-messages", JSON.stringify(next), true);
    } catch {
      showToast("Couldn't send — try again");
    }
  };

  const markThreadRead = async (threadId) => {
    const next = { ...messageReadState, [threadId]: Date.now() };
    setMessageReadState(next);
    try {
      await window.storage.set("stallyard-message-reads", JSON.stringify(next), false);
    } catch {
      // non-critical, fail silently
    }
  };

  const persistReviews = async (next) => {
    setReviews(next);
    try {
      await window.storage.set("stallyard-reviews", JSON.stringify(next), true);
    } catch {
      showToast("Couldn't save your review — try again");
    }
  };

  const submitReview = async (orderId, itemId, listingId, sellerUsername, rating, comment) => {
    if (!rating) {
      showToast("Pick a star rating");
      return;
    }
    const existing = reviews.find((r) => r.orderId === orderId && r.listingId === listingId);
    if (existing) {
      let res;
      try {
        res = await authFetch(`${BACKEND_URL}/reviews/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment: comment.trim() }),
        });
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
      if (!res.ok) {
        showToast("Couldn't update your review — try again");
        return;
      }
      const { review: row } = await res.json();
      await persistReviews(
        reviews.map((r) => (r.id === existing.id ? backendReviewToFrontend(row, members) : r))
      );
      showToast("Review updated");
    } else {
      const seller = members.find((m) => m.username === sellerUsername);
      if (!seller?.backendId) {
        showToast("Couldn't post that review — try again");
        return;
      }
      let res;
      try {
        res = await authFetch(`${BACKEND_URL}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            listingId,
            sellerId: seller.backendId,
            rating,
            comment: comment.trim(),
          }),
        });
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't post that review");
        return;
      }
      const review = backendReviewToFrontend(data.review, members);
      await persistReviews([review, ...reviews]);
      showToast("Review posted");
    }
  };

  const startOrOpenThread = async (listing, orderId = null) => {
    if (!currentUser) {
      setCartOpen(false);
      setSelected(null);
      setAuthMode("login");
      setAuthError("");
      setAuthReturnView(view);
      setView("signin");
      showToast("Log in to message a seller");
      return;
    }
    if (listing.ownerUsername === currentUser) {
      showToast("That's your own listing");
      return;
    }
    const existing = threads.find(
      (t) => t.listingId === listing.id && t.buyerUsername === currentUser && t.sellerUsername === listing.ownerUsername
    );
    let threadId = existing?.id;
    if (!existing) {
      const seller = members.find((m) => m.username === listing.ownerUsername);
      if (!currentMember?.backendId || !seller?.backendId) {
        showToast("Couldn't start that conversation — try again");
        return;
      }
      let res;
      try {
        res = await authFetch(`${BACKEND_URL}/threads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: listing.id,
            buyerId: currentMember.backendId,
            sellerId: seller.backendId,
          }),
        });
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
      if (!res.ok) {
        showToast("Couldn't start that conversation — try again");
        return;
      }
      const { thread } = await res.json();
      const newThread = backendThreadToFrontend(thread, [], members, listings);
      await persistThreads([newThread, ...threads]);
      threadId = newThread.id;
    }
    setSelected(null);
    setActiveThreadId(threadId);
    setActiveThreadOrderId(orderId);
    markThreadRead(threadId);
    setView("messages");
  };

  const sendMessage = async (threadId, text, imageUrl = null) => {
    const trimmed = text.trim();
    if (!trimmed && !imageUrl) return;
    if (trimmed && containsContactInfo(trimmed)) {
      setMessageError("Messages can't include email addresses or phone numbers — keep contact on Stallyard.");
      return;
    }
    setMessageError("");
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          body: trimmed,
          messageType: "text",
          imageUrl: imageUrl || undefined,
          orderId: activeThreadOrderId || undefined,
        }),
      });
    } catch {
      setMessageError("Couldn't reach the server — try again.");
      return;
    }
    if (!res.ok) {
      setMessageError("Couldn't send that — try again.");
      return;
    }
    const { message: row } = await res.json();
    const message = backendMessageToFrontend(row, members);
    await persistThreads(
      threads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, message], updatedAt: Date.now() } : t
      )
    );
    setMessageInput("");
  };

  const handleMessagePhotoSelect = async (e, threadId) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("That photo is too large — please upload something under 5MB");
      return;
    }
    setUploadingMessagePhoto(true);
    try {
      const dataUrl = await resizeImageFile(file, 1200, 0.8);
      await sendMessage(threadId, "", dataUrl);
    } catch {
      showToast("Couldn't send that photo — try again");
    } finally {
      setUploadingMessagePhoto(false);
    }
  };

  const reportMessage = async (messageId, reason) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/messages/${messageId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "" }),
      });
      if (!res.ok) {
        showToast("Couldn't submit that report — try again");
        return;
      }
      showToast("Reported — an admin will take a look");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const adminResolveMessageReport = async (reportId) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/message-reports/${reportId}/resolve`, { method: "PATCH" });
      if (!res.ok) {
        showToast("Couldn't resolve that report — try again");
        return;
      }
      setMessageReports((reports) =>
        reports.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
      );
      showToast("Report resolved");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const respondToReview = async (reviewId, response) => {
    if (!response.trim()) {
      showToast("Write a response first");
      return;
    }
    try {
      const res = await authFetch(`${BACKEND_URL}/reviews/${reviewId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: response.trim() }),
      });
      if (!res.ok) {
        showToast("Couldn't save your response — try again");
        return;
      }
      setReviews((rs) =>
        rs.map((r) =>
          r.id === reviewId ? { ...r, sellerResponse: response.trim(), sellerResponseAt: Date.now() } : r
        )
      );
      setReviewResponseDrafts((d) => {
        const next = { ...d };
        delete next[reviewId];
        return next;
      });
      showToast("Response posted");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const reportReview = async (reviewId, reason) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/reviews/${reviewId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "" }),
      });
      if (!res.ok) {
        showToast("Couldn't submit that report — try again");
        return;
      }
      showToast("Reported — an admin will take a look");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const adminResolveReviewReport = async (reportId) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/review-reports/${reportId}/resolve`, { method: "PATCH" });
      if (!res.ok) {
        showToast("Couldn't resolve that report — try again");
        return;
      }
      setReviewReports((reports) =>
        reports.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
      );
      showToast("Report resolved");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const adminResolveAccountReport = async (reportId) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/account-reports/${reportId}/resolve`, { method: "PATCH" });
      if (!res.ok) {
        showToast("Couldn't resolve that report — try again");
        return;
      }
      setAccountReports((reports) =>
        reports.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
      );
      showToast("Report resolved");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const openAdminPanel = () => {
    if (adminUnlockedUntil && Date.now() < adminUnlockedUntil) {
      setView("admin");
      return;
    }
    setAdminReauthStep("password");
    setAdminReauthPassword("");
    setAdminReauthCode("");
    setAdminReauthError("");
  };

  const submitAdminReauthPassword = async () => {
    if (!adminReauthPassword) {
      setAdminReauthError("Enter your password");
      return;
    }
    setAdminReauthSubmitting(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/admin/reauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminReauthPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminReauthError(data.error || "Couldn't verify your password");
        return;
      }
      if (data.success) {
        // No 2FA on file (shouldn't normally happen) — unlock directly.
        setAdminUnlockedUntil(Date.now() + ADMIN_SESSION_IDLE_MS);
        setAdminReauthStep(null);
        setView("admin");
        return;
      }
      setAdminReauthStep("code");
      setAdminReauthError("");
    } catch {
      setAdminReauthError("Couldn't reach the server — try again");
    } finally {
      setAdminReauthSubmitting(false);
    }
  };

  // Handles both steps of the reauth gate: authenticator app first
  // (adminReauthStep === "code"), then the auto-sent email code
  // (adminReauthStep === "code-email"). Both are mandatory.
  const submitAdminReauthCode = async () => {
    if (!adminReauthCode.trim()) {
      setAdminReauthError(
        adminReauthStep === "code-email" ? "Enter the code we emailed you" : "Enter the code from your authenticator app"
      );
      return;
    }
    setAdminReauthSubmitting(true);
    const endpoint = adminReauthStep === "code-email" ? "/admin/reauth/verify-email" : "/admin/reauth/verify";
    try {
      const res = await authFetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminReauthCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminReauthError(data.error || "That code didn't work");
        return;
      }
      if (data.emailStepRequired) {
        setAdminReauthStep("code-email");
        setAdminReauthCode("");
        showToast("Authenticator code confirmed — check your email for the next code");
        return;
      }
      setAdminUnlockedUntil(Date.now() + ADMIN_SESSION_IDLE_MS);
      setAdminReauthStep(null);
      setView("admin");
    } catch {
      setAdminReauthError("Couldn't reach the server — try again");
    } finally {
      setAdminReauthSubmitting(false);
    }
  };

  // Shared by both steps of the dedicated admin login: if the account
  // isn't actually an admin, the error is identical to a wrong password —
  // never confirms that valid, non-admin credentials were entered. A
  // successful admin login here also satisfies the re-auth gate, since
  // proving password + 2FA to log in already covers what re-auth checks.
  const finishAdminLogin = async (data, username) => {
    if (!data.user?.is_admin) {
      setAdminLoginError("Username or password doesn't match");
      return;
    }
    await completeLogin(data, username);
    setAdminUnlockedUntil(Date.now() + ADMIN_SESSION_IDLE_MS);
    setAdminLoginMode(false);
    setAdminLoginForm({ username: "", password: "" });
    setAdminLoginStep("credentials");
    setAdminLoginCode("");
    window.history.replaceState({}, "", ADMIN_SECRET_PATH);
    setView("admin");
  };

  const submitAdminLoginCredentials = async () => {
    const username = adminLoginForm.username.trim().toLowerCase();
    if (!username || !adminLoginForm.password) {
      setAdminLoginError("Enter your username and password");
      return;
    }
    setAdminLoginSubmitting(true);
    setAdminLoginError("");
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: adminLoginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminLoginError("Username or password doesn't match");
        return;
      }
      if (data.twoFactorRequired) {
        setAdminLoginPendingUserId(data.userId);
        setAdminLoginStep("code");
        return;
      }
      await finishAdminLogin(data, username);
    } catch {
      setAdminLoginError("Couldn't reach the server — try again");
    } finally {
      setAdminLoginSubmitting(false);
    }
  };

  // Handles both steps of the dedicated admin login's 2FA: authenticator
  // app first (adminLoginStep === "code"), then the auto-sent email code
  // (adminLoginStep === "code-email"). Both are mandatory.
  const submitAdminLoginTwoFactor = async () => {
    if (!adminLoginCode.trim()) {
      setAdminLoginError(
        adminLoginStep === "code-email" ? "Enter the code we emailed you" : "Enter the code from your authenticator app"
      );
      return;
    }
    setAdminLoginSubmitting(true);
    setAdminLoginError("");
    const endpoint = adminLoginStep === "code-email" ? "/login/verify-2fa-email" : "/login/verify-2fa";
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: adminLoginPendingUserId, code: adminLoginCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminLoginError(data.error || "That code didn't work");
        return;
      }
      if (data.emailStepRequired) {
        setAdminLoginStep("code-email");
        setAdminLoginCode("");
        showToast("Authenticator code confirmed — check your email for the next code");
        return;
      }
      await finishAdminLogin(data, adminLoginForm.username.trim().toLowerCase());
    } catch {
      setAdminLoginError("Couldn't reach the server — try again");
    } finally {
      setAdminLoginSubmitting(false);
    }
  };

  const fetchAuditLog = async () => {
    setLoadingAuditLog(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/admin-audit-log`);
      if (res.ok) {
        const { log } = await res.json();
        setAuditLog(log);
      }
    } catch {
      showToast("Couldn't load the audit log — try again");
    } finally {
      setLoadingAuditLog(false);
    }
  };

  const openAdminWarnings = async (member) => {
    setAdminWarningsTarget(member);
    setNewWarningMessage("");
    try {
      const res = await authFetch(`${BACKEND_URL}/users/${member.backendId}/warnings`);
      if (res.ok) {
        const { warnings } = await res.json();
        setAdminWarningsList(warnings);
      }
    } catch {
      showToast("Couldn't load warnings — try again");
    }
  };

  const issueWarning = async () => {
    if (!newWarningMessage.trim() || !adminWarningsTarget) {
      showToast("Write a message for the warning");
      return;
    }
    setIssuingWarning(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/users/${adminWarningsTarget.backendId}/warnings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newWarningMessage.trim() }),
      });
      if (!res.ok) {
        showToast("Couldn't issue that warning — try again");
        return;
      }
      const { warning } = await res.json();
      setAdminWarningsList((list) => [warning, ...list]);
      setNewWarningMessage("");
      showToast("Warning issued");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setIssuingWarning(false);
    }
  };

  // Public trust signal — fetched on demand when a storefront opens, cached
  // per username so revisiting the same seller doesn't re-fetch.
  const fetchLoginHistory = async () => {
    if (loginHistory !== null) return;
    setLoadingLoginHistory(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/login-history/mine`);
      if (res.ok) {
        const { history } = await res.json();
        setLoginHistory(history);
      }
    } catch {
      // couldn't reach backend — leave as null, "Show" button just won't populate
    } finally {
      setLoadingLoginHistory(false);
    }
  };

  const fetchSellerSalesCount = async (username) => {
    if (sellerSalesCounts[username] !== undefined) return;
    try {
      const res = await fetch(`${BACKEND_URL}/sellers/${username}/completed-sales-count`);
      if (!res.ok) return;
      const { count } = await res.json();
      setSellerSalesCounts((c) => ({ ...c, [username]: count }));
    } catch {
      // couldn't reach backend — leave uncached, storefront just won't show a count
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("That photo is too large — please upload something under 5MB");
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUrl = await resizeImageFile(file, 500, 0.85);
      const res = await authFetch(`${BACKEND_URL}/profile/store`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });
      if (!res.ok) {
        showToast("Couldn't save that photo — try again");
        return;
      }
      await persistMembers(
        members.map((m) => (m.username === currentUser ? { ...m, avatarUrl: dataUrl } : m))
      );
      showToast("Profile photo updated");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveStoreProfile = async () => {
    try {
      const res = await authFetch(`${BACKEND_URL}/profile/store`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeBio: storeProfileDraft.storeBio,
          storePolicies: storeProfileDraft.storePolicies,
        }),
      });
      if (!res.ok) {
        showToast("Couldn't save your store profile — try again");
        return;
      }
      await persistMembers(
        members.map((m) =>
          m.username === currentUser
            ? { ...m, storeBio: storeProfileDraft.storeBio, storePolicies: storeProfileDraft.storePolicies }
            : m
        )
      );
      setEditingStoreProfile(false);
      showToast("Store profile updated");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const sendOffer = async (threadId, amount) => {
    const amt = Math.round(Number(amount) * 100) / 100;
    if (!amt || amt <= 0) {
      showToast("Enter an offer amount");
      return;
    }
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, messageType: "offer", offerAmount: amt }),
      });
    } catch {
      showToast("Couldn't reach the server — try again");
      return;
    }
    if (!res.ok) {
      showToast("Couldn't send that offer — try again");
      return;
    }
    const { message: row } = await res.json();
    const message = backendMessageToFrontend(row, members);
    await persistThreads(
      threads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, message], updatedAt: Date.now() } : t
      )
    );
    showToast(`Offer of $${amt.toFixed(2)} sent`);
  };

  const respondToOffer = async (threadId, messageId, status) => {
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/messages/${messageId}/offer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      showToast("Couldn't reach the server — try again");
      return;
    }
    if (!res.ok) {
      showToast("Couldn't respond to that offer — try again");
      return;
    }
    await persistThreads(
      threads.map((t) =>
        t.id !== threadId
          ? t
          : {
              ...t,
              messages: t.messages.map((m) => (m.id === messageId ? { ...m, status } : m)),
              updatedAt: Date.now(),
            }
      )
    );
    showToast(status === "accepted" ? "Offer accepted" : "Offer declined");
  };

  const addBanner = async (data) => {
    if (!data.message.trim()) return;
    try {
      const res = await authFetch(`${BACKEND_URL}/content/banners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: data.message.trim(),
          tone: data.tone || "info",
          mediaType: data.mediaType || "none",
          imageUrl: data.mediaType === "image" ? data.imageUrl : "",
          videoUrl: data.mediaType === "video" ? data.videoUrl.trim() : "",
        }),
      });
      if (!res.ok) {
        showToast("Couldn't add that banner — try again");
        return;
      }
      const { banner: b } = await res.json();
      setContent((c) => ({
        ...c,
        banners: [
          { id: b.id, message: b.message, tone: b.tone, isActive: b.is_active, mediaType: b.media_type, imageUrl: b.image_url || "", videoUrl: b.video_url || "" },
          ...c.banners,
        ],
      }));
      showToast("Banner added");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const updateBanner = async (id, patch) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/content/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        showToast("Couldn't update that banner — try again");
        return;
      }
      setContent((c) => ({
        ...c,
        banners: c.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }));
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const removeBanner = async (id) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/content/banners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Couldn't remove that banner — try again");
        return;
      }
      setContent((c) => ({ ...c, banners: c.banners.filter((b) => b.id !== id) }));
      showToast("Banner removed");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const addArticle = async (data) => {
    if (!data.title.trim() || !data.body.trim()) return;
    try {
      const res = await authFetch(`${BACKEND_URL}/content/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title.trim(), body: data.body.trim() }),
      });
      if (!res.ok) {
        showToast("Couldn't publish that article — try again");
        return;
      }
      const { article: a } = await res.json();
      setContent((c) => ({
        ...c,
        articles: [{ id: a.id, title: a.title, body: a.body, updatedAt: Date.now() }, ...c.articles],
      }));
      showToast("Article published");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const updateArticle = async (id, patch) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/content/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        showToast("Couldn't update that article — try again");
        return;
      }
      setContent((c) => ({
        ...c,
        articles: c.articles.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a)),
      }));
      showToast("Article updated");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const removeArticle = async (id) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/content/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Couldn't remove that article — try again");
        return;
      }
      setContent((c) => ({ ...c, articles: c.articles.filter((a) => a.id !== id) }));
      showToast("Article removed");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const addFaq = async (data) => {
    if (!data.question.trim() || !data.answer.trim()) return;
    try {
      const res = await authFetch(`${BACKEND_URL}/content/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: data.question.trim(), answer: data.answer.trim() }),
      });
      if (!res.ok) {
        showToast("Couldn't add that FAQ — try again");
        return;
      }
      const { faq } = await res.json();
      setContent((c) => ({ ...c, faqs: [...c.faqs, faq] }));
      showToast("FAQ added");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const updateFaq = async (id, patch) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/content/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        showToast("Couldn't update that FAQ — try again");
        return;
      }
      setContent((c) => ({
        ...c,
        faqs: c.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      }));
      showToast("FAQ updated");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const removeFaq = async (id) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/content/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Couldn't remove that FAQ — try again");
        return;
      }
      setContent((c) => ({ ...c, faqs: c.faqs.filter((f) => f.id !== id) }));
      showToast("FAQ removed");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const savePolicy = async (category, body) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/policies/${category}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        showToast("Couldn't save that policy — try again");
        return;
      }
      setPolicies((p) => ({ ...p, [category]: body }));
      showToast("Policy updated");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const fetchMyTickets = async () => {
    try {
      const res = await authFetch(`${BACKEND_URL}/support-tickets/mine`);
      if (res.ok) {
        const { tickets } = await res.json();
        setMyTickets(tickets);
      }
    } catch {
      // couldn't reach backend — leave whatever was already loaded
    }
  };

  const createSupportTicket = async () => {
    if (!newTicketForm.subject.trim() || !newTicketForm.message.trim()) {
      showToast("Give it a subject and a message");
      return;
    }
    setCreatingTicket(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/support-tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newTicketForm.subject.trim(), message: newTicketForm.message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't open that ticket — try again");
        return;
      }
      setMyTickets((t) => [data.ticket, ...t]);
      setNewTicketForm({ subject: "", message: "" });
      setShowNewTicketForm(false);
      showToast("Ticket opened — we'll get back to you here");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setCreatingTicket(false);
    }
  };

  const openTicketThread = async (ticketId) => {
    setActiveTicketId(ticketId);
    setLoadingTicketMessages(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/support-tickets/${ticketId}/messages`);
      if (res.ok) {
        const { messages } = await res.json();
        setTicketMessages(messages);
      }
    } catch {
      showToast("Couldn't load that conversation — try again");
    } finally {
      setLoadingTicketMessages(false);
    }
  };

  const sendTicketMessage = async () => {
    if (!newTicketMessageInput.trim() || !activeTicketId) return;
    setSendingTicketMessage(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/support-tickets/${activeTicketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newTicketMessageInput.trim() }),
      });
      if (!res.ok) {
        showToast("Couldn't send that — try again");
        return;
      }
      const { message } = await res.json();
      setTicketMessages((m) => [...m, message]);
      setNewTicketMessageInput("");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setSendingTicketMessage(false);
    }
  };

  const fetchAdminTickets = async () => {
    try {
      const res = await authFetch(`${BACKEND_URL}/support-tickets`);
      if (res.ok) {
        const { tickets } = await res.json();
        setAdminTickets(tickets);
      }
    } catch {
      // couldn't reach backend — leave whatever was already loaded
    }
  };

  const adminUpdateTicketStatus = async (ticketId, status) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/support-tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        showToast("Couldn't update that ticket — try again");
        return;
      }
      setAdminTickets((tickets) => tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)));
      showToast("Ticket status updated");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const fileDispute = async (orderId) => {
    await persistOrders(orders.map((o) => (o.id === orderId ? { ...o, isDisputed: true } : o)));
    showToast("Issue reported — the marketplace admin will review it");
  };

  const patchOrderOnBackend = async (orderId, action, body) => {
    if (typeof orderId !== "number") return true; // legacy local-only order, nothing to sync
    try {
      const res = await authFetch(`${BACKEND_URL}/orders/${orderId}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        showToast("Couldn't save that change — try again");
        return false;
      }
      return true;
    } catch {
      showToast("Couldn't reach the server — try again");
      return false;
    }
  };

  const patchOrderItemOnBackend = async (itemId, body) => {
    if (typeof itemId !== "number") return true;
    try {
      const res = await authFetch(`${BACKEND_URL}/order-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        showToast("Couldn't save that change — try again");
        return false;
      }
      return true;
    } catch {
      showToast("Couldn't reach the server — try again");
      return false;
    }
  };

  const resolveDispute = async (orderId) => {
    const ok = await patchOrderOnBackend(orderId, "dispute", { isDisputed: false });
    if (!ok) return;
    await persistOrders(orders.map((o) => (o.id === orderId ? { ...o, isDisputed: false } : o)));
    showToast("Dispute resolved");
  };

  const releasePayout = async (orderId) => {
    const ok = await patchOrderOnBackend(orderId, "release");
    if (!ok) return;
    await persistOrders(
      orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: "released" } : o))
    );
    showToast("Payout marked as released");
  };

  const refundOrder = async (orderId) => {
    const ok = await patchOrderOnBackend(orderId, "refund");
    if (!ok) return;
    await persistOrders(
      orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: "refunded" } : o))
    );
    showToast("Order marked as refunded");
  };

  const updateItemFulfillment = async (orderId, itemId, status) => {
    const ok = await patchOrderItemOnBackend(itemId, { fulfillmentStatus: status });
    if (!ok) return;
    await persistOrders(
      orders.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      fulfillmentStatus: status,
                      statusHistory: [...(i.statusHistory || []), { status, at: Date.now() }],
                    }
                  : i
              ),
            }
      )
    );
    showToast(`Marked as ${FULFILLMENT_LABEL[status] || status}`);
  };

  const updateItemTracking = async (orderId, itemId, trackingNumber) => {
    const ok = await patchOrderItemOnBackend(itemId, { trackingNumber });
    if (!ok) return;
    await persistOrders(
      orders.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map((i) => (i.id === itemId ? { ...i, trackingNumber } : i)),
            }
      )
    );
    showToast("Tracking number saved");
  };

  const updateItemCarrier = async (orderId, itemId, carrier) => {
    const ok = await patchOrderItemOnBackend(itemId, { carrier });
    if (!ok) return;
    await persistOrders(
      orders.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map((i) => (i.id === itemId ? { ...i, carrier } : i)),
            }
      )
    );
  };

  const updateItemProofOfDelivery = async (orderId, itemId, proofOfDeliveryUrl) => {
    const ok = await patchOrderItemOnBackend(itemId, { proofOfDeliveryUrl });
    if (!ok) return;
    await persistOrders(
      orders.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map((i) => (i.id === itemId ? { ...i, proofOfDeliveryUrl } : i)),
            }
      )
    );
    showToast("Proof of delivery saved");
  };

  // Buyer-side action: confirms they received the item. If it's the last
  // item in the order still awaiting confirmation, the backend auto-releases
  // the order's held payment — mirrored here so the UI updates immediately.
  const confirmReceipt = async (orderId, itemId) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/order-items/${itemId}/confirm-receipt`, { method: "PATCH" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Couldn't confirm receipt — try again");
        return;
      }
      const { order: releasedOrder } = await res.json();
      await persistOrders(
        orders.map((o) =>
          o.id !== orderId
            ? o
            : {
                ...o,
                paymentStatus: releasedOrder ? "released" : o.paymentStatus,
                items: o.items.map((i) => (i.id === itemId ? { ...i, buyerConfirmedAt: Date.now() } : i)),
              }
        )
      );
      showToast("Thanks for confirming — glad it arrived!");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  // Buyer-side action: generates a 10-digit code to hand to the seller in
  // person as proof of delivery, instead of tapping "Confirm receipt"
  // themselves. Useful for cash-on-delivery or in-person handoffs.
  const generateDeliveryToken = async (itemId) => {
    setGeneratingTokenKey(itemId);
    try {
      const res = await authFetch(`${BACKEND_URL}/order-items/${itemId}/generate-delivery-token`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't generate a code — try again");
        return;
      }
      setDeliveryTokens((d) => ({ ...d, [itemId]: data.token }));
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setGeneratingTokenKey(null);
    }
  };

  // Seller-side action: enters the code the buyer handed them in person.
  // A match confirms receipt exactly like the buyer clicking the button
  // themselves — same auto-release-payment behavior.
  const redeemDeliveryToken = async (orderId, itemId, token) => {
    setRedeemingTokenKey(itemId);
    try {
      const res = await authFetch(`${BACKEND_URL}/order-items/${itemId}/redeem-delivery-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "That code didn't work — try again");
        return;
      }
      await persistOrders(
        orders.map((o) =>
          o.id !== orderId
            ? o
            : {
                ...o,
                paymentStatus: data.order ? "released" : o.paymentStatus,
                items: o.items.map((i) => (i.id === itemId ? { ...i, buyerConfirmedAt: Date.now() } : i)),
              }
        )
      );
      setRedeemTokenDrafts((d) => {
        const next = { ...d };
        delete next[itemId];
        return next;
      });
      showToast(data.order ? "Delivery confirmed — payment released!" : "Delivery confirmed");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setRedeemingTokenKey(null);
    }
  };

  const updateReturnTracking = async (orderId, itemId, trackingNumber) => {
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/order-items/${itemId}/return-tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber }),
      });
    } catch {
      showToast("Couldn't reach the server — try again");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Couldn't save that tracking number — try again");
      return;
    }
    await persistOrders(
      orders.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map((i) => (i.id === itemId ? { ...i, returnTrackingNumber: trackingNumber } : i)),
            }
      )
    );
    showToast("Return tracking number saved");
  };

  const requestReturn = async (orderId, itemId, reason, note, evidenceUrls = []) => {
    if (!reason) {
      showToast("Pick a reason for the return");
      return;
    }
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/order-items/${itemId}/request-return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note: note.trim(), evidenceUrls }),
      });
    } catch {
      showToast("Couldn't reach the server — try again");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Couldn't submit that return — try again");
      return;
    }
    await persistOrders(
      orders.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      returnStatus: "requested",
                      returnReason: reason,
                      returnNote: note.trim(),
                      returnRequestedAt: Date.now(),
                      returnEvidenceUrls: evidenceUrls,
                    }
                  : i
              ),
            }
      )
    );
    showToast("Return requested");
  };

  const approveReturn = async (orderId, itemId) => {
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/order-items/${itemId}/return-response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "approved" }),
      });
    } catch {
      showToast("Couldn't reach the server — try again");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Couldn't approve that return — try again");
      return;
    }
    await persistOrders(
      orders.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      returnStatus: "approved",
                      fulfillmentStatus: "returned",
                      statusHistory: [...(i.statusHistory || []), { status: "returned", at: Date.now() }],
                    }
                  : i
              ),
            }
      )
    );
    showToast("Return approved");
  };

  const denyReturn = async (orderId, itemId) => {
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/order-items/${itemId}/return-response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "denied" }),
      });
    } catch {
      showToast("Couldn't reach the server — try again");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Couldn't deny that return — try again");
      return;
    }
    await persistOrders(
      orders.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              items: o.items.map((i) => (i.id === itemId ? { ...i, returnStatus: "denied" } : i)),
            }
      )
    );
    showToast("Return request denied");
  };

  const loadBankList = async () => {
    if (bankList.length > 0) return;
    try {
      const res = await authFetch(`${BACKEND_URL}/paystack/banks`);
      if (res.ok) {
        const { banks } = await res.json();
        setBankList(banks);
      }
    } catch {
      // bank list couldn't load — the field will just be empty
    }
  };

  const toggleTwoFactor = async (enabled) => {
    setSavingTwoFactorToggle(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/profile/two-factor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't update that — try again");
        return;
      }
      await persistMembers(
        members.map((m) => (m.username === currentUser ? { ...m, twoFactorEnabled: data.twoFactorEnabled } : m))
      );
      showToast(data.twoFactorEnabled ? "Two-factor authentication turned on" : "Two-factor authentication turned off");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setSavingTwoFactorToggle(false);
    }
  };

  // Step 1: request the code. Doesn't touch twoFactorEnabled — the account
  // only actually becomes 2FA-on once verifyEnableTwoFactorCode succeeds.
  const sendEnableTwoFactorCode = async () => {
    setSendingEnable2FACode(true);
    setEnable2FAError("");
    try {
      const res = await authFetch(`${BACKEND_URL}/profile/two-factor/enable/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setEnable2FAError(data.error || "Couldn't send a code — try again");
        return;
      }
      setEnable2FAStep("code");
      setEnable2FACodeInput("");
      showToast("Code sent — check your email");
    } catch {
      setEnable2FAError("Couldn't reach the server — try again");
    } finally {
      setSendingEnable2FACode(false);
    }
  };

  // Step 2: the emailed code actually flips two_factor_enabled to true.
  const verifyEnableTwoFactorCode = async () => {
    if (!enable2FACodeInput.trim()) {
      setEnable2FAError("Enter the code we emailed you");
      return;
    }
    setVerifyingEnable2FACode(true);
    setEnable2FAError("");
    try {
      const res = await authFetch(`${BACKEND_URL}/profile/two-factor/enable/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: enable2FACodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEnable2FAError(data.error || "That code didn't work");
        return;
      }
      await persistMembers(
        members.map((m) => (m.username === currentUser ? { ...m, twoFactorEnabled: data.twoFactorEnabled } : m))
      );
      setEnable2FAStep("idle");
      setEnable2FACodeInput("");
      showToast("Two-factor authentication turned on");
    } catch {
      setEnable2FAError("Couldn't reach the server — try again");
    } finally {
      setVerifyingEnable2FACode(false);
    }
  };

  // Admin-only step 1: fetch a fresh secret + QR code to scan into an
  // authenticator app. Doesn't turn 2FA on yet — that's confirmAdminTotpSetup.
  const startAdminTotpSetup = async () => {
    setStartingAdminTotpSetup(true);
    setAdminTotpError("");
    try {
      const res = await authFetch(`${BACKEND_URL}/admin/totp/setup`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setAdminTotpError(data.error || "Couldn't start setup — try again");
        return;
      }
      setAdminTotpSetup(data);
      setAdminTotpCodeInput("");
    } catch {
      setAdminTotpError("Couldn't reach the server — try again");
    } finally {
      setStartingAdminTotpSetup(false);
    }
  };

  // Admin-only step 2: the code from the authenticator app confirms setup
  // and actually flips two_factor_enabled on.
  const confirmAdminTotpSetup = async () => {
    if (!adminTotpCodeInput.trim()) {
      setAdminTotpError("Enter the code from your authenticator app");
      return;
    }
    setConfirmingAdminTotpSetup(true);
    setAdminTotpError("");
    try {
      const res = await authFetch(`${BACKEND_URL}/admin/totp/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminTotpCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminTotpError(data.error || "That code didn't work");
        return;
      }
      await persistMembers(
        members.map((m) => (m.username === currentUser ? { ...m, twoFactorEnabled: data.twoFactorEnabled } : m))
      );
      setAdminTotpSetup(null);
      setAdminTotpCodeInput("");
      showToast("Two-factor authentication turned on");
    } catch {
      setAdminTotpError("Couldn't reach the server — try again");
    } finally {
      setConfirmingAdminTotpSetup(false);
    }
  };

  const signOutOtherDevices = async () => {
    setSigningOutOtherDevices(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/profile/sign-out-other-devices`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't do that — try again");
        return;
      }
      if (data.token) await saveAuthToken(data.token);
      showToast("Signed out of all other devices");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setSigningOutOtherDevices(false);
    }
  };

  const reportSuspiciousActivity = async () => {
    if (!suspiciousActivityMessage.trim()) {
      showToast("Describe what happened first");
      return;
    }
    setSubmittingSuspiciousReport(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/account-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: suspiciousActivityMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't submit that — try again");
        return;
      }
      setSuspiciousActivityMessage("");
      showToast("Reported — an admin will take a look");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setSubmittingSuspiciousReport(false);
    }
  };

  const changePassword = async () => {
    if (!changePasswordForm.current || !changePasswordForm.next) {
      showToast("Fill in your current and new password");
      return;
    }
    if (changePasswordForm.next.length < 8) {
      showToast("New password must be at least 8 characters");
      return;
    }
    if (changePasswordForm.next !== changePasswordForm.confirm) {
      showToast("New passwords don't match");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/profile/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: changePasswordForm.current,
          newPassword: changePasswordForm.next,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't change your password — try again");
        return;
      }
      if (data.token) await saveAuthToken(data.token);
      setChangePasswordForm({ current: "", next: "", confirm: "" });
      showToast("Password changed — you've been signed out of other devices");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setChangingPassword(false);
    }
  };

  const saveBankDetails = async () => {
    if (!bankForm.bankCode || !bankForm.accountNumber.trim()) {
      showToast("Choose a bank and enter your account number");
      return;
    }
    setBankSaving(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/sellers/bank-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentMember.backendId,
          bankCode: bankForm.bankCode,
          accountNumber: bankForm.accountNumber.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't verify those bank details");
        return;
      }
      if (data.confirmationRequired) {
        setPendingBankChange(true);
        setBankChangeCodeInput("");
        showToast("Check your email for a confirmation code");
        return;
      }
      await persistMembers(
        members.map((m) => (m.username === currentUser ? { ...m, hasBankDetails: true } : m))
      );
      showToast("Bank details saved");
      setBankForm({ bankCode: "", accountNumber: "" });
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setBankSaving(false);
    }
  };

  const confirmBankChange = async () => {
    if (!bankChangeCodeInput.trim()) {
      showToast("Enter the code we emailed you");
      return;
    }
    setBankSaving(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/sellers/bank-details/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: bankChangeCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "That code didn't work");
        return;
      }
      await persistMembers(
        members.map((m) => (m.username === currentUser ? { ...m, hasBankDetails: true } : m))
      );
      setPendingBankChange(false);
      setBankChangeCodeInput("");
      setBankForm({ bankCode: "", accountNumber: "" });
      showToast("Bank account updated");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setBankSaving(false);
    }
  };

  const sendAccountEmailCode = async () => {
    if (!currentMember?.email) {
      showToast("Add an email to your account first");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/email-verify/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentMember.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't send a code — try again");
        return;
      }
      setAccountEmailCodeSent(true);
      setAccountEmailCodeInput("");
      showToast("Check your email for a code");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const confirmAccountEmailCode = async () => {
    if (!accountEmailCodeInput.trim()) {
      showToast("Enter the code we emailed you");
      return;
    }
    setVerifyingAccountEmail(true);
    try {
      const checkRes = await fetch(`${BACKEND_URL}/email-verify/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentMember.email, code: accountEmailCodeInput.trim() }),
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok || !checkData.valid) {
        showToast("That code doesn't match — check and try again");
        return;
      }
      const attachRes = await authFetch(`${BACKEND_URL}/profile/verify-email`, { method: "PATCH" });
      if (!attachRes.ok) {
        showToast("Couldn't confirm that — try again");
        return;
      }
      await persistMembers(
        members.map((m) => (m.username === currentUser ? { ...m, isEmailVerified: true } : m))
      );
      setAccountEmailCodeSent(false);
      setAccountEmailCodeInput("");
      showToast("Email verified");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setVerifyingAccountEmail(false);
    }
  };

  const sendAccountPhoneCode = async () => {
    if (!accountPhoneInput.trim()) {
      showToast("Enter a phone number");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/phone-verify/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: accountPhoneInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't send a code — try again");
        return;
      }
      setAccountPhoneCodeSent(true);
      setAccountPhoneCodeInput("");
      showToast("Check your phone for a code");
    } catch {
      showToast("Couldn't reach the server — try again");
    }
  };

  const confirmAccountPhoneCode = async () => {
    if (!accountPhoneCodeInput.trim()) {
      showToast("Enter the code we texted you");
      return;
    }
    setVerifyingAccountPhone(true);
    try {
      const checkRes = await fetch(`${BACKEND_URL}/phone-verify/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: accountPhoneInput.trim(), code: accountPhoneCodeInput.trim() }),
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok || !checkData.valid) {
        showToast("That code doesn't match — check and try again");
        return;
      }
      const attachRes = await authFetch(`${BACKEND_URL}/profile/verify-phone`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: accountPhoneInput.trim() }),
      });
      if (!attachRes.ok) {
        showToast("Couldn't confirm that — try again");
        return;
      }
      await persistMembers(
        members.map((m) =>
          m.username === currentUser ? { ...m, phone: accountPhoneInput.trim(), isPhoneVerified: true } : m
        )
      );
      setAccountPhoneCodeSent(false);
      setAccountPhoneCodeInput("");
      setAccountPhoneInput("");
      showToast("Phone verified");
    } catch {
      showToast("Couldn't reach the server — try again");
    } finally {
      setVerifyingAccountPhone(false);
    }
  };

  const requestWithdrawal = async (amount) => {
    const amt = Math.round(Number(amount) * 100) / 100;
    if (!amt || amt <= 0) {
      showToast("Enter an amount to withdraw");
      return;
    }
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/withdrawals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
    } catch {
      showToast("Couldn't reach the server — try again");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Couldn't process that withdrawal");
      return;
    }
    const w = data.withdrawal;
    const mapped = {
      id: w.id,
      sellerUsername: w.seller_username,
      sellerId: w.seller_id,
      amount: Number(w.amount),
      status: w.status,
      failureReason: w.failure_reason,
      requestedAt: w.requested_at ? new Date(w.requested_at).getTime() : Date.now(),
      processedAt: w.processed_at ? new Date(w.processed_at).getTime() : null,
    };
    await persistWithdrawals([mapped, ...withdrawals]);
    showToast(
      mapped.status === "paid"
        ? "Withdrawal sent to your bank"
        : `Withdrawal couldn't be completed: ${mapped.failureReason || "unknown error"}`
    );
  };

  const checkout = async () => {
    if (cartItems.length === 0) return;
    if (!currentUser) {
      setCartOpen(false);
      setAuthMode("login");
      setAuthError("");
      setAuthReturnView(view);
      setView("signin");
      showToast("Log in to check out");
      return;
    }
    if (!shippingForm.fullName.trim() || !shippingForm.street.trim() || !shippingForm.city.trim() || !shippingForm.zip.trim() || !shippingForm.country.trim()) {
      setShippingError("Fill in your name, street, city, ZIP, and country to ship this order.");
      return;
    }
    setShippingError("");
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({ listingId: i.id, qty: i.qty })),
          shippingAddress: { ...shippingForm },
          currency: cartCurrency,
        }),
      });
    } catch {
      setShippingError("Couldn't reach the server — check your connection and try again.");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setShippingError(data.error || "Something went wrong placing this order.");
      return;
    }
    const order = backendOrderToFrontend(data.order);
    const purchasedIds = new Set(order.items.map((i) => i.listingId));
    await persistListings(listings.map((l) => (purchasedIds.has(l.id) ? { ...l, status: "sold" } : l)));
    await persistOrders([order, ...orders]);
    if (saveShippingAddress) {
      await persistMembers(
        members.map((m) => (m.username === currentUser ? { ...m, shippingAddress: { ...shippingForm } } : m))
      );
    }
    await persistCart([]);
    setCartOpen(false);
    setConfirmedOrder(order);
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      category: "Handmade",
      condition: "New",
      emoji: "📦",
      fitMake: "",
      fitModel: "",
      fitYear: "",
      images: [],
      listingType: "fixed",
      auctionDurationDays: "3",
      currency: "NGN",
      shippingFee: "0.00",
      quantity: "",
      sku: "",
      brand: "",
      state: "",
      shippingMethods: [],
      returnPolicy: "",
      vin: "",
    });
    setEditingId(null);
    setPreviewOpen(false);
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const room = 5 - form.images.length;
    if (room <= 0) {
      showToast("You can add up to 5 photos");
      return;
    }
    setUploading(true);
    try {
      const toProcess = files.slice(0, room);
      const results = await Promise.all(toProcess.map((f) => resizeImageFile(f)));
      setForm((f) => ({ ...f, images: [...f.images, ...results].slice(0, 5) }));
      if (files.length > room) showToast("Only added the first 5 photos");
    } catch {
      showToast("Couldn't process one of those photos");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleLicensePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const room = 5 - authForm.licensePhotos.length;
    if (room <= 0) {
      showToast("You can add up to 5 license photos");
      return;
    }
    setUploadingLicense(true);
    try {
      const toProcess = files.slice(0, room);
      const results = await Promise.all(toProcess.map((f) => resizeImageFile(f)));
      setAuthForm((f) => ({ ...f, licensePhotos: [...f.licensePhotos, ...results].slice(0, 5) }));
      if (files.length > room) showToast("Only added the first 5 photos");
    } catch {
      showToast("Couldn't process one of those photos");
    } finally {
      setUploadingLicense(false);
    }
  };

  const removeLicensePhoto = (idx) => {
    setAuthForm((f) => ({ ...f, licensePhotos: f.licensePhotos.filter((_, i) => i !== idx) }));
  };

  const handleBankStatementSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("That file is too large — please upload something under 5MB");
      return;
    }
    setUploadingBankStatement(true);
    try {
      const dataUrl = file.type.startsWith("image/")
        ? await resizeImageFile(file, 1400, 0.85)
        : await readFileAsDataURL(file);
      setBankStatementDraft(dataUrl);
      showToast("Bank statement attached");
    } catch {
      showToast("Couldn't read that file — try a different one");
    } finally {
      setUploadingBankStatement(false);
    }
  };

  const handleProofOfDeliverySelect = async (e, orderId, itemId) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("That photo is too large — please upload something under 5MB");
      return;
    }
    const key = `${orderId}-${itemId}`;
    setUploadingPodKey(key);
    try {
      const dataUrl = await resizeImageFile(file, 1400, 0.85);
      await updateItemProofOfDelivery(orderId, itemId, dataUrl);
    } catch {
      showToast("Couldn't read that photo — try a different one");
    } finally {
      setUploadingPodKey(null);
    }
  };

  const handleReturnEvidenceSelect = async (e, draftKey) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("That photo is too large — please upload something under 5MB");
      return;
    }
    setUploadingReturnEvidenceKey(draftKey);
    try {
      const dataUrl = await resizeImageFile(file, 1400, 0.85);
      setReturnDrafts((d) => ({
        ...d,
        [draftKey]: { ...d[draftKey], evidenceUrls: [...(d[draftKey]?.evidenceUrls || []), dataUrl] },
      }));
    } catch {
      showToast("Couldn't read that photo — try a different one");
    } finally {
      setUploadingReturnEvidenceKey(null);
    }
  };

  const handleBannerImageSelect = async (e) => {
    const file = (e.target.files || [])[0];
    e.target.value = "";
    if (!file) return;
    setBannerImageUploading(true);
    try {
      const resized = await resizeImageFile(file, 1400, 0.8);
      setBannerForm((f) => ({ ...f, imageUrl: resized }));
    } catch {
      showToast("Couldn't process that image");
    } finally {
      setBannerImageUploading(false);
    }
  };

  const handleAuthImageSelect = async (e) => {
    const file = (e.target.files || [])[0];
    e.target.value = "";
    if (!file) return;
    setAuthImageUploading(true);
    try {
      const resized = await resizeImageFile(file, 1400, 0.8);
      await persistSettings({ ...settings, authImage: resized });
    } catch {
      showToast("Couldn't process that image");
    } finally {
      setAuthImageUploading(false);
    }
  };

  const removeAuthImage = async () => {
    await persistSettings({ ...settings, authImage: "" });
  };

  const handleSubmit = async (mode = "publish") => {
    if (!currentUser) {
      setAuthMode("register");
      setAuthReturnView(view);
      setView("signup");
      showToast("Register or log in to publish a listing");
      return;
    }
    if (currentMember?.isApproved === false) {
      showToast("Your seller account is still pending admin approval");
      return;
    }
    if (needsIdVerification) {
      showToast(`You've crossed $${ID_VERIFICATION_SALES_THRESHOLD.toLocaleString()} in sales — add ID verification to keep selling`);
      setIdVerifyOpen(true);
      return;
    }
    const isDraft = mode === "draft";
    if (!form.title.trim()) {
      showToast("Give it a title");
      return;
    }
    if (!isDraft && !form.price) {
      showToast("Give it a price before publishing");
      return;
    }
    if (form.listingType === "auction" && isUnitedStates(currentMember?.country)) {
      showToast("Auctions aren't available for US sellers yet");
      return;
    }
    if (editingId) {
      const existingListing = listings.find((l) => l.id === editingId);
      if (existingListing?.listingType === "auction" && (existingListing.bidHistory || []).length > 0) {
        showToast("This auction already has bids and can't be edited");
        return;
      }
      // Publishing a draft (or re-saving as a draft) re-runs the same
      // approval logic a brand-new listing would get, since a draft has
      // never been through it yet.
      let statusPatch = {};
      if (isDraft) {
        statusPatch = { status: "draft" };
      } else if (existingListing?.status === "draft" || existingListing?.status === "rejected") {
        // Once a seller is approved, everything they list — including
        // auctions — goes live immediately without a separate review queue.
        const autoApproved = currentMember?.isApproved || currentMember?.isAdmin;
        statusPatch = { status: autoApproved ? "approved" : "pending" };
      }
      const patch = {
        ...form,
        price: form.price ? Number(form.price) : 0,
        shippingFee: Number(form.shippingFee) || 0,
        ...statusPatch,
      };
      if (typeof existingListing?.id === "number") {
        try {
          const res = await authFetch(`${BACKEND_URL}/listings/${existingListing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          });
          if (!res.ok) {
            showToast("Couldn't save changes — try again");
            return;
          }
          const { listing } = await res.json();
          await persistListings(
            listings.map((l) => (l.id === editingId ? backendListingToFrontend(listing, l) : l))
          );
        } catch {
          showToast("Couldn't reach the server — try again");
          return;
        }
      } else {
        await persistListings(listings.map((l) => (l.id === editingId ? { ...l, ...patch } : l)));
      }
      showToast(isDraft ? "Draft saved" : "Listing updated");
    } else {
      const isAuction = form.listingType === "auction";
      // Once a seller is approved, everything they list — including
      // auctions — goes live immediately without a separate review queue.
      const autoApproved = currentMember?.isApproved || currentMember?.isAdmin;
      const status = isDraft ? "draft" : autoApproved ? "approved" : "pending";
      const auctionEndTime = isAuction
        ? Date.now() + Number(form.auctionDurationDays) * 24 * 60 * 60 * 1000
        : null;
      let res;
      try {
        res = await authFetch(`${BACKEND_URL}/listings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownerId: currentMember.backendId,
            title: form.title,
            description: form.description,
            price: form.price ? Number(form.price) : 0,
            category: form.category,
            condition: form.condition,
            shippingFee: Number(form.shippingFee) || 0,
            emoji: form.emoji,
            fitMake: form.fitMake,
            fitModel: form.fitModel,
            fitYear: form.fitYear,
            images: form.images,
            listingType: form.listingType,
            currency: form.currency,
            status,
            auctionEndTime,
            quantity: form.quantity,
            sku: form.sku,
            brand: form.brand,
            state: form.state,
            shippingMethods: form.shippingMethods,
            returnPolicy: form.returnPolicy,
            vin: form.vin,
          }),
        });
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
      if (!res.ok) {
        showToast(isDraft ? "Couldn't save that draft — try again" : "Couldn't publish that listing — try again");
        return;
      }
      const { listing } = await res.json();
      const newListing = backendListingToFrontend(listing, {
        sellerName: currentMember.displayName,
        ownerUsername: currentUser,
      });
      await persistListings([newListing, ...listings]);
      showToast(isDraft ? "Draft saved" : autoApproved ? "Listing is live" : "Listing submitted — pending admin approval");
    }
    resetForm();
    setView(adminEditContext ? "admin" : "dashboard");
    setAdminEditContext(false);
  };

  const startEdit = (listing, fromAdmin = false) => {
    setForm({
      title: listing.title,
      description: listing.description,
      price: String(listing.price),
      category: listing.category,
      condition: listing.condition || "New",
      emoji: listing.emoji,
      fitMake: listing.fitMake || "",
      fitModel: listing.fitModel || "",
      fitYear: listing.fitYear || "",
      images: listing.images || [],
      listingType: listing.listingType || "fixed",
      auctionDurationDays: "3",
      currency: listing.currency || "USD",
      shippingFee: listing.shippingFee != null ? String(listing.shippingFee) : "0.00",
      quantity: listing.quantity != null ? String(listing.quantity) : "",
      sku: listing.sku || "",
      brand: listing.brand || "",
      state: listing.state || "",
      shippingMethods: listing.shippingMethods || [],
      returnPolicy: listing.returnPolicy || "",
      vin: listing.vin || "",
    });
    setEditingId(listing.id);
    setAdminEditContext(fromAdmin);
    setPreviewOpen(false);
    setView("sell");
  };

  const deleteListingOnBackend = async (id) => {
    if (typeof id !== "number") return true;
    try {
      const res = await authFetch(`${BACKEND_URL}/listings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Couldn't remove that listing — try again");
        return false;
      }
      return true;
    } catch {
      showToast("Couldn't reach the server — try again");
      return false;
    }
  };

  const deleteListing = async (id) => {
    if (!(await deleteListingOnBackend(id))) return;
    await persistListings(listings.filter((l) => l.id !== id));
    showToast("Listing removed");
    setSelected(null);
  };

  const pauseListing = async (id) => {
    if (!(await patchListingOnBackend(id, { status: "paused" }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, status: "paused" } : l)));
    showToast("Listing paused — hidden from Browse until you resume it");
  };

  const resumeListing = async (id) => {
    if (!(await patchListingOnBackend(id, { status: "approved" }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, status: "approved" } : l)));
    showToast("Listing is live again");
  };

  const markListingSoldOut = async (id) => {
    if (!(await patchListingOnBackend(id, { status: "sold" }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, status: "sold" } : l)));
    showToast("Marked out of stock");
  };

  const markListingInStock = async (id) => {
    if (!(await patchListingOnBackend(id, { status: "approved" }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, status: "approved" } : l)));
    showToast("Marked back in stock");
  };

  // Prefills the create form from an existing listing (minus id, bid
  // history, and auction end time) so the seller can tweak and publish it
  // as a brand-new listing rather than starting from scratch.
  const duplicateListing = (l) => {
    setForm({
      title: `${l.title} (copy)`,
      description: l.description || "",
      price: l.price != null ? String(l.price) : "",
      category: l.category,
      condition: l.condition || "New",
      emoji: l.emoji || "📦",
      fitMake: l.fitMake || "",
      fitModel: l.fitModel || "",
      fitYear: l.fitYear || "",
      images: l.images || [],
      listingType: "fixed",
      auctionDurationDays: "3",
      currency: l.currency || "NGN",
      shippingFee: l.shippingFee != null ? String(l.shippingFee) : "0.00",
      quantity: l.quantity != null ? String(l.quantity) : "",
      sku: l.sku || "",
      brand: l.brand || "",
      state: l.state || "",
      shippingMethods: l.shippingMethods || [],
      returnPolicy: l.returnPolicy || "",
      vin: l.vin || "",
    });
    setEditingId(null);
    setAdminEditContext(false);
    setPreviewOpen(false);
    setView("sell");
    showToast("Duplicated — review and publish when ready");
  };

  // Quick inline edit for just price/quantity from the Manage Listings list,
  // without opening the full edit form.
  const quickUpdateListing = async (id, { price, quantity }) => {
    const patch = {};
    if (price !== undefined) patch.price = Number(price);
    if (quantity !== undefined) patch.quantity = quantity === "" ? null : Number(quantity);
    if (!(await patchListingOnBackend(id, patch))) return;
    await persistListings(
      listings.map((l) =>
        l.id === id
          ? {
              ...l,
              ...(price !== undefined ? { price: Number(price) } : {}),
              ...(quantity !== undefined ? { quantity: quantity === "" ? "" : Number(quantity) } : {}),
            }
          : l
      )
    );
    showToast("Listing updated");
  };

  const adminRemoveListing = async (id) => {
    if (!(await deleteListingOnBackend(id))) return;
    await persistListings(listings.filter((l) => l.id !== id));
    showToast("Listing removed by admin");
  };

  const adminApproveListing = async (id) => {
    if (!(await patchListingOnBackend(id, { status: "approved" }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, status: "approved" } : l)));
    showToast("Listing approved");
  };

  const adminRejectListing = async (id) => {
    if (!(await patchListingOnBackend(id, { status: "rejected" }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, status: "rejected" } : l)));
    showToast("Listing rejected");
  };

  const adminTakeDownListing = async (id) => {
    if (!(await patchListingOnBackend(id, { status: "removed" }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, status: "removed" } : l)));
    showToast("Listing taken down");
  };

  const adminRestoreListing = async (id) => {
    if (!(await patchListingOnBackend(id, { status: "approved" }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, status: "approved" } : l)));
    showToast("Listing restored");
  };

  const adminToggleFeature = async (id) => {
    const target = listings.find((l) => l.id === id);
    const nextFeatured = !target?.isFeatured;
    if (!(await patchListingOnBackend(id, { isFeatured: nextFeatured }))) return;
    await persistListings(listings.map((l) => (l.id === id ? { ...l, isFeatured: nextFeatured } : l)));
    showToast(nextFeatured ? "Listing featured" : "Listing unfeatured");
  };

  const adminRemoveMember = async (username) => {
    if (username === currentUser) {
      showToast("You can't remove your own admin account");
      return;
    }
    const target = members.find((m) => m.username === username);
    if (target?.backendId) {
      try {
        await authFetch(`${BACKEND_URL}/listings/by-owner/${target.backendId}`, { method: "DELETE" });
        const res = await authFetch(`${BACKEND_URL}/users/${target.backendId}`, { method: "DELETE" });
        if (!res.ok) {
          let body = {};
          try {
            body = await res.json();
          } catch {}
          if (body.code === "HAS_HISTORY") {
            // This member has order/payout history, so we can't hard-delete
            // them without destroying records other users depend on.
            // Suspend instead — blocks their access, keeps history intact.
            await adminToggleSuspend(username);
            showToast("Member has order or payout history, so they were suspended instead of deleted");
          } else {
            showToast("Couldn't remove member — try again");
          }
          return;
        }
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
    }
    await persistMembers(members.filter((m) => m.username !== username));
    await persistListings(listings.filter((l) => l.ownerUsername !== username));
    showToast("Member removed");
  };

  const adminSetRole = async (username, role) => {
    const target = members.find((m) => m.username === username);
    if (target?.backendId) {
      try {
        const res = await authFetch(`${BACKEND_URL}/users/${target.backendId}/admin-role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        if (!res.ok) {
          showToast("Couldn't update that role — try again");
          return;
        }
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
    }
    await persistMembers(
      members.map((m) => (m.username === username ? { ...m, isAdmin: role !== null, adminRole: role } : m))
    );
    showToast(role ? `Role set to ${ADMIN_ROLE_LABELS[role] || role}` : "Admin access revoked");
  };

  const adminToggleSuspend = async (username) => {
    if (username === currentUser) {
      showToast("You can't suspend your own account");
      return;
    }
    const target = members.find((m) => m.username === username);
    const nextSuspended = !target?.isSuspended;
    if (target?.backendId) {
      try {
        const res = await authFetch(`${BACKEND_URL}/users/${target.backendId}/suspend`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isSuspended: nextSuspended }),
        });
        if (!res.ok) {
          showToast("Couldn't update member — try again");
          return;
        }
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
    }
    await persistMembers(
      members.map((m) => (m.username === username ? { ...m, isSuspended: nextSuspended } : m))
    );
    showToast(nextSuspended ? "Member suspended" : "Member unsuspended");
  };

  const adminApproveMember = async (username) => {
    const target = members.find((m) => m.username === username);
    if (target?.backendId) {
      try {
        const res = await authFetch(`${BACKEND_URL}/users/${target.backendId}/approve`, { method: "PATCH" });
        if (!res.ok) {
          showToast("Couldn't approve member — try again");
          return;
        }
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
    }
    await persistMembers(
      members.map((m) =>
        m.username === username
          ? { ...m, isApproved: true, verificationStatus: "approved", rejectionReason: "" }
          : m
      )
    );
    showToast("Seller approved — they can now list items");
  };

  const adminRejectMember = async (username, reason) => {
    const target = members.find((m) => m.username === username);
    if (target?.backendId) {
      try {
        const res = await authFetch(`${BACKEND_URL}/users/${target.backendId}/reject`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason || "" }),
        });
        if (!res.ok) {
          showToast("Couldn't reject member — try again");
          return;
        }
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
    }
    await persistMembers(
      members.map((m) =>
        m.username === username
          ? { ...m, isApproved: false, verificationStatus: "rejected", rejectionReason: reason || "" }
          : m
      )
    );
    showToast("Seller application rejected");
  };

  const adminToggleVerify = async (username) => {
    const target = members.find((m) => m.username === username);
    const nextVerified = !target?.isVerified;
    if (target?.backendId) {
      try {
        const res = await authFetch(`${BACKEND_URL}/users/${target.backendId}/verify`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isVerified: nextVerified }),
        });
        if (!res.ok) {
          showToast("Couldn't update member — try again");
          return;
        }
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
    }
    await persistMembers(
      members.map((m) => (m.username === username ? { ...m, isVerified: nextVerified } : m))
    );
    showToast(nextVerified ? "Seller verified" : "Verification removed");
  };

  const adminAddMember = async (data) => {
    const username = data.username.trim().toLowerCase();
    if (!username || !data.password || !data.email?.trim() || !data.phone?.trim()) {
      showToast("Enter a username, email, phone, and password");
      return false;
    }
    if (members.some((m) => m.username === username)) {
      showToast("That username is taken");
      return false;
    }
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/admin/create-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: data.password,
          displayName: data.displayName.trim() || username,
          email: data.email?.trim() || "",
          phone: data.phone?.trim() || "",
          isApproved: true,
        }),
      });
    } catch {
      showToast("Couldn't reach the server — try again");
      return false;
    }
    const responseData = await res.json();
    if (!res.ok) {
      showToast(responseData.error || "Couldn't add that member");
      return false;
    }
    const newMember = {
      ...backendUserToMember(responseData.user),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      officeLocation: data.officeLocation.trim(),
    };
    await persistMembers([...members, newMember]);
    showToast(`Member ${newMember.displayName} added`);
    return true;
  };

  const toggleFollow = async (followedUsername) => {
    if (!currentUser) {
      setAuthReturnView(view);
      setView("signin");
      showToast("Sign in to follow sellers");
      return;
    }
    if (currentUser === followedUsername) return;
    const isFollowing = follows.some(
      (f) => f.followerUsername === currentUser && f.followedUsername === followedUsername
    );
    try {
      const res = await authFetch(`${BACKEND_URL}/follows`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerUsername: currentUser, followedUsername }),
      });
      if (!res.ok) {
        showToast("Couldn't update follow status — try again");
        return;
      }
    } catch {
      showToast("Couldn't reach the server — try again");
      return;
    }
    setFollows((prev) =>
      isFollowing
        ? prev.filter((f) => !(f.followerUsername === currentUser && f.followedUsername === followedUsername))
        : [...prev, { followerUsername: currentUser, followedUsername }]
    );
    showToast(isFollowing ? "Unfollowed" : "Following");
  };

  const noAdminExists = members.length > 0 && !members.some((m) => m.isAdmin);

  const claimAdmin = async () => {
    if (!currentUser) return;
    await persistMembers(members.map((m) => (m.username === currentUser ? { ...m, isAdmin: true } : m)));
    showToast("You're now the marketplace admin");
  };

  const myListings = listings.filter((l) => l.ownerUsername === currentUser);
  const filteredMyListings =
    manageListingsTab === "all" ? myListings : myListings.filter((l) => l.status === manageListingsTab);
  const mySales = orders
    .filter((o) => o.items.some((i) => i.ownerUsername === currentUser))
    .sort((a, b) => b.createdAt - a.createdAt);
  const filteredMySales =
    salesTab === "all" ? mySales : mySales.filter((o) => getSellerOrderStatus(o, currentUser) === salesTab);

  // Flattened view of just this seller's line items across all their sales,
  // used for the dashboard's order-status breakdown (waiting to ship, in
  // transit, completed, returns/disputes).
  const mySoldItems = mySales.flatMap((o) =>
    o.items
      .filter((i) => i.ownerUsername === currentUser)
      .map((i) => ({ ...i, orderId: o.id, orderCreatedAt: o.createdAt, isDisputed: o.isDisputed }))
  );
  const totalSalesRevenue = mySoldItems
    .filter((i) => i.fulfillmentStatus !== "cancelled")
    .reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);
  const ordersWaitingToShip = mySoldItems.filter((i) => (i.fulfillmentStatus || "new") === "new").length;
  const ordersInTransit = mySoldItems.filter((i) => i.fulfillmentStatus === "shipped").length;
  const completedOrdersCount = mySoldItems.filter((i) => i.fulfillmentStatus === "delivered").length;
  const activeReturnsDisputes = mySoldItems.filter(
    (i) => i.returnStatus === "requested" || i.isDisputed
  ).length;

  // Seller performance rates — all computed from this seller's own data,
  // no separate backend endpoint needed.
  const ON_TIME_SHIP_WINDOW_MS = 48 * 60 * 60 * 1000;
  const cancellationRate =
    mySoldItems.length > 0
      ? Math.round((mySoldItems.filter((i) => i.fulfillmentStatus === "cancelled").length / mySoldItems.length) * 100)
      : null;
  const returnRate =
    mySoldItems.length > 0
      ? Math.round((mySoldItems.filter((i) => !!i.returnStatus).length / mySoldItems.length) * 100)
      : null;
  const disputeRate =
    mySales.length > 0
      ? Math.round((mySales.filter((o) => o.isDisputed).length / mySales.length) * 100)
      : null;
  const shippedItems = mySoldItems.filter((i) => i.shippedAt);
  const onTimeShippingRate =
    shippedItems.length > 0
      ? Math.round(
          (shippedItems.filter((i) => i.shippedAt - i.orderCreatedAt <= ON_TIME_SHIP_WINDOW_MS).length /
            shippedItems.length) *
            100
        )
      : null;

  const myWalletTx = mySales.flatMap((o) => {
    const myItems = o.items.filter((i) => i.ownerUsername === currentUser);
    return myItems.map((i) => {
      const itemGross = i.price * i.qty;
      const rate = o.commissionRate ?? 0.05;
      const itemShipping = Number(i.shippingFee) || 0;
      const payout =
        o.commissionRate !== undefined
          ? Math.round((itemGross - itemGross * rate + itemShipping) * 100) / 100
          : itemGross;
      const voided = i.fulfillmentStatus === "cancelled" || i.fulfillmentStatus === "returned";
      let walletStatus;
      if (voided) walletStatus = "voided";
      else if (o.paymentStatus === "refunded") walletStatus = "refunded";
      else if (o.paymentStatus === "released") walletStatus = "released";
      else walletStatus = "held";
      return {
        key: `${o.id}-${i.id}`,
        buyerName: o.buyerName,
        createdAt: o.createdAt,
        title: i.title,
        qty: i.qty,
        payout,
        walletStatus,
      };
    });
  });
  const walletAvailable = myWalletTx
    .filter((t) => t.walletStatus === "released")
    .reduce((s, t) => s + t.payout, 0);
  const walletHeld = myWalletTx
    .filter((t) => t.walletStatus === "held")
    .reduce((s, t) => s + t.payout, 0);
  const walletVoided = myWalletTx
    .filter((t) => t.walletStatus === "voided" || t.walletStatus === "refunded")
    .reduce((s, t) => s + t.payout, 0);

  const myWithdrawals = withdrawals
    .filter((w) => w.sellerUsername === currentUser)
    .sort((a, b) => b.requestedAt - a.requestedAt);
  const withdrawalsReserved = myWithdrawals
    .filter((w) => w.status === "processing" || w.status === "paid")
    .reduce((s, w) => s + w.amount, 0);
  const withdrawalsPaidTotal = myWithdrawals
    .filter((w) => w.status === "paid")
    .reduce((s, w) => s + w.amount, 0);
  const walletNetAvailable = Math.max(0, walletAvailable - withdrawalsReserved);

  const myRecentActivity = [
    ...mySales.map((o) => {
      const myItems = o.items.filter((i) => i.ownerUsername === currentUser);
      const total = myItems.reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);
      return { id: `sale-${o.id}`, message: `New sale from ${o.buyerName} — $${total.toFixed(2)}`, at: o.createdAt };
    }),
    ...mySales
      .filter((o) => o.isDisputed)
      .map((o) => ({ id: `dispute-${o.id}`, message: `Dispute opened on order from ${o.buyerName}`, at: o.createdAt })),
    ...mySoldItems
      .filter((i) => i.returnStatus === "requested")
      .map((i) => ({ id: `return-${i.id}`, message: `Return requested — ${i.title}`, at: i.returnRequestedAt || Date.now() })),
    ...myWithdrawals
      .filter((w) => w.status === "paid")
      .map((w) => ({ id: `payout-${w.id}`, message: `Payout of $${Number(w.amount).toFixed(2)} completed`, at: w.requestedAt })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 5);

  const myOrders = orders
    .filter((o) => o.buyerUsername === currentUser)
    .sort((a, b) => b.createdAt - a.createdAt);
  const disputedOrders = orders.filter((o) => o.isDisputed);
  const myThreads = threads
    .filter((t) => t.buyerUsername === currentUser || t.sellerUsername === currentUser)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const activeThread = threads.find((t) => t.id === activeThreadId) || null;
  const unreadThreadsCount = myThreads.filter((t) => {
    const lastMsg = t.messages[t.messages.length - 1];
    return lastMsg && lastMsg.senderUsername !== currentUser && lastMsg.createdAt > (messageReadState[t.id] || 0);
  }).length;

  const getListingRating = (listingId) => {
    const rs = reviews.filter((r) => r.listingId === listingId);
    if (rs.length === 0) return null;
    const avg = rs.reduce((s, r) => s + r.rating, 0) / rs.length;
    return { avg, count: rs.length };
  };

  const getReviewFor = (orderId, itemId) =>
    reviews.find((r) => r.orderId === orderId && r.itemId === itemId) || null;

  const getSellerVacationInfo = (username) => {
    const seller = members.find((m) => m.username === username);
    if (!seller?.vacationMode) return null;
    return {
      returnDate: seller.vacationReturnDate || "",
      message: seller.vacationMessage || "",
    };
  };

  const getSellerRating = (username) => {
    const rs = reviews.filter((r) => r.sellerUsername === username);
    if (rs.length === 0) return null;
    const avg = rs.reduce((s, r) => s + r.rating, 0) / rs.length;
    return { avg, count: rs.length };
  };

  // Only counts USD-denominated sales — this threshold is a USD figure, and
  // there's no live exchange rate here to convert other currencies into it.
  const getSellerTotalSalesUSD = (username) =>
    orders.reduce((sum, o) => {
      if ((o.currency || "USD") !== "USD") return sum;
      const mine = o.items.filter((i) => i.ownerUsername === username);
      return sum + mine.reduce((s, i) => s + i.price * i.qty, 0);
    }, 0);

  const needsIdVerification =
    !!currentMember &&
    currentMember.idVerificationExempt &&
    !currentMember.idCountry &&
    getSellerTotalSalesUSD(currentUser) >= ID_VERIFICATION_SALES_THRESHOLD;

  // eBay-style reputation: 4-5 stars count as positive, 3 as neutral, 1-2 as negative.
  const getSellerReputation = (username) => {
    const rs = reviews.filter((r) => r.sellerUsername === username);
    if (rs.length === 0) return null;
    const positive = rs.filter((r) => r.rating >= 4).length;
    const positivePct = Math.round((positive / rs.length) * 100);
    return { positivePct, count: rs.length };
  };

  const openStorefront = (username) => {
    setViewingSeller(username);
    setSelected(null);
    setView("storefront");
    fetchSellerSalesCount(username);
  };


  const filtered = listings
    .filter((l) => {
      const matchesCategory = categoryFilter === "All" || l.category === categoryFilter;
      const matchesCondition = conditionFilter === "All" || (l.condition || "New") === conditionFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      const isVisible = l.status === "approved";
      const min = priceMin !== "" ? Number(priceMin) : -Infinity;
      const max = priceMax !== "" ? Number(priceMax) : Infinity;
      const matchesPrice = Number(l.price) >= min && Number(l.price) <= max;
      return matchesCategory && matchesCondition && matchesSearch && isVisible && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === "rating") {
        const ra = getListingRating(a.id)?.avg || 0;
        const rb = getListingRating(b.id)?.avg || 0;
        return rb - ra;
      }
      // default: featured first
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  const visibleListings = listings.filter((l) => l.status === "approved");
  const featuredPicks = visibleListings.filter((l) => l.isFeatured).slice(0, 10);
  const newArrivals = visibleListings
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 10);
  const isHomeState = !search.trim() && categoryFilter === "All" && !priceMin && !priceMax && conditionFilter === "All";

  const NavButton = ({ id, icon: Icon, label, badge, onClick }) => (
    <button
      onClick={onClick || (() => setView(id))}
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{
        color: view === id ? INK : "#C9CCD3",
        backgroundColor: view === id ? MARIGOLD : "transparent",
      }}
    >
      <Icon size={16} />
      {label}
      {badge > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center"
          style={{ backgroundColor: BERRY, color: "white" }}
        >
          {badge}
        </span>
      )}
    </button>
  );

  if (adminLoginMode) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ backgroundColor: INK, fontFamily: "'Work Sans', sans-serif" }}
      >
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: MARIGOLD }}
            >
              <span style={{ fontFamily: "'DM Serif Display', serif", color: INK, fontSize: "16px" }}>S</span>
            </div>
            <h1 className="text-xl tracking-wide" style={{ fontFamily: "'DM Serif Display', serif", color: MARIGOLD }}>
              Stallyard Admin
            </h1>
          </div>
          <div className="bg-white rounded-2xl p-6">
            {adminLoginStep === "credentials" ? (
              <>
                <h2 className="text-lg font-semibold mb-1" style={{ color: INK }}>
                  Sign in
                </h2>
                <p className="text-sm mb-4" style={{ color: SLATE }}>
                  This is a restricted entrance — admin credentials only.
                </p>
                <input
                  value={adminLoginForm.username}
                  onChange={(e) => setAdminLoginForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="Username"
                  autoCapitalize="none"
                  className="w-full mb-2 px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
                <input
                  type="password"
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm((f) => ({ ...f, password: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && submitAdminLoginCredentials()}
                  placeholder="Password"
                  className="w-full mb-2 px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
                {adminLoginError && (
                  <p className="text-sm mb-2" style={{ color: BERRY }}>
                    {adminLoginError}
                  </p>
                )}
                <button
                  onClick={submitAdminLoginCredentials}
                  disabled={adminLoginSubmitting}
                  className="w-full py-2.5 rounded-lg font-medium mt-1 disabled:opacity-50"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  {adminLoginSubmitting ? "Checking..." : "Continue"}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-1" style={{ color: INK }}>
                  Enter your code
                </h2>
                <p className="text-sm mb-4" style={{ color: SLATE }}>
                  {adminLoginStep === "code-email"
                    ? "Now enter the 6-digit code we just emailed you. (2 of 2)"
                    : "Enter the 6-digit code from your authenticator app. (1 of 2 — an email code comes next.)"}
                </p>
                <input
                  value={adminLoginCode}
                  onChange={(e) => setAdminLoginCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitAdminLoginTwoFactor()}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-center text-lg tracking-widest"
                  style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                  autoFocus
                />
                {adminLoginError && (
                  <p className="text-sm mb-2" style={{ color: BERRY }}>
                    {adminLoginError}
                  </p>
                )}
                <button
                  onClick={submitAdminLoginTwoFactor}
                  disabled={adminLoginSubmitting}
                  className="w-full py-2.5 rounded-lg font-medium mt-1 disabled:opacity-50"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  {adminLoginSubmitting ? "Verifying..." : adminLoginStep === "code-email" ? "Sign in" : "Continue"}
                </button>
                <button
                  onClick={() => {
                    setAdminLoginStep("credentials");
                    setAdminLoginCode("");
                    setAdminLoginError("");
                  }}
                  className="text-xs font-medium underline mt-3"
                  style={{ color: SLATE }}
                >
                  ← Back
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setAdminLoginMode(false);
              window.history.replaceState({}, "", "/");
              setView("browse");
            }}
            className="text-xs font-medium underline mt-4 block mx-auto"
            style={{ color: "#8A93A3" }}
          >
            ← Back to Stallyard
          </button>
        </div>
      </div>
    );
  }

  if (view === "signup" || view === "signin") {
    const isSignUp = view === "signup";
    const showBusinessFields = authForm.accountType !== "personal";
    return (
      <div className="min-h-screen w-full flex" style={{ backgroundColor: "white", fontFamily: "'Work Sans', sans-serif" }}>
        {/* Photo panel */}
        <div
          className="hidden lg:block lg:w-1/2 relative"
          style={{ backgroundColor: CANVAS }}
        >
          <div
            className="absolute inset-6 rounded-2xl bg-cover bg-center"
            style={{
              backgroundImage:
                `linear-gradient(135deg, rgba(27,36,48,0.15), rgba(27,36,48,0.35)), url('${
                  settings.authImage ||
                  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
                }')`,
            }}
          />
        </div>

        {/* Form panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 sm:px-10 py-5">
            <button
              onClick={() => setView(authReturnView)}
              className="flex items-center gap-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: MARIGOLD }}
              >
                <Store size={16} style={{ color: INK }} />
              </div>
              <span className="text-lg" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                Stallyard
              </span>
            </button>
            <p className="text-sm" style={{ color: SLATE }}>
              {isSignUp ? "Already have an account? " : "New to Stallyard? "}
              <button
                onClick={() => {
                  setAuthMode(isSignUp ? "login" : "register");
                  setAuthError("");
                  setView(isSignUp ? "signin" : "signup");
                }}
                className="font-medium underline"
                style={{ color: INK }}
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>

          <div className="flex-1 flex items-start sm:items-center justify-center px-6 sm:px-10 pb-10">
            <div className="w-full max-w-sm">
              {pendingTwoFactor ? (
                <div>
                  <h1 className="text-3xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                    Enter your code
                  </h1>
                  <p className="text-sm mb-4" style={{ color: SLATE }}>
                    {pendingTwoFactor.method === "totp"
                      ? "Enter the 6-digit code from your authenticator app. (1 of 2 — an email code comes next.)"
                      : pendingTwoFactor.method === "totp-email"
                      ? "Now enter the 6-digit code we just emailed you. (2 of 2)"
                      : "We emailed a 6-digit code to confirm it's really you."}
                  </p>
                  <input
                    value={twoFactorCodeInput}
                    onChange={(e) => setTwoFactorCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && verifyTwoFactorCode()}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-center text-lg tracking-widest"
                    style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  {authError && (
                    <p className="text-sm mb-2" style={{ color: BERRY }}>
                      {authError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={verifyTwoFactorCode}
                    className="w-full py-2.5 rounded-lg font-medium mt-1"
                    style={{ backgroundColor: MARIGOLD, color: INK }}
                  >
                    {pendingTwoFactor.method === "totp" ? "Continue" : "Verify & log in"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingTwoFactor(null);
                      setTwoFactorCodeInput("");
                      setAuthError("");
                    }}
                    className="text-xs font-medium underline mt-3"
                    style={{ color: SLATE }}
                  >
                    ← Back
                  </button>
                </div>
              ) : pendingEmailVerification ? (
                <div>
                  <h1 className="text-3xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                    Verify your email
                  </h1>
                  <p className="text-sm mb-4" style={{ color: SLATE }}>
                    We just emailed a 6-digit code to{" "}
                    <strong style={{ color: INK }}>{pendingEmailVerification.signupDraft.email}</strong>.
                    Enter it below to finish creating your account.
                  </p>
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Enter the 6-digit code
                  </label>
                  <input
                    value={emailCodeInput}
                    onChange={(e) => {
                      setEmailCodeInput(e.target.value);
                      if (emailVerifyError) setEmailVerifyError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && confirmEmailCode()}
                    placeholder="123456"
                    className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-center text-lg tracking-widest"
                    style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  {emailVerifyError && (
                    <p className="text-sm mb-2" style={{ color: BERRY }}>
                      {emailVerifyError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={confirmEmailCode}
                    className="w-full py-2.5 rounded-lg font-medium mt-1"
                    style={{ backgroundColor: MARIGOLD, color: INK }}
                  >
                    Verify & create account
                  </button>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      type="button"
                      onClick={resendEmailCode}
                      className="text-xs font-medium underline"
                      style={{ color: SLATE }}
                    >
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingEmailVerification(null);
                        setEmailCodeInput("");
                        setEmailVerifyError("");
                      }}
                      className="text-xs font-medium underline"
                      style={{ color: SLATE }}
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              ) : profileStageOpen ? (
                <div>
                  <h1 className="text-3xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                    Finish your profile
                  </h1>
                  <p className="text-sm mb-6" style={{ color: SLATE }}>
                    You're signed in — this just unlocks buying and selling. Close this any time and pick up where you left off.
                  </p>
                  <div className="space-y-3">
                    <div
                      className="w-full flex rounded-full p-1 mb-1"
                      style={{ backgroundColor: "#F1EDE1" }}
                    >
                      {["personal", "business"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAuthForm({ ...authForm, accountType: type })}
                          className="flex-1 py-2 rounded-full text-sm font-medium transition-colors"
                          style={
                            authForm.accountType === type
                              ? { backgroundColor: INK, color: "#fff" }
                              : { backgroundColor: "transparent", color: SLATE }
                          }
                        >
                          {type === "personal" ? "Personal" : "Business"}
                        </button>
                      ))}
                    </div>
                    <select
                      value={authForm.country}
                      onChange={(e) => setAuthForm({ ...authForm, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                      style={{ borderColor: "#DDD8CC", color: authForm.country ? INK : SLATE }}
                    >
                      <option value="">Country of residence</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="United States">United States (coming soon)</option>
                    </select>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          value={authForm.firstName}
                          onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                          placeholder="First name"
                          className="w-full px-3 py-2 rounded-lg border outline-none"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          value={authForm.lastName}
                          onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                          placeholder="Last name"
                          className="w-full px-3 py-2 rounded-lg border outline-none"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                      </div>
                    </div>
                    {showBusinessFields && (
                      <input
                        value={authForm.displayName}
                        onChange={(e) => setAuthForm({ ...authForm, displayName: e.target.value })}
                        placeholder="Stall name (e.g. Maple & Co.)"
                        className="w-full px-3 py-2 rounded-lg border outline-none"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                    )}
                    <input
                      type="tel"
                      value={authForm.phone}
                      onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                      placeholder="Phone number (optional)"
                      className="w-full px-3 py-2 rounded-lg border outline-none"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    {showBusinessFields && (
                      <input
                        value={authForm.officeLocation}
                        onChange={(e) => setAuthForm({ ...authForm, officeLocation: e.target.value })}
                        placeholder="Office location (e.g. Downtown branch)"
                        className="w-full px-3 py-2 rounded-lg border outline-none"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                    )}
                    {!isUnitedStates(authForm.country) && (
                      <select
                        value={authForm.idType}
                        onChange={(e) => setAuthForm({ ...authForm, idType: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                        style={{ borderColor: "#DDD8CC" }}
                      >
                        <option>Passport</option>
                        <option>National ID</option>
                        <option>Driver's License</option>
                        <option>NIN</option>
                        <option>Permanent Voter's Card</option>
                      </select>
                    )}
                    {isUnitedStates(authForm.country) && (
                      <p className="text-xs" style={{ color: SLATE }}>
                        ID verification isn't required for US-based members.
                      </p>
                    )}
                    {!isUnitedStates(authForm.country) && showBusinessFields && (
                      <input
                        value={authForm.licenseNumber}
                        onChange={(e) => setAuthForm({ ...authForm, licenseNumber: e.target.value })}
                        placeholder="License number (optional, self-reported)"
                        className="w-full px-3 py-2 rounded-lg border outline-none"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                    )}
                    {!isUnitedStates(authForm.country) && (
                      <div>
                        <p className="text-xs mb-2" style={{ color: SLATE }}>
                          License photos (optional, up to 5)
                        </p>
                        {authForm.licensePhotos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {authForm.licensePhotos.map((src, idx) => (
                              <div key={idx} className="relative w-20 h-20">
                                <img
                                  src={src}
                                  alt={`License photo ${idx + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeLicensePhoto(idx)}
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: BERRY }}
                                  aria-label="Remove photo"
                                >
                                  <X size={14} color="white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {authForm.licensePhotos.length < 5 && (
                          <label
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                            style={{ borderColor: "#DDD8CC", color: SLATE, backgroundColor: "white" }}
                          >
                            {uploadingLicense ? "Processing..." : "Add license photos"}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleLicensePhotoSelect}
                              disabled={uploadingLicense}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}
                    {profileStageError && (
                      <p className="text-sm" style={{ color: BERRY }}>
                        {profileStageError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={completeProfile}
                      className="w-full py-2.5 rounded-lg font-medium mt-1"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      Save & continue
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileStageOpen(false);
                        setView(authReturnView);
                      }}
                      className="text-xs font-medium underline text-center w-full"
                      style={{ color: SLATE }}
                    >
                      I'll finish this later
                    </button>
                  </div>
                </div>
              ) : authMode === "forgot" ? (
                <div>
                  {!pendingPasswordReset ? (
                    <>
                      <h1 className="text-3xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                        Reset your password
                      </h1>
                      <p className="text-sm mb-4" style={{ color: SLATE }}>
                        Enter your username and we'll email a code to the address on file.
                      </p>
                      <input
                        value={resetIdentifier}
                        onChange={(e) => {
                          setResetIdentifier(e.target.value);
                          if (resetError) setResetError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && requestPasswordReset()}
                        placeholder="Username"
                        className="w-full mb-2 px-3 py-2 rounded-lg border outline-none"
                        style={{ borderColor: "#DDD8CC" }}
                        autoCapitalize="none"
                      />
                      {resetError && (
                        <p className="text-sm mb-2" style={{ color: BERRY }}>
                          {resetError}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={requestPasswordReset}
                        className="w-full py-2.5 rounded-lg font-medium mt-1"
                        style={{ backgroundColor: MARIGOLD, color: INK }}
                      >
                        Send reset code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setResetError("");
                        }}
                        className="text-xs font-medium underline mt-3"
                        style={{ color: SLATE }}
                      >
                        ← Back to sign in
                      </button>
                    </>
                  ) : !pendingPasswordReset.verified ? (
                    <>
                      <h1 className="text-3xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                        Enter your code
                      </h1>
                      <p className="text-sm mb-4" style={{ color: SLATE }}>
                        We sent a code to {pendingPasswordReset.maskedEmail || "the email on file"}. Enter it below.
                      </p>
                      <input
                        value={resetCodeInput}
                        onChange={(e) => {
                          setResetCodeInput(e.target.value);
                          if (resetError) setResetError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && confirmResetCode()}
                        placeholder="123456"
                        className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-center text-lg tracking-widest"
                        style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      {resetError && (
                        <p className="text-sm mb-2" style={{ color: BERRY }}>
                          {resetError}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={confirmResetCode}
                        className="w-full py-2.5 rounded-lg font-medium mt-1"
                        style={{ backgroundColor: MARIGOLD, color: INK }}
                      >
                        Verify code
                      </button>
                      <div className="flex items-center justify-between mt-3">
                        <button
                          type="button"
                          onClick={resendResetCode}
                          className="text-xs font-medium underline"
                          style={{ color: SLATE }}
                        >
                          Resend code
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingPasswordReset(null);
                            setResetCodeInput("");
                            setResetError("");
                          }}
                          className="text-xs font-medium underline"
                          style={{ color: SLATE }}
                        >
                          ← Back
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                        Set a new password
                      </h1>
                      <p className="text-sm mb-4" style={{ color: SLATE }}>
                        Choose a new password for @{pendingPasswordReset.username}.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                            New password
                          </label>
                          <input
                            type="password"
                            value={newPasswordForm.password}
                            onChange={(e) => setNewPasswordForm({ ...newPasswordForm, password: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border outline-none"
                            style={{ borderColor: "#DDD8CC" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                            Confirm password
                          </label>
                          <input
                            type="password"
                            value={newPasswordForm.confirm}
                            onChange={(e) => setNewPasswordForm({ ...newPasswordForm, confirm: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border outline-none"
                            style={{ borderColor: "#DDD8CC" }}
                          />
                        </div>
                        {resetError && (
                          <p className="text-sm" style={{ color: BERRY }}>
                            {resetError}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={submitNewPassword}
                          className="w-full py-2.5 rounded-lg font-medium mt-1"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          Update password
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <h1 className="text-3xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                    {isSignUp ? "Create an account" : "Welcome back"}
                  </h1>
                  <p className="text-sm mb-6" style={{ color: SLATE }}>
                    {isSignUp
                      ? "Just a username, email, and password to get started — you can add the rest later."
                      : "Sign in to manage your stall and listings."}
                  </p>

                  <div className="space-y-3">
                    <input
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      placeholder="Username"
                      className="w-full px-3 py-2 rounded-lg border outline-none"
                      style={{ borderColor: "#DDD8CC" }}
                      autoCapitalize="none"
                    />
                    {isSignUp && (
                      <input
                        type="email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        placeholder="Email"
                        className="w-full px-3 py-2 rounded-lg border outline-none"
                        style={{ borderColor: "#DDD8CC" }}
                        autoCapitalize="none"
                      />
                    )}
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-lg border outline-none"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("forgot");
                          setAuthError("");
                          setResetIdentifier("");
                          setResetError("");
                        }}
                        className="text-xs font-medium underline"
                        style={{ color: SLATE }}
                      >
                        Forgot password?
                      </button>
                    )}
                    {authError && (
                      <p className="text-sm" style={{ color: BERRY }}>
                        {authError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => (isSignUp ? register() : login())}
                      className="w-full py-2.5 rounded-lg font-medium mt-1"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      {isSignUp ? "Continue" : "Sign in"}
                    </button>
                    <p className="text-xs text-center pt-1" style={{ color: SLATE }}>
                      Demo accounts — please don't reuse a real password, and don't enter your actual ID/passport number anywhere.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: CANVAS, fontFamily: "'Work Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: INK }} className="sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => {
              setSelected(null);
              setView("browse");
              if (window.location.pathname === ADMIN_SECRET_PATH) window.history.pushState({}, "", "/");
            }}
            className="flex items-center gap-2"
            aria-label="Go to home"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: MARIGOLD }}
            >
              <span style={{ fontFamily: "'DM Serif Display', serif", color: INK, fontSize: "16px" }}>S</span>
            </div>
            <h1
              className="text-2xl tracking-wide"
              style={{ fontFamily: "'DM Serif Display', serif", color: MARIGOLD }}
            >
              Stallyard
            </h1>
          </button>
          <nav className="flex items-center gap-1">
            <NavButton id="browse" icon={LayoutGrid} label="Browse" />
            <NavButton id="sell" icon={Plus} label="Sell" />
            <NavButton id="dashboard" icon={Store} label="My Stall" />
            {currentUser && <NavButton id="watchlist" icon={Heart} label="Watchlist" />}
            {currentUser && <NavButton id="wallet" icon={Wallet} label="Wallet" />}
            {currentUser && <NavButton id="messages" icon={MessageCircle} label="Messages" badge={unreadThreadsCount} />}
            <NavButton id="orders" icon={Receipt} label="Orders" />
            <NavButton id="help" icon={HelpCircle} label="Help" />
            {currentMember?.isAdmin && (
              <NavButton id="admin" icon={Shield} label="Admin" onClick={openAdminPanel} />
            )}
            {currentUser && (
              <button
                onClick={() => setNotifPanelOpen((o) => !o)}
                className="relative p-2 rounded-lg"
                style={{ color: "#C9CCD3" }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {notifications.some((n) => !n.read) && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center"
                    style={{ backgroundColor: BERRY, color: "white" }}
                  >
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ml-1"
              style={{ color: "#C9CCD3" }}
              aria-label="Open cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center"
                  style={{ backgroundColor: BERRY, color: "white" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            {currentUser ? (
              <div className="flex items-center gap-2 ml-1 pl-2" style={{ borderLeft: "1px solid #3A4351" }}>
                <span className="text-sm hidden sm:inline" style={{ color: "#C9CCD3" }}>
                  {currentMember?.displayName}
                </span>
                <button onClick={logout} aria-label="Log out" className="p-2 rounded-lg" style={{ color: "#C9CCD3" }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                  setAuthReturnView(view);
                  setView("signup");
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ml-1"
                style={{ backgroundColor: MARIGOLD, color: INK }}
              >
                <User size={16} />
                Log in
              </button>
            )}
          </nav>
        </div>
      </header>

      {notifPanelOpen && currentUser && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setNotifPanelOpen(false)}
        >
          <div
            className="absolute right-4 top-16 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border"
            style={{ borderColor: "#DDD8CC" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#EFEBE0" }}>
              <h3 className="text-sm font-semibold" style={{ color: INK }}>
                Notifications
              </h3>
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markNotificationsRead}
                  className="text-xs font-medium underline"
                  style={{ color: SLATE }}
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm p-4" style={{ color: SLATE }}>
                No notifications yet.
              </p>
            ) : (
              <div>
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.read && markNotificationRead(n.id)}
                    className="w-full text-left p-3 border-b text-sm"
                    style={{
                      borderColor: "#EFEBE0",
                      backgroundColor: n.read ? "white" : "#FBF0DC",
                      color: INK,
                    }}
                  >
                    <div>{n.message}</div>
                    <div className="text-xs mt-1" style={{ color: SLATE }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed top-4 right-4 z-30 px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white"
          style={{ backgroundColor: INK }}
        >
          {toast}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {content.banners
          .filter((b) => b.isActive)
          .map((b) =>
            b.mediaType === "image" && b.imageUrl ? (
              <div
                key={b.id}
                className="mb-4 rounded-lg overflow-hidden border"
                style={{ borderColor: "#DDD8CC" }}
              >
                <img src={b.imageUrl} alt="" className="w-full max-h-56 object-cover" />
                <div
                  className="px-4 py-3 text-sm font-medium"
                  style={{
                    backgroundColor:
                      b.tone === "alert" ? "#F9E4E2" : b.tone === "success" ? "#E7EFE8" : "#E3EDF4",
                    color: b.tone === "alert" ? BERRY : b.tone === "success" ? SAGE : "#3B6E8F",
                  }}
                >
                  {b.message}
                </div>
              </div>
            ) : b.mediaType === "video" && b.videoUrl ? (
              <div
                key={b.id}
                className="mb-4 rounded-lg overflow-hidden border"
                style={{ borderColor: "#DDD8CC" }}
              >
                <video src={b.videoUrl} controls className="w-full max-h-56 bg-black" />
                <div
                  className="px-4 py-3 text-sm font-medium"
                  style={{
                    backgroundColor:
                      b.tone === "alert" ? "#F9E4E2" : b.tone === "success" ? "#E7EFE8" : "#E3EDF4",
                    color: b.tone === "alert" ? BERRY : b.tone === "success" ? SAGE : "#3B6E8F",
                  }}
                >
                  {b.message}
                </div>
              </div>
            ) : (
              <div
                key={b.id}
                className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor:
                    b.tone === "alert" ? "#F9E4E2" : b.tone === "success" ? "#E7EFE8" : "#E3EDF4",
                  color: b.tone === "alert" ? BERRY : b.tone === "success" ? SAGE : "#3B6E8F",
                }}
              >
                {b.message}
              </div>
            )
          )}
        {membersLoaded && noAdminExists && currentUser && !currentMember?.isAdmin && (
          <div
            className="mb-6 p-4 rounded-lg border flex items-center justify-between gap-3 flex-wrap"
            style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}
          >
            <p className="text-sm" style={{ color: INK }}>
              This marketplace doesn't have an admin yet.
            </p>
            <button
              onClick={claimAdmin}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: INK, color: "white" }}
            >
              Claim admin access
            </button>
          </div>
        )}
        {view === "browse" && (
          <>
            {isHomeState && (
              <div className="text-center py-10 mb-8 rounded-2xl" style={{ backgroundColor: "#EFE7D6" }}>
                <h2
                  className="text-3xl sm:text-4xl mb-2 px-4"
                  style={{ fontFamily: "'DM Serif Display', serif", color: INK }}
                >
                  Find something good today
                </h2>
                <p className="text-sm mb-6" style={{ color: SLATE }}>
                  Handmade, vintage, and everyday finds from real sellers.
                </p>
                <div className="relative max-w-xl mx-auto px-4">
                  <Search
                    size={20}
                    className="absolute left-8 top-1/2 -translate-y-1/2"
                    style={{ color: SLATE }}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search the stalls..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-full border outline-none text-base shadow-sm"
                    style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}
                  />
                </div>
              </div>
            )}

            <div className="mb-10 -mx-1 overflow-x-auto">
              <div className="flex gap-4 px-1 pb-2" style={{ minWidth: "max-content" }}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(categoryFilter === c ? "All" : c)}
                    className="flex flex-col items-center gap-2 shrink-0"
                    style={{ width: "84px" }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-transform"
                      style={{
                        backgroundColor: categoryFilter === c ? CATEGORY_COLOR[c] : "white",
                        border: `2px solid ${categoryFilter === c ? CATEGORY_COLOR[c] : "#DDD8CC"}`,
                        transform: categoryFilter === c ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {CATEGORY_ICON[c]}
                    </div>
                    <span
                      className="text-xs text-center leading-tight"
                      style={{ color: categoryFilter === c ? INK : SLATE, fontWeight: categoryFilter === c ? 600 : 500 }}
                    >
                      {c}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {isHomeState && featuredPicks.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl mb-4" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                  Featured picks
                </h3>
                <div className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1">
                  {featuredPicks.map((l) => (
                    <div key={l.id} className="shrink-0" style={{ width: "260px" }}>
                      <PriceTagCard
                        listing={l}
                        rating={getListingRating(l.id)}
                        isSaved={watchlist.includes(l.id)}
                        onToggleWatchlist={toggleWatchlist}
                        onOpenStorefront={openStorefront}
                        now={nowTick}
                        onVacation={getSellerVacationInfo(l.ownerUsername)}
                        onOpen={(listing) => {
                          setActiveImg(0);
                          setSelected(listing);
                        }}
                        onAddToCart={addToCart}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isHomeState && newArrivals.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl mb-4" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                  New arrivals
                </h3>
                <div className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1">
                  {newArrivals.map((l) => (
                    <div key={l.id} className="shrink-0" style={{ width: "260px" }}>
                      <PriceTagCard
                        listing={l}
                        rating={getListingRating(l.id)}
                        isSaved={watchlist.includes(l.id)}
                        onToggleWatchlist={toggleWatchlist}
                        onOpenStorefront={openStorefront}
                        now={nowTick}
                        onVacation={getSellerVacationInfo(l.ownerUsername)}
                        onOpen={(listing) => {
                          setActiveImg(0);
                          setSelected(listing);
                        }}
                        onAddToCart={addToCart}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-xl mb-4" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              {isHomeState ? "Shop all" : "Results"}
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: SLATE }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search the stalls..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none focus:ring-2"
                  style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 rounded-lg border outline-none bg-white text-sm"
                style={{ borderColor: "#DDD8CC", color: INK }}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <button
                onClick={() => setFiltersOpen((f) => !f)}
                className="px-3 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap"
                style={{
                  borderColor: filtersOpen ? INK : "#DDD8CC",
                  backgroundColor: filtersOpen ? INK : "white",
                  color: filtersOpen ? "white" : SLATE,
                }}
              >
                Filters{(priceMin || priceMax || conditionFilter !== "All") ? " •" : ""}
              </button>
            </div>

            {filtersOpen && (
              <div className="flex flex-wrap items-end gap-4 mb-5 p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: SLATE }}>
                    Min price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="$0"
                    className="w-24 px-2 py-1.5 rounded-lg border outline-none text-sm"
                    style={{ borderColor: "#DDD8CC" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: SLATE }}>
                    Max price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Any"
                    className="w-24 px-2 py-1.5 rounded-lg border outline-none text-sm"
                    style={{ borderColor: "#DDD8CC" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: SLATE }}>
                    Condition
                  </label>
                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="px-2 py-1.5 rounded-lg border outline-none text-sm bg-white"
                    style={{ borderColor: "#DDD8CC" }}
                  >
                    <option value="All">All</option>
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {(priceMin || priceMax || conditionFilter !== "All") && (
                  <button
                    onClick={() => {
                      setPriceMin("");
                      setPriceMax("");
                      setConditionFilter("All");
                    }}
                    className="text-xs font-medium underline"
                    style={{ color: SLATE }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {categoryFilter !== "All" && (
              <button
                onClick={() => setCategoryFilter("All")}
                className="mb-6 text-xs font-medium underline"
                style={{ color: SLATE }}
              >
                ← Clear category ({categoryFilter})
              </button>
            )}

            {loaded && filtered.length === 0 && (
              <div className="text-center py-20">
                <PackageOpen size={40} className="mx-auto mb-3" style={{ color: SLATE }} />
                <p className="text-lg" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                  No stalls open in this aisle yet.
                </p>
                <p className="text-sm mt-1" style={{ color: SLATE }}>
                  Be the first to set one up.
                </p>
                <button
                  onClick={() => setView("sell")}
                  className="mt-4 px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  List something
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {filtered.map((l) => (
                <PriceTagCard
                  key={l.id}
                  listing={l}
                  rating={getListingRating(l.id)}
                  isSaved={watchlist.includes(l.id)}
                  onToggleWatchlist={toggleWatchlist}
                  onOpenStorefront={openStorefront}
                  now={nowTick}
                  onVacation={getSellerVacationInfo(l.ownerUsername)}
                  onOpen={(listing) => {
                    setActiveImg(0);
                    setSelected(listing);
                  }}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </>
        )}

        {view === "sell" && (
          <div className="max-w-xl">
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              {editingId ? "Edit your listing" : "Set up a listing"}
            </h2>
            <p className="text-sm mb-6" style={{ color: SLATE }}>
              Visible to everyone browsing Stallyard.
            </p>

            {!currentUser ? (
              <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}>
                <p className="text-sm mb-3" style={{ color: INK }}>
                  Register or log in to open your stall.
                </p>
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setAuthReturnView(view);
                    setView("signup");
                  }}
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Get started
                </button>
              </div>
            ) : (
              <p className="text-sm mb-6" style={{ color: SLATE }}>
                Selling as <strong style={{ color: INK }}>{currentMember.displayName}</strong>
                {currentMember.isVerified && <Tag color={SAGE}>Verified</Tag>}
              </p>
            )}

            {currentUser &&
              currentMember?.isApproved === false &&
              (currentMember?.verificationStatus === "none" || !currentMember?.verificationStatus) &&
              !currentMember?.hasAppliedToSell && (
              <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}>
                <p className="text-sm mb-2" style={{ color: INK }}>
                  Selling outside the US requires admin approval. Apply for a seller account to get started.
                </p>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1" style={{ color: INK }}>
                    Bank statement <span className="font-normal" style={{ color: SLATE }}>(optional, helps speed up review)</span>
                  </label>
                  {bankStatementDraft ? (
                    <div className="flex items-center gap-2 text-xs" style={{ color: SLATE }}>
                      <span>File attached</span>
                      <button
                        onClick={() => setBankStatementDraft(null)}
                        className="underline font-medium"
                        style={{ color: BERRY }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label
                      className="inline-block px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer"
                      style={{ borderColor: "#DDD8CC", backgroundColor: "white", color: INK }}
                    >
                      {uploadingBankStatement ? "Uploading…" : "Upload bank statement"}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleBankStatementSelect}
                        className="hidden"
                        disabled={uploadingBankStatement}
                      />
                    </label>
                  )}
                </div>
                <button
                  onClick={applyToSell}
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Apply for seller account
                </button>
              </div>
            )}

            {currentUser && currentMember?.isApproved === false && currentMember?.verificationStatus === "pending" && (
              <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}>
                <p className="text-sm flex items-center gap-2" style={{ color: INK }}>
                  <Tag color={MARIGOLD}>Pending</Tag>
                  Your seller application is under review. You'll be able to publish listings once approved.
                </p>
              </div>
            )}

            {currentUser && currentMember?.isApproved === false && currentMember?.verificationStatus === "rejected" && (
              <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: BERRY, backgroundColor: "#FBEAEA" }}>
                <p className="text-sm mb-1 flex items-center gap-2" style={{ color: INK }}>
                  <Tag color={BERRY}>Rejected</Tag>
                  Your seller application wasn't approved.
                </p>
                {currentMember?.rejectionReason && (
                  <p className="text-xs mb-2" style={{ color: SLATE }}>
                    Reason: {currentMember.rejectionReason}
                  </p>
                )}
                <button
                  onClick={applyToSell}
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Re-apply
                </button>
              </div>
            )}

            {currentUser && needsIdVerification && (
              <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}>
                <p className="text-sm mb-2" style={{ color: INK }}>
                  You've crossed ${ID_VERIFICATION_SALES_THRESHOLD.toLocaleString()} in sales. Add ID verification to keep publishing and editing listings.
                </p>
                <button
                  onClick={() => setIdVerifyOpen(true)}
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Add ID verification
                </button>
              </div>
            )}

            {(!currentUser || (currentMember?.isApproved !== false && !needsIdVerification)) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}
                  placeholder="Hand-thrown ceramic mug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border outline-none resize-none"
                  style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}
                  placeholder="Tell buyers what makes it worth a look"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Listing type
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "fixed", label: "Fixed price" },
                    ...(isUnitedStates(currentMember?.country) ? [] : [{ id: "auction", label: "Auction" }]),
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!!editingId}
                      onClick={() => setForm({ ...form, listingType: opt.id })}
                      className="px-3 py-1.5 rounded-full text-sm font-medium border disabled:opacity-50"
                      style={{
                        borderColor: form.listingType === opt.id ? INK : "#DDD8CC",
                        backgroundColor: form.listingType === opt.id ? INK : "white",
                        color: form.listingType === opt.id ? "white" : SLATE,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {editingId && (
                  <p className="text-xs mt-1" style={{ color: SLATE }}>
                    Listing type can't be changed after publishing.
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    {form.listingType === "auction" ? "Starting bid" : "Price"}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="px-2 py-2 rounded-lg border outline-none bg-white text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    >
                      {Object.entries(CURRENCIES).map(([code, c]) => (
                        <option key={code} value={code}>
                          {c.symbol} {code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border outline-none"
                      style={{ borderColor: "#DDD8CC", backgroundColor: "white", fontFamily: "'IBM Plex Mono', monospace" }}
                      placeholder="24.00"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                        emoji:
                          e.target.value === "Auto Parts" && form.emoji === "📦"
                            ? "🔧"
                            : e.target.value === "Groceries" && form.emoji === "📦"
                            ? "🛒"
                            : form.emoji,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                    style={{ borderColor: "#DDD8CC" }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Quantity available <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}
                    placeholder="1"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    SKU / part number <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                  </label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}
                    placeholder="e.g. SKU-1024"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Brand <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                  </label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}
                    placeholder="e.g. Samsung"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Shipping fee
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ color: SLATE }}>{CURRENCIES[form.currency]?.symbol || "$"}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.shippingFee}
                    onChange={(e) => setForm({ ...form, shippingFee: e.target.value })}
                    className="w-32 px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: "#DDD8CC", backgroundColor: "white", fontFamily: "'IBM Plex Mono', monospace" }}
                    placeholder="0.00"
                  />
                  <span className="text-xs" style={{ color: SLATE }}>
                    Leave at 0 for free shipping. Charged once per line, not per quantity.
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Condition
                </label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                  style={{ borderColor: "#DDD8CC" }}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Location <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                </label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                  style={{ borderColor: "#DDD8CC" }}
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: INK }}>
                  Shipping options <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {SHIPPING_METHODS.map((m) => (
                    <label key={m.value} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                      <input
                        type="checkbox"
                        checked={form.shippingMethods.includes(m.value)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            shippingMethods: e.target.checked
                              ? [...form.shippingMethods, m.value]
                              : form.shippingMethods.filter((v) => v !== m.value),
                          })
                        }
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Return policy <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                </label>
                <select
                  value={form.returnPolicy}
                  onChange={(e) => setForm({ ...form, returnPolicy: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                  style={{ borderColor: "#DDD8CC" }}
                >
                  <option value="">Not specified</option>
                  {RETURN_POLICIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              {form.listingType === "auction" && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Auction duration
                  </label>
                  <select
                    value={form.auctionDurationDays}
                    onChange={(e) => setForm({ ...form, auctionDurationDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                    style={{ borderColor: "#DDD8CC" }}
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">7 days</option>
                    <option value="10">10 days</option>
                  </select>
                  {!currentMember?.isAdmin && (
                    <p className="text-xs mt-1" style={{ color: SLATE }}>
                      Auctions always go through admin review before going live.
                    </p>
                  )}
                </div>
              )}
              {form.category === "Auto Parts" && (
                <div className="p-4 rounded-lg border" style={{ borderColor: "#DDD8CC", backgroundColor: "white" }}>
                  <label className="block text-sm font-medium mb-2" style={{ color: INK }}>
                    Fits which vehicle?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={form.fitMake}
                      onChange={(e) => setForm({ ...form, fitMake: e.target.value })}
                      placeholder="Make"
                      className="px-3 py-2 rounded-lg border outline-none"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <input
                      value={form.fitModel}
                      onChange={(e) => setForm({ ...form, fitModel: e.target.value })}
                      placeholder="Model"
                      className="px-3 py-2 rounded-lg border outline-none"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <input
                      value={form.fitYear}
                      onChange={(e) => setForm({ ...form, fitYear: e.target.value })}
                      placeholder="Year(s)"
                      className="px-3 py-2 rounded-lg border outline-none"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                  </div>
                  <p className="text-xs mt-2" style={{ color: SLATE }}>
                    e.g. Honda / Civic / 2016–2021
                  </p>
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                      VIN <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                    </label>
                    <input
                      value={form.vin}
                      onChange={(e) => setForm({ ...form, vin: e.target.value })}
                      placeholder="Vehicle identification number"
                      className="w-full px-3 py-2 rounded-lg border outline-none"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: INK }}>
                  Photos ({form.images.length}/5)
                </label>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.images.map((src, idx) => (
                      <div key={idx} className="relative w-20 h-20">
                        <img
                          src={src}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: BERRY }}
                          aria-label="Remove photo"
                        >
                          <X size={14} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length < 5 && (
                  <label
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                    style={{ borderColor: "#DDD8CC", color: SLATE, backgroundColor: "white" }}
                  >
                    {uploading ? "Processing..." : "Add photos"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs mt-2" style={{ color: SLATE }}>
                  Up to 5 photos. First one is the cover photo.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: INK }}>
                  Icon <span className="font-normal" style={{ color: SLATE }}>(shown if no photos)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_CHOICES.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setForm({ ...form, emoji: em })}
                      className="w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2"
                      style={{
                        borderColor: form.emoji === em ? MARIGOLD : "#DDD8CC",
                        backgroundColor: "white",
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2 flex-wrap">
                {(!editingId || listings.find((l) => l.id === editingId)?.status === "draft") && (
                  <button
                    type="button"
                    onClick={() => handleSubmit("draft")}
                    className="px-5 py-2.5 rounded-lg font-medium border"
                    style={{ borderColor: "#DDD8CC", color: INK, backgroundColor: "white" }}
                  >
                    Save as draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const isDraftFlow = !editingId || listings.find((l) => l.id === editingId)?.status === "draft";
                    if (isDraftFlow) {
                      if (!form.title.trim()) {
                        showToast("Give it a title first");
                        return;
                      }
                      setPreviewOpen(true);
                    } else {
                      handleSubmit("publish");
                    }
                  }}
                  className="px-5 py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  {editingId && listings.find((l) => l.id === editingId)?.status !== "draft" ? "Save changes" : "Preview"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-lg font-medium border"
                    style={{ borderColor: "#DDD8CC", color: SLATE }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            )}
          </div>
        )}

        {view === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <h2 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                My Stall
              </h2>
              {currentUser && currentMember?.isApproved !== false && (
                <button
                  onClick={() => {
                    resetForm();
                    setView("sell");
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  <Plus size={16} />
                  List new item
                </button>
              )}
            </div>
            {currentUser &&
              currentMember?.isApproved === false &&
              (currentMember?.verificationStatus === "none" || !currentMember?.verificationStatus) &&
              !currentMember?.hasAppliedToSell && (
              <div
                className="mb-4 p-4 rounded-lg border flex items-center justify-between gap-3 flex-wrap"
                style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}
              >
                <p className="text-sm" style={{ color: INK }}>
                  Selling outside the US requires admin approval.
                </p>
                <button
                  onClick={applyToSell}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Apply for seller account
                </button>
              </div>
            )}
            {currentUser && currentMember?.isApproved === false && currentMember?.verificationStatus === "pending" && (
              <div
                className="mb-4 p-4 rounded-lg border"
                style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}
              >
                <p className="text-sm flex items-center gap-2" style={{ color: INK }}>
                  <Tag color={MARIGOLD}>Pending</Tag>
                  Your seller application is under review.
                </p>
              </div>
            )}
            {currentUser && currentMember?.isApproved === false && currentMember?.verificationStatus === "rejected" && (
              <div
                className="mb-4 p-4 rounded-lg border flex items-center justify-between gap-3 flex-wrap"
                style={{ borderColor: BERRY, backgroundColor: "#FBEAEA" }}
              >
                <p className="text-sm flex items-center gap-2" style={{ color: INK }}>
                  <Tag color={BERRY}>Rejected</Tag>
                  Your seller application wasn't approved.
                </p>
                <button
                  onClick={applyToSell}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Re-apply
                </button>
              </div>
            )}
            {currentUser && needsIdVerification && (
              <div
                className="mb-4 p-4 rounded-lg border flex items-center justify-between gap-3 flex-wrap"
                style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}
              >
                <p className="text-sm" style={{ color: INK }}>
                  You've crossed ${ID_VERIFICATION_SALES_THRESHOLD.toLocaleString()} in sales — add ID verification to keep listing.
                </p>
                <button
                  onClick={() => setIdVerifyOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Add ID verification
                </button>
              </div>
            )}
            {!currentUser ? (
              <p className="text-sm mt-2" style={{ color: SLATE }}>
                Register or log in from the Sell tab to open your stall.
              </p>
            ) : (
              <>
                {currentMember?.idCountry ? (
                  <p className="text-xs mt-1" style={{ color: SAGE }}>
                    ID on file: {currentMember.idType} ({currentMember.idCountry})
                  </p>
                ) : currentMember?.idVerificationExempt ? (
                  <p className="text-xs mt-1" style={{ color: SLATE }}>
                    ID verification not required (US resident)
                  </p>
                ) : null}
                <h3 className="text-sm font-semibold mb-3 mt-4" style={{ color: INK }}>
                  Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                      {myListings.length}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      active listings
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: SAGE }}>
                      ${myListings.reduce((s, l) => s + Number(l.price), 0).toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      total inventory value
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                      ${totalSalesRevenue.toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      total sales ({mySales.length} order{mySales.length === 1 ? "" : "s"})
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3B6E8F" }}>
                      {ordersWaitingToShip}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      waiting to ship
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6B8F71" }}>
                      {ordersInTransit}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      in transit
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#2F6B3A" }}>
                      {completedOrdersCount}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      completed
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: BERRY }}>
                      {activeReturnsDisputes}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      returns/disputes
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white mb-8" style={{ borderColor: "#DDD8CC" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                    Seller performance
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <div
                        className="text-xl font-semibold"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          color: cancellationRate === null || cancellationRate <= 5 ? SAGE : cancellationRate <= 15 ? MARIGOLD : BERRY,
                        }}
                      >
                        {cancellationRate === null ? "—" : `${cancellationRate}%`}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        cancellation rate
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xl font-semibold"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          color: returnRate === null || returnRate <= 5 ? SAGE : returnRate <= 15 ? MARIGOLD : BERRY,
                        }}
                      >
                        {returnRate === null ? "—" : `${returnRate}%`}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        return rate
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xl font-semibold"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          color: disputeRate === null || disputeRate === 0 ? SAGE : disputeRate <= 10 ? MARIGOLD : BERRY,
                        }}
                      >
                        {disputeRate === null ? "—" : `${disputeRate}%`}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        dispute rate
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xl font-semibold"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          color: onTimeShippingRate === null || onTimeShippingRate >= 90 ? SAGE : onTimeShippingRate >= 70 ? MARIGOLD : BERRY,
                        }}
                      >
                        {onTimeShippingRate === null ? "—" : `${onTimeShippingRate}%`}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        on-time shipping
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mt-3" style={{ color: SLATE }}>
                    On-time shipping counts items marked Shipped within 48 hours of the sale.
                  </p>
                </div>

                {myWarnings.length > 0 && (
                  <div className="p-4 rounded-lg border bg-white mb-8" style={{ borderColor: BERRY }}>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: INK }}>
                      Warnings <Tag color={BERRY}>{myWarnings.length}</Tag>
                    </h3>
                    <div className="space-y-2">
                      {myWarnings.map((w) => (
                        <div key={w.id} className="text-sm p-3 rounded-lg" style={{ backgroundColor: "#FBEAEA", color: INK }}>
                          {w.message}
                          <div className="text-xs mt-1" style={{ color: SLATE }}>
                            {new Date(w.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-lg border bg-white mb-8" style={{ borderColor: "#DDD8CC" }}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: INK }}>
                      Balance
                    </h3>
                    <button
                      onClick={() => setView("wallet")}
                      className="text-xs font-medium underline"
                      style={{ color: SLATE }}
                    >
                      View full wallet →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <div
                        className="text-xl font-semibold"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: SAGE }}
                      >
                        ${walletNetAvailable.toFixed(2)}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        available
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xl font-semibold"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: MARIGOLD }}
                      >
                        ${walletHeld.toFixed(2)}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        on hold
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xl font-semibold"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                      >
                        {myWithdrawals.filter((w) => w.status === "processing").length}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        pending requests
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: SLATE }}>$</span>
                    <input
                      type="number"
                      min="0"
                      max={walletNetAvailable}
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={walletNetAvailable.toFixed(2)}
                      className="w-28 px-3 py-1.5 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <button
                      onClick={async () => {
                        await requestWithdrawal(withdrawAmount || walletNetAvailable);
                        setWithdrawAmount("");
                      }}
                      disabled={walletNetAvailable <= 0}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      Request withdrawal
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white mb-8" style={{ borderColor: "#DDD8CC" }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: INK }}>
                    Upcoming payouts
                  </h3>
                  {myWithdrawals.filter((w) => w.status === "processing").length === 0 ? (
                    <p className="text-xs" style={{ color: SLATE }}>
                      No payouts in progress right now.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {myWithdrawals
                        .filter((w) => w.status === "processing")
                        .slice(0, 5)
                        .map((w) => (
                          <div key={w.id} className="flex items-center justify-between text-sm">
                            <span style={{ color: INK }}>
                              ${Number(w.amount).toFixed(2)} to your bank
                            </span>
                            <span className="text-xs" style={{ color: SLATE }}>
                              Requested {new Date(w.requestedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg border bg-white mb-8" style={{ borderColor: "#DDD8CC" }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: INK }}>
                      Recent activity
                    </h3>
                    <button
                      onClick={() => setView("orders")}
                      className="text-xs font-medium underline"
                      style={{ color: SLATE }}
                    >
                      View all orders →
                    </button>
                  </div>
                  {myRecentActivity.length === 0 ? (
                    <p className="text-xs" style={{ color: SLATE }}>
                      Nothing to show yet — activity will appear here once you make a sale.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {myRecentActivity.map((n) => (
                        <div key={n.id} className="text-sm" style={{ color: INK }}>
                          {n.message}
                          <span className="text-xs ml-2" style={{ color: SLATE }}>
                            {new Date(n.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg border bg-white mb-8" style={{ borderColor: "#DDD8CC" }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: INK }}>
                        🌴 Vacation mode
                        {currentMember?.vacationMode && <Tag color={MARIGOLD}>On</Tag>}
                      </h3>
                      {currentMember?.vacationMode ? (
                        <p className="text-xs mt-1" style={{ color: SLATE }}>
                          Buyers see a notice on your listings
                          {currentMember.vacationReturnDate
                            ? ` that you're back on ${new Date(currentMember.vacationReturnDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                            : ""}
                          .
                        </p>
                      ) : (
                        <p className="text-xs mt-1" style={{ color: SLATE }}>
                          Let buyers know if you'll be slow to ship.
                        </p>
                      )}
                    </div>
                    {currentMember?.vacationMode ? (
                      <button
                        onClick={endVacation}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border"
                        style={{ borderColor: "#DDD8CC", color: SLATE }}
                      >
                        Turn off
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setVacationForm({ returnDate: "", message: "" });
                          setVacationOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: MARIGOLD, color: INK }}
                      >
                        Turn on
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                  {LISTING_MANAGE_TABS.map((t) => {
                    const count =
                      t.key === "all" ? myListings.length : myListings.filter((l) => l.status === t.key).length;
                    if (t.key !== "all" && count === 0) return null;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setManageListingsTab(t.key)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
                        style={{
                          backgroundColor: manageListingsTab === t.key ? INK : "white",
                          color: manageListingsTab === t.key ? "white" : SLATE,
                          border: `1px solid ${manageListingsTab === t.key ? INK : "#DDD8CC"}`,
                        }}
                      >
                        {t.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {myListings.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    Your stall is empty.{" "}
                    <button onClick={() => setView("sell")} className="underline" style={{ color: INK }}>
                      List your first item
                    </button>
                    .
                  </p>
                ) : filteredMyListings.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    Nothing in this tab.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredMyListings.map((l) => (
                      <div
                        key={l.id}
                        className="p-3 rounded-lg border bg-white"
                        style={{ borderColor: "#DDD8CC" }}
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl">{l.emoji}</span>
                            <div className="min-w-0">
                              <div className="font-medium truncate flex items-center gap-2" style={{ color: INK }}>
                                {l.title}
                                {l.isFeatured && <Tag color={MARIGOLD}>Featured</Tag>}
                                {l.status === "draft" && <Tag color={SLATE}>Draft</Tag>}
                                {l.status === "pending" && <Tag color={MARIGOLD}>Pending review</Tag>}
                                {l.status === "paused" && <Tag color={SLATE}>Paused</Tag>}
                                {l.status === "sold" && <Tag color={BERRY}>Sold out</Tag>}
                                {l.status === "rejected" && <Tag color={BERRY}>Rejected</Tag>}
                                {l.status === "removed" && <Tag color={BERRY}>Taken down</Tag>}
                              </div>
                              <div className="text-xs" style={{ color: SLATE }}>
                                {l.category}
                                {l.condition && l.condition !== "New" ? ` · ${l.condition}` : ""}
                                {l.quantity !== "" && l.quantity != null ? ` · Qty: ${l.quantity}` : ""}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                            <span
                              style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                              className="font-medium"
                            >
                              ${Number(l.price).toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                if (quickEditId === l.id) {
                                  setQuickEditId(null);
                                } else {
                                  setQuickEditId(l.id);
                                  setQuickEditDraft({
                                    price: String(l.price ?? ""),
                                    quantity: l.quantity != null ? String(l.quantity) : "",
                                  });
                                }
                              }}
                              className="text-xs font-medium underline"
                              style={{ color: SLATE }}
                            >
                              {quickEditId === l.id ? "Close" : "Quick edit"}
                            </button>
                            {l.status === "approved" && (
                              <button
                                onClick={() => pauseListing(l.id)}
                                className="text-xs font-medium underline"
                                style={{ color: SLATE }}
                              >
                                Pause
                              </button>
                            )}
                            {l.status === "paused" && (
                              <button
                                onClick={() => resumeListing(l.id)}
                                className="text-xs font-medium underline"
                                style={{ color: SAGE }}
                              >
                                Resume
                              </button>
                            )}
                            {l.status === "approved" && (
                              <button
                                onClick={() => markListingSoldOut(l.id)}
                                className="text-xs font-medium underline"
                                style={{ color: SLATE }}
                              >
                                Mark out of stock
                              </button>
                            )}
                            {l.status === "sold" && (
                              <button
                                onClick={() => markListingInStock(l.id)}
                                className="text-xs font-medium underline"
                                style={{ color: SAGE }}
                              >
                                Mark in stock
                              </button>
                            )}
                            <button
                              onClick={() => duplicateListing(l)}
                              className="text-xs font-medium underline"
                              style={{ color: SLATE }}
                            >
                              Duplicate
                            </button>
                            <button onClick={() => startEdit(l)} aria-label="Edit">
                              <Pencil size={16} style={{ color: SLATE }} />
                            </button>
                            <button onClick={() => deleteListing(l.id)} aria-label="Delete">
                              <Trash2 size={16} style={{ color: BERRY }} />
                            </button>
                          </div>
                        </div>
                        {quickEditId === l.id && (
                          <div
                            className="mt-3 pt-3 flex items-end gap-3 flex-wrap"
                            style={{ borderTop: "1px solid #EFEBE0" }}
                          >
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: INK }}>
                                Price
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={quickEditDraft.price}
                                onChange={(e) => setQuickEditDraft((d) => ({ ...d, price: e.target.value }))}
                                className="w-28 px-2 py-1.5 rounded-lg border outline-none text-sm"
                                style={{ borderColor: "#DDD8CC" }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: INK }}>
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={quickEditDraft.quantity}
                                onChange={(e) => setQuickEditDraft((d) => ({ ...d, quantity: e.target.value }))}
                                className="w-24 px-2 py-1.5 rounded-lg border outline-none text-sm"
                                style={{ borderColor: "#DDD8CC" }}
                              />
                            </div>
                            <button
                              onClick={async () => {
                                await quickUpdateListing(l.id, {
                                  price: quickEditDraft.price,
                                  quantity: quickEditDraft.quantity,
                                });
                                setQuickEditId(null);
                              }}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium"
                              style={{ backgroundColor: MARIGOLD, color: INK }}
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="text-lg font-semibold mt-10 mb-3" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
                  Sales
                </h3>
                {mySales.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                    {SALES_TABS.map((t) => {
                      const count =
                        t.key === "all"
                          ? mySales.length
                          : mySales.filter((o) => getSellerOrderStatus(o, currentUser) === t.key).length;
                      if (t.key !== "all" && count === 0) return null;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setSalesTab(t.key)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
                          style={{
                            backgroundColor: salesTab === t.key ? INK : "white",
                            color: salesTab === t.key ? "white" : SLATE,
                            border: `1px solid ${salesTab === t.key ? INK : "#DDD8CC"}`,
                          }}
                        >
                          {t.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}
                {mySales.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No sales yet.
                  </p>
                ) : filteredMySales.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    Nothing in this tab.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredMySales.map((o) => {
                      const myItems = o.items.filter((i) => i.ownerUsername === currentUser);
                      const myRevenue = myItems.reduce((s, i) => s + i.price * i.qty, 0);
                      return (
                        <div key={o.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium flex items-center gap-2" style={{ color: INK }}>
                              {o.buyerName}
                              {o.paymentStatus === "held" && <Tag color={MARIGOLD}>Held</Tag>}
                              {o.paymentStatus === "released" && <Tag color={SAGE}>Released</Tag>}
                              {o.paymentStatus === "refunded" && <Tag color={BERRY}>Refunded</Tag>}
                            </span>
                            <span
                              className="text-sm font-semibold"
                              style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                            >
                              ${myRevenue.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs mb-2 flex items-center gap-2" style={{ color: SLATE }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                              {orderNumber(o.id)}
                            </span>
                            · {new Date(o.createdAt).toLocaleString()}
                            <button
                              onClick={() => setPackingSlipOrder(o)}
                              className="text-xs font-medium underline ml-auto"
                              style={{ color: INK }}
                            >
                              Print packing slip
                            </button>
                          </div>
                          {o.shippingAddress && (
                            <div
                              className="text-xs mb-3 p-2 rounded-lg"
                              style={{ backgroundColor: CANVAS, color: INK }}
                            >
                              <span className="font-medium">Ship to:</span> {o.shippingAddress.fullName},{" "}
                              {o.shippingAddress.street}, {o.shippingAddress.city}
                              {o.shippingAddress.state ? `, ${o.shippingAddress.state}` : ""}{" "}
                              {o.shippingAddress.zip}, {o.shippingAddress.country}
                            </div>
                          )}
                          <div className="space-y-2">
                            {myItems.map((i) => {
                              const trackKey = `${o.id}-${i.id}`;
                              const trackDraft =
                                trackingDrafts[trackKey] !== undefined
                                  ? trackingDrafts[trackKey]
                                  : i.trackingNumber || "";
                              return (
                                <div
                                  key={i.id}
                                  className="text-xs pt-2 border-t"
                                  style={{ borderColor: "#EFEBE0", color: SLATE }}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span>
                                      {i.title} × {i.qty}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                      <Tag color={FULFILLMENT_COLOR[i.fulfillmentStatus] || FULFILLMENT_COLOR.new}>
                                        {FULFILLMENT_LABEL[i.fulfillmentStatus] || "New"}
                                      </Tag>
                                      {i.buyerConfirmedAt && <Tag color={SAGE}>Buyer confirmed</Tag>}
                                      <select
                                        value={i.fulfillmentStatus || "new"}
                                        onChange={(e) => updateItemFulfillment(o.id, i.id, e.target.value)}
                                        className="px-2 py-1 rounded-lg border outline-none text-xs"
                                        style={{ borderColor: "#DDD8CC", color: INK }}
                                      >
                                        <option value="new">New</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="returned">Returned</option>
                                      </select>
                                    </div>
                                  </div>
                                  {(i.fulfillmentStatus === "shipped" || i.fulfillmentStatus === "delivered") && (
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      <select
                                        value={i.carrier || ""}
                                        onChange={(e) => updateItemCarrier(o.id, i.id, e.target.value)}
                                        className="px-2 py-1 rounded-lg border outline-none text-xs bg-white"
                                        style={{ borderColor: "#DDD8CC", color: INK }}
                                      >
                                        <option value="">Carrier (optional)</option>
                                        {SHIPPING_CARRIERS.map((c) => (
                                          <option key={c} value={c}>
                                            {c}
                                          </option>
                                        ))}
                                      </select>
                                      <input
                                        value={trackDraft}
                                        onChange={(e) =>
                                          setTrackingDrafts((d) => ({ ...d, [trackKey]: e.target.value }))
                                        }
                                        placeholder="Tracking number (optional)"
                                        className="flex-1 px-2 py-1 rounded-lg border outline-none text-xs"
                                        style={{ borderColor: "#DDD8CC" }}
                                      />
                                      <button
                                        onClick={async () => {
                                          await updateItemTracking(o.id, i.id, trackDraft.trim());
                                          setTrackingDrafts((d) => {
                                            const next = { ...d };
                                            delete next[trackKey];
                                            return next;
                                          });
                                        }}
                                        className="px-2 py-1 rounded-lg text-xs font-medium"
                                        style={{ backgroundColor: MARIGOLD, color: INK }}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  )}
                                  {i.fulfillmentStatus === "delivered" && (
                                    <div className="mt-2">
                                      <div className="text-xs font-medium mb-1" style={{ color: INK }}>
                                        Proof of delivery
                                      </div>
                                      {i.proofOfDeliveryUrl ? (
                                        <a href={i.proofOfDeliveryUrl} target="_blank" rel="noreferrer">
                                          <img
                                            src={i.proofOfDeliveryUrl}
                                            alt="Proof of delivery"
                                            className="w-20 h-20 object-cover rounded-lg border"
                                            style={{ borderColor: "#DDD8CC" }}
                                          />
                                        </a>
                                      ) : (
                                        <label
                                          className="inline-block px-2 py-1 rounded-lg border text-xs font-medium cursor-pointer"
                                          style={{ borderColor: "#DDD8CC", backgroundColor: "white", color: INK }}
                                        >
                                          {uploadingPodKey === trackKey ? "Uploading…" : "Add photo (optional)"}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleProofOfDeliverySelect(e, o.id, i.id)}
                                            className="hidden"
                                            disabled={uploadingPodKey === trackKey}
                                          />
                                        </label>
                                      )}
                                    </div>
                                  )}
                                  {(i.fulfillmentStatus === "shipped" || i.fulfillmentStatus === "delivered") &&
                                    (i.buyerConfirmedAt ? (
                                      <div className="mt-2">
                                        <Tag color={SAGE}>Delivery confirmed — payment released</Tag>
                                      </div>
                                    ) : (
                                      <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: CANVAS }}>
                                        <div className="text-xs font-medium mb-1" style={{ color: INK }}>
                                          Buyer's delivery code
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <input
                                            value={redeemTokenDrafts[i.id] || ""}
                                            onChange={(e) =>
                                              setRedeemTokenDrafts((d) => ({ ...d, [i.id]: e.target.value }))
                                            }
                                            placeholder="10-digit code from buyer"
                                            maxLength={10}
                                            className="px-2 py-1 rounded-lg border outline-none text-xs w-36"
                                            style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                                          />
                                          <button
                                            onClick={() =>
                                              redeemDeliveryToken(o.id, i.id, (redeemTokenDrafts[i.id] || "").trim())
                                            }
                                            disabled={redeemingTokenKey === i.id || !(redeemTokenDrafts[i.id] || "").trim()}
                                            className="px-2 py-1 rounded-lg text-xs font-medium disabled:opacity-50"
                                            style={{ backgroundColor: MARIGOLD, color: INK }}
                                          >
                                            {redeemingTokenKey === i.id ? "Checking…" : "Release payment"}
                                          </button>
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: SLATE }}>
                                          Ask the buyer for the 10-digit code they generated after delivery.
                                        </p>
                                      </div>
                                    ))}
                                  {i.returnStatus === "requested" && (
                                    <div
                                      className="mt-2 p-2 rounded-lg"
                                      style={{ backgroundColor: "#FBF0DC" }}
                                    >
                                      <div className="mb-1" style={{ color: INK }}>
                                        <span className="font-medium">Return requested:</span> {i.returnReason}
                                        {i.returnNote ? ` — "${i.returnNote}"` : ""}
                                      </div>
                                      {i.returnEvidenceUrls && i.returnEvidenceUrls.length > 0 && (
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                          {i.returnEvidenceUrls.map((url, idx) => (
                                            <a key={idx} href={url} target="_blank" rel="noreferrer">
                                              <img
                                                src={url}
                                                alt={`Evidence ${idx + 1}`}
                                                className="w-14 h-14 object-cover rounded-lg border"
                                                style={{ borderColor: "#DDD8CC" }}
                                              />
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={() => approveReturn(o.id, i.id)}
                                          className="text-xs font-medium underline"
                                          style={{ color: SAGE }}
                                        >
                                          Approve return
                                        </button>
                                        <button
                                          onClick={() => denyReturn(o.id, i.id)}
                                          className="text-xs font-medium underline"
                                          style={{ color: BERRY }}
                                        >
                                          Deny
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {i.returnStatus === "approved" && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <Tag color={SAGE}>Return approved</Tag>
                                        {o.paymentStatus === "held" && (
                                          <button
                                            onClick={() => refundOrder(o.id)}
                                            className="text-xs font-medium underline"
                                            style={{ color: BERRY }}
                                          >
                                            Refund buyer
                                          </button>
                                        )}
                                      </div>
                                      {i.returnTrackingNumber ? (
                                        <div className="text-xs" style={{ color: SLATE }}>
                                          Buyer's return tracking:{" "}
                                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                                            {i.returnTrackingNumber}
                                          </span>{" "}
                                          <a
                                            href={buildTrackingUrl(i.returnTrackingNumber)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline font-medium"
                                            style={{ color: MARIGOLD }}
                                          >
                                            Track →
                                          </a>
                                        </div>
                                      ) : (
                                        <div className="text-xs" style={{ color: SLATE }}>
                                          Waiting on buyer to add return tracking.
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {i.returnStatus === "denied" && (
                                    <div className="mt-2">
                                      <Tag color={BERRY}>Return denied</Tag>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-xs pt-1" style={{ color: SLATE }}>
                      Amounts shown are your gross sales before the marketplace commission. Payout status is tracked per order in the admin dashboard.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === "orders" && (
          <div>
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Your orders
            </h2>
            {!currentUser ? (
              <p className="text-sm mt-2" style={{ color: SLATE }}>
                Log in to see your order history.
              </p>
            ) : myOrders.length === 0 ? (
              <p className="text-sm mt-2" style={{ color: SLATE }}>
                No orders yet. Anything you buy will show up here.
              </p>
            ) : (
              <div className="space-y-4 mt-4">
                {myOrders.map((o) => (
                  <div key={o.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-medium"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                      >
                        {orderNumber(o.id)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs" style={{ color: SLATE }}>
                        {new Date(o.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                      >
                        {formatMoney(o.total, o.currency)}
                      </span>
                    </div>
                    {o.shippingAddress && (
                      <div className="text-xs mb-3" style={{ color: SLATE }}>
                        Shipping to: {o.shippingAddress.street}, {o.shippingAddress.city}
                        {o.shippingAddress.state ? `, ${o.shippingAddress.state}` : ""} {o.shippingAddress.zip}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {o.items.map((item, idx) => {
                        const existingReview = getReviewFor(o.id, item.id);
                        const draftKey = `${o.id}-${item.id}`;
                        const draft = reviewDrafts[draftKey] || {
                          rating: existingReview?.rating || 0,
                          comment: existingReview?.comment || "",
                        };
                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between text-sm gap-2">
                              <span className="flex items-center gap-2 min-w-0" style={{ color: INK }}>
                                <span>{item.emoji}</span>
                                <span className="truncate">
                                  {item.title} {item.qty > 1 ? `×${item.qty}` : ""}
                                </span>
                              </span>
                              <span className="flex items-center gap-2 shrink-0">
                                {item.fulfillmentStatus && (
                                  <Tag color={FULFILLMENT_COLOR[item.fulfillmentStatus] || FULFILLMENT_COLOR.new}>
                                    {FULFILLMENT_LABEL[item.fulfillmentStatus] || "New"}
                                  </Tag>
                                )}
                                <span
                                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: SLATE }}
                                >
                                  {formatMoney(item.price * item.qty, item.currency)}
                                </span>
                              </span>
                            </div>

                            <div className="pl-6 mt-2 mb-2">
                              <TrackingTimeline
                                item={item}
                                orderCreatedAt={o.createdAt}
                                ink={INK}
                                slate={SLATE}
                                sage={SAGE}
                                berry={BERRY}
                              />
                              <button
                                onClick={() =>
                                  startOrOpenThread(
                                    { id: item.listingId, ownerUsername: item.ownerUsername, sellerName: item.sellerName },
                                    o.id
                                  )
                                }
                                className="text-xs font-medium underline mt-2 inline-block"
                                style={{ color: INK }}
                              >
                                Message seller about this order
                              </button>
                              {(item.fulfillmentStatus === "shipped" || item.fulfillmentStatus === "delivered") && item.trackingNumber && (
                                <div className="text-xs mt-2" style={{ color: SLATE }}>
                                  {item.carrier ? `${item.carrier} tracking: ` : "Tracking: "}
                                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                                    {item.trackingNumber}
                                  </span>{" "}
                                  <a
                                    href={buildTrackingUrl(item.trackingNumber)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline font-medium"
                                    style={{ color: MARIGOLD }}
                                  >
                                    Track package →
                                  </a>
                                </div>
                              )}
                              {item.fulfillmentStatus === "delivered" && item.proofOfDeliveryUrl && (
                                <div className="mt-2">
                                  <div className="text-xs mb-1" style={{ color: SLATE }}>
                                    Proof of delivery:
                                  </div>
                                  <a href={item.proofOfDeliveryUrl} target="_blank" rel="noreferrer">
                                    <img
                                      src={item.proofOfDeliveryUrl}
                                      alt="Proof of delivery"
                                      className="w-20 h-20 object-cover rounded-lg border"
                                      style={{ borderColor: "#DDD8CC" }}
                                    />
                                  </a>
                                </div>
                              )}
                              {(item.fulfillmentStatus === "shipped" || item.fulfillmentStatus === "delivered") && (
                                <div className="mt-2">
                                  {item.buyerConfirmedAt ? (
                                    <Tag color={SAGE}>You confirmed receipt</Tag>
                                  ) : deliveryTokens[item.id] ? (
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: CANVAS }}>
                                      <div className="text-xs mb-1" style={{ color: SLATE }}>
                                        Give this code to the seller once the item's in hand:
                                      </div>
                                      <div
                                        className="text-center py-2 rounded-lg text-lg font-semibold tracking-widest"
                                        style={{ backgroundColor: "white", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                                      >
                                        {deliveryTokens[item.id]}
                                      </div>
                                      <p className="text-xs mt-1" style={{ color: SLATE }}>
                                        Valid for 7 days. The seller enters this in their dashboard to release payment.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <button
                                        onClick={() => confirmReceipt(o.id, item.id)}
                                        className="text-xs font-medium underline"
                                        style={{ color: SAGE }}
                                      >
                                        Confirm receipt
                                      </button>
                                      <button
                                        onClick={() => generateDeliveryToken(item.id)}
                                        disabled={generatingTokenKey === item.id}
                                        className="text-xs font-medium underline disabled:opacity-50"
                                        style={{ color: SLATE }}
                                      >
                                        {generatingTokenKey === item.id ? "Generating…" : "Generate delivery code for seller"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {(item.fulfillmentStatus === "shipped" || item.returnStatus) && (
                              <div className="pl-6 mb-2">
                                {!item.returnStatus ? (
                                  returnDrafts[draftKey] ? (
                                    <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                                      <label className="block text-xs font-medium mb-1" style={{ color: INK }}>
                                        Reason for return
                                      </label>
                                      <select
                                        value={returnDrafts[draftKey].reason}
                                        onChange={(e) =>
                                          setReturnDrafts((d) => ({
                                            ...d,
                                            [draftKey]: { ...d[draftKey], reason: e.target.value },
                                          }))
                                        }
                                        className="w-full mb-2 px-2 py-1.5 rounded-lg border outline-none text-sm bg-white"
                                        style={{ borderColor: "#DDD8CC" }}
                                      >
                                        <option value="">Select a reason...</option>
                                        {RETURN_REASONS.map((r) => (
                                          <option key={r} value={r}>
                                            {r}
                                          </option>
                                        ))}
                                      </select>
                                      <textarea
                                        value={returnDrafts[draftKey].note}
                                        onChange={(e) =>
                                          setReturnDrafts((d) => ({
                                            ...d,
                                            [draftKey]: { ...d[draftKey], note: e.target.value },
                                          }))
                                        }
                                        placeholder="Any extra detail? (optional)"
                                        rows={2}
                                        className="w-full mb-2 px-2 py-1.5 rounded-lg border outline-none text-sm"
                                        style={{ borderColor: "#DDD8CC" }}
                                      />
                                      <div className="mb-2">
                                        <label className="block text-xs font-medium mb-1" style={{ color: INK }}>
                                          Evidence photos <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                                        </label>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {(returnDrafts[draftKey].evidenceUrls || []).map((url, idx) => (
                                            <div key={idx} className="relative">
                                              <img
                                                src={url}
                                                alt={`Evidence ${idx + 1}`}
                                                className="w-14 h-14 object-cover rounded-lg border"
                                                style={{ borderColor: "#DDD8CC" }}
                                              />
                                              <button
                                                onClick={() =>
                                                  setReturnDrafts((d) => ({
                                                    ...d,
                                                    [draftKey]: {
                                                      ...d[draftKey],
                                                      evidenceUrls: d[draftKey].evidenceUrls.filter((_, i) => i !== idx),
                                                    },
                                                  }))
                                                }
                                                className="absolute -top-1.5 -right-1.5 rounded-full bg-white border"
                                                style={{ borderColor: "#DDD8CC" }}
                                                aria-label="Remove photo"
                                              >
                                                <X size={12} style={{ color: BERRY }} />
                                              </button>
                                            </div>
                                          ))}
                                          <label
                                            className="w-14 h-14 rounded-lg border flex items-center justify-center cursor-pointer text-xs"
                                            style={{ borderColor: "#DDD8CC", color: SLATE }}
                                          >
                                            {uploadingReturnEvidenceKey === draftKey ? "…" : "+"}
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleReturnEvidenceSelect(e, draftKey)}
                                              className="hidden"
                                              disabled={uploadingReturnEvidenceKey === draftKey}
                                            />
                                          </label>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={async () => {
                                            await requestReturn(
                                              o.id,
                                              item.id,
                                              returnDrafts[draftKey].reason,
                                              returnDrafts[draftKey].note,
                                              returnDrafts[draftKey].evidenceUrls || []
                                            );
                                            setReturnDrafts((d) => {
                                              const next = { ...d };
                                              delete next[draftKey];
                                              return next;
                                            });
                                          }}
                                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                          style={{ backgroundColor: MARIGOLD, color: INK }}
                                        >
                                          Submit request
                                        </button>
                                        <button
                                          onClick={() =>
                                            setReturnDrafts((d) => {
                                              const next = { ...d };
                                              delete next[draftKey];
                                              return next;
                                            })
                                          }
                                          className="text-xs font-medium underline"
                                          style={{ color: SLATE }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setReturnDrafts((d) => ({ ...d, [draftKey]: { reason: "", note: "", evidenceUrls: [] } }))
                                      }
                                      className="text-xs font-medium underline"
                                      style={{ color: SLATE }}
                                    >
                                      Request a return
                                    </button>
                                  )
                                ) : (
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <Tag color={RETURN_STATUS_COLOR[item.returnStatus]}>
                                        {RETURN_STATUS_LABEL[item.returnStatus]}
                                      </Tag>
                                      <span className="text-xs" style={{ color: SLATE }}>
                                        {item.returnReason}
                                        {item.returnNote ? ` — "${item.returnNote}"` : ""}
                                      </span>
                                    </div>
                                    {item.returnStatus === "approved" && (
                                      <div>
                                        {item.returnTrackingNumber ? (
                                          <div className="text-xs" style={{ color: SLATE }}>
                                            Return tracking:{" "}
                                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                                              {item.returnTrackingNumber}
                                            </span>{" "}
                                            <a
                                              href={buildTrackingUrl(item.returnTrackingNumber)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="underline font-medium"
                                              style={{ color: MARIGOLD }}
                                            >
                                              Track package →
                                            </a>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <input
                                              value={returnTrackingDrafts[draftKey] ?? ""}
                                              onChange={(e) =>
                                                setReturnTrackingDrafts((d) => ({ ...d, [draftKey]: e.target.value }))
                                              }
                                              placeholder="Add tracking for your return shipment"
                                              className="flex-1 px-2 py-1 rounded-lg border outline-none text-xs"
                                              style={{ borderColor: "#DDD8CC" }}
                                            />
                                            <button
                                              onClick={async () => {
                                                await updateReturnTracking(
                                                  o.id,
                                                  item.id,
                                                  (returnTrackingDrafts[draftKey] || "").trim()
                                                );
                                                setReturnTrackingDrafts((d) => {
                                                  const next = { ...d };
                                                  delete next[draftKey];
                                                  return next;
                                                });
                                              }}
                                              className="px-2 py-1 rounded-lg text-xs font-medium"
                                              style={{ backgroundColor: MARIGOLD, color: INK }}
                                            >
                                              Save
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {item.fulfillmentStatus === "shipped" && (
                              <div className="mt-2 mb-1 pl-6">
                                {existingReview && !reviewDrafts[draftKey] ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <StarDisplay value={existingReview.rating} />
                                    {existingReview.comment && (
                                      <span className="text-xs" style={{ color: SLATE }}>
                                        "{existingReview.comment}"
                                      </span>
                                    )}
                                    <button
                                      onClick={() =>
                                        setReviewDrafts((d) => ({
                                          ...d,
                                          [draftKey]: {
                                            rating: existingReview.rating,
                                            comment: existingReview.comment,
                                          },
                                        }))
                                      }
                                      className="text-xs font-medium underline"
                                      style={{ color: SLATE }}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                                    <StarRating
                                      value={draft.rating}
                                      onChange={(n) =>
                                        setReviewDrafts((d) => ({ ...d, [draftKey]: { ...draft, rating: n } }))
                                      }
                                    />
                                    <textarea
                                      value={draft.comment}
                                      onChange={(e) =>
                                        setReviewDrafts((d) => ({
                                          ...d,
                                          [draftKey]: { ...draft, comment: e.target.value },
                                        }))
                                      }
                                      placeholder="How was it? (optional)"
                                      rows={2}
                                      className="w-full mt-2 px-2 py-1.5 rounded-lg border outline-none text-sm"
                                      style={{ borderColor: "#DDD8CC" }}
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                      <button
                                        onClick={async () => {
                                          await submitReview(
                                            o.id,
                                            item.id,
                                            item.id,
                                            item.ownerUsername,
                                            draft.rating,
                                            draft.comment
                                          );
                                          setReviewDrafts((d) => {
                                            const next = { ...d };
                                            delete next[draftKey];
                                            return next;
                                          });
                                        }}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                        style={{ backgroundColor: MARIGOLD, color: INK }}
                                      >
                                        {existingReview ? "Save review" : "Leave a review"}
                                      </button>
                                      {reviewDrafts[draftKey] && existingReview && (
                                        <button
                                          onClick={() =>
                                            setReviewDrafts((d) => {
                                              const next = { ...d };
                                              delete next[draftKey];
                                              return next;
                                            })
                                          }
                                          className="text-xs font-medium underline"
                                          style={{ color: SLATE }}
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 flex items-center justify-between border-t" style={{ borderColor: "#EFEBE0" }}>
                      <div className="flex items-center gap-2">
                        {o.paymentStatus === "refunded" && <Tag color={BERRY}>Refunded</Tag>}
                        {o.isDisputed && <Tag color={BERRY}>Issue reported — under review</Tag>}
                      </div>
                      {!o.isDisputed && (
                        <button
                          onClick={() => fileDispute(o.id)}
                          className="text-xs font-medium underline"
                          style={{ color: SLATE }}
                        >
                          Report an issue
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "watchlist" && (
          <div>
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Watchlist
            </h2>
            {!currentUser ? (
              <p className="text-sm mt-2" style={{ color: SLATE }}>
                Log in to save items for later.
              </p>
            ) : (
              <>
                <p className="text-sm mb-6" style={{ color: SLATE }}>
                  Items you've saved. Nothing here is reserved — someone else could still buy it first.
                </p>
                {(() => {
                  const savedListings = listings.filter(
                    (l) => watchlist.includes(l.id) && l.status !== "removed"
                  );
                  return savedListings.length === 0 ? (
                    <p className="text-sm" style={{ color: SLATE }}>
                      Nothing saved yet. Tap the heart icon on any listing to save it here.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                      {savedListings.map((l) => (
                        <PriceTagCard
                          key={l.id}
                          listing={l}
                          rating={getListingRating(l.id)}
                          isSaved={true}
                          onToggleWatchlist={toggleWatchlist}
                          onOpenStorefront={openStorefront}
                          now={nowTick}
                          onVacation={getSellerVacationInfo(l.ownerUsername)}
                          onOpen={(listing) => {
                            setActiveImg(0);
                            setSelected(listing);
                          }}
                          onAddToCart={addToCart}
                        />
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {view === "storefront" && (
          <div>
            {(() => {
              const seller = members.find((m) => m.username === viewingSeller);
              if (!seller) {
                return (
                  <p className="text-sm" style={{ color: SLATE }}>
                    This seller couldn't be found.
                  </p>
                );
              }
              const sellerListings = listings.filter(
                (l) => l.ownerUsername === viewingSeller && l.status === "approved"
              );
              const sellerRating = getSellerRating(viewingSeller);
              const reputation = getSellerReputation(viewingSeller);
              const followerCount = follows.filter((f) => f.followedUsername === viewingSeller).length;
              const isFollowing = follows.some(
                (f) => f.followerUsername === currentUser && f.followedUsername === viewingSeller
              );
              const completedSalesCount = sellerSalesCounts[viewingSeller];
              const isOwnStorefrontHeader = currentUser === viewingSeller;
              return (
                <>
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      {seller.avatarUrl ? (
                        <img
                          src={seller.avatarUrl}
                          alt={seller.displayName}
                          className="w-16 h-16 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
                          style={{ backgroundColor: "#F1EFE7", color: INK }}
                        >
                          {seller.displayName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h2 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                            {seller.displayName}
                          </h2>
                          {seller.isAdmin && <Tag color={MARIGOLD}>Admin</Tag>}
                          {seller.isVerified && <Tag color={SAGE}>Verified</Tag>}
                          {seller.vacationMode && <Tag color={MARIGOLD}>🌴 On vacation</Tag>}
                          {reputation && (
                            <Tag color={reputation.positivePct >= 90 ? SAGE : reputation.positivePct >= 70 ? MARIGOLD : BERRY}>
                              {reputation.positivePct}% positive
                            </Tag>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: SLATE }}>
                          Member since{" "}
                          {new Date(seller.joinedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                          })}
                          {seller.officeLocation ? ` · ${seller.officeLocation}` : ""}
                          {reputation && ` · ${reputation.count} rating${reputation.count !== 1 ? "s" : ""}`}
                          {` · ${followerCount} follower${followerCount !== 1 ? "s" : ""}`}
                        </p>
                        {isOwnStorefrontHeader && (
                          <label
                            className="inline-block mt-2 text-xs font-medium underline cursor-pointer"
                            style={{ color: INK }}
                          >
                            {uploadingAvatar ? "Uploading…" : "Change photo"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarSelect}
                              className="hidden"
                              disabled={uploadingAvatar}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                    {currentUser !== viewingSeller && (
                      <button
                        onClick={() => toggleFollow(viewingSeller)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border"
                        style={
                          isFollowing
                            ? { borderColor: "#DDD8CC", color: SLATE, backgroundColor: "white" }
                            : { borderColor: INK, backgroundColor: INK, color: "white" }
                        }
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                    <button
                      onClick={() => startOrOpenThread(sellerListings[0] || { ownerUsername: viewingSeller, sellerName: seller.displayName, id: null })}
                      disabled={sellerListings.length === 0}
                      className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-40"
                      style={{ borderColor: "#DDD8CC", color: SLATE }}
                    >
                      Message seller
                    </button>
                    </div>
                  </div>

                  {isOwnStorefrontHeader && editingStoreProfile ? (
                    <div className="mb-6 p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                      <label className="block text-xs font-medium mb-1" style={{ color: INK }}>
                        Store description
                      </label>
                      <textarea
                        value={storeProfileDraft.storeBio}
                        onChange={(e) => setStoreProfileDraft((d) => ({ ...d, storeBio: e.target.value }))}
                        placeholder="Tell buyers about your store..."
                        rows={3}
                        className="w-full mb-3 px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <label className="block text-xs font-medium mb-1" style={{ color: INK }}>
                        Store policies
                      </label>
                      <textarea
                        value={storeProfileDraft.storePolicies}
                        onChange={(e) => setStoreProfileDraft((d) => ({ ...d, storePolicies: e.target.value }))}
                        placeholder="Shipping times, returns, general terms..."
                        rows={3}
                        className="w-full mb-3 px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={saveStoreProfile}
                          className="px-4 py-2 rounded-lg text-sm font-medium"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingStoreProfile(false)}
                          className="text-sm font-medium underline"
                          style={{ color: SLATE }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    (seller.storeBio || seller.storePolicies || isOwnStorefrontHeader) && (
                      <div className="mb-6 p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                        {seller.storeBio && (
                          <p className="text-sm mb-2" style={{ color: INK }}>
                            {seller.storeBio}
                          </p>
                        )}
                        {seller.storePolicies && (
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: SLATE }}>
                              Store policies
                            </div>
                            <p className="text-sm" style={{ color: INK }}>
                              {seller.storePolicies}
                            </p>
                          </div>
                        )}
                        {isOwnStorefrontHeader && (
                          <button
                            onClick={() => {
                              setStoreProfileDraft({
                                storeBio: seller.storeBio || "",
                                storePolicies: seller.storePolicies || "",
                              });
                              setEditingStoreProfile(true);
                            }}
                            className="text-xs font-medium underline mt-2"
                            style={{ color: INK }}
                          >
                            {seller.storeBio || seller.storePolicies ? "Edit store profile" : "Add store description & policies"}
                          </button>
                        )}
                      </div>
                    )
                  )}

                  {seller.vacationMode && (
                    <div
                      className="mb-6 p-4 rounded-lg border"
                      style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}
                    >
                      <p className="text-sm" style={{ color: INK }}>
                        🌴 This seller is currently on vacation
                        {seller.vacationReturnDate
                          ? ` and will be back on ${new Date(seller.vacationReturnDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`
                          : ""}
                        . {seller.vacationMessage || "Orders placed now may ship later than usual."}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-lg">
                    <div>
                      <div
                        className="text-2xl font-semibold"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                      >
                        {sellerListings.length}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        active listings
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-semibold"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                      >
                        {completedSalesCount === undefined ? "…" : completedSalesCount}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        completed sales
                      </div>
                    </div>
                    <div>
                      {reputation ? (
                        <>
                          <div
                            className="text-2xl font-semibold"
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              color: reputation.positivePct >= 90 ? SAGE : reputation.positivePct >= 70 ? MARIGOLD : BERRY,
                            }}
                          >
                            {reputation.positivePct}%
                          </div>
                          <div className="text-xs" style={{ color: SLATE }}>
                            positive ({reputation.count})
                          </div>
                        </>
                      ) : (
                        <div className="text-xs" style={{ color: SLATE }}>
                          No ratings yet
                        </div>
                      )}
                    </div>
                    <div>
                      {sellerRating ? (
                        <>
                          <div className="flex items-center gap-1">
                            <StarDisplay value={sellerRating.avg} />
                          </div>
                          <div className="text-xs" style={{ color: SLATE }}>
                            {sellerRating.avg.toFixed(1)} avg
                          </div>
                        </>
                      ) : (
                        <div className="text-xs" style={{ color: SLATE }}>
                          No reviews yet
                        </div>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const sellerReviews = reviews
                      .filter((r) => r.sellerUsername === viewingSeller)
                      .sort((a, b) => b.createdAt - a.createdAt);
                    const isOwnStorefront = currentUser === viewingSeller;
                    if (sellerReviews.length === 0) return null;
                    return (
                      <div className="mb-8">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                          Reviews ({sellerReviews.length})
                        </h3>
                        <div className="space-y-3">
                          {sellerReviews.map((r) => (
                            <div key={r.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                                <span className="text-sm font-medium" style={{ color: INK }}>
                                  {r.buyerName}
                                </span>
                                <span className="text-xs" style={{ color: SLATE }}>
                                  {new Date(r.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <StarDisplay value={r.rating} />
                              {r.comment && (
                                <p className="text-sm mt-2" style={{ color: INK }}>
                                  {r.comment}
                                </p>
                              )}
                              {r.sellerResponse && (
                                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: CANVAS }}>
                                  <div className="text-xs font-medium mb-1" style={{ color: INK }}>
                                    Seller response
                                  </div>
                                  <p className="text-sm" style={{ color: INK }}>
                                    {r.sellerResponse}
                                  </p>
                                </div>
                              )}
                              {isOwnStorefront && !r.sellerResponse && (
                                <div className="mt-3">
                                  {reviewResponseDrafts[r.id] !== undefined ? (
                                    <div>
                                      <textarea
                                        value={reviewResponseDrafts[r.id]}
                                        onChange={(e) =>
                                          setReviewResponseDrafts((d) => ({ ...d, [r.id]: e.target.value }))
                                        }
                                        placeholder="Write a response..."
                                        rows={2}
                                        className="w-full mb-2 px-2 py-1.5 rounded-lg border outline-none text-sm"
                                        style={{ borderColor: "#DDD8CC" }}
                                      />
                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={() => respondToReview(r.id, reviewResponseDrafts[r.id])}
                                          className="text-xs font-medium underline"
                                          style={{ color: SAGE }}
                                        >
                                          Post response
                                        </button>
                                        <button
                                          onClick={() =>
                                            setReviewResponseDrafts((d) => {
                                              const next = { ...d };
                                              delete next[r.id];
                                              return next;
                                            })
                                          }
                                          className="text-xs font-medium underline"
                                          style={{ color: SLATE }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setReviewResponseDrafts((d) => ({ ...d, [r.id]: "" }))}
                                      className="text-xs font-medium underline"
                                      style={{ color: SLATE }}
                                    >
                                      Respond
                                    </button>
                                  )}
                                </div>
                              )}
                              {!isOwnStorefront && currentUser && (
                                <button
                                  onClick={() => {
                                    setReportReviewId(r.id);
                                    setReviewReportReasonDraft("");
                                  }}
                                  className="text-xs font-medium underline mt-3 flex items-center gap-1"
                                  style={{ color: SLATE }}
                                >
                                  <Flag size={10} />
                                  Report
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                    Listings
                  </h3>
                  {sellerListings.length === 0 ? (
                    <p className="text-sm" style={{ color: SLATE }}>
                      This seller has no active listings right now.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                      {sellerListings.map((l) => (
                        <PriceTagCard
                          key={l.id}
                          listing={l}
                          rating={getListingRating(l.id)}
                          isSaved={watchlist.includes(l.id)}
                          onToggleWatchlist={toggleWatchlist}
                          onOpenStorefront={openStorefront}
                          now={nowTick}
                          onVacation={getSellerVacationInfo(l.ownerUsername)}
                          onOpen={(listing) => {
                            setActiveImg(0);
                            setSelected(listing);
                          }}
                          onAddToCart={addToCart}
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {view === "wallet" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Wallet
            </h2>
            {!currentUser ? (
              <p className="text-sm mt-2" style={{ color: SLATE }}>
                Log in to see your balance.
              </p>
            ) : (
              <>
                <p className="text-sm mb-6" style={{ color: SLATE }}>
                  Funds from your sales, tracked through the marketplace's escrow status. This isn't a real bank
                  balance — it reflects what you're owed based on order status set by the admin.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="p-4 rounded-lg border bg-white" style={{ borderColor: SAGE }}>
                    <div className="text-xs uppercase tracking-wide mb-1" style={{ color: SLATE }}>
                      Available
                    </div>
                    <div
                      className="text-2xl font-semibold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: SAGE }}
                    >
                      ${walletNetAvailable.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-xs uppercase tracking-wide mb-1" style={{ color: SLATE }}>
                      Pending (held)
                    </div>
                    <div
                      className="text-2xl font-semibold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: MARIGOLD }}
                    >
                      ${walletHeld.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-xs uppercase tracking-wide mb-1" style={{ color: SLATE }}>
                      Paid out
                    </div>
                    <div
                      className="text-2xl font-semibold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                    >
                      ${withdrawalsPaidTotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-xs uppercase tracking-wide mb-1" style={{ color: SLATE }}>
                      Refunded / voided
                    </div>
                    <div
                      className="text-2xl font-semibold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: BERRY }}
                    >
                      ${walletVoided.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: INK }}>
                    Change password
                  </h3>
                  <p className="text-xs mb-3" style={{ color: SLATE }}>
                    You'll need your current password to set a new one.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <input
                      type="password"
                      value={changePasswordForm.current}
                      onChange={(e) => setChangePasswordForm((f) => ({ ...f, current: e.target.value }))}
                      placeholder="Current password"
                      className="px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <input
                      type="password"
                      value={changePasswordForm.next}
                      onChange={(e) => setChangePasswordForm((f) => ({ ...f, next: e.target.value }))}
                      placeholder="New password"
                      className="px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <input
                      type="password"
                      value={changePasswordForm.confirm}
                      onChange={(e) => setChangePasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                      className="px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <button
                      onClick={changePassword}
                      disabled={changingPassword}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      style={{ backgroundColor: INK, color: "white" }}
                    >
                      {changingPassword ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: INK }}>
                        Two-factor authentication
                      </h3>
                      <p className="text-xs mt-1" style={{ color: SLATE }}>
                        {currentMember?.isAdmin
                          ? currentMember?.twoFactorEnabled
                            ? "On — required for admin accounts, via your authenticator app."
                            : "Required for admin accounts — set up an authenticator app below."
                          : currentMember?.twoFactorEnabled
                          ? "On — we'll email a code each time you log in."
                          : "Off — add a one-time email code to your login."}
                      </p>
                    </div>
                    {currentMember?.isAdmin ? (
                      !currentMember?.twoFactorEnabled &&
                      !adminTotpSetup && (
                        <button
                          onClick={startAdminTotpSetup}
                          disabled={startingAdminTotpSetup}
                          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shrink-0"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          {startingAdminTotpSetup ? "Generating..." : "Set up"}
                        </button>
                      )
                    ) : currentMember?.twoFactorEnabled ? (
                      <button
                        onClick={() => toggleTwoFactor(false)}
                        disabled={savingTwoFactorToggle}
                        className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shrink-0"
                        style={{ borderColor: "#DDD8CC", color: SLATE, backgroundColor: "white", border: "1px solid #DDD8CC" }}
                      >
                        Turn off
                      </button>
                    ) : (
                      enable2FAStep === "idle" && (
                        <button
                          onClick={sendEnableTwoFactorCode}
                          disabled={sendingEnable2FACode}
                          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shrink-0"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          {sendingEnable2FACode ? "Sending code..." : "Turn on"}
                        </button>
                      )
                    )}
                  </div>

                  {/* Admin: authenticator app (TOTP) setup */}
                  {currentMember?.isAdmin && !currentMember?.twoFactorEnabled && adminTotpSetup && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "#DDD8CC" }}>
                      <p className="text-xs mb-2" style={{ color: SLATE }}>
                        Scan this QR code with your authenticator app:
                      </p>
                      <img
                        src={adminTotpSetup.qrCodeUrl}
                        alt="Authenticator app QR code"
                        className="mb-3 rounded-lg border"
                        style={{ borderColor: "#DDD8CC", width: 160, height: 160 }}
                      />
                      <p className="text-xs mb-1" style={{ color: SLATE }}>
                        Can't scan? Enter this key manually:
                      </p>
                      <p
                        className="text-xs mb-3 px-2 py-1.5 rounded border break-all"
                        style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                      >
                        {adminTotpSetup.secret}
                      </p>
                      <label className="block text-xs font-medium mb-1" style={{ color: SLATE }}>
                        Then enter the 6-digit code it's showing
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={adminTotpCodeInput}
                        onChange={(e) => setAdminTotpCodeInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmAdminTotpSetup()}
                        className="w-full px-3 py-2 rounded-lg border mb-2"
                        style={{ borderColor: "#DDD8CC" }}
                        placeholder="123456"
                      />
                      {adminTotpError && (
                        <p className="text-xs mb-2" style={{ color: "#B4432A" }}>
                          {adminTotpError}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={confirmAdminTotpSetup}
                          disabled={confirmingAdminTotpSetup}
                          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          {confirmingAdminTotpSetup ? "Confirming..." : "Confirm code"}
                        </button>
                        <button
                          onClick={() => {
                            setAdminTotpSetup(null);
                            setAdminTotpCodeInput("");
                            setAdminTotpError("");
                          }}
                          className="text-xs underline disabled:opacity-50"
                          style={{ color: SLATE }}
                        >
                          Start over
                        </button>
                      </div>
                    </div>
                  )}
                  {currentMember?.isAdmin && !currentMember?.twoFactorEnabled && !adminTotpSetup && adminTotpError && (
                    <p className="text-xs mt-2" style={{ color: "#B4432A" }}>
                      {adminTotpError}
                    </p>
                  )}

                  {/* Non-admin: email code flow */}
                  {!currentMember?.isAdmin && !currentMember?.twoFactorEnabled && enable2FAStep === "code" && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "#DDD8CC" }}>
                      <label className="block text-xs font-medium mb-1" style={{ color: SLATE }}>
                        Enter the 6-digit code we emailed you
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={enable2FACodeInput}
                        onChange={(e) => setEnable2FACodeInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && verifyEnableTwoFactorCode()}
                        className="w-full px-3 py-2 rounded-lg border mb-2"
                        style={{ borderColor: "#DDD8CC" }}
                        placeholder="123456"
                      />
                      {enable2FAError && (
                        <p className="text-xs mb-2" style={{ color: "#B4432A" }}>
                          {enable2FAError}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={verifyEnableTwoFactorCode}
                          disabled={verifyingEnable2FACode}
                          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          {verifyingEnable2FACode ? "Confirming..." : "Confirm code"}
                        </button>
                        <button
                          onClick={sendEnableTwoFactorCode}
                          disabled={sendingEnable2FACode}
                          className="text-xs underline disabled:opacity-50"
                          style={{ color: SLATE }}
                        >
                          Resend code
                        </button>
                      </div>
                    </div>
                  )}
                  {!currentMember?.isAdmin && !currentMember?.twoFactorEnabled && enable2FAStep === "idle" && enable2FAError && (
                    <p className="text-xs mt-2" style={{ color: "#B4432A" }}>
                      {enable2FAError}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold" style={{ color: INK }}>
                      Login history
                    </h3>
                    {loginHistory === null && (
                      <button
                        onClick={fetchLoginHistory}
                        disabled={loadingLoginHistory}
                        className="text-xs font-medium underline"
                        style={{ color: SLATE }}
                      >
                        {loadingLoginHistory ? "Loading..." : "Show"}
                      </button>
                    )}
                  </div>
                  {loginHistory === null ? (
                    <p className="text-xs" style={{ color: SLATE }}>
                      See the last 20 times this account was signed into, with device and location info.
                    </p>
                  ) : loginHistory.length === 0 ? (
                    <p className="text-xs" style={{ color: SLATE }}>
                      No login history yet.
                    </p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {loginHistory.map((h) => (
                        <div key={h.id} className="flex items-center justify-between text-xs" style={{ color: INK }}>
                          <span>
                            {describeUserAgent(h.user_agent)}
                            {h.ip ? ` · ${h.ip}` : ""}
                          </span>
                          <span style={{ color: SLATE }}>{new Date(h.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs mt-2" style={{ color: SLATE }}>
                    Don't recognize something here? Change your password above right away.
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: INK }}>
                        Sign out of other devices
                      </h3>
                      <p className="text-xs mt-1" style={{ color: SLATE }}>
                        Ends every other active session. This device stays signed in.
                      </p>
                    </div>
                    <button
                      onClick={signOutOtherDevices}
                      disabled={signingOutOtherDevices}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shrink-0"
                      style={{ border: "1px solid #DDD8CC", color: SLATE, backgroundColor: "white" }}
                    >
                      {signingOutOtherDevices ? "Signing out..." : "Sign out others"}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: INK }}>
                    Report suspicious activity
                  </h3>
                  <p className="text-xs mb-2" style={{ color: SLATE }}>
                    See something on your account that doesn't look right? Let an admin know.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <textarea
                      value={suspiciousActivityMessage}
                      onChange={(e) => setSuspiciousActivityMessage(e.target.value)}
                      placeholder="What did you notice?"
                      rows={2}
                      className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <button
                      onClick={reportSuspiciousActivity}
                      disabled={submittingSuspiciousReport}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 self-start"
                      style={{ backgroundColor: BERRY, color: "white" }}
                    >
                      {submittingSuspiciousReport ? "Sending..." : "Report"}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                    Email & phone verification
                  </h3>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: INK }}>
                      Email {currentMember?.email ? `(${currentMember.email})` : ""}
                    </span>
                    {currentMember?.isEmailVerified ? (
                      <Tag color={SAGE}>Verified</Tag>
                    ) : !accountEmailCodeSent ? (
                      <button
                        onClick={sendAccountEmailCode}
                        className="text-xs font-medium underline"
                        style={{ color: INK }}
                      >
                        Verify
                      </button>
                    ) : null}
                  </div>
                  {!currentMember?.isEmailVerified && accountEmailCodeSent && (
                    <div className="flex items-center gap-2 mt-2 mb-3">
                      <input
                        value={accountEmailCodeInput}
                        onChange={(e) => setAccountEmailCodeInput(e.target.value)}
                        placeholder="6-digit code"
                        maxLength={6}
                        className="px-3 py-2 rounded-lg border outline-none text-sm w-32 text-center"
                        style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <button
                        onClick={confirmAccountEmailCode}
                        disabled={verifyingAccountEmail}
                        className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        style={{ backgroundColor: MARIGOLD, color: INK }}
                      >
                        {verifyingAccountEmail ? "Checking..." : "Confirm"}
                      </button>
                      <button
                        onClick={() => setAccountEmailCodeSent(false)}
                        className="text-xs font-medium underline"
                        style={{ color: SLATE }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="pt-3 mt-3" style={{ borderTop: "1px solid #EFEBE0" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm" style={{ color: INK }}>
                        Phone {currentMember?.phone ? `(${currentMember.phone})` : ""}
                      </span>
                      {currentMember?.isPhoneVerified && <Tag color={SAGE}>Verified</Tag>}
                    </div>
                    {!currentMember?.isPhoneVerified && !accountPhoneCodeSent && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          value={accountPhoneInput}
                          onChange={(e) => setAccountPhoneInput(e.target.value)}
                          placeholder={currentMember?.phone || "Phone number"}
                          className="px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <button
                          onClick={sendAccountPhoneCode}
                          className="px-3 py-2 rounded-lg text-sm font-medium"
                          style={{ backgroundColor: INK, color: "white" }}
                        >
                          Send code
                        </button>
                      </div>
                    )}
                    {!currentMember?.isPhoneVerified && accountPhoneCodeSent && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          value={accountPhoneCodeInput}
                          onChange={(e) => setAccountPhoneCodeInput(e.target.value)}
                          placeholder="6-digit code"
                          maxLength={6}
                          className="px-3 py-2 rounded-lg border outline-none text-sm w-32 text-center"
                          style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                        />
                        <button
                          onClick={confirmAccountPhoneCode}
                          disabled={verifyingAccountPhone}
                          className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          {verifyingAccountPhone ? "Checking..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setAccountPhoneCodeSent(false)}
                          className="text-xs font-medium underline"
                          style={{ color: SLATE }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: INK }}>
                    Payout bank details
                  </h3>
                  {pendingBankChange ? (
                    <>
                      <p className="text-xs mb-3" style={{ color: SLATE }}>
                        We emailed a code to confirm this change. Enter it below to finish updating your payout account.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <input
                          value={bankChangeCodeInput}
                          onChange={(e) => setBankChangeCodeInput(e.target.value)}
                          placeholder="6-digit code"
                          maxLength={6}
                          className="px-3 py-2 rounded-lg border outline-none text-sm w-32 text-center"
                          style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                        />
                        <button
                          onClick={confirmBankChange}
                          disabled={bankSaving}
                          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          {bankSaving ? "Confirming..." : "Confirm change"}
                        </button>
                        <button
                          onClick={() => {
                            setPendingBankChange(false);
                            setBankChangeCodeInput("");
                          }}
                          className="text-xs font-medium underline"
                          style={{ color: SLATE }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs mb-3" style={{ color: SLATE }}>
                        {currentMember?.hasBankDetails
                          ? "Your bank details are on file. Changing them requires confirming a code we'll email you."
                          : "Add your bank details before requesting a withdrawal — payouts go here automatically."}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <select
                          value={bankForm.bankCode}
                          onFocus={loadBankList}
                          onChange={(e) => setBankForm({ ...bankForm, bankCode: e.target.value })}
                          className="px-3 py-2 rounded-lg border outline-none text-sm bg-white"
                          style={{ borderColor: "#DDD8CC", minWidth: "180px" }}
                        >
                          <option value="">Select your bank</option>
                          {bankList.map((b) => (
                            <option key={b.code} value={b.code}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <input
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          placeholder="Account number"
                          className="px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <button
                          onClick={saveBankDetails}
                          disabled={bankSaving}
                          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          style={{ backgroundColor: INK, color: "white" }}
                        >
                          {bankSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-lg border bg-white mb-8" style={{ borderColor: "#DDD8CC" }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: INK }}>
                    Request a withdrawal
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: SLATE }}>$</span>
                    <input
                      type="number"
                      min="0"
                      max={walletNetAvailable}
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={walletNetAvailable.toFixed(2)}
                      className="w-32 px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <button
                      onClick={async () => {
                        await requestWithdrawal(withdrawAmount || walletNetAvailable);
                        setWithdrawAmount("");
                      }}
                      disabled={walletNetAvailable <= 0}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      Request
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: SLATE }}>
                    Up to ${walletNetAvailable.toFixed(2)} available. The admin marks requests as paid outside this app.
                  </p>
                </div>

                {myWithdrawals.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                      Your withdrawal requests
                    </h3>
                    <div className="space-y-2">
                      {myWithdrawals.map((w) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white"
                          style={{ borderColor: "#DDD8CC" }}
                        >
                          <span className="text-xs" style={{ color: SLATE }}>
                            {new Date(w.requestedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <div className="flex items-center gap-3">
                            <Tag
                              color={
                                w.status === "paid" ? SAGE : w.status === "failed" ? BERRY : MARIGOLD
                              }
                            >
                              {w.status === "paid" ? "Paid" : w.status === "failed" ? "Failed" : "Processing"}
                            </Tag>
                            <span
                              className="font-medium"
                              style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                            >
                              ${w.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                  Transactions
                </h3>
                {myWalletTx.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No wallet activity yet — it'll show up here once you make a sale.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myWalletTx
                      .slice()
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((t) => (
                        <div
                          key={t.key}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white"
                          style={{ borderColor: "#DDD8CC" }}
                        >
                          <div className="min-w-0">
                            <div className="text-sm truncate" style={{ color: INK }}>
                              {t.title} × {t.qty}
                              <span style={{ color: SLATE }}> — {t.buyerName}</span>
                            </div>
                            <div className="text-xs" style={{ color: SLATE }}>
                              {new Date(t.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Tag
                              color={
                                t.walletStatus === "released"
                                  ? SAGE
                                  : t.walletStatus === "held"
                                  ? MARIGOLD
                                  : BERRY
                              }
                            >
                              {t.walletStatus === "released"
                                ? "Available"
                                : t.walletStatus === "held"
                                ? "Held"
                                : t.walletStatus === "refunded"
                                ? "Refunded"
                                : "Voided"}
                            </Tag>
                            <span
                              className="font-medium"
                              style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                            >
                              ${t.payout.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === "messages" && (
          <div>
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Messages
            </h2>
            {!currentUser ? (
              <p className="text-sm mt-2" style={{ color: SLATE }}>
                Log in to see your conversations.
              </p>
            ) : !activeThread ? (
              <>
                <p className="text-sm mb-6" style={{ color: SLATE }}>
                  Chat with buyers and sellers about a listing. For everyone's safety, email addresses and phone
                  numbers can't be sent here — keep contact on Stallyard.
                </p>
                {myThreads.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No conversations yet. Message a seller from any listing to start one.
                  </p>
                ) : (
                  <div className="space-y-2 max-w-xl">
                    {myThreads.map((t) => {
                      const otherName = t.buyerUsername === currentUser ? t.sellerName : t.buyerName;
                      const lastMsg = t.messages[t.messages.length - 1];
                      const isUnread =
                        lastMsg &&
                        lastMsg.senderUsername !== currentUser &&
                        lastMsg.createdAt > (messageReadState[t.id] || 0);
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveThreadId(t.id);
                            setActiveThreadOrderId(null);
                            markThreadRead(t.id);
                          }}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-lg border bg-white"
                          style={{ borderColor: isUnread ? MARIGOLD : "#DDD8CC" }}
                        >
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: MARIGOLD }} />
                          )}
                          <span className="text-2xl shrink-0">{t.listingEmoji}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate" style={{ color: INK, fontWeight: isUnread ? 700 : 500 }}>
                                {otherName}
                              </span>
                              <span className="text-xs shrink-0" style={{ color: SLATE }}>
                                {new Date(t.updatedAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="text-xs truncate" style={{ color: SLATE }}>
                              {t.listingTitle}
                              {lastMsg
                                ? ` — ${lastMsg.type === "offer" ? `Offer: $${lastMsg.amount.toFixed(2)}` : lastMsg.text}`
                                : ""}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="max-w-xl">
                <button
                  onClick={() => {
                    setActiveThreadId(null);
                    setActiveThreadOrderId(null);
                    setMessageError("");
                  }}
                  className="text-xs font-medium underline mb-3"
                  style={{ color: SLATE }}
                >
                  ← Back to conversations
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{activeThread.listingEmoji}</span>
                  <div>
                    <div className="font-medium" style={{ color: INK }}>
                      {activeThread.buyerUsername === currentUser
                        ? activeThread.sellerName
                        : activeThread.buyerName}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      About: {activeThread.listingTitle}
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-lg border bg-white p-4 mb-3 space-y-3 overflow-y-auto"
                  style={{ borderColor: "#DDD8CC", maxHeight: "50vh", minHeight: "200px" }}
                >
                  {activeThread.messages.length === 0 && (
                    <p className="text-sm" style={{ color: SLATE }}>
                      Say hello — no messages yet.
                    </p>
                  )}
                  {activeThread.messages.map((m) => {
                    const mine = m.senderUsername === currentUser;
                    if (m.type === "offer") {
                      const isBuyer = activeThread.buyerUsername === currentUser;
                      const listingForOffer = listings.find((l) => l.id === activeThread.listingId);
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className="max-w-[75%] px-3 py-2.5 rounded-lg text-sm border"
                            style={{
                              backgroundColor: mine ? "#FBF0DC" : "white",
                              borderColor: MARIGOLD,
                              color: INK,
                            }}
                          >
                            <div className="font-medium mb-1">
                              Offer: ${m.amount.toFixed(2)}
                            </div>
                            {m.status === "pending" && !mine && (
                              <div className="flex items-center gap-3 mt-1">
                                <button
                                  onClick={() => respondToOffer(activeThread.id, m.id, "accepted")}
                                  className="text-xs font-medium underline"
                                  style={{ color: SAGE }}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => respondToOffer(activeThread.id, m.id, "declined")}
                                  className="text-xs font-medium underline"
                                  style={{ color: BERRY }}
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            {m.status === "pending" && mine && (
                              <div className="text-xs" style={{ color: SLATE }}>
                                Waiting for a response...
                              </div>
                            )}
                            {m.status === "accepted" && (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Tag color={SAGE}>Accepted</Tag>
                                {isBuyer && listingForOffer && (
                                  <button
                                    onClick={() => addToCartAtPrice(listingForOffer, m.amount)}
                                    className="text-xs font-medium underline"
                                    style={{ color: INK }}
                                  >
                                    Add to cart at ${m.amount.toFixed(2)}
                                  </button>
                                )}
                              </div>
                            )}
                            {m.status === "declined" && (
                              <Tag color={BERRY}>Declined</Tag>
                            )}
                            <div className="text-[10px] mt-1" style={{ color: SLATE }}>
                              {new Date(m.createdAt).toLocaleTimeString(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className="max-w-[75%] px-3 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: mine ? INK : "#F1EFE7",
                            color: mine ? "white" : INK,
                          }}
                        >
                          {m.imageUrl && (
                            <a href={m.imageUrl} target="_blank" rel="noreferrer">
                              <img
                                src={m.imageUrl}
                                alt="Attachment"
                                className="rounded-lg mb-1 max-w-full"
                                style={{ maxHeight: "200px" }}
                              />
                            </a>
                          )}
                          {m.text}
                          <div
                            className="flex items-center gap-2 text-[10px] mt-1"
                            style={{ color: mine ? "#C9CCD3" : SLATE }}
                          >
                            {new Date(m.createdAt).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                            {!mine && (
                              <button
                                onClick={() => {
                                  setReportMessageId(m.id);
                                  setReportReasonDraft("");
                                }}
                                className="underline flex items-center gap-0.5"
                                style={{ color: mine ? "#C9CCD3" : SLATE }}
                                title="Report this message"
                              >
                                <Flag size={10} />
                                Report
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {messageError && (
                  <p className="text-xs mb-2" style={{ color: BERRY }}>
                    {messageError}
                  </p>
                )}

                {offerModalOpen && (
                  <div className="flex items-center gap-2 mb-2 p-2 rounded-lg border" style={{ borderColor: MARIGOLD }}>
                    <span style={{ color: SLATE }}>$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Your offer"
                      autoFocus
                      className="flex-1 px-2 py-1.5 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <button
                      onClick={async () => {
                        await sendOffer(activeThread.id, offerAmount);
                        setOfferAmount("");
                        setOfferModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      Send offer
                    </button>
                    <button
                      onClick={() => {
                        setOfferModalOpen(false);
                        setOfferAmount("");
                      }}
                      aria-label="Cancel offer"
                    >
                      <X size={16} style={{ color: SLATE }} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {!offerModalOpen && (
                    <button
                      type="button"
                      onClick={() => setOfferModalOpen(true)}
                      className="p-2.5 rounded-lg border shrink-0"
                      style={{ borderColor: MARIGOLD, color: MARIGOLD }}
                      aria-label="Make an offer"
                      title="Make an offer"
                    >
                      $
                    </button>
                  )}
                  <label
                    className="p-2.5 rounded-lg border shrink-0 cursor-pointer flex items-center justify-center"
                    style={{ borderColor: "#DDD8CC", color: SLATE }}
                    title="Attach a photo"
                  >
                    <ImageIcon size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMessagePhotoSelect(e, activeThread.id)}
                      className="hidden"
                      disabled={uploadingMessagePhoto}
                    />
                  </label>
                  <input
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      if (messageError) setMessageError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage(activeThread.id, messageInput);
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                    style={{ borderColor: "#DDD8CC" }}
                  />
                  <button
                    type="button"
                    onClick={() => sendMessage(activeThread.id, messageInput)}
                    className="p-2.5 rounded-lg"
                    style={{ backgroundColor: MARIGOLD, color: INK }}
                    aria-label="Send"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "help" && activeTicketId && (
          <div className="max-w-2xl">
            <button
              onClick={() => {
                setActiveTicketId(null);
                setTicketMessages([]);
              }}
              className="text-sm font-medium underline mb-4"
              style={{ color: SLATE }}
            >
              ← Back to Help center
            </button>
            {(() => {
              const ticket =
                (currentMember?.isAdmin ? adminTickets : myTickets).find((t) => t.id === activeTicketId) || null;
              return (
                <>
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <h2 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                      {ticket?.subject || "Ticket"}
                    </h2>
                    {ticket && (
                      <Tag color={ticket.status === "resolved" ? SAGE : ticket.status === "in_progress" ? MARIGOLD : SLATE}>
                        {TICKET_STATUS_LABEL[ticket.status] || ticket.status}
                      </Tag>
                    )}
                  </div>
                  {ticket && !currentMember?.isAdmin && (
                    <p className="text-xs mb-4" style={{ color: SLATE }}>
                      Opened {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  )}
                  {ticket && currentMember?.isAdmin && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs" style={{ color: SLATE }}>
                        From {ticket.display_name || ticket.username} · Set status:
                      </span>
                      <select
                        value={ticket.status}
                        onChange={(e) => adminUpdateTicketStatus(ticket.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border outline-none text-xs bg-white"
                        style={{ borderColor: "#DDD8CC" }}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  )}
                  {loadingTicketMessages ? (
                    <p className="text-sm" style={{ color: SLATE }}>
                      Loading...
                    </p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {ticketMessages.map((m) => {
                        const fromAdmin = m.is_admin;
                        return (
                          <div key={m.id} className={`flex ${fromAdmin ? "justify-start" : "justify-end"}`}>
                            <div
                              className="max-w-[80%] px-3 py-2 rounded-lg text-sm"
                              style={{ backgroundColor: fromAdmin ? "#F1EFE7" : INK, color: fromAdmin ? INK : "white" }}
                            >
                              <div className="text-xs font-medium mb-1" style={{ color: fromAdmin ? SLATE : "#C9CCD3" }}>
                                {m.display_name || m.username}
                              </div>
                              {m.body}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      value={newTicketMessageInput}
                      onChange={(e) => setNewTicketMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendTicketMessage()}
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <button
                      onClick={sendTicketMessage}
                      disabled={sendingTicketMessage}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      Send
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {view === "help" && !activeTicketId && (
          <div className="max-w-2xl">
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Help center
            </h2>
            <p className="text-sm mb-6" style={{ color: SLATE }}>
              Articles and answers to common questions.
            </p>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: INK }}>
                  Contact support
                </h3>
                {currentUser && (
                  <button
                    onClick={() => setShowNewTicketForm((v) => !v)}
                    className="text-xs font-medium underline"
                    style={{ color: INK }}
                  >
                    {showNewTicketForm ? "Cancel" : "+ New ticket"}
                  </button>
                )}
              </div>
              {!currentUser ? (
                <p className="text-sm" style={{ color: SLATE }}>
                  <button onClick={() => setView("signin")} className="underline" style={{ color: INK }}>
                    Log in
                  </button>{" "}
                  to contact support.
                </p>
              ) : (
                <>
                  {showNewTicketForm && (
                    <div className="p-4 rounded-lg border bg-white mb-3" style={{ borderColor: "#DDD8CC" }}>
                      <input
                        value={newTicketForm.subject}
                        onChange={(e) => setNewTicketForm((f) => ({ ...f, subject: e.target.value }))}
                        placeholder="Subject"
                        className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <textarea
                        value={newTicketForm.message}
                        onChange={(e) => setNewTicketForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Describe what's going on..."
                        rows={3}
                        className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <button
                        onClick={createSupportTicket}
                        disabled={creatingTicket}
                        className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        style={{ backgroundColor: MARIGOLD, color: INK }}
                      >
                        {creatingTicket ? "Submitting..." : "Submit ticket"}
                      </button>
                    </div>
                  )}
                  {myTickets.length === 0 ? (
                    !showNewTicketForm && (
                      <p className="text-sm" style={{ color: SLATE }}>
                        No tickets yet.
                      </p>
                    )
                  ) : (
                    <div className="space-y-2">
                      {myTickets.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => openTicketThread(t.id)}
                          className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg border bg-white"
                          style={{ borderColor: "#DDD8CC" }}
                        >
                          <span className="text-sm font-medium truncate" style={{ color: INK }}>
                            {t.subject}
                          </span>
                          <Tag color={t.status === "resolved" ? SAGE : t.status === "in_progress" ? MARIGOLD : SLATE}>
                            {TICKET_STATUS_LABEL[t.status] || t.status}
                          </Tag>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                Marketplace policies
              </h3>
              <div className="space-y-2">
                {POLICY_ORDER.map((cat) => (
                  <div key={cat} className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#DDD8CC" }}>
                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium" style={{ color: INK }}>
                        {POLICY_LABELS[cat]}
                      </span>
                      {currentMember?.isAdmin && editingPolicyCategory !== cat && (
                        <button
                          onClick={() => {
                            setEditingPolicyCategory(cat);
                            setPolicyDraft(policies[cat] || "");
                          }}
                          className="text-xs font-medium underline shrink-0"
                          style={{ color: SLATE }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {editingPolicyCategory === cat ? (
                      <div className="px-4 pb-3">
                        <textarea
                          value={policyDraft}
                          onChange={(e) => setPolicyDraft(e.target.value)}
                          rows={4}
                          className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={async () => {
                              await savePolicy(cat, policyDraft);
                              setEditingPolicyCategory(null);
                            }}
                            className="text-xs font-medium underline"
                            style={{ color: SAGE }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPolicyCategory(null)}
                            className="text-xs font-medium underline"
                            style={{ color: SLATE }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      policies[cat] && (
                        <div className="px-4 pb-3 text-sm whitespace-pre-wrap" style={{ color: SLATE }}>
                          {policies[cat]}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            {content.articles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                  Help articles
                </h3>
                <div className="space-y-3">
                  {content.articles.map((a) => (
                    <div key={a.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                      <h4 className="font-medium mb-1" style={{ color: INK }}>
                        {a.title}
                      </h4>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: SLATE }}>
                        {a.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.faqs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                  Frequently asked questions
                </h3>
                <div className="space-y-2">
                  {content.faqs.map((f) => (
                    <div key={f.id} className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#DDD8CC" }}>
                      <button
                        onClick={() => setOpenFaqId(openFaqId === f.id ? null : f.id)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <span className="text-sm font-medium" style={{ color: INK }}>
                          {f.question}
                        </span>
                        <span style={{ color: SLATE }}>{openFaqId === f.id ? "−" : "+"}</span>
                      </button>
                      {openFaqId === f.id && (
                        <div className="px-4 pb-3 text-sm" style={{ color: SLATE }}>
                          {f.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.articles.length === 0 && content.faqs.length === 0 && (
              <p className="text-sm" style={{ color: SLATE }}>
                No help content has been published yet.
              </p>
            )}
          </div>
        )}

        {view === "admin" && currentMember?.isAdmin && !currentMember?.twoFactorEnabled && (
          <div className="max-w-sm">
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Two-factor required
            </h2>
            <p className="text-sm mb-5" style={{ color: SLATE }}>
              Admin accounts must set up an authenticator app (Google Authenticator, Authy, 1Password, etc.)
              before you can open this panel.
            </p>
            {!adminTotpSetup ? (
              <div>
                {adminTotpError && (
                  <p className="text-xs mb-2" style={{ color: "#B4432A" }}>
                    {adminTotpError}
                  </p>
                )}
                <button
                  onClick={startAdminTotpSetup}
                  disabled={startingAdminTotpSetup}
                  className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  {startingAdminTotpSetup ? "Generating..." : "Set up authenticator app"}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-2" style={{ color: SLATE }}>
                  Scan this QR code with your authenticator app:
                </p>
                <img
                  src={adminTotpSetup.qrCodeUrl}
                  alt="Authenticator app QR code"
                  className="mb-3 rounded-lg border"
                  style={{ borderColor: "#DDD8CC", width: 180, height: 180 }}
                />
                <p className="text-xs mb-1" style={{ color: SLATE }}>
                  Can't scan? Enter this key manually:
                </p>
                <p
                  className="text-xs mb-3 px-2 py-1.5 rounded border break-all"
                  style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                >
                  {adminTotpSetup.secret}
                </p>
                <label className="block text-xs font-medium mb-1" style={{ color: SLATE }}>
                  Then enter the 6-digit code it's showing
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={adminTotpCodeInput}
                  onChange={(e) => setAdminTotpCodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmAdminTotpSetup()}
                  className="w-full px-3 py-2 rounded-lg border mb-2"
                  style={{ borderColor: "#DDD8CC" }}
                  placeholder="123456"
                  autoFocus
                />
                {adminTotpError && (
                  <p className="text-xs mb-2" style={{ color: "#B4432A" }}>
                    {adminTotpError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={confirmAdminTotpSetup}
                    disabled={confirmingAdminTotpSetup}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: MARIGOLD, color: INK }}
                  >
                    {confirmingAdminTotpSetup ? "Confirming..." : "Confirm code"}
                  </button>
                  <button
                    onClick={() => {
                      setAdminTotpSetup(null);
                      setAdminTotpCodeInput("");
                      setAdminTotpError("");
                    }}
                    className="text-xs underline disabled:opacity-50"
                    style={{ color: SLATE }}
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


        {view === "admin" && currentMember?.isAdmin && currentMember?.twoFactorEnabled && (
          <div>
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Admin dashboard
            </h2>
            <p className="text-sm mb-5" style={{ color: SLATE }}>
              Visible only to you, {currentMember.displayName}.
            </p>

            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { id: "overview", label: "Overview", requireSuperAdmin: true },
                { id: "listings", label: `Listings (${listings.length})`, permission: "listing_moderation" },
                { id: "members", label: `Members (${members.length})` },
                { id: "orders", label: `Orders (${orders.length})` },
                { id: "disputes", label: `Disputes (${disputedOrders.length})`, permission: "dispute_resolution" },
                {
                  id: "reports",
                  label: `Message reports (${messageReports.filter((r) => r.status === "open").length})`,
                  permission: "dispute_resolution",
                },
                {
                  id: "reviewReports",
                  label: `Review reports (${reviewReports.filter((r) => r.status === "open").length})`,
                  permission: "dispute_resolution",
                },
                {
                  id: "accountReports",
                  label: `Account reports (${accountReports.filter((r) => r.status === "open").length})`,
                  requireSuperAdmin: true,
                },
                {
                  id: "supportTickets",
                  label: `Support tickets (${adminTickets.filter((t) => t.status !== "resolved").length})`,
                  permission: "support_tickets",
                },
                { id: "settings", label: "Settings", permission: "finance_or_content" },
                { id: "content", label: "Content", requireSuperAdmin: true },
                {
                  id: "withdrawals",
                  label: `Withdrawals (${withdrawals.filter((w) => w.status === "processing").length})`,
                  permission: "finance",
                },
                { id: "auditLog", label: "Audit log", requireSuperAdmin: true },
              ]
                .filter((t) => {
                  const isSuperAdmin = !currentMember?.adminRole || currentMember.adminRole === "super_admin";
                  if (t.requireSuperAdmin) return isSuperAdmin;
                  if (t.permission === "finance_or_content") {
                    return isSuperAdmin || hasAdminPermission(currentMember, "finance") || hasAdminPermission(currentMember, "content_management");
                  }
                  if (t.permission) return hasAdminPermission(currentMember, t.permission);
                  return true; // no permission listed = every admin role can view (accounts/orders)
                })
                .map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setAdminTab(t.id);
                    if (t.id === "auditLog") fetchAuditLog();
                  }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{
                    borderColor: adminTab === t.id ? INK : "#DDD8CC",
                    backgroundColor: adminTab === t.id ? INK : "white",
                    color: adminTab === t.id ? "white" : SLATE,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {adminTab === "overview" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: SLATE }}>
                  Marketplace totals
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {[
                    {
                      label: "Total sales",
                      value: `$${orders.reduce((s, o) => s + o.total, 0).toFixed(2)}`,
                      color: SAGE,
                    },
                    {
                      label: "Marketplace commission",
                      value: `$${orders.reduce((s, o) => s + (o.commissionAmount || 0), 0).toFixed(2)}`,
                      color: SAGE,
                    },
                    { label: "Total users", value: members.length, color: INK, tab: "members" },
                    {
                      label: "Active listings",
                      value: listings.filter((l) => l.status === "approved").length,
                      color: INK,
                      tab: "listings",
                    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => s.tab && setAdminTab(s.tab)}
                      className="p-4 rounded-lg border bg-white text-left"
                      style={{ borderColor: "#DDD8CC", cursor: s.tab ? "pointer" : "default" }}
                    >
                      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: SLATE }}>
                        {s.label}
                      </div>
                      <div
                        className="text-2xl font-semibold"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: s.color }}
                      >
                        {s.value}
                      </div>
                    </button>
                  ))}
                </div>

                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: SLATE }}>
                  Needs your attention
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {(() => {
                    const pendingOrders = orders.reduce(
                      (s, o) => s + o.items.filter((i) => (i.fulfillmentStatus || "new") === "new").length,
                      0
                    );
                    const awaitingConfirmation = orders.reduce(
                      (s, o) =>
                        s +
                        o.items.filter(
                          (i) =>
                            (i.fulfillmentStatus === "shipped" || i.fulfillmentStatus === "delivered") &&
                            !i.buyerConfirmedAt
                        ).length,
                      0
                    );
                    const pendingSellerApps = members.filter((m) => m.verificationStatus === "pending").length;
                    const refundRequests = orders.reduce(
                      (s, o) => s + o.items.filter((i) => i.returnStatus === "requested").length,
                      0
                    );
                    const suspendedUsers = members.filter((m) => m.isSuspended).length;
                    const suspiciousActivity = accountReports.filter((r) => r.status === "open").length;
                    const systemAlerts = withdrawals.filter((w) => w.status === "failed").length;

                    return [
                      { label: "Pending orders", value: pendingOrders, tab: "orders" },
                      { label: "Awaiting delivery confirmation", value: awaitingConfirmation, tab: "orders" },
                      { label: "Seller apps awaiting verification", value: pendingSellerApps, tab: "members" },
                      { label: "Open disputes", value: disputedOrders.length, tab: "disputes" },
                      { label: "Refund requests", value: refundRequests, tab: "orders" },
                      { label: "Suspended users", value: suspendedUsers, tab: "members" },
                      { label: "Suspicious activity reports", value: suspiciousActivity, tab: "accountReports" },
                      { label: "System alerts", value: systemAlerts, tab: "withdrawals" },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setAdminTab(s.tab)}
                        className="p-4 rounded-lg border bg-white text-left"
                        style={{ borderColor: s.value > 0 ? BERRY : "#DDD8CC" }}
                      >
                        <div className="text-xs mb-1" style={{ color: SLATE }}>
                          {s.label}
                        </div>
                        <div
                          className="text-2xl font-semibold"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: s.value > 0 ? BERRY : INK }}
                        >
                          {s.value}
                        </div>
                      </button>
                    ));
                  })()}
                </div>

                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: SLATE }}>
                  Money
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {(() => {
                    const processingWithdrawals = withdrawals.filter((w) => w.status === "processing");
                    const moneyAwaitingPayout = processingWithdrawals.reduce((s, w) => s + Number(w.amount), 0);
                    return [
                      {
                        label: "Money awaiting payout",
                        value: `$${moneyAwaitingPayout.toFixed(2)}`,
                        sub: `${processingWithdrawals.length} request${processingWithdrawals.length === 1 ? "" : "s"}`,
                        tab: "withdrawals",
                      },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setAdminTab(s.tab)}
                        className="p-4 rounded-lg border bg-white text-left"
                        style={{ borderColor: "#DDD8CC" }}
                      >
                        <div className="text-xs mb-1" style={{ color: SLATE }}>
                          {s.label}
                        </div>
                        <div
                          className="text-2xl font-semibold"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: MARIGOLD }}
                        >
                          {s.value}
                        </div>
                        <div className="text-xs mt-1" style={{ color: SLATE }}>
                          {s.sub}
                        </div>
                      </button>
                    ));
                  })()}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                      Listings by category
                    </h3>
                    <div className="space-y-2">
                      {CATEGORIES.filter((c) => listings.some((l) => l.category === c)).map((c) => {
                        const count = listings.filter((l) => l.category === c).length;
                        const pct = Math.round((count / listings.length) * 100) || 0;
                        return (
                          <div key={c} className="flex items-center gap-2">
                            <span className="text-xs w-24 shrink-0 truncate" style={{ color: SLATE }}>
                              {c}
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLOR[c] }}
                              />
                            </div>
                            <span
                              className="text-xs w-8 text-right shrink-0"
                              style={{ fontFamily: "'IBM Plex Mono', monospace", color: SLATE }}
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                      {listings.length === 0 && (
                        <p className="text-sm" style={{ color: SLATE }}>
                          No listings yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: INK }}>
                      Recent orders
                    </h3>
                    <div className="space-y-2">
                      {orders
                        .slice()
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .slice(0, 5)
                        .map((o) => (
                          <div
                            key={o.id}
                            className="flex items-center justify-between text-sm p-2 rounded-lg border bg-white"
                            style={{ borderColor: "#DDD8CC" }}
                          >
                            <span className="truncate" style={{ color: INK }}>
                              {o.buyerName}
                            </span>
                            <span
                              style={{ fontFamily: "'IBM Plex Mono', monospace", color: SLATE }}
                              className="shrink-0 ml-2"
                            >
                              {formatMoney(o.total, o.currency)}
                            </span>
                          </div>
                        ))}
                      {orders.length === 0 && (
                        <p className="text-sm" style={{ color: SLATE }}>
                          No orders yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === "listings" && hasAdminPermission(currentMember, "listing_moderation") && (
              <div className="space-y-2">
                {listings.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No listings on the marketplace yet.
                  </p>
                )}
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white flex-wrap"
                    style={{ borderColor: l.status === "removed" ? BERRY : "#DDD8CC" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl">{l.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-medium truncate flex items-center gap-2" style={{ color: INK }}>
                          {l.title}
                          {l.isFeatured && <Tag color={MARIGOLD}>Featured</Tag>}
                          {l.status === "draft" && <Tag color={SLATE}>Draft</Tag>}
                          {l.status === "pending" && <Tag color={MARIGOLD}>Pending</Tag>}
                          {l.status === "paused" && <Tag color={SLATE}>Paused</Tag>}
                          {l.status === "sold" && <Tag color={BERRY}>Sold out</Tag>}
                          {l.status === "rejected" && <Tag color={BERRY}>Rejected</Tag>}
                          {l.status === "removed" && <Tag color={BERRY}>Taken down</Tag>}
                        </div>
                        <div className="text-xs" style={{ color: SLATE }}>
                          {l.category}
                          {l.condition && l.condition !== "New" ? ` · ${l.condition}` : ""} · by {l.sellerName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                      <span
                        style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                        className="font-medium"
                      >
                        ${Number(l.price).toFixed(2)}
                      </span>
                      {l.status === "pending" && (
                        <button
                          onClick={() => adminApproveListing(l.id)}
                          className="text-xs font-medium underline"
                          style={{ color: SAGE }}
                        >
                          Approve
                        </button>
                      )}
                      {l.status === "pending" && (
                        <button
                          onClick={() => adminRejectListing(l.id)}
                          className="text-xs font-medium underline"
                          style={{ color: BERRY }}
                        >
                          Reject
                        </button>
                      )}
                      {l.status === "removed" ? (
                        <button
                          onClick={() => adminRestoreListing(l.id)}
                          className="text-xs font-medium underline"
                          style={{ color: SAGE }}
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => adminTakeDownListing(l.id)}
                          className="text-xs font-medium underline"
                          style={{ color: BERRY }}
                        >
                          Take down
                        </button>
                      )}
                      <button
                        onClick={() => adminToggleFeature(l.id)}
                        className="text-xs font-medium underline"
                        style={{ color: SLATE }}
                      >
                        {l.isFeatured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        onClick={() => startEdit(l, true)}
                        className="text-xs font-medium underline"
                        style={{ color: SLATE }}
                      >
                        Edit
                      </button>
                      <button onClick={() => adminRemoveListing(l.id)} aria-label="Delete listing">
                        <Trash2 size={16} style={{ color: BERRY }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "members" && (
              <div>
                {hasAdminPermission(currentMember, "user_management") && (
                  <button
                    onClick={() => setAddMemberOpen(true)}
                    className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: INK, color: "white" }}
                  >
                    <Plus size={16} />
                    Add member
                  </button>
                )}
                <p className="text-xs mb-2" style={{ color: SLATE }}>
                  Admin staff are listed separately from regular members, each sorted A–Z — documents for each
                  member are under "View documents" below their info.
                </p>
                <div className="space-y-2">
                  {members
                    .slice()
                    .sort((a, b) => {
                      if (!!a.isAdmin !== !!b.isAdmin) return a.isAdmin ? -1 : 1;
                      return (a.displayName || a.username || "").localeCompare(b.displayName || b.username || "");
                    })
                    .map((m, i, sorted) => {
                    const hasDocs =
                      m.idType || m.licenseNumber || m.bankStatementUrl || (m.licensePhotos && m.licensePhotos.length > 0);
                    const docsOpen = expandedDocsUsername === m.username;
                    const showAdminHeader = i === 0 && m.isAdmin;
                    const showMemberHeader = !m.isAdmin && (i === 0 || sorted[i - 1].isAdmin);
                    return (
                    <React.Fragment key={m.username}>
                      {showAdminHeader && (
                        <h4 className="text-xs font-semibold uppercase tracking-wide pt-1" style={{ color: SLATE }}>
                          Admin staff
                        </h4>
                      )}
                      {showMemberHeader && (
                        <h4 className="text-xs font-semibold uppercase tracking-wide pt-3" style={{ color: SLATE }}>
                          Members
                        </h4>
                      )}
                    <div
                      className="p-3 rounded-lg border bg-white"
                      style={{ borderColor: "#DDD8CC" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate flex items-center gap-2" style={{ color: INK }}>
                          {m.displayName}
                          {m.isAdmin && <Tag color={MARIGOLD}>Admin</Tag>}
                          {m.isVerified && <Tag color={SAGE}>Verified</Tag>}
                          {m.isApproved === false && m.verificationStatus === "pending" && (
                            <Tag color={MARIGOLD}>Seller application pending</Tag>
                          )}
                          {m.isApproved === false && m.verificationStatus === "rejected" && (
                            <Tag color={BERRY}>Seller application rejected</Tag>
                          )}
                          {m.isApproved === false &&
                            (m.verificationStatus === "none" || !m.verificationStatus) && (
                            <Tag color={SLATE}>Buyer only</Tag>
                          )}
                          {m.isSuspended && <Tag color={BERRY}>Suspended</Tag>}
                        </div>
                        <div className="text-xs" style={{ color: SLATE }}>
                          @{m.username} · {m.email || "no email"} · {m.phone || "no phone"} · {m.officeLocation || "no office set"}
                        </div>
                        {hasDocs && (
                          <button
                            onClick={() => setExpandedDocsUsername(docsOpen ? null : m.username)}
                            className="text-xs font-medium underline mt-1"
                            style={{ color: INK }}
                          >
                            {docsOpen ? "Hide documents" : `View documents${m.licensePhotos?.length ? ` (${m.licensePhotos.length} photo${m.licensePhotos.length > 1 ? "s" : ""})` : ""}`}
                          </button>
                        )}
                      </div>
                      {!m.isAdmin && (
                        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                          {m.isApproved === false &&
                            m.verificationStatus === "pending" &&
                            hasAdminPermission(currentMember, "seller_verification") && (
                            <button
                              onClick={() => adminApproveMember(m.username)}
                              className="text-xs font-medium underline"
                              style={{ color: SAGE }}
                            >
                              Approve seller
                            </button>
                          )}
                          {m.isApproved === false &&
                            m.verificationStatus === "pending" &&
                            hasAdminPermission(currentMember, "seller_verification") && (
                            <button
                              onClick={() => {
                                setRejectModalUsername(m.username);
                                setRejectReasonDraft("");
                              }}
                              className="text-xs font-medium underline"
                              style={{ color: BERRY }}
                            >
                              Reject
                            </button>
                          )}
                          {hasAdminPermission(currentMember, "user_management") && (
                            <button
                              onClick={() => openAdminWarnings(m)}
                              className="text-xs font-medium underline"
                              style={{ color: SLATE }}
                            >
                              Warnings
                            </button>
                          )}
                          {hasAdminPermission(currentMember, "user_management") && (
                            <button
                              onClick={() => adminToggleVerify(m.username)}
                              className="text-xs font-medium underline"
                              style={{ color: SLATE }}
                            >
                              {m.isVerified ? "Unverify" : "Verify"}
                            </button>
                          )}
                          {hasAdminPermission(currentMember, "user_management") && (
                            <button
                              onClick={() => adminToggleSuspend(m.username)}
                              className="text-xs font-medium underline"
                              style={{ color: m.isSuspended ? SAGE : BERRY }}
                            >
                              {m.isSuspended ? "Unsuspend" : "Suspend"}
                            </button>
                          )}
                          {hasAdminPermission(currentMember, "user_management") && (
                            <button onClick={() => adminRemoveMember(m.username)} aria-label="Remove member">
                              <Trash2 size={16} style={{ color: BERRY }} />
                            </button>
                          )}
                        </div>
                      )}
                      {(currentMember?.adminRole === "super_admin" || !currentMember?.adminRole) &&
                        m.username !== currentUser && (
                          <div className="shrink-0">
                            <label className="block text-xs mb-1" style={{ color: SLATE }}>
                              Admin role
                            </label>
                            <select
                              value={m.adminRole || ""}
                              onChange={(e) => adminSetRole(m.username, e.target.value || null)}
                              className="px-2 py-1 rounded-lg border outline-none text-xs bg-white"
                              style={{ borderColor: "#DDD8CC" }}
                            >
                              <option value="">Not an admin</option>
                              {ADMIN_ROLE_ORDER.map((r) => (
                                <option key={r} value={r}>
                                  {ADMIN_ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      {docsOpen && (
                        <div className="mt-3 pt-3" style={{ borderTop: "1px solid #DDD8CC" }}>
                          <div className="text-xs space-y-1 mb-2" style={{ color: SLATE }}>
                            <div>Account type: {m.accountType === "business" ? "Business" : "Personal"}</div>
                            {m.idType && <div>ID type: {m.idType}</div>}
                            {m.idCountry && <div>Issuing country: {m.idCountry}</div>}
                            {m.licenseNumber && <div>License number: {m.licenseNumber}</div>}
                            {m.idVerificationExempt && <div>US-based — ID verification exempt</div>}
                            {m.verificationStatus === "rejected" && m.rejectionReason && (
                              <div>Rejection reason: {m.rejectionReason}</div>
                            )}
                          </div>
                          {m.bankStatementUrl && (
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1" style={{ color: INK }}>
                                Bank statement
                              </p>
                              {m.bankStatementUrl.startsWith("data:image") ? (
                                <a href={m.bankStatementUrl} target="_blank" rel="noreferrer">
                                  <img
                                    src={m.bankStatementUrl}
                                    alt={`${m.displayName} bank statement`}
                                    className="w-24 h-24 object-cover rounded-lg border"
                                    style={{ borderColor: "#DDD8CC" }}
                                  />
                                </a>
                              ) : (
                                <a
                                  href={m.bankStatementUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-medium underline"
                                  style={{ color: INK }}
                                >
                                  View bank statement
                                </a>
                              )}
                            </div>
                          )}
                          {m.licensePhotos && m.licensePhotos.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {m.licensePhotos.map((src, idx) => (
                                <a key={idx} href={src} target="_blank" rel="noreferrer">
                                  <img
                                    src={src}
                                    alt={`${m.displayName} document ${idx + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg border"
                                    style={{ borderColor: "#DDD8CC" }}
                                  />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs" style={{ color: SLATE }}>
                              No photos uploaded.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {adminTab === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No orders placed yet.
                  </p>
                )}
                {orders
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((o) => (
                    <div key={o.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-2" style={{ color: INK }}>
                          {o.buyerName}
                          {o.isDisputed && <Tag color={BERRY}>Disputed</Tag>}
                          {o.paymentStatus === "held" && <Tag color={MARIGOLD}>Held</Tag>}
                          {o.paymentStatus === "released" && <Tag color={SAGE}>Released</Tag>}
                          {o.paymentStatus === "refunded" && <Tag color={BERRY}>Refunded</Tag>}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                        >
                          {formatMoney(o.total, o.currency)}
                        </span>
                      </div>
                      <div className="text-xs mb-2 flex items-center gap-2" style={{ color: SLATE }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                          {orderNumber(o.id)}
                        </span>
                        · {new Date(o.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs mb-2" style={{ color: SLATE }}>
                        {o.items.map((i) => i.title).join(", ")}
                      </div>
                      {o.commissionAmount !== undefined ? (
                        <div
                          className="flex items-center gap-4 text-xs mb-3 pt-2 border-t"
                          style={{ color: SLATE, borderColor: "#EFEBE0" }}
                        >
                          <span>
                            Commission ({Math.round(o.commissionRate * 100)}%):{" "}
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                              ${o.commissionAmount.toFixed(2)}
                            </span>
                          </span>
                          <span>
                            Seller payout:{" "}
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                              ${o.sellerPayout.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs mb-3" style={{ color: SLATE }}>
                          No payment tracking data (order placed before this feature).
                        </p>
                      )}
                      {o.paymentStatus === "held" && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => releasePayout(o.id)}
                            className="text-xs font-medium underline"
                            style={{ color: SAGE }}
                          >
                            Release payout
                          </button>
                          <button
                            onClick={() => refundOrder(o.id)}
                            className="text-xs font-medium underline"
                            style={{ color: BERRY }}
                          >
                            Refund buyer
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {adminTab === "settings" && (
              <div className="max-w-sm">
                {hasAdminPermission(currentMember, "finance") && (
                  <>
                    <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                      Commission rate
                    </label>
                    <p className="text-xs mb-3" style={{ color: SLATE }}>
                      Percentage taken from every sale before the seller payout.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={Math.round(settings.commissionRate * 1000) / 10}
                        onChange={(e) =>
                          setSettings({ ...settings, commissionRate: Number(e.target.value) / 100 })
                        }
                        className="w-24 px-3 py-2 rounded-lg border outline-none"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <span style={{ color: SLATE }}>%</span>
                      <button
                        onClick={() => persistSettings(settings)}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: MARIGOLD, color: INK }}
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-xs mt-3" style={{ color: SLATE }}>
                      Applies to new orders going forward — existing orders keep the rate they were placed under.
                    </p>
                  </>
                )}

                {hasAdminPermission(currentMember, "content_management") && (
                <div className="mt-8 pt-6" style={{ borderTop: "1px solid #DDD8CC" }}>
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Sign up / sign in page image
                  </label>
                  <p className="text-xs mb-3" style={{ color: SLATE }}>
                    Shown as the side photo on the sign up and sign in screens. Falls back to a default photo if
                    none is set.
                  </p>
                  {settings.authImage && (
                    <img
                      src={settings.authImage}
                      alt="Sign up page"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <label
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                      style={{ borderColor: "#DDD8CC", color: SLATE, backgroundColor: "white" }}
                    >
                      {authImageUploading ? "Uploading…" : settings.authImage ? "Change image" : "Choose image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAuthImageSelect}
                        disabled={authImageUploading}
                        className="hidden"
                      />
                    </label>
                    {settings.authImage && (
                      <button
                        onClick={removeAuthImage}
                        className="text-sm font-medium"
                        style={{ color: BERRY }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                )}
              </div>
            )}

            {adminTab === "content" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div>
                <div className="flex gap-2 mb-5">
                  {[
                    { id: "banners", label: `Banners (${content.banners.length})` },
                    { id: "articles", label: `Help articles (${content.articles.length})` },
                    { id: "faqs", label: `FAQs (${content.faqs.length})` },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setContentTab(t.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border"
                      style={{
                        borderColor: contentTab === t.id ? INK : "#DDD8CC",
                        backgroundColor: contentTab === t.id ? INK : "white",
                        color: contentTab === t.id ? "white" : SLATE,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {contentTab === "banners" && (
                  <div>
                    <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                      <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                        New banner message
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          value={bannerForm.message}
                          onChange={(e) => setBannerForm({ ...bannerForm, message: e.target.value })}
                          placeholder="e.g. Free shipping on orders over $50 this week!"
                          className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <select
                          value={bannerForm.tone}
                          onChange={(e) => setBannerForm({ ...bannerForm, tone: e.target.value })}
                          className="px-2 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        >
                          <option value="info">Info</option>
                          <option value="success">Success</option>
                          <option value="alert">Alert</option>
                        </select>
                      </div>

                      <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                        Media <span className="font-normal" style={{ color: SLATE }}>(optional)</span>
                      </label>
                      <div className="flex gap-2 mb-3">
                        {[
                          { id: "none", label: "None" },
                          { id: "image", label: "Image" },
                          { id: "video", label: "Video" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setBannerForm({ ...bannerForm, mediaType: opt.id })}
                            className="px-3 py-1.5 rounded-full text-xs font-medium border"
                            style={{
                              borderColor: bannerForm.mediaType === opt.id ? INK : "#DDD8CC",
                              backgroundColor: bannerForm.mediaType === opt.id ? INK : "white",
                              color: bannerForm.mediaType === opt.id ? "white" : SLATE,
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {bannerForm.mediaType === "image" && (
                        <div className="mb-3">
                          {bannerForm.imageUrl ? (
                            <div className="relative inline-block mb-2">
                              <img
                                src={bannerForm.imageUrl}
                                alt="Banner preview"
                                className="h-24 rounded-lg border object-cover"
                                style={{ borderColor: "#DDD8CC" }}
                              />
                              <button
                                type="button"
                                onClick={() => setBannerForm({ ...bannerForm, imageUrl: "" })}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: BERRY }}
                                aria-label="Remove image"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <label
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer"
                              style={{ borderColor: "#DDD8CC", color: SLATE }}
                            >
                              {bannerImageUploading ? "Uploading…" : "Choose image"}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerImageSelect}
                                disabled={bannerImageUploading}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}

                      {bannerForm.mediaType === "video" && (
                        <div className="mb-3">
                          <input
                            value={bannerForm.videoUrl}
                            onChange={(e) => setBannerForm({ ...bannerForm, videoUrl: e.target.value })}
                            placeholder="Direct video URL, e.g. https://example.com/promo.mp4"
                            className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                            style={{ borderColor: "#DDD8CC" }}
                          />
                          <p className="text-xs mt-1" style={{ color: SLATE }}>
                            Use a direct .mp4/.webm link — YouTube/Vimeo share links won't play inline.
                          </p>
                        </div>
                      )}

                      <button
                        onClick={async () => {
                          await addBanner(bannerForm);
                          setBannerForm({ message: "", tone: "info", mediaType: "none", imageUrl: "", videoUrl: "" });
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: MARIGOLD, color: INK }}
                      >
                        Add banner
                      </button>
                    </div>
                    <div className="space-y-2">
                      {content.banners.length === 0 && (
                        <p className="text-sm" style={{ color: SLATE }}>
                          No banners yet.
                        </p>
                      )}
                      {content.banners.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white"
                          style={{ borderColor: "#DDD8CC" }}
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            {b.mediaType === "image" && b.imageUrl && (
                              <img src={b.imageUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                            )}
                            {b.mediaType === "video" && b.videoUrl && (
                              <span className="text-base shrink-0" title="Has video">🎬</span>
                            )}
                            <Tag
                              color={
                                b.tone === "alert" ? BERRY : b.tone === "success" ? SAGE : "#3B6E8F"
                              }
                            >
                              {b.tone}
                            </Tag>
                            <span className="text-sm truncate" style={{ color: INK }}>
                              {b.message}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => updateBanner(b.id, { isActive: !b.isActive })}
                              className="text-xs font-medium underline"
                              style={{ color: b.isActive ? BERRY : SAGE }}
                            >
                              {b.isActive ? "Hide" : "Show"}
                            </button>
                            <button onClick={() => removeBanner(b.id)} aria-label="Delete banner">
                              <Trash2 size={16} style={{ color: BERRY }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contentTab === "articles" && (
                  <div>
                    <button
                      onClick={() => {
                        setArticleForm({ title: "", body: "" });
                        setEditingArticleId(null);
                        setArticleModalOpen(true);
                      }}
                      className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: INK, color: "white" }}
                    >
                      <Plus size={16} />
                      New article
                    </button>
                    <div className="space-y-2">
                      {content.articles.length === 0 && (
                        <p className="text-sm" style={{ color: SLATE }}>
                          No help articles yet.
                        </p>
                      )}
                      {content.articles.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white"
                          style={{ borderColor: "#DDD8CC" }}
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate" style={{ color: INK }}>
                              {a.title}
                            </div>
                            <div className="text-xs truncate" style={{ color: SLATE }}>
                              {a.body}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => {
                                setArticleForm({ title: a.title, body: a.body });
                                setEditingArticleId(a.id);
                                setArticleModalOpen(true);
                              }}
                              aria-label="Edit article"
                            >
                              <Pencil size={16} style={{ color: SLATE }} />
                            </button>
                            <button onClick={() => removeArticle(a.id)} aria-label="Delete article">
                              <Trash2 size={16} style={{ color: BERRY }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contentTab === "faqs" && (
                  <div>
                    <div className="p-4 rounded-lg border bg-white mb-4" style={{ borderColor: "#DDD8CC" }}>
                      <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                        {editingFaqId ? "Edit FAQ" : "New FAQ"}
                      </label>
                      <input
                        value={faqForm.question}
                        onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                        placeholder="Question"
                        className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <textarea
                        value={faqForm.answer}
                        onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                        placeholder="Answer"
                        rows={2}
                        className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (editingFaqId) {
                              await updateFaq(editingFaqId, faqForm);
                            } else {
                              await addFaq(faqForm);
                            }
                            setFaqForm({ question: "", answer: "" });
                            setEditingFaqId(null);
                          }}
                          className="px-4 py-2 rounded-lg text-sm font-medium"
                          style={{ backgroundColor: MARIGOLD, color: INK }}
                        >
                          {editingFaqId ? "Save changes" : "Add FAQ"}
                        </button>
                        {editingFaqId && (
                          <button
                            onClick={() => {
                              setFaqForm({ question: "", answer: "" });
                              setEditingFaqId(null);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium border"
                            style={{ borderColor: "#DDD8CC", color: SLATE }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {content.faqs.length === 0 && (
                        <p className="text-sm" style={{ color: SLATE }}>
                          No FAQs yet.
                        </p>
                      )}
                      {content.faqs.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white"
                          style={{ borderColor: "#DDD8CC" }}
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate" style={{ color: INK }}>
                              {f.question}
                            </div>
                            <div className="text-xs truncate" style={{ color: SLATE }}>
                              {f.answer}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => {
                                setFaqForm({ question: f.question, answer: f.answer });
                                setEditingFaqId(f.id);
                              }}
                              aria-label="Edit FAQ"
                            >
                              <Pencil size={16} style={{ color: SLATE }} />
                            </button>
                            <button onClick={() => removeFaq(f.id)} aria-label="Delete FAQ">
                              <Trash2 size={16} style={{ color: BERRY }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {adminTab === "withdrawals" && hasAdminPermission(currentMember, "finance") && (
              <div className="space-y-2">
                <p className="text-xs mb-2" style={{ color: SLATE }}>
                  Withdrawals process automatically once a seller requests one — nothing to approve here.
                  This is a read-only history.
                </p>
                {withdrawals.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No withdrawal requests yet.
                  </p>
                )}
                {withdrawals
                  .slice()
                  .sort((a, b) => b.requestedAt - a.requestedAt)
                  .map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white flex-wrap"
                      style={{ borderColor: "#DDD8CC" }}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate flex items-center gap-2" style={{ color: INK }}>
                          {members.find((m) => m.username === w.sellerUsername)?.displayName || w.sellerUsername}
                          <Tag
                            color={
                              w.status === "paid" ? SAGE : w.status === "failed" ? BERRY : MARIGOLD
                            }
                          >
                            {w.status === "paid" ? "Paid" : w.status === "failed" ? "Failed" : "Processing"}
                          </Tag>
                        </div>
                        <div className="text-xs" style={{ color: SLATE }}>
                          Requested {new Date(w.requestedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          {w.status === "failed" && w.failureReason ? ` — ${w.failureReason}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                          className="font-medium"
                        >
                          ${w.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {adminTab === "disputes" && hasAdminPermission(currentMember, "dispute_resolution") && (
              <div className="space-y-3">
                {disputedOrders.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No open disputes right now.
                  </p>
                )}
                {disputedOrders
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((o) => (
                    <div
                      key={o.id}
                      className="p-4 rounded-lg border bg-white"
                      style={{ borderColor: BERRY }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: INK }}>
                          {o.buyerName}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                        >
                          {formatMoney(o.total, o.currency)}
                        </span>
                      </div>
                      <div className="text-xs mb-2" style={{ color: SLATE }}>
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs mb-3" style={{ color: SLATE }}>
                        {o.items.map((i) => i.title).join(", ")}
                      </div>
                      <button
                        onClick={() => resolveDispute(o.id)}
                        className="text-xs font-medium underline"
                        style={{ color: SAGE }}
                      >
                        Mark as resolved
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {adminTab === "reports" && hasAdminPermission(currentMember, "dispute_resolution") && (
              <div className="space-y-3">
                {messageReports.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No reported messages.
                  </p>
                )}
                {messageReports
                  .slice()
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-lg border bg-white"
                      style={{ borderColor: r.status === "open" ? BERRY : "#DDD8CC" }}
                    >
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-sm font-medium flex items-center gap-2" style={{ color: INK }}>
                          Reported by {r.reporter_display_name || r.reporter_username}
                          {r.status === "resolved" && <Tag color={SAGE}>Resolved</Tag>}
                        </span>
                        <span className="text-xs" style={{ color: SLATE }}>
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                      {r.listing_title && (
                        <div className="text-xs mb-2" style={{ color: SLATE }}>
                          Re: {r.listing_title}
                        </div>
                      )}
                      <div
                        className="text-sm p-3 rounded-lg mb-2"
                        style={{ backgroundColor: CANVAS, color: INK }}
                      >
                        <div className="text-xs font-medium mb-1" style={{ color: SLATE }}>
                          From {r.sender_display_name || r.sender_username}
                        </div>
                        {r.message_image_url && (
                          <img
                            src={r.message_image_url}
                            alt="Reported attachment"
                            className="rounded-lg mb-1 max-w-full"
                            style={{ maxHeight: "160px" }}
                          />
                        )}
                        {r.message_body || <em>No text</em>}
                      </div>
                      {r.reason && (
                        <div className="text-xs mb-3" style={{ color: SLATE }}>
                          <span className="font-medium">Reason:</span> {r.reason}
                        </div>
                      )}
                      {r.status === "open" && (
                        <button
                          onClick={() => adminResolveMessageReport(r.id)}
                          className="text-xs font-medium underline"
                          style={{ color: SAGE }}
                        >
                          Mark as resolved
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {adminTab === "reviewReports" && hasAdminPermission(currentMember, "dispute_resolution") && (
              <div className="space-y-3">
                {reviewReports.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No reported reviews.
                  </p>
                )}
                {reviewReports
                  .slice()
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-lg border bg-white"
                      style={{ borderColor: r.status === "open" ? BERRY : "#DDD8CC" }}
                    >
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-sm font-medium flex items-center gap-2" style={{ color: INK }}>
                          Reported by {r.reporter_display_name || r.reporter_username}
                          {r.status === "resolved" && <Tag color={SAGE}>Resolved</Tag>}
                        </span>
                        <span className="text-xs" style={{ color: SLATE }}>
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs mb-2" style={{ color: SLATE }}>
                        Review of {r.review_seller_display_name || r.review_seller_username}, by{" "}
                        {r.review_buyer_display_name || r.review_buyer_username}
                      </div>
                      <div
                        className="text-sm p-3 rounded-lg mb-2"
                        style={{ backgroundColor: CANVAS, color: INK }}
                      >
                        <StarDisplay value={r.review_rating} />
                        <div className="mt-1">{r.review_comment || <em>No comment</em>}</div>
                      </div>
                      {r.reason && (
                        <div className="text-xs mb-3" style={{ color: SLATE }}>
                          <span className="font-medium">Reason:</span> {r.reason}
                        </div>
                      )}
                      {r.status === "open" && (
                        <button
                          onClick={() => adminResolveReviewReport(r.id)}
                          className="text-xs font-medium underline"
                          style={{ color: SAGE }}
                        >
                          Mark as resolved
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {adminTab === "accountReports" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div className="space-y-3">
                {accountReports.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No account reports.
                  </p>
                )}
                {accountReports
                  .slice()
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-lg border bg-white"
                      style={{ borderColor: r.status === "open" ? BERRY : "#DDD8CC" }}
                    >
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-sm font-medium flex items-center gap-2" style={{ color: INK }}>
                          {r.display_name || r.username}
                          {r.status === "resolved" && <Tag color={SAGE}>Resolved</Tag>}
                        </span>
                        <span className="text-xs" style={{ color: SLATE }}>
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div
                        className="text-sm p-3 rounded-lg mb-3"
                        style={{ backgroundColor: CANVAS, color: INK }}
                      >
                        {r.message}
                      </div>
                      {r.status === "open" && (
                        <button
                          onClick={() => adminResolveAccountReport(r.id)}
                          className="text-xs font-medium underline"
                          style={{ color: SAGE }}
                        >
                          Mark as resolved
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {adminTab === "auditLog" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div>
                <p className="text-xs mb-4" style={{ color: SLATE }}>
                  Every admin role change, most recent first. Currently the only action tracked here — a good
                  foundation to log more admin actions later without needing another migration.
                </p>
                {loadingAuditLog ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    Loading...
                  </p>
                ) : auditLog.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No audit log entries yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {auditLog.map((entry) => (
                      <div key={entry.id} className="p-3 rounded-lg border bg-white text-sm" style={{ borderColor: "#DDD8CC" }}>
                        <div style={{ color: INK }}>{entry.details}</div>
                        <div className="text-xs mt-1" style={{ color: SLATE }}>
                          {entry.display_name || entry.username || "Unknown admin"} ·{" "}
                          {new Date(entry.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {adminTab === "supportTickets" && hasAdminPermission(currentMember, "support_tickets") && (
              <div className="space-y-3">
                {adminTickets.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No support tickets.
                  </p>
                )}
                {adminTickets
                  .slice()
                  .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        openTicketThread(t.id);
                        setView("help");
                      }}
                      className="w-full text-left flex items-center justify-between gap-3 p-4 rounded-lg border bg-white"
                      style={{ borderColor: t.status === "open" ? BERRY : "#DDD8CC" }}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: INK }}>
                          {t.subject}
                        </div>
                        <div className="text-xs" style={{ color: SLATE }}>
                          {t.display_name || t.username} · {new Date(t.updated_at).toLocaleString()}
                        </div>
                      </div>
                      <Tag color={t.status === "resolved" ? SAGE : t.status === "in_progress" ? MARIGOLD : BERRY}>
                        {TICKET_STATUS_LABEL[t.status] || t.status}
                      </Tag>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ backgroundColor: INK }} className="mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#8A93A3" }}>
              Shop
            </h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => setView("browse")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Browse listings
              </button>
              <button onClick={() => setView("browse")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Categories
              </button>
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                How it works
              </button>
              {!currentUser && (
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setView("signup");
                  }}
                  className="text-sm text-left"
                  style={{ color: "#E5E7EB" }}
                >
                  Create an account
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#8A93A3" }}>
              Sell
            </h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => setView("sell")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Become a seller
              </button>
              <button onClick={() => setView("dashboard")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Seller dashboard
              </button>
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Shipping & delivery
              </button>
              <button onClick={() => setView("wallet")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Getting paid
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#8A93A3" }}>
              Support
            </h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Contact support
              </button>
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Help center
              </button>
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Marketplace policies
              </button>
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Returns & disputes
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#8A93A3" }}>
              Stallyard
            </h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Seller rules
              </button>
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Prohibited items
              </button>
              <button onClick={() => setView("help")} className="text-sm text-left" style={{ color: "#E5E7EB" }}>
                Fees
              </button>
            </div>
          </div>
        </div>
        <div
          className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-xs" style={{ color: "#8A93A3" }}>
            © {new Date().getFullYear()} Stallyard. Payments processed securely through Paystack.
          </p>
        </div>
      </footer>

      {/* Detail modal */}
      {selected && (() => {
        const liveSelected = listings.find((l) => l.id === selected.id) || selected;
        const isAuction = liveSelected.listingType === "auction";
        const timeLeft = isAuction ? formatTimeRemaining(liveSelected.auctionEndTime, nowTick) : null;
        const auctionEnded = isAuction && !timeLeft;
        const isHighBidder = liveSelected.highestBidderUsername === currentUser;
        return (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            {selected.images && selected.images.length > 0 ? (
              <div className="mb-3">
                <img
                  src={selected.images[activeImg]}
                  alt={selected.title}
                  className="w-full h-56 object-cover rounded-xl"
                />
                {selected.images.length > 1 && (
                  <div className="flex gap-2 mt-2">
                    {selected.images.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImg(idx)}
                        className="w-14 h-14 rounded-lg overflow-hidden border-2"
                        style={{ borderColor: idx === activeImg ? MARIGOLD : "transparent" }}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-4xl mb-3">{selected.emoji}</div>
            )}
            <h3 className="text-xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              {selected.title}
            </h3>
            <div
              className="text-2xl mb-3"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
            >
              ${Number(selected.price).toFixed(2)}
            </div>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              {selected.description || "No description provided."}
            </p>
            {selected.category === "Auto Parts" && (selected.fitMake || selected.fitModel) && (
              <p
                className="text-sm font-medium mb-4 px-3 py-2 rounded-lg"
                style={{ color: CATEGORY_COLOR["Auto Parts"], backgroundColor: CANVAS }}
              >
                Fits: {[selected.fitMake, selected.fitModel, selected.fitYear].filter(Boolean).join(" ")}
              </p>
            )}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Tag color={CATEGORY_COLOR[selected.category] || SLATE}>{selected.category}</Tag>
                <Tag color={CONDITION_COLOR[selected.condition] || SAGE}>{selected.condition || "New"}</Tag>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const rep = getSellerReputation(selected.ownerUsername);
                  return rep ? (
                    <span
                      className="text-xs font-medium"
                      style={{ color: rep.positivePct >= 90 ? SAGE : rep.positivePct >= 70 ? MARIGOLD : BERRY }}
                    >
                      {rep.positivePct}% positive
                    </span>
                  ) : null;
                })()}
                <button
                  onClick={() => openStorefront(selected.ownerUsername)}
                  className="text-xs underline"
                  style={{ color: SLATE }}
                >
                  sold by {selected.sellerName}
                </button>
              </div>
            </div>
            {(() => {
              const vacation = getSellerVacationInfo(selected.ownerUsername);
              if (!vacation) return null;
              return (
                <div
                  className="mb-4 px-3 py-2 rounded-lg text-xs"
                  style={{ backgroundColor: "#FBF0DC", color: INK }}
                >
                  🌴 This seller is on vacation
                  {vacation.returnDate
                    ? ` until ${new Date(vacation.returnDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                    : ""}
                  . {vacation.message || "Orders may ship later than usual."}
                </div>
              );
            })()}
            {(() => {
              const rating = getListingRating(selected.id);
              return rating ? (
                <div className="flex items-center gap-2 mb-2">
                  <StarDisplay value={rating.avg} />
                  <span className="text-xs" style={{ color: SLATE }}>
                    {rating.avg.toFixed(1)} ({rating.count} review{rating.count !== 1 ? "s" : ""})
                  </span>
                </div>
              ) : (
                <p className="text-xs mb-2" style={{ color: SLATE }}>
                  No reviews yet.
                </p>
              );
            })()}
            <p className="text-xs mb-5" style={{ color: SLATE }}>
              {selected.shippingFee
                ? `+ ${formatMoney(selected.shippingFee, selected.currency)} shipping`
                : "Free shipping"}
            </p>
            {isAuction ? (
              <div>
                <div
                  className="p-3 rounded-lg mb-4"
                  style={{ backgroundColor: "#E3EDF4" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: "#3B6E8F" }}>
                      Current bid
                    </span>
                    <span className="text-xs font-medium" style={{ color: "#3B6E8F" }}>
                      {auctionEnded ? "Auction ended" : timeLeft}
                    </span>
                  </div>
                  <div
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                  >
                    {formatMoney(liveSelected.price, liveSelected.currency)}
                  </div>
                  <div className="text-xs mt-1" style={{ color: SLATE }}>
                    {(liveSelected.bidHistory || []).length} bid
                    {(liveSelected.bidHistory || []).length !== 1 ? "s" : ""}
                    {liveSelected.highestBidderUsername &&
                      ` · highest bidder: ${
                        liveSelected.highestBidderUsername === currentUser
                          ? "you"
                          : liveSelected.bidHistory[liveSelected.bidHistory.length - 1]?.bidderName || "someone"
                      }`}
                  </div>
                </div>

                {auctionEnded ? (
                  isHighBidder ? (
                    <button
                      onClick={() => {
                        addToCartAtPrice(liveSelected, liveSelected.price);
                        setSelected(null);
                      }}
                      className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 mb-3"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      <ShoppingBag size={16} />
                      You won! Add to cart at {formatMoney(liveSelected.price, liveSelected.currency)}
                    </button>
                  ) : (
                    <p className="text-sm text-center mb-3" style={{ color: SLATE }}>
                      {(liveSelected.bidHistory || []).length === 0
                        ? "This auction ended with no bids."
                        : "This auction has ended."}
                    </p>
                  )
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: SLATE }}>{CURRENCIES[liveSelected.currency]?.symbol || "$"}</span>
                    <input
                      type="number"
                      min={Number(liveSelected.price) + 1}
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={(Number(liveSelected.price) + 1).toFixed(2)}
                      className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <button
                      onClick={() => placeBid(liveSelected, bidAmount)}
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      Place bid
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleWatchlist(liveSelected.id)}
                    className="flex-1 py-2.5 px-4 rounded-lg font-medium border flex items-center justify-center gap-2"
                    style={{
                      borderColor: watchlist.includes(liveSelected.id) ? BERRY : "#DDD8CC",
                      color: watchlist.includes(liveSelected.id) ? BERRY : SLATE,
                    }}
                  >
                    <Heart size={16} fill={watchlist.includes(liveSelected.id) ? BERRY : "none"} />
                    {watchlist.includes(liveSelected.id) ? "Saved" : "Watch"}
                  </button>
                  <button
                    onClick={() => startOrOpenThread(liveSelected)}
                    className="flex-1 py-2.5 rounded-lg font-medium border"
                    style={{ borderColor: "#DDD8CC", color: SLATE }}
                  >
                    Message seller
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => addToCart(selected)}
                  className="flex-1 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  <ShoppingBag size={16} />
                  Add to cart
                </button>
                <button
                  onClick={() => toggleWatchlist(selected.id)}
                  className="py-2.5 px-4 rounded-lg font-medium border flex items-center justify-center gap-2"
                  style={{
                    borderColor: watchlist.includes(selected.id) ? BERRY : "#DDD8CC",
                    color: watchlist.includes(selected.id) ? BERRY : SLATE,
                  }}
                  aria-label={watchlist.includes(selected.id) ? "Remove from watchlist" : "Save to watchlist"}
                >
                  <Heart size={16} fill={watchlist.includes(selected.id) ? BERRY : "none"} />
                </button>
                <button
                  onClick={() => startOrOpenThread(selected)}
                  className="flex-1 py-2.5 rounded-lg font-medium border"
                  style={{ borderColor: "#DDD8CC", color: SLATE }}
                >
                  Message seller
                </button>
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* Cart drawer */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-40 flex justify-end"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setCartOpen(false)}
        >
          <div
            className="bg-white h-full w-full max-w-sm p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                Your cart
              </h3>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart">
                <X size={20} style={{ color: SLATE }} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={32} className="mx-auto mb-3" style={{ color: SLATE }} />
                <p className="text-sm" style={{ color: SLATE }}>
                  Your cart is empty.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: INK }}>
                          {item.title}
                        </div>
                        <div
                          className="text-xs mt-0.5 flex items-center gap-2"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: SLATE }}
                        >
                          {formatMoney(item.price, item.currency)} each
                          {item.isOfferPrice && <Tag color={MARIGOLD}>Offer price</Tag>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            className="w-6 h-6 rounded-md border flex items-center justify-center"
                            style={{ borderColor: "#DDD8CC" }}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} style={{ color: SLATE }} />
                          </button>
                          <span
                            className="text-sm w-5 text-center"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                          >
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            className="w-6 h-6 rounded-md border flex items-center justify-center"
                            style={{ borderColor: "#DDD8CC" }}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} style={{ color: SLATE }} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span
                          className="text-sm font-medium"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                        >
                          {formatMoney(item.price * item.qty, item.currency)}
                        </span>
                        <button onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                          <Trash2 size={14} style={{ color: BERRY }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span style={{ color: SLATE }}>Subtotal</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                      {formatMoney(cartSubtotal, cartCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span style={{ color: SLATE }}>Shipping</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                      {cartShipping > 0 ? formatMoney(cartShipping, cartCurrency) : "Free"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#EFEBE0" }}>
                    <span className="text-sm" style={{ color: SLATE }}>
                      Total
                    </span>
                    <span
                      className="text-xl"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                    >
                      {formatMoney(cartTotal, cartCurrency)}
                    </span>
                  </div>
                </div>

                {currentUser && (
                  <div className="border-t pt-4 mb-4" style={{ borderColor: "#DDD8CC" }}>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: INK }}>
                      Shipping address
                    </h4>
                    <div className="space-y-2">
                      <input
                        value={shippingForm.fullName}
                        onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                        placeholder="Full name"
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <input
                        value={shippingForm.street}
                        onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                        placeholder="Street address"
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <div className="flex gap-2">
                        <input
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          placeholder="City"
                          className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <input
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                          placeholder="State/Province"
                          className="w-28 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={shippingForm.zip}
                          onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                          placeholder="ZIP / postal code"
                          className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <input
                          value={shippingForm.country}
                          onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                          placeholder="Country"
                          className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs pt-1" style={{ color: SLATE }}>
                        <input
                          type="checkbox"
                          checked={saveShippingAddress}
                          onChange={(e) => setSaveShippingAddress(e.target.checked)}
                        />
                        Save this address to my account for next time
                      </label>
                      {shippingError && (
                        <p className="text-xs" style={{ color: BERRY }}>
                          {shippingError}
                        </p>
                      )}
                      <p className="text-xs" style={{ color: SLATE }}>
                        Demo storage isn't encrypted — avoid using an address you wouldn't want visible to the marketplace admin.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={checkout}
                  className="w-full py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Checkout
                </button>
                <p className="text-xs text-center mt-2" style={{ color: SLATE }}>
                  No payment is processed — this saves your order to your account.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order confirmation modal */}
      {confirmedOrder && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setConfirmedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConfirmedOrder(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
              style={{ backgroundColor: "#E7EFE8" }}
            >
              ✓
            </div>
            <h3 className="text-xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Order confirmed
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              Thanks! Your order has been placed.
            </p>
            <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: CANVAS }}>
              <div className="text-xs uppercase tracking-wide mb-1" style={{ color: SLATE }}>
                Confirmation number
              </div>
              <div
                className="text-lg font-semibold"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
              >
                {orderNumber(confirmedOrder.id)}
              </div>
            </div>
            <div className="text-sm mb-4" style={{ color: SLATE }}>
              Total charged:{" "}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                {formatMoney(confirmedOrder.total, confirmedOrder.currency)}
              </span>
            </div>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                setView("orders");
              }}
              className="w-full py-2.5 rounded-lg font-medium"
              style={{ backgroundColor: MARIGOLD, color: INK }}
            >
              View my orders
            </button>
          </div>
        </div>
      )}

      {/* Vacation mode settings modal */}
      {vacationOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setVacationOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVacationOpen(false)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-1" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              🌴 Turn on vacation mode
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              Buyers will see a notice on your listings and when they add your items to their cart.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Back on{" "}
                  <span className="font-normal" style={{ color: SLATE }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={vacationForm.returnDate}
                  onChange={(e) => setVacationForm({ ...vacationForm, returnDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Message to buyers{" "}
                  <span className="font-normal" style={{ color: SLATE }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  value={vacationForm.message}
                  onChange={(e) => setVacationForm({ ...vacationForm, message: e.target.value })}
                  rows={2}
                  placeholder="e.g. Orders will ship as soon as I'm back!"
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <button
                type="button"
                onClick={saveVacationSettings}
                className="w-full py-2.5 rounded-lg font-medium mt-1"
                style={{ backgroundColor: MARIGOLD, color: INK }}
              >
                Turn on vacation mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retroactive ID verification modal (US sellers past the sales threshold) */}
      {idVerifyOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setIdVerifyOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIdVerifyOpen(false)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-1" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              Add ID verification
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              You've crossed ${ID_VERIFICATION_SALES_THRESHOLD.toLocaleString()} in sales, so Stallyard now needs ID on file to keep you selling.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    ID type
                  </label>
                  <select
                    value={idVerifyForm.idType}
                    onChange={(e) => setIdVerifyForm({ ...idVerifyForm, idType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                    style={{ borderColor: "#DDD8CC" }}
                  >
                    <option>Passport</option>
                    <option>National ID</option>
                    <option>Driver's License</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Issuing country
                  </label>
                  <input
                    value={idVerifyForm.idCountry}
                    onChange={(e) => setIdVerifyForm({ ...idVerifyForm, idCountry: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: "#DDD8CC" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  License number{" "}
                  <span className="font-normal" style={{ color: SLATE }}>
                    (self-reported, not verified)
                  </span>
                </label>
                <input
                  value={idVerifyForm.licenseNumber}
                  onChange={(e) => setIdVerifyForm({ ...idVerifyForm, licenseNumber: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <button
                type="button"
                onClick={submitIdVerification}
                className="w-full py-2.5 rounded-lg font-medium mt-1"
                style={{ backgroundColor: MARIGOLD, color: INK }}
              >
                Save & continue selling
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModalUsername && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setRejectModalUsername(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setRejectModalUsername(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-1" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              Reject seller application
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              Let {rejectModalUsername} know why, so they can fix it and re-apply.
            </p>
            <textarea
              value={rejectReasonDraft}
              onChange={(e) => setRejectReasonDraft(e.target.value)}
              placeholder="e.g. Bank statement doesn't match the name on file"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border outline-none mb-3"
              style={{ borderColor: "#DDD8CC" }}
            />
            <button
              type="button"
              onClick={() => {
                adminRejectMember(rejectModalUsername, rejectReasonDraft.trim());
                setRejectModalUsername(null);
              }}
              className="w-full py-2.5 rounded-lg font-medium"
              style={{ backgroundColor: BERRY, color: "white" }}
            >
              Reject application
            </button>
          </div>
        </div>
      )}

      {previewOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-3" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              Preview listing
            </h3>
            {form.images.length > 0 ? (
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {form.images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg shrink-0"
                  />
                ))}
              </div>
            ) : (
              <div className="text-4xl mb-3">{form.emoji}</div>
            )}
            <div className="font-medium text-lg mb-1" style={{ color: INK }}>
              {form.title || "Untitled listing"}
            </div>
            <div
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
            >
              {CURRENCIES[form.currency]?.symbol || "$"}
              {form.price ? Number(form.price).toFixed(2) : "0.00"}
            </div>
            <div className="text-sm mb-3" style={{ color: SLATE }}>
              {form.category} · {form.condition}
              {form.quantity && ` · Qty: ${form.quantity}`}
            </div>
            {form.description && (
              <p className="text-sm mb-3" style={{ color: INK }}>
                {form.description}
              </p>
            )}
            <div className="text-xs space-y-1 mb-4" style={{ color: SLATE }}>
              {form.brand && <div>Brand: {form.brand}</div>}
              {form.sku && <div>SKU/part number: {form.sku}</div>}
              {form.category === "Auto Parts" && (form.fitMake || form.fitModel || form.fitYear) && (
                <div>
                  Fits: {form.fitMake} {form.fitModel} {form.fitYear}
                </div>
              )}
              {form.category === "Auto Parts" && form.vin && <div>VIN: {form.vin}</div>}
              {form.state && <div>Location: {form.state}</div>}
              {form.shippingMethods.length > 0 && (
                <div>
                  Shipping:{" "}
                  {form.shippingMethods
                    .map((v) => SHIPPING_METHODS.find((m) => m.value === v)?.label || v)
                    .join(", ")}
                </div>
              )}
              {form.returnPolicy && <div>Return policy: {form.returnPolicy}</div>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="flex-1 py-2.5 rounded-lg font-medium border"
                style={{ borderColor: "#DDD8CC", color: SLATE }}
              >
                Back to edit
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("publish")}
                className="flex-1 py-2.5 rounded-lg font-medium"
                style={{ backgroundColor: MARIGOLD, color: INK }}
              >
                Publish listing
              </button>
            </div>
          </div>
        </div>
      )}

      {packingSlipOrder && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setPackingSlipOrder(null)}
        >
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #packing-slip-content, #packing-slip-content * { visibility: visible; }
              #packing-slip-content {
                position: absolute; top: 0; left: 0; width: 100%; padding: 24px;
              }
              #packing-slip-no-print { display: none !important; }
            }
          `}</style>
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="packing-slip-no-print"
              onClick={() => setPackingSlipOrder(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <div id="packing-slip-content">
              <h3 className="text-lg font-semibold mb-1" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
                Packing slip
              </h3>
              <p className="text-xs mb-4" style={{ color: SLATE }}>
                {orderNumber(packingSlipOrder.id)} · {new Date(packingSlipOrder.createdAt).toLocaleString()}
              </p>
              <div className="mb-4">
                <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: SLATE }}>
                  Ship to
                </div>
                {packingSlipOrder.shippingAddress ? (
                  <p className="text-sm" style={{ color: INK }}>
                    {packingSlipOrder.shippingAddress.fullName}
                    <br />
                    {packingSlipOrder.shippingAddress.street}
                    <br />
                    {packingSlipOrder.shippingAddress.city}
                    {packingSlipOrder.shippingAddress.state ? `, ${packingSlipOrder.shippingAddress.state}` : ""}{" "}
                    {packingSlipOrder.shippingAddress.zip}
                    <br />
                    {packingSlipOrder.shippingAddress.country}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No shipping address on file.
                  </p>
                )}
              </div>
              <div className="mb-4">
                <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: SLATE }}>
                  Items
                </div>
                <div className="space-y-2">
                  {packingSlipOrder.items
                    .filter((i) => i.ownerUsername === currentUser)
                    .map((i) => (
                      <div key={i.id} className="flex items-center justify-between text-sm" style={{ color: INK }}>
                        <span>
                          {i.title} × {i.qty}
                        </span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          ${(i.price * i.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="pt-3 text-xs" style={{ borderTop: "1px solid #EFEBE0", color: SLATE }}>
                Sold by {currentMember?.displayName} on Stallyard
              </div>
            </div>
            <button
              id="packing-slip-no-print"
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-lg font-medium mt-4"
              style={{ backgroundColor: MARIGOLD, color: INK }}
            >
              Print
            </button>
          </div>
        </div>
      )}

      {reportMessageId && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setReportMessageId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReportMessageId(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-1" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              Report this message
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              An admin will review it. This doesn't notify the other person.
            </p>
            <textarea
              value={reportReasonDraft}
              onChange={(e) => setReportReasonDraft(e.target.value)}
              placeholder="What's wrong with this message? (optional)"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border outline-none mb-3"
              style={{ borderColor: "#DDD8CC" }}
            />
            <button
              type="button"
              onClick={() => {
                reportMessage(reportMessageId, reportReasonDraft.trim());
                setReportMessageId(null);
              }}
              className="w-full py-2.5 rounded-lg font-medium"
              style={{ backgroundColor: BERRY, color: "white" }}
            >
              Submit report
            </button>
          </div>
        </div>
      )}

      {reportReviewId && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setReportReviewId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReportReviewId(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-1" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              Report this review
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              An admin will review it for being abusive or fraudulent.
            </p>
            <textarea
              value={reviewReportReasonDraft}
              onChange={(e) => setReviewReportReasonDraft(e.target.value)}
              placeholder="What's wrong with this review? (optional)"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border outline-none mb-3"
              style={{ borderColor: "#DDD8CC" }}
            />
            <button
              type="button"
              onClick={() => {
                reportReview(reportReviewId, reviewReportReasonDraft.trim());
                setReportReviewId(null);
              }}
              className="w-full py-2.5 rounded-lg font-medium"
              style={{ backgroundColor: BERRY, color: "white" }}
            >
              Submit report
            </button>
          </div>
        </div>
      )}

      {adminWarningsTarget && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setAdminWarningsTarget(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAdminWarningsTarget(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-1" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              Warnings — {adminWarningsTarget.displayName}
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              Visible to both you and this seller. A lighter step than suspending.
            </p>
            {adminWarningsList.length === 0 ? (
              <p className="text-sm mb-4" style={{ color: SLATE }}>
                No warnings yet.
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {adminWarningsList.map((w) => (
                  <div key={w.id} className="text-sm p-3 rounded-lg" style={{ backgroundColor: CANVAS, color: INK }}>
                    {w.message}
                    <div className="text-xs mt-1" style={{ color: SLATE }}>
                      {new Date(w.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={newWarningMessage}
              onChange={(e) => setNewWarningMessage(e.target.value)}
              placeholder="What's the warning about?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border outline-none mb-3"
              style={{ borderColor: "#DDD8CC" }}
            />
            <button
              type="button"
              onClick={issueWarning}
              disabled={issuingWarning}
              className="w-full py-2.5 rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: BERRY, color: "white" }}
            >
              {issuingWarning ? "Issuing..." : "Issue warning"}
            </button>
          </div>
        </div>
      )}

      {adminReauthStep && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setAdminReauthStep(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-1" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              Confirm it's you
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              The admin panel needs a fresh check, even though you're already signed in.
            </p>
            {adminReauthStep === "password" ? (
              <>
                <input
                  type="password"
                  value={adminReauthPassword}
                  onChange={(e) => setAdminReauthPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitAdminReauthPassword()}
                  placeholder="Your password"
                  className="w-full mb-2 px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                  autoFocus
                />
                {adminReauthError && (
                  <p className="text-sm mb-2" style={{ color: BERRY }}>
                    {adminReauthError}
                  </p>
                )}
                <button
                  onClick={submitAdminReauthPassword}
                  disabled={adminReauthSubmitting}
                  className="w-full py-2.5 rounded-lg font-medium mt-1 disabled:opacity-50"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  {adminReauthSubmitting ? "Checking..." : "Continue"}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: SLATE }}>
                  {adminReauthStep === "code-email"
                    ? "Now enter the 6-digit code we just emailed you. (2 of 2)"
                    : "Enter the 6-digit code from your authenticator app. (1 of 2 — an email code comes next.)"}
                </p>
                <input
                  value={adminReauthCode}
                  onChange={(e) => setAdminReauthCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitAdminReauthCode()}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full mb-2 px-3 py-2 rounded-lg border outline-none text-center text-lg tracking-widest"
                  style={{ borderColor: "#DDD8CC", fontFamily: "'IBM Plex Mono', monospace" }}
                  autoFocus
                />
                {adminReauthError && (
                  <p className="text-sm mb-2" style={{ color: BERRY }}>
                    {adminReauthError}
                  </p>
                )}
                <button
                  onClick={submitAdminReauthCode}
                  disabled={adminReauthSubmitting}
                  className="w-full py-2.5 rounded-lg font-medium mt-1 disabled:opacity-50"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  {adminReauthSubmitting ? "Verifying..." : adminReauthStep === "code-email" ? "Unlock admin panel" : "Continue"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Admin: add member modal */}
      {addMemberOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setAddMemberOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAddMemberOpen(false)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-4" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              Add a new member
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    First name
                  </label>
                  <input
                    value={addMemberForm.firstName}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: "#DDD8CC" }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Last name
                  </label>
                  <input
                    value={addMemberForm.lastName}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: "#DDD8CC" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Stall name
                </label>
                <input
                  value={addMemberForm.displayName}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, displayName: e.target.value })}
                  placeholder="e.g. Maple & Co."
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Office location
                </label>
                <input
                  value={addMemberForm.officeLocation}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, officeLocation: e.target.value })}
                  placeholder="e.g. Downtown branch"
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Email
                </label>
                <input
                  value={addMemberForm.email}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                  autoCapitalize="none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Phone
                </label>
                <input
                  value={addMemberForm.phone}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Username
                </label>
                <input
                  value={addMemberForm.username}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                  autoCapitalize="none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Password
                </label>
                <input
                  type="password"
                  value={addMemberForm.password}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  const ok = await adminAddMember(addMemberForm);
                  if (ok) {
                    setAddMemberOpen(false);
                    setAddMemberForm({
                      firstName: "",
                      lastName: "",
                      displayName: "",
                      officeLocation: "",
                      username: "",
                      email: "",
                      phone: "",
                      password: "",
                    });
                  }
                }}
                className="w-full py-2.5 rounded-lg font-medium mt-1"
                style={{ backgroundColor: MARIGOLD, color: INK }}
              >
                Add member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin: add/edit help article modal */}
      {articleModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setArticleModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setArticleModalOpen(false)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <h3 className="text-lg font-semibold mb-4" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
              {editingArticleId ? "Edit article" : "New help article"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Title
                </label>
                <input
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. How do refunds work?"
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                  Body
                </label>
                <textarea
                  value={articleForm.body}
                  onChange={(e) => setArticleForm({ ...articleForm, body: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#DDD8CC" }}
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (editingArticleId) {
                    await updateArticle(editingArticleId, articleForm);
                  } else {
                    await addArticle(articleForm);
                  }
                  setArticleModalOpen(false);
                  setArticleForm({ title: "", body: "" });
                  setEditingArticleId(null);
                }}
                className="w-full py-2.5 rounded-lg font-medium mt-1"
                style={{ backgroundColor: MARIGOLD, color: INK }}
              >
                {editingArticleId ? "Save changes" : "Publish article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
