import React, { lazy, Suspense, useEffect, useRef, useState } from "react";

// AWS camera and face-liveness code is downloaded only when verification opens.
const FaceLivenessDetectorCore = lazy(() =>
  Promise.all([
    import("@aws-amplify/ui-react-liveness"),
    import("@aws-amplify/ui-react-liveness/styles.css"),
  ]).then(([module]) => ({ default: module.FaceLivenessDetectorCore }))
);

function CasualSellerVerificationModal({ onClose, onApproved, authFetch, showToast, scope }) {
  const {
    BACKEND_URL,
    BERRY,
    CANVAS,
    INK,
    MARIGOLD,
    SAGE,
    SLATE,
    X,
  } = scope;
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const neutralFaceSizeRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ legalName: "", dateOfBirth: "", consent: false });
  const [captures, setCaptures] = useState({ liveSelfie: "", holdingIdSelfie: "", challengeFrames: [] });
  const [faceChecks, setFaceChecks] = useState([]);
  const [faceDetectionSupported, setFaceDetectionSupported] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [challengeToken, setChallengeToken] = useState("");
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [awsLiveness, setAwsLiveness] = useState(null);
  const [awsLivenessVerified, setAwsLivenessVerified] = useState(false);
  const [rekognitionVerificationToken, setRekognitionVerificationToken] = useState("");

  const labels = {
    blink: "Blink slowly, then look at the camera",
    turn_left: "Turn your head to the left",
    turn_right: "Turn your head to the right",
    smile: "Smile while looking at the camera",
    move_closer: "Move your face slightly closer",
  };

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (detectorRef.current?.close) detectorRef.current.close();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [challengeResponse, awsResponse] = await Promise.all([
          authFetch(`${BACKEND_URL}/casual-seller/challenge`, { method: "POST" }),
          authFetch(`${BACKEND_URL}/casual-seller/rekognition/session`, { method: "POST" }),
        ]);
        const [data, awsData] = await Promise.all([challengeResponse.json(), awsResponse.json()]);
        if (!challengeResponse.ok) throw new Error(data.error || "Couldn't start secure verification");
        if (!awsResponse.ok) throw new Error(awsData.error || "Couldn't start AWS face verification");
        if (!cancelled) {
          setChallenges(data.challenges || []); setChallengeToken(data.token || "");
          setAwsLiveness(awsData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't start secure verification");
      } finally {
        if (!cancelled) setChallengeLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const completeAwsLiveness = async () => {
    const response = await authFetch(`${BACKEND_URL}/casual-seller/rekognition/complete`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: awsLiveness.sessionId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "AWS could not verify liveness");
    setAwsLivenessVerified(true);
    setRekognitionVerificationToken(data.verificationToken || "");
    showToast(`Secure liveness verified (${Math.round(Number(data.confidence || 0))}%)`);
  };

  const initializeFaceDetector = async () => {
    const vision = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/+esm");
    const files = await vision.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm");
    const detector = await vision.FaceLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task" },
      runningMode: "IMAGE", numFaces: 2, outputFaceBlendshapes: true,
    });
    return detector;
  };

  const startCamera = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot securely open the camera. Use an updated phone browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      detectorRef.current = await initializeFaceDetector();
      setCameraReady(true);
      setFaceDetectionSupported(true);
    } catch {
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      setError("The secure camera or on-device face checker could not start. Check camera permission and your connection, then try again.");
    }
  };

  const captureCamera = async (kind, requestedChallenge = null) => {
    const video = videoRef.current;
    if (!video || !cameraReady || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = Math.floor((video.videoWidth - size) / 2), sy = Math.floor((video.videoHeight - size) / 2);
    canvas.width = 900; canvas.height = 900;
    canvas.getContext("2d").drawImage(video, sx, sy, size, size, 0, 0, 900, 900);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    let facePresent = false;
    if (detectorRef.current) {
      try {
        const result = detectorRef.current.detect(canvas);
        facePresent = result.faceLandmarks?.length === 1;
        if (facePresent) {
          const landmarks = result.faceLandmarks[0];
          const xs = landmarks.map((point) => point.x), ys = landmarks.map((point) => point.y);
          const faceWidth = Math.max(...xs) - Math.min(...xs), faceHeight = Math.max(...ys) - Math.min(...ys);
          if (kind === "live") neutralFaceSizeRef.current = faceWidth * faceHeight;
          if (requestedChallenge) {
            const scores = Object.fromEntries((result.faceBlendshapes?.[0]?.categories || []).map((item) => [item.categoryName, item.score]));
            const noseRatio = (landmarks[1].x - Math.min(...xs)) / Math.max(faceWidth, 0.001);
            const challengePassed = requestedChallenge === "blink" ? Math.max(scores.eyeBlinkLeft || 0, scores.eyeBlinkRight || 0) > 0.45
              : requestedChallenge === "smile" ? Math.max(scores.mouthSmileLeft || 0, scores.mouthSmileRight || 0) > 0.45
              : requestedChallenge === "turn_left" || requestedChallenge === "turn_right" ? Math.abs(noseRatio - 0.5) > 0.06
              : requestedChallenge === "move_closer" ? neutralFaceSizeRef.current && faceWidth * faceHeight > neutralFaceSizeRef.current * 1.18
              : false;
            if (!challengePassed) { setError(`The “${labels[requestedChallenge]}” movement was not detected. Hold the position and capture again.`); return; }
          }
        }
      } catch { facePresent = false; }
      if (!facePresent) { setError("Exactly one clear face must be visible. Adjust the lighting and try again."); return; }
    }
    setFaceChecks((current) => [...current, facePresent]);
    setError("");
    if (kind === "live") setCaptures((current) => ({ ...current, liveSelfie: dataUrl }));
    else if (kind === "holding") setCaptures((current) => ({ ...current, holdingIdSelfie: dataUrl }));
    else setCaptures((current) => ({ ...current, challengeFrames: [...current.challengeFrames, dataUrl].slice(0, 3) }));
  };

  const submit = async () => {
    setError("");
    if (!awsLivenessVerified || !rekognitionVerificationToken) { setError("Complete the secure AWS face-liveness check first."); return; }
    if (!faceDetectionSupported) { setError("Automatic face detection is unavailable on this browser. Use an updated supported phone or browser so Stallyard does not approve an unverified person."); return; }
    if (!form.legalName.trim() || !form.dateOfBirth) { setError("Enter your legal name and date of birth."); return; }
    if (!captures.liveSelfie || !captures.holdingIdSelfie || captures.challengeFrames.length !== 3) { setError("Complete the live selfie, all three challenges, and the selfie holding your ID."); return; }
    if (!form.consent) { setError("You must accept the identity-record consent before submitting."); return; }
    setSubmitting(true);
    try {
      const response = await authFetch(`${BACKEND_URL}/casual-seller/apply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...captures, challenges, challengeToken, faceDetectionSupported, faceChecks, rekognitionVerificationToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification could not be completed");
      onApproved(data);
      showToast(data.status === "approved" ? "Identity verified — you can now publish up to ₦500,000 in active listings" : "Verification needs attention — review the result and try again");
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(27,36,48,.72)" }} onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl p-5 my-6" style={{ backgroundColor: CANVAS }} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div><h2 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>Automatic casual-seller verification</h2><p className="text-sm" style={{ color: SLATE }}>Verify once to publish up to ₦500,000 in combined active listings.</p></div>
          <button onClick={onClose} aria-label="Close"><X size={22} /></button>
        </div>
        <div className="mb-4 p-3 rounded-lg border text-xs leading-5" style={{ borderColor: MARIGOLD, backgroundColor: "#FFF8E8", color: SLATE }}>
          <strong style={{ color: INK }}>Identity-check attempt limit:</strong> You may start up to 3 AWS face-liveness checks in a rolling 24-hour period. Closing, restarting or abandoning a started check still uses an attempt.
          {awsLiveness && <span className="block mt-1 font-medium" style={{ color: INK }}>{Number(awsLiveness.remainingAttempts || 0)} attempt{Number(awsLiveness.remainingAttempts || 0) === 1 ? "" : "s"} remaining after this session.</span>}
        </div>
        {!awsLivenessVerified && awsLiveness && (
          <div className="mb-5 rounded-xl overflow-hidden border bg-white" style={{ borderColor: SAGE }}>
            <Suspense fallback={<div className="p-8 text-center text-sm" style={{ color: SLATE }}>Loading secure face verification…</div>}>
              <FaceLivenessDetectorCore
                sessionId={awsLiveness.sessionId}
                region={awsLiveness.region}
                config={{ credentialProvider: async () => ({
                  accessKeyId: awsLiveness.credentials.accessKeyId,
                  secretAccessKey: awsLiveness.credentials.secretAccessKey,
                  sessionToken: awsLiveness.credentials.sessionToken,
                  expiration: awsLiveness.credentials.expiration ? new Date(awsLiveness.credentials.expiration) : undefined,
                }) }}
                onAnalysisComplete={completeAwsLiveness}
                onError={(livenessError) => setError(livenessError?.error?.message || livenessError?.message || "AWS face-liveness verification failed")}
                onUserCancel={onClose}
              />
            </Suspense>
          </div>
        )}
        {awsLivenessVerified && <p className="mb-4 text-sm font-medium" style={{ color: SAGE }}>✓ AWS face-liveness verification passed</p>}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <input className="w-full px-3 py-2 rounded-lg border" placeholder="Legal name exactly as shown on ID" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
            <label className="block text-xs" style={{ color: SLATE }}>Date of birth<input type="date" className="block w-full mt-1 px-3 py-2 rounded-lg border" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></label>
            <div className="p-3 rounded-lg border text-xs" style={{ borderColor: SAGE, backgroundColor: "#EDF4EE", color: SLATE }}>
              You do not need to enter an ID number or upload separate ID photographs for Casual Seller verification. You will only take a selfie while holding your identification.
            </div>
          </div>
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-black mb-2"><video ref={videoRef} muted playsInline className="w-full h-full object-cover" /></div>
            {!cameraReady ? <button disabled={challengeLoading || !challengeToken || !awsLivenessVerified} onClick={startCamera} className="w-full py-2 rounded-lg font-medium disabled:opacity-50" style={{ backgroundColor: MARIGOLD, color: INK }}>{challengeLoading ? "Preparing secure challenge…" : !awsLivenessVerified ? "Complete AWS liveness first" : "Open secure camera"}</button> : (
              <div className="space-y-2 text-sm">
                <button onClick={() => captureCamera("live")} className="w-full py-2 rounded-lg border">{captures.liveSelfie ? "✓ Retake neutral live selfie" : "Capture neutral live selfie"}</button>
                {challenges.map((challenge, index) => <button key={challenge} disabled={captures.challengeFrames.length !== index} onClick={() => captureCamera("challenge", challenge)} className="w-full py-2 px-2 rounded-lg border disabled:opacity-40 text-left">{captures.challengeFrames[index] ? "✓ " : `${index + 1}. `}{labels[challenge]}</button>)}
                <button onClick={() => captureCamera("holding")} className="w-full py-2 rounded-lg border">{captures.holdingIdSelfie ? "✓ Retake selfie holding ID" : "Hold your ID beside your face and capture"}</button>
              </div>
            )}
          </div>
        </div>
        <label className="flex gap-2 mt-5 text-xs" style={{ color: SLATE }}><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} /><span>I consent to Stallyard collecting and securely retaining my identity images and verification results for fraud prevention, account security, seller accountability, transaction investigations, and legal recordkeeping. They may be accessed only by authorized Stallyard verification personnel.</span></label>
        {error && <p className="text-sm mt-3" style={{ color: BERRY }}>{error}</p>}
        <button disabled={submitting} onClick={submit} className="w-full mt-4 py-3 rounded-lg font-semibold disabled:opacity-50" style={{ backgroundColor: MARIGOLD, color: INK }}>{submitting ? "Securely checking and saving…" : "Submit for automatic verification"}</button>
      </div>
    </div>
  );
}

export default function VerificationScreens({ scope }) {
  const {
    BACKEND_URL,
    BERRY,
    CANVAS,
    INK,
    MARIGOLD,
    SAGE,
    SLATE,
    X,
    authFetch,
    casualVerificationOpen,
    idVerifyForm,
    idVerifyOpen,
    setCasualSellerStatus,
    setCasualVerificationOpen,
    setIdVerifyForm,
    setIdVerifyOpen,
    setSessionUserProfile,
    showToast,
    submitIdVerification,
  } = scope;

  return (
    <>
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
              Stallyard requires approved seller verification to keep selling.
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
                    <option>Residence/Work Permit (CERPAC)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: INK }}>
                    Issuing country
                  </label>
                  <input
                    value={idVerifyForm.idCountry}
                    onChange={(e) => setIdVerifyForm({ ...idVerifyForm, idCountry: e.target.value })}
                    placeholder="Nigeria"
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
      {casualVerificationOpen && (
        <CasualSellerVerificationModal
          scope={scope}
          onClose={() => setCasualVerificationOpen(false)}
          authFetch={authFetch}
          showToast={showToast}
          onApproved={(result) => {
            setCasualSellerStatus((current) => ({
              ...(current || {}), status: result.status, limit: result.limit,
              application: { reference: result.reference, status: result.status, automatic_checks: result.checks },
            }));
            setSessionUserProfile((current) => current ? { ...current, casual_seller_status: result.status, casual_seller_limit: result.limit } : current);
          }}
        />
      )}
    </>
  );
}
