import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Store, LayoutGrid, Pencil, Trash2, X, PackageOpen, ShoppingBag, Minus, User, LogOut, Receipt, Shield, HelpCircle, Wallet, MessageCircle, Send, Heart, Bell } from "lucide-react";

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
  shipped: "Shipped",
  cancelled: "Cancelled",
  returned: "Returned",
};

const FULFILLMENT_COLOR = {
  new: "#3B6E8F",
  shipped: "#6B8F71",
  cancelled: "#C1443C",
  returned: "#B8862E",
};

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

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
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

// Demo-only obfuscation so passwords aren't stored as plain text in shared
// storage. This is NOT real cryptographic security — don't reuse a real
// password here.
function obfuscate(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
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
  const [authReturnView, setAuthReturnView] = useState("browse");
  const [adminTab, setAdminTab] = useState("overview");
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
  const [bankSaving, setBankSaving] = useState(false);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
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
    currency: "USD",
    shippingFee: "0.00",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [idVerifyOpen, setIdVerifyOpen] = useState(false);
  const [idVerifyForm, setIdVerifyForm] = useState({ idType: "Passport", idCountry: "", licenseNumber: "" });
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
        const notifRes = await window.storage.get("stallyard-notifications", true);
        setNotifications(notifRes ? JSON.parse(notifRes.value) : []);
      } catch {
        setNotifications([]);
      }
      try {
        const readRes = await window.storage.get("stallyard-message-reads", false);
        setMessageReadState(readRes ? JSON.parse(readRes.value) : {});
      } catch {
        setMessageReadState({});
      }
      setOrders([]);
      try {
        const settingsRes = await window.storage.get("stallyard-settings", true);
        if (settingsRes) setSettings((prev) => ({ ...prev, ...JSON.parse(settingsRes.value) }));
      } catch {
        // keep default settings
      }
      try {
        const contentRes = await window.storage.get("stallyard-content", true);
        if (contentRes) setContent(JSON.parse(contentRes.value));
      } catch {
        // keep default empty content
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
        return;
      }
      const isAdmin = members.find((m) => m.username === currentUser)?.isAdmin;
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
    await persistMembers(
      members.map((m) => (m.username === currentUser ? { ...m, hasAppliedToSell: true } : m))
    );
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
    if (authForm.password.length < 4) {
      setAuthError("Password should be at least 4 characters");
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
    await pushNotification("new_account", `${newMember.displayName} (@${newMember.username}) created an account`);
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

  const requestPasswordReset = () => {
    setResetError("");
    const id = resetIdentifier.trim().toLowerCase();
    if (!id) {
      setResetError("Enter your username, email, or phone number");
      return;
    }
    const member = members.find(
      (m) =>
        m.username === id ||
        (m.email || "").toLowerCase() === id ||
        (m.phone || "").replace(/[^0-9]/g, "") === id.replace(/[^0-9]/g, "")
    );
    if (!member) {
      setResetError("We couldn't find an account matching that");
      return;
    }
    setPendingPasswordReset({ code: generateVerificationCode(), username: member.username, verified: false });
    setResetCodeInput("");
  };

  const resendResetCode = () => {
    if (!pendingPasswordReset) return;
    setPendingPasswordReset({ ...pendingPasswordReset, code: generateVerificationCode() });
    setResetError("");
    showToast("New code generated");
  };

  const confirmResetCode = () => {
    if (!pendingPasswordReset) return;
    if (resetCodeInput.trim() !== pendingPasswordReset.code) {
      setResetError("That code doesn't match — check and try again.");
      return;
    }
    setPendingPasswordReset({ ...pendingPasswordReset, verified: true });
    setResetError("");
  };

  const submitNewPassword = async () => {
    if (newPasswordForm.password.length < 4) {
      setResetError("Password should be at least 4 characters");
      return;
    }
    if (newPasswordForm.password !== newPasswordForm.confirm) {
      setResetError("Passwords don't match");
      return;
    }
    await persistMembers(
      members.map((m) =>
        m.username === pendingPasswordReset.username
          ? { ...m, passwordHash: obfuscate(newPasswordForm.password) }
          : m
      )
    );
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
    setSelected(null);
    setView("browse");
    showToast("Logged out");
  };

  const currentMember = members.find((m) => m.username === currentUser) || null;

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

  const persistNotifications = async (next) => {
    setNotifications(next);
    try {
      await window.storage.set("stallyard-notifications", JSON.stringify(next), true);
    } catch {
      // non-critical, fail silently
    }
  };

  const pushNotification = async (type, message) => {
    try {
      const res = await window.storage.get("stallyard-notifications", true);
      const current = res ? JSON.parse(res.value) : [];
      const notif = { id: uid(), type, message, createdAt: Date.now(), read: false };
      await persistNotifications([notif, ...current]);
    } catch {
      // non-critical, fail silently
    }
  };

  const markNotificationsRead = async () => {
    await persistNotifications(notifications.map((n) => ({ ...n, read: true })));
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
    setSettings(next);
    try {
      await window.storage.set("stallyard-settings", JSON.stringify(next), true);
      showToast("Settings saved");
    } catch {
      showToast("Couldn't save settings — try again");
    }
  };

  const persistContent = async (next) => {
    setContent(next);
    try {
      await window.storage.set("stallyard-content", JSON.stringify(next), true);
    } catch {
      showToast("Couldn't save — try again");
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

  const startOrOpenThread = async (listing) => {
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
    markThreadRead(threadId);
    setView("messages");
  };

  const sendMessage = async (threadId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (containsContactInfo(trimmed)) {
      setMessageError("Messages can't include email addresses or phone numbers — keep contact on Stallyard.");
      return;
    }
    setMessageError("");
    let res;
    try {
      res = await authFetch(`${BACKEND_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, body: trimmed, messageType: "text" }),
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
    const banner = {
      id: uid(),
      message: data.message.trim(),
      tone: data.tone || "info",
      isActive: true,
      mediaType: data.mediaType || "none",
      imageUrl: data.mediaType === "image" ? data.imageUrl : "",
      videoUrl: data.mediaType === "video" ? data.videoUrl.trim() : "",
    };
    await persistContent({ ...content, banners: [banner, ...content.banners] });
    showToast("Banner added");
  };

  const updateBanner = async (id, patch) => {
    await persistContent({
      ...content,
      banners: content.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  };

  const removeBanner = async (id) => {
    await persistContent({ ...content, banners: content.banners.filter((b) => b.id !== id) });
    showToast("Banner removed");
  };

  const addArticle = async (data) => {
    if (!data.title.trim() || !data.body.trim()) return;
    const article = {
      id: uid(),
      title: data.title.trim(),
      body: data.body.trim(),
      updatedAt: Date.now(),
    };
    await persistContent({ ...content, articles: [article, ...content.articles] });
    showToast("Article published");
  };

  const updateArticle = async (id, patch) => {
    await persistContent({
      ...content,
      articles: content.articles.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a)),
    });
    showToast("Article updated");
  };

  const removeArticle = async (id) => {
    await persistContent({ ...content, articles: content.articles.filter((a) => a.id !== id) });
    showToast("Article removed");
  };

  const addFaq = async (data) => {
    if (!data.question.trim() || !data.answer.trim()) return;
    const faq = { id: uid(), question: data.question.trim(), answer: data.answer.trim() };
    await persistContent({ ...content, faqs: [...content.faqs, faq] });
    showToast("FAQ added");
  };

  const updateFaq = async (id, patch) => {
    await persistContent({
      ...content,
      faqs: content.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
    showToast("FAQ updated");
  };

  const removeFaq = async (id) => {
    await persistContent({ ...content, faqs: content.faqs.filter((f) => f.id !== id) });
    showToast("FAQ removed");
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

  const updateReturnTracking = async (orderId, itemId, trackingNumber) => {
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

  const requestReturn = async (orderId, itemId, reason, note) => {
    if (!reason) {
      showToast("Pick a reason for the return");
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
                    }
                  : i
              ),
            }
      )
    );
    showToast("Return requested");
  };

  const approveReturn = async (orderId, itemId) => {
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
      currency: "USD",
      shippingFee: "0.00",
    });
    setEditingId(null);
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
    if (!form.title.trim() || !form.price) {
      showToast("Give it a title and a price");
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
      const patch = { ...form, price: Number(form.price), shippingFee: Number(form.shippingFee) || 0 };
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
      showToast("Listing updated");
    } else {
      const isUSSeller = isUnitedStates(currentMember?.country);
      const trusted = currentMember?.isVerified || currentMember?.isAdmin || isUSSeller;
      const isAuction = form.listingType === "auction";
      // US-based sellers and admins skip the approval queue entirely, including
      // auctions. Everyone else's auctions still need admin approval even if
      // they're a verified seller for fixed-price listings.
      const autoApproved = isAuction ? (currentMember?.isAdmin || isUSSeller) : trusted;
      const status = autoApproved ? "approved" : "pending";
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
            price: Number(form.price),
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
          }),
        });
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
      if (!res.ok) {
        showToast("Couldn't publish that listing — try again");
        return;
      }
      const { listing } = await res.json();
      const newListing = backendListingToFrontend(listing, {
        sellerName: currentMember.displayName,
        ownerUsername: currentUser,
      });
      await persistListings([newListing, ...listings]);
      showToast(autoApproved ? "Listing is live" : "Listing submitted — pending admin approval");
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
    });
    setEditingId(listing.id);
    setAdminEditContext(fromAdmin);
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
          showToast("Couldn't remove member — try again");
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

  const adminPromoteMember = async (username) => {
    const target = members.find((m) => m.username === username);
    if (target?.backendId) {
      try {
        const res = await authFetch(`${BACKEND_URL}/users/${target.backendId}/promote`, { method: "PATCH" });
        if (!res.ok) {
          showToast("Couldn't promote member — try again");
          return;
        }
      } catch {
        showToast("Couldn't reach the server — try again");
        return;
      }
    }
    await persistMembers(members.map((m) => (m.username === username ? { ...m, isAdmin: true } : m)));
    showToast("Member promoted to admin");
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
    await persistMembers(members.map((m) => (m.username === username ? { ...m, isApproved: true } : m)));
    showToast("Seller approved — they can now list items");
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
  const mySales = orders
    .filter((o) => o.items.some((i) => i.ownerUsername === currentUser))
    .sort((a, b) => b.createdAt - a.createdAt);

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
  };


  const filtered = listings
    .filter((l) => {
      const matchesCategory = categoryFilter === "All" || l.category === categoryFilter;
      const matchesCondition = conditionFilter === "All" || (l.condition || "New") === conditionFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      const isVisible = l.status !== "pending" && l.status !== "removed";
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

  const visibleListings = listings.filter((l) => l.status !== "pending" && l.status !== "removed");
  const featuredPicks = visibleListings.filter((l) => l.isFeatured).slice(0, 10);
  const newArrivals = visibleListings
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 10);
  const isHomeState = !search.trim() && categoryFilter === "All" && !priceMin && !priceMax && conditionFilter === "All";

  const NavButton = ({ id, icon: Icon, label, badge }) => (
    <button
      onClick={() => setView(id)}
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
              {pendingEmailVerification ? (
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
                        Enter your username, email, or phone number and we'll send you a code.
                      </p>
                      <input
                        value={resetIdentifier}
                        onChange={(e) => {
                          setResetIdentifier(e.target.value);
                          if (resetError) setResetError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && requestPasswordReset()}
                        placeholder="Username, email, or phone"
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
                        This demo has no real email/SMS backend, so here's the code we'd normally send:
                      </p>
                      <div
                        className="text-center py-3 mb-4 rounded-lg text-2xl font-semibold tracking-widest"
                        style={{ backgroundColor: CANVAS, color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {pendingPasswordReset.code}
                      </div>
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
                          Generate a new code
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
          <div className="flex items-center gap-2">
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
          </div>
          <nav className="flex items-center gap-1">
            <NavButton id="browse" icon={LayoutGrid} label="Browse" />
            <NavButton id="sell" icon={Plus} label="Sell" />
            <NavButton id="dashboard" icon={Store} label="My Stall" />
            {currentUser && <NavButton id="watchlist" icon={Heart} label="Watchlist" />}
            {currentUser && <NavButton id="wallet" icon={Wallet} label="Wallet" />}
            {currentUser && <NavButton id="messages" icon={MessageCircle} label="Messages" badge={unreadThreadsCount} />}
            <NavButton id="orders" icon={Receipt} label="Orders" />
            <NavButton id="help" icon={HelpCircle} label="Help" />
            {currentMember?.isAdmin && <NavButton id="admin" icon={Shield} label="Admin" />}
            {currentMember?.isAdmin && (
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

      {notifPanelOpen && currentMember?.isAdmin && (
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
                  <div
                    key={n.id}
                    className="p-3 border-b text-sm"
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
                  </div>
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

            {currentUser && currentMember?.isApproved === false && !currentMember?.hasAppliedToSell && (
              <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}>
                <p className="text-sm mb-2" style={{ color: INK }}>
                  Selling outside the US requires admin approval. Apply for a seller account to get started.
                </p>
                <button
                  onClick={applyToSell}
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Apply for seller account
                </button>
              </div>
            )}

            {currentUser && currentMember?.isApproved === false && currentMember?.hasAppliedToSell && (
              <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}>
                <p className="text-sm" style={{ color: INK }}>
                  Your seller application is under review. You'll be able to publish listings once approved.
                </p>
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
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-5 py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  {editingId ? "Save changes" : "Publish listing"}
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
            {currentUser && currentMember?.isApproved === false && !currentMember?.hasAppliedToSell && (
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
            {currentUser && currentMember?.isApproved === false && currentMember?.hasAppliedToSell && (
              <div
                className="mb-4 p-4 rounded-lg border"
                style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}
              >
                <p className="text-sm" style={{ color: INK }}>
                  Your seller application is under review.
                </p>
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
                <div className="flex gap-6 mt-4 mb-8">
                  <div>
                    <div
                      className="text-3xl"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                    >
                      {myListings.length}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      active listings
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-3xl"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: SAGE }}
                    >
                      ${myListings.reduce((s, l) => s + Number(l.price), 0).toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      total inventory value
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-3xl"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                    >
                      {mySales.length}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      sales
                    </div>
                  </div>
                </div>

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

                {myListings.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    Your stall is empty.{" "}
                    <button onClick={() => setView("sell")} className="underline" style={{ color: INK }}>
                      List your first item
                    </button>
                    .
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myListings.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-white"
                        style={{ borderColor: "#DDD8CC" }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl">{l.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-medium truncate flex items-center gap-2" style={{ color: INK }}>
                              {l.title}
                              {l.isFeatured && <Tag color={MARIGOLD}>Featured</Tag>}
                              {l.status === "pending" && <Tag color={MARIGOLD}>Pending review</Tag>}
                              {l.status === "removed" && <Tag color={BERRY}>Taken down</Tag>}
                            </div>
                            <div className="text-xs" style={{ color: SLATE }}>
                              {l.category}
                              {l.condition && l.condition !== "New" ? ` · ${l.condition}` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                            className="font-medium"
                          >
                            ${Number(l.price).toFixed(2)}
                          </span>
                          <button onClick={() => startEdit(l)} aria-label="Edit">
                            <Pencil size={16} style={{ color: SLATE }} />
                          </button>
                          <button onClick={() => deleteListing(l.id)} aria-label="Delete">
                            <Trash2 size={16} style={{ color: BERRY }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="text-lg font-semibold mt-10 mb-3" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
                  Sales
                </h3>
                {mySales.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No sales yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {mySales.map((o) => {
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
                                    <div className="flex items-center gap-2 shrink-0">
                                      <Tag color={FULFILLMENT_COLOR[i.fulfillmentStatus] || FULFILLMENT_COLOR.new}>
                                        {FULFILLMENT_LABEL[i.fulfillmentStatus] || "New"}
                                      </Tag>
                                      <select
                                        value={i.fulfillmentStatus || "new"}
                                        onChange={(e) => updateItemFulfillment(o.id, i.id, e.target.value)}
                                        className="px-2 py-1 rounded-lg border outline-none text-xs"
                                        style={{ borderColor: "#DDD8CC", color: INK }}
                                      >
                                        <option value="new">New</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="returned">Returned</option>
                                      </select>
                                    </div>
                                  </div>
                                  {i.fulfillmentStatus === "shipped" && (
                                    <div className="flex items-center gap-2 mt-2">
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
                                  {i.returnStatus === "requested" && (
                                    <div
                                      className="mt-2 p-2 rounded-lg"
                                      style={{ backgroundColor: "#FBF0DC" }}
                                    >
                                      <div className="mb-1" style={{ color: INK }}>
                                        <span className="font-medium">Return requested:</span> {i.returnReason}
                                        {i.returnNote ? ` — "${i.returnNote}"` : ""}
                                      </div>
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
                              {item.fulfillmentStatus === "shipped" && item.trackingNumber && (
                                <div className="text-xs mt-2" style={{ color: SLATE }}>
                                  Tracking:{" "}
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
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={async () => {
                                            await requestReturn(
                                              o.id,
                                              item.id,
                                              returnDrafts[draftKey].reason,
                                              returnDrafts[draftKey].note
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
                                        setReturnDrafts((d) => ({ ...d, [draftKey]: { reason: "", note: "" } }))
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
                (l) => l.ownerUsername === viewingSeller && l.status !== "pending" && l.status !== "removed"
              );
              const sellerRating = getSellerRating(viewingSeller);
              const reputation = getSellerReputation(viewingSeller);
              const followerCount = follows.filter((f) => f.followedUsername === viewingSeller).length;
              const isFollowing = follows.some(
                (f) => f.followerUsername === currentUser && f.followedUsername === viewingSeller
              );
              const itemsSold = orders.reduce(
                (s, o) =>
                  s + o.items.filter((i) => i.ownerUsername === viewingSeller).reduce((s2, i) => s2 + i.qty, 0),
                0
              );
              return (
                <>
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
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
                        {itemsSold}
                      </div>
                      <div className="text-xs" style={{ color: SLATE }}>
                        items sold
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
                    Payout bank details
                  </h3>
                  <p className="text-xs mb-3" style={{ color: SLATE }}>
                    {currentMember?.hasBankDetails
                      ? "Your bank details are on file. Add new ones below to replace them."
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
                          {m.text}
                          <div
                            className="text-[10px] mt-1"
                            style={{ color: mine ? "#C9CCD3" : SLATE }}
                          >
                            {new Date(m.createdAt).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
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

        {view === "help" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Help center
            </h2>
            <p className="text-sm mb-6" style={{ color: SLATE }}>
              Articles and answers to common questions.
            </p>

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

        {view === "admin" && currentMember?.isAdmin && (
          <div>
            <h2 className="text-2xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Admin dashboard
            </h2>
            <p className="text-sm mb-5" style={{ color: SLATE }}>
              Visible only to you, {currentMember.displayName}.
            </p>

            <div className="flex gap-2 mb-6">
              {[
                { id: "overview", label: "Overview" },
                { id: "listings", label: `Listings (${listings.length})` },
                { id: "members", label: `Members (${members.length})` },
                { id: "orders", label: `Orders (${orders.length})` },
                { id: "disputes", label: `Disputes (${disputedOrders.length})` },
                { id: "settings", label: "Settings" },
                { id: "content", label: "Content" },
                {
                  id: "withdrawals",
                  label: `Withdrawals (${withdrawals.filter((w) => w.status === "processing").length})`,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAdminTab(t.id)}
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

            {adminTab === "overview" && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                  {[
                    { label: "Total users", value: members.length, color: INK },
                    {
                      label: "Active listings",
                      value: listings.filter((l) => l.status !== "pending" && l.status !== "removed").length,
                      color: INK,
                    },
                    {
                      label: "Sales",
                      value: `$${orders.reduce((s, o) => s + o.total, 0).toFixed(2)}`,
                      color: SAGE,
                    },
                    {
                      label: "Commission earned",
                      value: `$${orders.reduce((s, o) => s + (o.commissionAmount || 0), 0).toFixed(2)}`,
                      color: SAGE,
                    },
                    {
                      label: "Disputes",
                      value: disputedOrders.length,
                      color: disputedOrders.length > 0 ? BERRY : INK,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="p-4 rounded-lg border bg-white"
                      style={{ borderColor: "#DDD8CC" }}
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
                    </div>
                  ))}
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

            {adminTab === "listings" && (
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
                          {l.status === "pending" && <Tag color={MARIGOLD}>Pending</Tag>}
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
                <button
                  onClick={() => setAddMemberOpen(true)}
                  className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: INK, color: "white" }}
                >
                  <Plus size={16} />
                  Add member
                </button>
                <p className="text-xs mb-2" style={{ color: SLATE }}>
                  Sorted A–Z by name — documents for each member are under "View documents" below their info.
                </p>
                <div className="space-y-2">
                  {members
                    .slice()
                    .sort((a, b) =>
                      (a.displayName || a.username || "").localeCompare(b.displayName || b.username || "")
                    )
                    .map((m) => {
                    const hasDocs = m.idType || m.licenseNumber || (m.licensePhotos && m.licensePhotos.length > 0);
                    const docsOpen = expandedDocsUsername === m.username;
                    return (
                    <div
                      key={m.username}
                      className="p-3 rounded-lg border bg-white"
                      style={{ borderColor: "#DDD8CC" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate flex items-center gap-2" style={{ color: INK }}>
                          {m.displayName}
                          {m.isAdmin && <Tag color={MARIGOLD}>Admin</Tag>}
                          {m.isVerified && <Tag color={SAGE}>Verified</Tag>}
                          {m.isApproved === false && m.hasAppliedToSell && (
                            <Tag color={MARIGOLD}>Seller application pending</Tag>
                          )}
                          {m.isApproved === false && !m.hasAppliedToSell && (
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
                          {m.isApproved === false && m.hasAppliedToSell && (
                            <button
                              onClick={() => adminApproveMember(m.username)}
                              className="text-xs font-medium underline"
                              style={{ color: SAGE }}
                            >
                              Approve seller
                            </button>
                          )}
                          <button
                            onClick={() => adminToggleVerify(m.username)}
                            className="text-xs font-medium underline"
                            style={{ color: SLATE }}
                          >
                            {m.isVerified ? "Unverify" : "Verify"}
                          </button>
                          <button
                            onClick={() => adminPromoteMember(m.username)}
                            className="text-xs font-medium underline"
                            style={{ color: SLATE }}
                          >
                            Make admin
                          </button>
                          <button
                            onClick={() => adminToggleSuspend(m.username)}
                            className="text-xs font-medium underline"
                            style={{ color: m.isSuspended ? SAGE : BERRY }}
                          >
                            {m.isSuspended ? "Unsuspend" : "Suspend"}
                          </button>
                          <button onClick={() => adminRemoveMember(m.username)} aria-label="Remove member">
                            <Trash2 size={16} style={{ color: BERRY }} />
                          </button>
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
                          </div>
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
              </div>
            )}

            {adminTab === "content" && (
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

            {adminTab === "withdrawals" && (
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

            {adminTab === "disputes" && (
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
          </div>
        )}
      </main>

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
