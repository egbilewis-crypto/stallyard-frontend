import React, { useEffect, useMemo, useState } from "react";

const INK = "#1B2430";
const CANVAS = "#F6F3EC";
const MARIGOLD = "#E8A94D";
const BERRY = "#C1443C";
const SAGE = "#6B8F71";
const SLATE = "#667085";

const BACKEND_URL =
  typeof window !== "undefined" && /(^|\.)stallyard\.com$/i.test(window.location.hostname)
    ? "https://api.stallyard.com"
    : "https://stallyard-backend-production.up.railway.app";

function formatMoney(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not specified" : date.toLocaleString();
}

function addressText(address) {
  if (!address || typeof address !== "object") return "Delivery address unavailable";
  return [address.fullName, address.street, address.city, address.state, address.zip, address.country]
    .filter(Boolean)
    .join(", ");
}

export default function DriverDelivery({ accessToken }) {
  const sessionKey = useMemo(() => `stallyard-driver-session:${accessToken}`, [accessToken]);
  const [activationCode, setActivationCode] = useState("");
  const [sessionToken, setSessionToken] = useState(() => {
    try {
      return window.sessionStorage.getItem(sessionKey) || "";
    } catch {
      return "";
    }
  });
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(Boolean(sessionToken));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const clearSession = () => {
    try {
      window.sessionStorage.removeItem(sessionKey);
    } catch {
      // Private browsing can block sessionStorage. The in-memory session still works.
    }
    setSessionToken("");
    setAssignment(null);
  };

  const loadAssignment = async (driverSession) => {
    if (!driverSession) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${BACKEND_URL}/driver-deliveries/${encodeURIComponent(accessToken)}`,
        { headers: { Authorization: `Bearer ${driverSession}` } }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if ([401, 403, 404, 410].includes(response.status)) clearSession();
        throw new Error(data.error || "This delivery link could not be opened.");
      }
      setAssignment(data.assignment || null);
    } catch (requestError) {
      setError(requestError.message || "This delivery link could not be opened.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionToken) loadAssignment(sessionToken);
    else setLoading(false);
    // accessToken is fixed for this route; sessionToken is handled after activation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const activate = async (event) => {
    event.preventDefault();
    const code = activationCode.replace(/\D/g, "");
    if (code.length !== 6) {
      setError("Enter the six-digit activation code sent by the seller.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(
        `${BACKEND_URL}/driver-deliveries/${encodeURIComponent(accessToken)}/activate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activationCode: code }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The activation code could not be verified.");
      if (!data.sessionToken) throw new Error("Driver access was not created. Ask the seller for a new link.");
      try {
        window.sessionStorage.setItem(sessionKey, data.sessionToken);
      } catch {
        // Continue with the in-memory token if storage is unavailable.
      }
      setSessionToken(data.sessionToken);
      setAssignment(data.assignment || null);
      setActivationCode("");
    } catch (requestError) {
      setError(requestError.message || "The activation code could not be verified.");
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    backgroundColor: "white",
    border: "1px solid #DDD8CC",
    borderRadius: 18,
    boxShadow: "0 18px 60px rgba(27,36,48,0.10)",
  };

  if (!/^[A-Za-z0-9_-]{30,120}$/.test(accessToken || "")) {
    return (
      <main className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: CANVAS }}>
        <section className="w-full max-w-md p-6 text-center" style={cardStyle}>
          <BrandMark />
          <h1 className="text-2xl font-semibold mt-4" style={{ color: INK }}>Invalid delivery link</h1>
          <p className="mt-2 text-sm" style={{ color: SLATE }}>Ask the seller to create a new Local Delivery Driver link.</p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: CANVAS }}>
        <div className="text-sm font-medium" style={{ color: INK }}>Opening secure delivery…</div>
      </main>
    );
  }

  if (!assignment) {
    return (
      <main className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: CANVAS }}>
        <section className="w-full max-w-md p-6" style={cardStyle}>
          <BrandMark />
          <div className="text-xs font-semibold tracking-widest mt-4" style={{ color: BERRY }}>STALLYARD DELIVERY</div>
          <h1 className="text-2xl font-semibold mt-1" style={{ color: INK }}>Activate driver access</h1>
          <p className="mt-2 text-sm" style={{ color: SLATE }}>
            Enter the six-digit code the seller sent separately. You do not need the seller&apos;s Stallyard password.
          </p>
          <form onSubmit={activate} className="mt-5">
            <label className="block text-sm font-medium mb-2" style={{ color: INK }}>Six-digit activation code</label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={activationCode}
              onChange={(event) => setActivationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl border text-center text-2xl tracking-widest outline-none"
              style={{ borderColor: "#CFC8B8", color: INK, fontFamily: "'IBM Plex Mono', monospace" }}
              autoFocus
            />
            {error && <div role="alert" className="mt-3 p-3 rounded-lg text-sm" style={{ backgroundColor: "#FFF1EF", color: BERRY }}>{error}</div>}
            <button
              type="submit"
              disabled={submitting || activationCode.length !== 6}
              className="w-full mt-4 px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
              style={{ backgroundColor: MARIGOLD, color: INK }}
            >
              {submitting ? "Checking…" : "Open delivery"}
            </button>
          </form>
          <p className="mt-4 text-xs" style={{ color: SLATE }}>The code works once. Access is limited to this delivery and expires automatically.</p>
        </section>
      </main>
    );
  }

  const address = assignment.deliveryAddress || {};
  const destination = addressText(address);

  return (
    <main className="min-h-screen py-6 px-4" style={{ backgroundColor: CANVAS }}>
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-3 mb-5">
          <BrandMark />
          <div>
            <div className="text-xs font-semibold tracking-widest" style={{ color: BERRY }}>STALLYARD DELIVERY</div>
            <h1 className="text-2xl font-semibold" style={{ color: INK }}>Driver assignment</h1>
          </div>
        </header>

        {error && <div role="alert" className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: "#FFF1EF", color: BERRY }}>{error}</div>}

        <section className="p-5" style={cardStyle}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs" style={{ color: SLATE }}>Order</div>
              <div className="font-semibold" style={{ color: INK }}>{assignment.orderNumber || `#${assignment.orderId}`}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: "#E7F3E9", color: SAGE }}>
              {String(assignment.status || "assigned").replace(/_/g, " ")}
            </span>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <Detail label="Assigned driver" value={assignment.driverName} />
            <Detail label="Package" value={assignment.packageDescription || assignment.itemTitle} />
            <Detail label="Delivery fee" value={formatMoney(assignment.deliveryFee)} />
            <Detail label="Driver payment" value={String(assignment.paymentMethod || "cash").replace(/_/g, " ")} capitalize />
            <Detail label="Pickup time" value={formatDate(assignment.pickupAt)} />
            <Detail label="Delivery due" value={formatDate(assignment.deliveryDueAt)} />
          </div>
        </section>

        <section className="mt-4 p-5" style={cardStyle}>
          <h2 className="text-lg font-semibold" style={{ color: INK }}>Delivery destination</h2>
          <p className="mt-2 text-sm" style={{ color: INK }}>{destination}</p>
          {address.deliveryInstructions && (
            <p className="mt-2 text-sm" style={{ color: SLATE }}><strong style={{ color: INK }}>Instructions:</strong> {address.deliveryInstructions}</p>
          )}
          {address.preferredDeliveryTime && (
            <p className="mt-1 text-sm" style={{ color: SLATE }}><strong style={{ color: INK }}>Preferred time:</strong> {address.preferredDeliveryTime}</p>
          )}
          <div className="mt-4 flex gap-3 flex-wrap">
            {address.phone && (
              <a href={`tel:${address.phone}`} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: MARIGOLD, color: INK }}>Call buyer</a>
            )}
            {destination && destination !== "Delivery address unavailable" && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border text-sm font-semibold"
                style={{ borderColor: INK, color: INK }}
              >
                Open map
              </a>
            )}
          </div>
        </section>

        <p className="mt-4 text-xs text-center" style={{ color: SLATE }}>
          This page only grants access to this delivery. Never ask for or use the seller&apos;s Stallyard password.
        </p>
      </div>
    </main>
  );
}

function BrandMark() {
  return <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold" style={{ backgroundColor: MARIGOLD, color: INK }}>S</div>;
}

function Detail({ label, value, capitalize = false }) {
  return (
    <div>
      <div className="text-xs" style={{ color: SLATE }}>{label}</div>
      <div className={`font-medium ${capitalize ? "capitalize" : ""}`} style={{ color: INK }}>{value || "Not specified"}</div>
    </div>
  );
}
