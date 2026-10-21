import React, { useEffect, useMemo, useRef, useState } from "react";

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
  const [actionBusy, setActionBusy] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
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

  const runDeliveryStep = async (action, extra = {}) => {
    if (!sessionToken || actionBusy) return false;
    setActionBusy(action);
    setError("");
    try {
      const response = await fetch(
        `${BACKEND_URL}/driver-deliveries/${encodeURIComponent(accessToken)}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action, ...extra }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if ([401, 403, 404, 410].includes(response.status)) clearSession();
        throw new Error(data.error || "The delivery status could not be updated.");
      }
      setAssignment(data.assignment || null);
      return true;
    } catch (requestError) {
      setError(requestError.message || "The delivery status could not be updated.");
      return false;
    } finally {
      setActionBusy("");
    }
  };

  const saveDeliveryProof = async (dataUrl) => {
    const saved = await runDeliveryStep("proof", { proofOfDelivery: dataUrl });
    if (saved) setCameraOpen(false);
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

        <DriverWorkflow
          assignment={assignment}
          busy={actionBusy}
          onAction={runDeliveryStep}
          onOpenCamera={() => setCameraOpen(true)}
          cardStyle={cardStyle}
        />

        <p className="mt-4 text-xs text-center" style={{ color: SLATE }}>
          This page only grants access to this delivery. Never ask for or use the seller&apos;s Stallyard password.
        </p>
      </div>
      {cameraOpen && (
        <LiveDeliveryCamera
          busy={actionBusy === "proof"}
          onSave={saveDeliveryProof}
          onClose={() => !actionBusy && setCameraOpen(false)}
        />
      )}
    </main>
  );
}

const DRIVER_STEPS = [
  { status: "assigned", label: "Accept delivery", action: "accept", help: "Confirm that you accept this assignment." },
  { status: "accepted", label: "Confirm package pickup", action: "pickup", help: "Use this only after the seller hands you the package." },
  { status: "picked_up", label: "Start delivery", action: "start", help: "The buyer will see that the package is on the way." },
  { status: "on_the_way", label: "I’m here", action: "arrived", help: "Use this after reaching the buyer’s delivery address." },
];

function DriverWorkflow({ assignment, busy, onAction, onOpenCamera, cardStyle }) {
  const status = String(assignment.status || "assigned");
  const step = DRIVER_STEPS.find((entry) => entry.status === status);
  const proofSaved = Boolean(assignment.proofOfDeliveryUrl);

  return (
    <section className="mt-4 p-5" style={cardStyle}>
      <h2 className="text-lg font-semibold" style={{ color: INK }}>Delivery progress</h2>
      <p className="mt-1 text-sm" style={{ color: SLATE }}>Complete every step in order. Each update is recorded for the buyer and seller.</p>

      <ol className="mt-4 space-y-2">
        {[
          ["accepted", "Assignment accepted", assignment.acceptedAt],
          ["picked_up", "Package picked up", assignment.pickedUpAt],
          ["on_the_way", "Delivery started", assignment.startedAt],
          ["arrived", "Arrived at destination", assignment.arrivedAt],
          ["delivered", "Delivery completed", assignment.deliveredAt],
        ].map(([key, label, time]) => {
          const order = ["assigned", "accepted", "picked_up", "on_the_way", "arrived", "delivered"];
          const complete = order.indexOf(status) >= order.indexOf(key);
          return (
            <li key={key} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ backgroundColor: complete ? "#EDF6EF" : "#F4F2ED" }}>
              <span className="text-sm font-medium" style={{ color: complete ? SAGE : SLATE }}>{complete ? "✓ " : "○ "}{label}</span>
              {time && <span className="text-xs" style={{ color: SLATE }}>{formatDate(time)}</span>}
            </li>
          );
        })}
      </ol>

      {step && (
        <div className="mt-4">
          <p className="text-sm" style={{ color: SLATE }}>{step.help}</p>
          <button
            type="button"
            onClick={() => onAction(step.action)}
            disabled={Boolean(busy)}
            className="w-full mt-3 px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
            style={{ backgroundColor: MARIGOLD, color: INK }}
          >
            {busy === step.action ? "Saving…" : step.label}
          </button>
        </div>
      )}

      {status === "arrived" && !proofSaved && (
        <div className="mt-4 p-4 rounded-xl border" style={{ borderColor: MARIGOLD, backgroundColor: "#FFF9EF" }}>
          <div className="text-sm font-semibold" style={{ color: INK }}>Live delivery-proof photo required</div>
          <p className="mt-1 text-xs" style={{ color: SLATE }}>The camera must capture a current handoff photo. Gallery uploads are not accepted.</p>
          <button
            type="button"
            onClick={onOpenCamera}
            disabled={Boolean(busy)}
            className="w-full mt-3 px-4 py-3 rounded-xl border font-semibold disabled:opacity-50"
            style={{ borderColor: INK, color: INK, backgroundColor: "white" }}
          >
            Open live camera
          </button>
        </div>
      )}

      {status === "arrived" && proofSaved && (
        <div className="mt-4">
          <div className="flex gap-3 items-center p-3 rounded-xl" style={{ backgroundColor: "#EDF6EF" }}>
            <img src={assignment.proofOfDeliveryUrl} alt="Live delivery proof" className="w-20 h-20 rounded-lg object-cover" />
            <div>
              <div className="text-sm font-semibold" style={{ color: SAGE }}>Delivery proof saved</div>
              <p className="mt-1 text-xs" style={{ color: SLATE }}>Finish only after the package has been handed to the buyer.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAction("delivered")}
            disabled={Boolean(busy)}
            className="w-full mt-3 px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
            style={{ backgroundColor: SAGE, color: "white" }}
          >
            {busy === "delivered" ? "Completing…" : "Mark delivered"}
          </button>
        </div>
      )}

      {status === "delivered" && (
        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#EDF6EF", color: SAGE }}>
          <div className="font-semibold">Delivery completed</div>
          <p className="mt-1 text-sm">The proof was saved. The buyer sends the private delivery token to the seller separately.</p>
        </div>
      )}
    </section>
  );
}

function LiveDeliveryCamera({ busy, onSave, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let active = true;
    const open = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Live camera is unavailable in this browser. Open this secure link in Chrome or Safari on the driver’s phone.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (cameraRequestError) {
        setCameraError(cameraRequestError?.message || "Camera permission is required to take delivery proof.");
      } finally {
        if (active) setStarting(false);
      }
    };
    open();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || busy) return;
    const maxDimension = 1280;
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    await onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center" style={{ backgroundColor: "rgba(15,20,28,0.92)" }}>
      <section className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ backgroundColor: "white" }}>
        <div className="p-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold" style={{ color: INK }}>Live delivery proof</h2>
            <p className="text-xs mt-1" style={{ color: SLATE }}>Show the package handoff clearly. This camera does not accept saved photos.</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50" style={{ borderColor: "#DDD8CC", color: INK }}>Close</button>
        </div>
        <div className="relative bg-black aspect-[4/3] flex items-center justify-center">
          {starting && <div className="text-sm text-white">Opening camera…</div>}
          {cameraError ? (
            <div role="alert" className="m-5 p-4 rounded-xl text-sm" style={{ backgroundColor: "#FFF1EF", color: BERRY }}>{cameraError}</div>
          ) : (
            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${starting ? "hidden" : "block"}`} />
          )}
        </div>
        <div className="p-4">
          <button
            type="button"
            onClick={capture}
            disabled={starting || Boolean(cameraError) || busy}
            className="w-full px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
            style={{ backgroundColor: MARIGOLD, color: INK }}
          >
            {busy ? "Saving proof…" : "Take and save photo"}
          </button>
        </div>
      </section>
    </div>
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
