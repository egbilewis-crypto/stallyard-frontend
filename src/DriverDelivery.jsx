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

function compressIdentityDocument(file) {
  return new Promise((resolve, reject) => {
    if (!file || !String(file.type || "").startsWith("image/")) {
      reject(new Error("Select a photo of the identity document."));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        reject(new Error("The ID photo could not be prepared. Try another image."));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("That image format could not be opened. Use a JPG, PNG, or WebP photo."));
    };
    image.src = objectUrl;
  });
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
  const [identityCameraOpen, setIdentityCameraOpen] = useState(false);
  const [identitySelfie, setIdentitySelfie] = useState("");
  const [identityDocument, setIdentityDocument] = useState("");
  const [identityBusy, setIdentityBusy] = useState(false);
  const [identityForm, setIdentityForm] = useState({ legalName: "", idType: "nin", idNumber: "" });
  const [paymentBusy, setPaymentBusy] = useState("");
  const [bankForm, setBankForm] = useState({ bankName: "", accountName: "", accountNumber: "" });
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ category: "non_payment", details: "" });
  const [reportSent, setReportSent] = useState(false);
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

  const captureIdentitySelfie = async (dataUrl) => {
    setIdentitySelfie(dataUrl);
    setIdentityCameraOpen(false);
  };

  const saveDriverIdentity = async (event) => {
    event.preventDefault();
    if (!sessionToken || identityBusy) return;
    if (!identitySelfie) {
      setError("Take a live selfie before submitting your identity.");
      return;
    }
    if (!identityDocument) {
      setError("Upload a clear photo of the selected identity document.");
      return;
    }
    setIdentityBusy(true);
    setError("");
    try {
      const response = await fetch(
        `${BACKEND_URL}/driver-deliveries/${encodeURIComponent(accessToken)}/identity`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${sessionToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ ...identityForm, liveSelfie: identitySelfie, idDocumentPhoto: identityDocument }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Your identity could not be submitted.");
      setAssignment(data.assignment || assignment);
      setIdentitySelfie("");
      setIdentityDocument("");
      setIdentityForm({ legalName: "", idType: "nin", idNumber: "" });
    } catch (requestError) {
      setError(requestError.message || "Your identity could not be submitted.");
    } finally {
      setIdentityBusy(false);
    }
  };

  const saveBankDetails = async (event) => {
    event.preventDefault();
    if (!sessionToken || paymentBusy) return;
    setPaymentBusy("bank");
    setError("");
    try {
      const response = await fetch(
        `${BACKEND_URL}/driver-deliveries/${encodeURIComponent(accessToken)}/payment-details`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${sessionToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(bankForm),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Your bank details could not be saved.");
      setAssignment(data.assignment || assignment);
      setBankForm({ bankName: "", accountName: "", accountNumber: "" });
    } catch (requestError) {
      setError(requestError.message || "Your bank details could not be saved.");
    } finally {
      setPaymentBusy("");
    }
  };

  const confirmDriverPayment = async () => {
    if (!sessionToken || paymentBusy) return;
    setPaymentBusy("confirm");
    setError("");
    try {
      const response = await fetch(
        `${BACKEND_URL}/driver-deliveries/${encodeURIComponent(accessToken)}/confirm-payment`,
        { method: "POST", headers: { Authorization: `Bearer ${sessionToken}` } }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Payment could not be confirmed.");
      setAssignment(data.assignment || assignment);
    } catch (requestError) {
      setError(requestError.message || "Payment could not be confirmed.");
    } finally {
      setPaymentBusy("");
    }
  };

  const submitSellerReport = async (event) => {
    event.preventDefault();
    if (!sessionToken || paymentBusy) return;
    setPaymentBusy("report");
    setError("");
    try {
      const response = await fetch(
        `${BACKEND_URL}/driver-deliveries/${encodeURIComponent(accessToken)}/report-seller`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(reportForm),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The report could not be submitted.");
      setReportSent(true);
      setReportOpen(false);
    } catch (requestError) {
      setError(requestError.message || "The report could not be submitted.");
    } finally {
      setPaymentBusy("");
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

        <DriverIdentity
          assignment={assignment}
          form={identityForm}
          setForm={setIdentityForm}
          selfie={identitySelfie}
          documentPhoto={identityDocument}
          onDocumentPhoto={async (file) => {
            try {
              setError("");
              setIdentityDocument(await compressIdentityDocument(file));
            } catch (documentError) {
              setError(documentError.message || "The ID photo could not be prepared.");
            }
          }}
          busy={identityBusy}
          onOpenCamera={() => setIdentityCameraOpen(true)}
          onSubmit={saveDriverIdentity}
          cardStyle={cardStyle}
        />

        {(assignment.pickupAddress || assignment.pickupCity || assignment.pickupState) && (
          <section className="mt-4 p-5" style={cardStyle}>
            <h2 className="text-lg font-semibold" style={{ color: INK }}>Package pickup</h2>
            <p className="mt-2 text-sm" style={{ color: INK }}>
              {[assignment.pickupAddress, assignment.pickupCity, assignment.pickupState].filter(Boolean).join(", ")}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([assignment.pickupAddress, assignment.pickupCity, assignment.pickupState].filter(Boolean).join(", "))}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 px-4 py-2 rounded-xl border text-sm font-semibold"
              style={{ borderColor: INK, color: INK }}
            >
              Open pickup map
            </a>
          </section>
        )}

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

        <DriverPayment
          assignment={assignment}
          bankForm={bankForm}
          setBankForm={setBankForm}
          busy={paymentBusy}
          onSaveBank={saveBankDetails}
          onConfirmPayment={confirmDriverPayment}
          reportOpen={reportOpen}
          setReportOpen={setReportOpen}
          reportForm={reportForm}
          setReportForm={setReportForm}
          reportSent={reportSent}
          onSubmitReport={submitSellerReport}
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
      {identityCameraOpen && (
        <LiveDeliveryCamera
          busy={identityBusy}
          facingMode="user"
          title="Live driver selfie"
          instructions="Face the camera in good light. Saved photos and gallery uploads are not accepted."
          actionLabel="Take selfie"
          onSave={captureIdentitySelfie}
          onClose={() => !identityBusy && setIdentityCameraOpen(false)}
        />
      )}
    </main>
  );
}

function DriverIdentity({ assignment, form, setForm, selfie, documentPhoto, onDocumentPhoto, busy, onOpenCamera, onSubmit, cardStyle }) {
  const status = assignment.driverIdentityStatus || "not_submitted";
  const maySubmit = assignment.status === "assigned" && (["not_submitted", "rejected"].includes(status) || !assignment.identitySubmitted);
  const statusColor = status === "approved" ? SAGE : status === "rejected" ? BERRY : MARIGOLD;

  return (
    <section className="mt-4 p-5" style={cardStyle}>
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: INK }}>Driver identity</h2>
          <p className="mt-1 text-sm" style={{ color: SLATE }}>Required once before accepting this delivery.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: `${statusColor}18`, color: statusColor }}>
          {status.replace(/_/g, " ")}
        </span>
      </div>

      {assignment.identitySubmitted && (
        <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: status === "rejected" ? "#FFF1EF" : "#EDF6EF" }}>
          <div className="flex gap-3 items-center">
            {assignment.driverIdentitySelfieUrl && <img src={assignment.driverIdentitySelfieUrl} alt="Driver identity selfie" className="w-20 h-20 rounded-lg object-cover" />}
            {assignment.driverIdDocumentUrl && <img src={assignment.driverIdDocumentUrl} alt="Driver identity document" className="w-24 h-20 rounded-lg object-cover" />}
            <div className="text-sm" style={{ color: INK }}>
              <div className="font-semibold">{assignment.driverLegalName || "Identity submitted"}</div>
              {assignment.driverIdType && <div className="mt-1 capitalize" style={{ color: SLATE }}>{assignment.driverIdType.replace(/_/g, " ")}{assignment.driverIdLast4 ? ` · ending ${assignment.driverIdLast4}` : ""}</div>}
              {assignment.driverIdentitySubmittedAt && <div className="mt-1 text-xs" style={{ color: SLATE }}>Submitted {formatDate(assignment.driverIdentitySubmittedAt)}</div>}
            </div>
          </div>
          {status === "pending" && <p className="mt-3 text-xs" style={{ color: SLATE }}>Stallyard review is pending. You may accept the assignment while review continues.</p>}
          {status === "approved" && <p className="mt-3 text-xs" style={{ color: SAGE }}>Identity approved by Stallyard.</p>}
          {status === "rejected" && <p className="mt-3 text-xs" style={{ color: BERRY }}>{assignment.driverIdentityAdminNote || "Identity was rejected. Submit clear, correct details again."}</p>}
        </div>
      )}

      {maySubmit && (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block text-xs font-medium" style={{ color: INK }}>
            Legal name
            <input value={form.legalName} onChange={(e) => setForm((v) => ({ ...v, legalName: e.target.value }))} minLength={3} maxLength={120} required autoComplete="name" className="w-full mt-1 px-3 py-2 rounded-lg border bg-white outline-none" style={{ borderColor: "#CFC8B8" }} />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs font-medium" style={{ color: INK }}>
              ID type
              <select value={form.idType} onChange={(e) => setForm((v) => ({ ...v, idType: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border bg-white" style={{ borderColor: "#CFC8B8" }}>
                <option value="nin">NIN</option>
                <option value="drivers_license">Driver&apos;s licence</option>
                <option value="passport">Passport</option>
                <option value="pvc">Permanent voter card</option>
              </select>
            </label>
            <label className="block text-xs font-medium" style={{ color: INK }}>
              ID number
              <input value={form.idNumber} onChange={(e) => setForm((v) => ({ ...v, idNumber: e.target.value.replace(/[^A-Za-z0-9-]/g, "").slice(0, 30) }))} minLength={4} maxLength={30} required autoComplete="off" className="w-full mt-1 px-3 py-2 rounded-lg border bg-white outline-none" style={{ borderColor: "#CFC8B8", fontFamily: "'IBM Plex Mono', monospace" }} />
            </label>
          </div>
          <div className="p-3 rounded-xl border" style={{ borderColor: selfie ? SAGE : "#DDD8CC", backgroundColor: "#FAF9F6" }}>
            <div className="text-sm font-semibold" style={{ color: INK }}>Live selfie required</div>
            <p className="mt-1 text-xs" style={{ color: SLATE }}>The camera must take a current photo. Gallery uploads are disabled.</p>
            {selfie && <img src={selfie} alt="New live driver selfie" className="w-24 h-24 mt-3 rounded-lg object-cover" />}
            <button type="button" onClick={onOpenCamera} disabled={busy} className="w-full mt-3 px-4 py-3 rounded-xl border font-semibold disabled:opacity-50" style={{ borderColor: INK, color: INK, backgroundColor: "white" }}>{selfie ? "Retake live selfie" : "Open front camera"}</button>
          </div>
          <div className="p-3 rounded-xl border" style={{ borderColor: documentPhoto ? SAGE : "#DDD8CC", backgroundColor: "#FAF9F6" }}>
            <div className="text-sm font-semibold" style={{ color: INK }}>Identity-document photo required</div>
            <p className="mt-1 text-xs" style={{ color: SLATE }}>Upload a clear photo showing the name, document number, and photograph.</p>
            {documentPhoto && <img src={documentPhoto} alt="Selected identity document" className="w-full max-h-52 mt-3 rounded-lg object-contain bg-white" />}
            <label className="block w-full mt-3 px-4 py-3 rounded-xl border font-semibold text-center cursor-pointer" style={{ borderColor: INK, color: INK, backgroundColor: "white" }}>
              {documentPhoto ? "Choose another ID photo" : "Upload ID photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/*" className="sr-only" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; if (file) onDocumentPhoto(file); e.target.value = ""; }} />
            </label>
          </div>
          <button type="submit" disabled={busy || !selfie || !documentPhoto || form.legalName.trim().length < 3 || form.idNumber.trim().length < 4} className="w-full px-4 py-3 rounded-xl font-semibold disabled:opacity-50" style={{ backgroundColor: MARIGOLD, color: INK }}>{busy ? "Submitting…" : status === "rejected" ? "Resubmit identity" : "Submit identity"}</button>
        </form>
      )}

      <p className="mt-3 text-xs" style={{ color: SLATE }}>Your full ID number is encrypted. Sellers do not receive it; authorized Stallyard reviewers see only the verification record.</p>
    </section>
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
          <p className="text-sm" style={{ color: SLATE }}>{status === "assigned" && !assignment.identitySubmitted ? "Submit your live identity check above before accepting this assignment." : step.help}</p>
          <button
            type="button"
            onClick={() => onAction(step.action)}
            disabled={Boolean(busy) || (status === "assigned" && !assignment.identitySubmitted)}
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

function DriverPayment({
  assignment,
  bankForm,
  setBankForm,
  busy,
  onSaveBank,
  onConfirmPayment,
  reportOpen,
  setReportOpen,
  reportForm,
  setReportForm,
  reportSent,
  onSubmitReport,
  cardStyle,
}) {
  const method = assignment.paymentMethod || "cash";
  const status = assignment.paymentStatus || "pending";
  const delivered = assignment.status === "delivered";

  return (
    <section className="mt-4 p-5" style={cardStyle}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: INK }}>Driver payment</h2>
          <p className="mt-1 text-sm" style={{ color: SLATE }}>
            The seller pays the agreed {formatMoney(assignment.deliveryFee)} driver fee directly by {String(method).replace(/_/g, " ")}.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
          backgroundColor: status === "confirmed" ? "#EDF6EF" : "#FFF5E5",
          color: status === "confirmed" ? SAGE : BERRY,
        }}>
          {status === "confirmed" ? "Payment confirmed" : status === "seller_marked_paid" ? "Seller marked paid" : "Payment pending"}
        </span>
      </div>

      {method === "bank_transfer" && !assignment.hasDriverBankDetails && !assignment.sellerMarkedPaidAt && (
        <form onSubmit={onSaveBank} className="mt-4 p-4 rounded-xl border" style={{ borderColor: "#DDD8CC", backgroundColor: "#FAF9F6" }}>
          <div className="text-sm font-semibold" style={{ color: INK }}>Add your bank details</div>
          <p className="mt-1 text-xs" style={{ color: SLATE }}>Only the assigned seller can see these encrypted details for this delivery.</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <label className="text-xs" style={{ color: INK }}>
              <span className="block mb-1 font-medium">Bank name</span>
              <input value={bankForm.bankName} onChange={(e) => setBankForm((v) => ({ ...v, bankName: e.target.value }))} maxLength={100} required className="w-full px-3 py-2 rounded-lg border bg-white outline-none" style={{ borderColor: "#CFC8B8" }} />
            </label>
            <label className="text-xs" style={{ color: INK }}>
              <span className="block mb-1 font-medium">Account number</span>
              <input inputMode="numeric" value={bankForm.accountNumber} onChange={(e) => setBankForm((v) => ({ ...v, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) }))} maxLength={10} required className="w-full px-3 py-2 rounded-lg border bg-white outline-none" style={{ borderColor: "#CFC8B8", fontFamily: "'IBM Plex Mono', monospace" }} />
            </label>
            <label className="text-xs sm:col-span-2" style={{ color: INK }}>
              <span className="block mb-1 font-medium">Name on account</span>
              <input value={bankForm.accountName} onChange={(e) => setBankForm((v) => ({ ...v, accountName: e.target.value }))} maxLength={120} required className="w-full px-3 py-2 rounded-lg border bg-white outline-none" style={{ borderColor: "#CFC8B8" }} />
            </label>
          </div>
          <button type="submit" disabled={Boolean(busy) || bankForm.accountNumber.length !== 10} className="w-full mt-3 px-4 py-3 rounded-xl font-semibold disabled:opacity-50" style={{ backgroundColor: MARIGOLD, color: INK }}>
            {busy === "bank" ? "Saving…" : "Save bank details"}
          </button>
        </form>
      )}

      {method === "bank_transfer" && assignment.hasDriverBankDetails && status !== "confirmed" && (
        <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: "#EDF6EF", color: SAGE }}>
          <div className="text-sm font-semibold">Bank details saved securely</div>
          <p className="mt-1 text-xs">The seller can now use them to pay the agreed driver fee.</p>
        </div>
      )}

      {delivered && status === "pending" && (
        <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: "#FFF5E5", color: INK }}>
          <div className="text-sm font-semibold">Waiting for seller payment</div>
          <p className="mt-1 text-xs" style={{ color: SLATE }}>Do not confirm payment until the cash or bank transfer has actually been received.</p>
        </div>
      )}

      {delivered && status === "seller_marked_paid" && (
        <div className="mt-4">
          <p className="text-sm" style={{ color: SLATE }}>The seller marked the driver fee paid. Confirm only after you verify that you received it.</p>
          {assignment.sellerPaymentReference && <p className="mt-1 text-xs" style={{ color: SLATE }}>Reference: {assignment.sellerPaymentReference}</p>}
          <button type="button" onClick={onConfirmPayment} disabled={Boolean(busy)} className="w-full mt-3 px-4 py-3 rounded-xl font-semibold disabled:opacity-50" style={{ backgroundColor: SAGE, color: "white" }}>
            {busy === "confirm" ? "Confirming…" : "I received the driver fee"}
          </button>
        </div>
      )}

      {status === "confirmed" && (
        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#EDF6EF", color: SAGE }}>
          <div className="font-semibold">Driver fee received</div>
          <p className="mt-1 text-sm">You confirmed payment on {formatDate(assignment.driverConfirmedPaidAt)}.</p>
          <div className="mt-3 pt-3 border-t text-xs space-y-1" style={{ borderColor: "#CFE4D3", color: INK }}>
            <div><strong>Order:</strong> {assignment.orderNumber || `#${assignment.orderId}`}</div>
            <div><strong>Amount:</strong> {formatMoney(assignment.deliveryFee)}</div>
            <div className="capitalize"><strong>Method:</strong> {String(method).replace(/_/g, " ")}</div>
            {assignment.sellerPaymentReference && <div><strong>Reference:</strong> {assignment.sellerPaymentReference}</div>}
            {assignment.sellerMarkedPaidAt && <div><strong>Seller marked paid:</strong> {formatDate(assignment.sellerMarkedPaidAt)}</div>}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t" style={{ borderColor: "#EFEBE0" }}>
        {reportSent ? (
          <div className="text-sm font-medium" style={{ color: SAGE }}>Your report was submitted for Stallyard review.</div>
        ) : !reportOpen ? (
          <button type="button" onClick={() => setReportOpen(true)} className="text-sm font-semibold underline" style={{ color: BERRY }}>Report seller</button>
        ) : (
          <form onSubmit={onSubmitReport}>
            <div className="text-sm font-semibold" style={{ color: INK }}>Report a problem with the seller</div>
            <label className="block mt-3 text-xs font-medium" style={{ color: INK }}>
              Reason
              <select value={reportForm.category} onChange={(e) => setReportForm((v) => ({ ...v, category: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border bg-white" style={{ borderColor: "#CFC8B8" }}>
                <option value="non_payment">Driver fee not paid</option>
                <option value="unsafe_request">Unsafe or prohibited request</option>
                <option value="harassment">Harassment or abusive conduct</option>
                <option value="incorrect_package">Package did not match the assignment</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block mt-3 text-xs font-medium" style={{ color: INK }}>
              What happened?
              <textarea value={reportForm.details} onChange={(e) => setReportForm((v) => ({ ...v, details: e.target.value.slice(0, 1000) }))} rows={4} minLength={10} maxLength={1000} required className="w-full mt-1 px-3 py-2 rounded-lg border bg-white resize-y" style={{ borderColor: "#CFC8B8" }} />
            </label>
            <div className="flex gap-2 mt-3">
              <button type="submit" disabled={Boolean(busy) || reportForm.details.trim().length < 10} className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50" style={{ backgroundColor: BERRY, color: "white" }}>{busy === "report" ? "Submitting…" : "Submit report"}</button>
              <button type="button" onClick={() => setReportOpen(false)} disabled={Boolean(busy)} className="px-4 py-2 rounded-lg border font-semibold bg-white" style={{ borderColor: INK, color: INK }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function LiveDeliveryCamera({
  busy,
  onSave,
  onClose,
  facingMode = "environment",
  title = "Live delivery proof",
  instructions = "Show the package handoff clearly. This camera does not accept saved photos.",
  actionLabel = "Take and save photo",
}) {
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
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 960 } },
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
  }, [facingMode]);

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
            <h2 className="font-semibold" style={{ color: INK }}>{title}</h2>
            <p className="text-xs mt-1" style={{ color: SLATE }}>{instructions}</p>
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
            {busy ? "Saving…" : actionLabel}
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
