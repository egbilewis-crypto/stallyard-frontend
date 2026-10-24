import React, { useEffect, useRef, useState } from "react";

const INK = "#1B2430";
const CANVAS = "#F6F3EC";
const MARIGOLD = "#E8A94D";
const BERRY = "#C1443C";
const SAGE = "#6B8F71";
const SLATE = "#667085";
const BACKEND_URL = typeof window !== "undefined" && /(^|\.)stallyard\.com$/i.test(window.location.hostname)
  ? "https://api.stallyard.com"
  : "https://stallyard-backend-production.up.railway.app";

const NIGERIA_STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Federal Capital Territory","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

const api = (path, options = {}) => fetch(`${BACKEND_URL}${path}`, { ...options, credentials: "include" });
const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value || 0));
const date = (value) => value ? new Date(value).toLocaleString() : "Not specified";

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !String(file.type || "").startsWith("image/")) return reject(new Error("Select a JPG, PNG, or WebP image."));
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch { reject(new Error("The picture could not be prepared.")); }
      finally { URL.revokeObjectURL(url); }
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That picture could not be opened.")); };
    image.src = url;
  });
}

export default function DriverDashboard() {
  const [tab, setTab] = useState("jobs");
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [form, setForm] = useState({ legalName:"",phone:"",state:"",city:"",vehicleType:"motorcycle",vehicleDescription:"",licensePlate:"",bankName:"",accountName:"",accountNumber:"",isAvailable:true });
  const [identity, setIdentity] = useState({ idType:"nin",idNumber:"",selfie:"",document:"" });
  const [cameraOpen, setCameraOpen] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const dashboardResponse = await api("/driver/dashboard");
      if (dashboardResponse.status === 401) { setSignedOut(true); return; }
      const dashboard = await dashboardResponse.json().catch(() => ({}));
      if (!dashboardResponse.ok) throw new Error(dashboard.error || "Driver Dashboard could not be opened.");
      setProfile(dashboard.profile || null);
      setRequests(dashboard.requests || []);
      setAssignments(dashboard.assignments || []);
      if (dashboard.profile) {
        setForm((value) => ({ ...value,
          legalName:dashboard.profile.legalName || "",phone:dashboard.profile.phone || "",
          state:dashboard.profile.state || "",city:dashboard.profile.city || "",
          vehicleType:dashboard.profile.vehicleType || "motorcycle",vehicleDescription:dashboard.profile.vehicleDescription || "",
          licensePlate:dashboard.profile.licensePlate || "",bankName:"",
          accountName:"",accountNumber:"",isAvailable:dashboard.profile.isAvailable !== false,
        }));
        const jobsResponse = await api("/driver/jobs");
        const jobData = await jobsResponse.json().catch(() => ({}));
        if (jobsResponse.ok) setJobs(jobData.jobs || []);
      }
    } catch (requestError) { setError(requestError.message || "Driver Dashboard could not be opened."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async (event) => {
    event.preventDefault(); setBusy("profile"); setError(""); setNotice("");
    try {
      const response = await api("/driver/profile", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Driver profile could not be saved.");
      setProfile(data.profile); setNotice("Driver profile saved.");
      await load();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(""); }
  };

  const submitIdentity = async (event) => {
    event.preventDefault();
    if (!identity.selfie || !identity.document) { setError("Take a live selfie and upload your ID document."); return; }
    setBusy("identity"); setError(""); setNotice("");
    try {
      const response = await api("/driver/profile/identity", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ idType:identity.idType,idNumber:identity.idNumber,liveSelfie:identity.selfie,idDocumentPhoto:identity.document }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Identity could not be submitted.");
      setProfile(data.profile); setIdentity({ idType:"nin",idNumber:"",selfie:"",document:"" });
      setNotice("Identity submitted for Stallyard review.");
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(""); }
  };

  const requestJob = async (jobId) => {
    setBusy(`job-${jobId}`); setError("");
    try {
      const response = await api(`/driver/jobs/${jobId}/request`, { method:"POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The delivery job could not be requested.");
      setNotice("Delivery request sent to the seller."); await load();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(""); }
  };

  const openAssignment = async (assignmentId) => {
    setBusy(`assignment-${assignmentId}`); setError("");
    try {
      const response = await api(`/driver/assignments/${assignmentId}/access`, { method:"POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "This delivery could not be opened.");
      const token = String(data.accessPath || "").split("/").filter(Boolean).pop();
      if (!token || !data.sessionToken) throw new Error("Secure delivery access was not returned.");
      window.sessionStorage.setItem(`stallyard-driver-session:${token}`, data.sessionToken);
      window.location.assign(data.accessPath);
    } catch (requestError) { setError(requestError.message); setBusy(""); }
  };

  if (loading) return <Page><div className="p-6 text-center">Opening Driver Dashboard…</div></Page>;
  if (signedOut) return <Page><Card><h1 className="text-2xl font-semibold" style={{color:INK}}>Driver sign-in required</h1><p className="mt-2 text-sm" style={{color:SLATE}}>Use your own Stallyard account. Never use a seller&apos;s password.</p><a href="/signin?return=%2Fdriver%2Fdashboard" className="inline-block mt-4 px-4 py-3 rounded-xl font-semibold" style={{backgroundColor:MARIGOLD,color:INK}}>Sign in to Stallyard</a></Card></Page>;

  return <Page>
    <header className="flex items-center justify-between gap-3 flex-wrap mb-5">
      <div><div className="text-xs font-semibold tracking-widest" style={{color:BERRY}}>STALLYARD DELIVERY</div><h1 className="text-3xl font-semibold" style={{color:INK}}>Driver Dashboard</h1></div>
      <a href="/" className="px-4 py-2 rounded-xl border bg-white text-sm font-semibold" style={{borderColor:"#DDD8CC",color:INK}}>Stallyard home</a>
    </header>
    {error && <div className="mb-4 p-3 rounded-xl" style={{backgroundColor:"#FFF1EF",color:BERRY}}>{error}</div>}
    {notice && <div className="mb-4 p-3 rounded-xl" style={{backgroundColor:"#EDF6EF",color:SAGE}}>{notice}</div>}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
      {[["jobs","Find jobs"],["active","My deliveries"],["earnings","Earnings"],["profile","My profile"]].map(([key,label]) => <button key={key} onClick={() => setTab(key)} className="px-3 py-3 rounded-xl border text-sm font-semibold" style={{backgroundColor:tab===key?INK:"white",color:tab===key?"white":INK,borderColor:tab===key?INK:"#DDD8CC"}}>{label}</button>)}
    </div>

    {tab === "jobs" && <Card>
      <h2 className="text-xl font-semibold" style={{color:INK}}>Available delivery jobs</h2>
      {!profile && <p className="mt-3 text-sm" style={{color:BERRY}}>Create your driver profile before viewing jobs.</p>}
      {profile && profile.verificationStatus !== "approved" && <p className="mt-3 text-sm" style={{color:BERRY}}>Your identity must be approved before you can request a job. Current status: {profile.verificationStatus}.</p>}
      <div className="mt-4 space-y-3">{jobs.length === 0 && <p className="text-sm" style={{color:SLATE}}>No open jobs currently match your service state.</p>}{jobs.map((job) => <div key={job.id} className="p-4 rounded-xl border" style={{borderColor:"#DDD8CC"}}>
        <div className="flex justify-between gap-3 flex-wrap"><div className="font-semibold" style={{color:INK}}>{job.packageDescription || job.itemTitle}</div><span className="font-semibold" style={{color:SAGE}}>{money(job.deliveryFee)}</span></div>
        <div className="mt-2 text-sm" style={{color:SLATE}}>{job.pickupCity}, {job.pickupState} → {job.deliveryCity}, {job.deliveryState}</div>
        <div className="mt-1 text-xs capitalize" style={{color:SLATE}}>{String(job.paymentMethod).replace(/_/g," ")} · Pickup {date(job.pickupAt)} · Due {date(job.deliveryDueAt)}</div>
        <button onClick={() => requestJob(job.id)} disabled={busy===`job-${job.id}` || job.requestStatus==="requested" || profile?.verificationStatus!=="approved"} className="mt-3 px-4 py-2 rounded-lg font-semibold disabled:opacity-50" style={{backgroundColor:MARIGOLD,color:INK}}>{job.requestStatus==="requested"?"Request sent":busy===`job-${job.id}`?"Sending…":"Request this delivery"}</button>
      </div>)}</div>
    </Card>}

    {tab === "active" && <Card><h2 className="text-xl font-semibold" style={{color:INK}}>My deliveries</h2><div className="mt-4 space-y-3">{assignments.length===0&&<p className="text-sm" style={{color:SLATE}}>You have no selected delivery assignments yet.</p>}{assignments.map((assignment)=><div key={assignment.id} className="p-4 rounded-xl border" style={{borderColor:"#DDD8CC"}}><div className="flex justify-between gap-2 flex-wrap"><div className="font-semibold" style={{color:INK}}>{assignment.orderNumber} · {assignment.itemTitle}</div><span className="text-xs capitalize" style={{color:SAGE}}>{String(assignment.status).replace(/_/g," ")}</span></div><div className="mt-2 text-sm" style={{color:SLATE}}>Pickup: {assignment.pickupAddress || `${assignment.pickupCity}, ${assignment.pickupState}`}</div><div className="mt-1 text-sm" style={{color:SLATE}}>Driver fee: {money(assignment.deliveryFee)}</div><button onClick={()=>openAssignment(assignment.id)} disabled={Boolean(busy)} className="mt-3 px-4 py-2 rounded-lg font-semibold disabled:opacity-50" style={{backgroundColor:MARIGOLD,color:INK}}>{busy===`assignment-${assignment.id}`?"Opening…":"Open delivery workflow"}</button></div>)}</div></Card>}

    {tab === "earnings" && <Card><h2 className="text-xl font-semibold" style={{color:INK}}>Earnings history</h2><div className="grid sm:grid-cols-2 gap-3 mt-4"><Metric label="Confirmed earnings" value={money(assignments.filter((a)=>a.paymentStatus==="confirmed").reduce((sum,a)=>sum+Number(a.deliveryFee||0),0))}/><Metric label="Completed deliveries" value={profile?.completedDeliveries || 0}/></div><div className="mt-4 space-y-2">{assignments.filter((a)=>a.status==="delivered").map((a)=><div key={a.id} className="p-3 rounded-lg border text-sm flex justify-between gap-2" style={{borderColor:"#DDD8CC",color:INK}}><span>{a.orderNumber} · {date(a.deliveredAt)}</span><span style={{color:a.paymentStatus==="confirmed"?SAGE:MARIGOLD}}>{money(a.deliveryFee)} · {a.paymentStatus}</span></div>)}</div></Card>}

    {tab === "profile" && <div className="space-y-4">
      <Card><h2 className="text-xl font-semibold" style={{color:INK}}>Driver profile</h2><form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-3 mt-4">
        <Field label="Legal name"><input required minLength={3} value={form.legalName} onChange={(e)=>setForm({...form,legalName:e.target.value})}/></Field>
        <Field label="Nigerian phone"><input required type="tel" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></Field>
        <Field label="Service state"><select required value={form.state} onChange={(e)=>setForm({...form,state:e.target.value})}><option value="">Select state</option>{NIGERIA_STATES.map((state)=><option key={state}>{state}</option>)}</select></Field>
        <Field label="Service city"><input required value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})}/></Field>
        <Field label="Vehicle type"><select value={form.vehicleType} onChange={(e)=>setForm({...form,vehicleType:e.target.value})}><option value="motorcycle">Motorcycle</option><option value="car">Car</option><option value="van">Van</option><option value="truck">Truck</option><option value="bicycle">Bicycle</option><option value="on_foot">On foot</option></select></Field>
        <Field label="Licence plate (if applicable)"><input value={form.licensePlate} onChange={(e)=>setForm({...form,licensePlate:e.target.value})}/></Field>
        <Field label="Vehicle description" wide><input value={form.vehicleDescription} onChange={(e)=>setForm({...form,vehicleDescription:e.target.value})} placeholder="Colour, make and model"/></Field>
        <div className="sm:col-span-2 pt-2 border-t" style={{borderColor:"#EFEBE0"}}><div className="text-sm font-semibold" style={{color:INK}}>Optional bank payment details</div><p className="text-xs mt-1" style={{color:SLATE}}>Required only if you want sellers to pay by bank transfer.</p></div>
        {profile?.hasBankDetails&&<div className="sm:col-span-2 text-xs p-3 rounded-lg" style={{backgroundColor:"#EDF6EF",color:SAGE}}>Bank details are saved securely{profile.accountNumberLast4?` (account ending ${profile.accountNumberLast4})`:""}. Complete all three bank fields only when replacing them.</div>}
        <Field label="Bank name"><input value={form.bankName} onChange={(e)=>setForm({...form,bankName:e.target.value})}/></Field>
        <Field label="Account number"><input inputMode="numeric" maxLength={10} value={form.accountNumber} onChange={(e)=>setForm({...form,accountNumber:e.target.value.replace(/\D/g,"").slice(0,10)})} placeholder={profile?.accountNumberLast4?`Saved account ending ${profile.accountNumberLast4}`:"10 digits"}/></Field>
        <Field label="Name on account" wide><input value={form.accountName} onChange={(e)=>setForm({...form,accountName:e.target.value})}/></Field>
        <label className="sm:col-span-2 flex items-center gap-2 text-sm" style={{color:INK}}><input type="checkbox" checked={form.isAvailable} onChange={(e)=>setForm({...form,isAvailable:e.target.checked})}/>Available to receive delivery jobs</label>
        <button disabled={busy==="profile"} className="sm:col-span-2 px-4 py-3 rounded-xl font-semibold disabled:opacity-50" style={{backgroundColor:MARIGOLD,color:INK}}>{busy==="profile"?"Saving…":"Save driver profile"}</button>
      </form></Card>
      {profile && <Card><div className="flex justify-between gap-3 flex-wrap"><div><h2 className="text-xl font-semibold" style={{color:INK}}>Identity verification</h2><p className="text-sm mt-1" style={{color:SLATE}}>Verification is completed once and reused for selected deliveries.</p></div><span className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{backgroundColor:"#F4F2ED",color:profile.verificationStatus==="approved"?SAGE:profile.verificationStatus==="rejected"?BERRY:MARIGOLD}}>{profile.verificationStatus}</span></div>
        {profile.identitySelfieUrl&&<div className="flex gap-3 mt-4"><img src={profile.identitySelfieUrl} alt="Driver selfie" className="w-24 h-24 rounded-lg object-cover"/><img src={profile.idDocumentUrl} alt="Driver ID" className="w-32 h-24 rounded-lg object-cover"/></div>}
        {profile.verificationAdminNote&&<p className="mt-3 text-sm" style={{color:BERRY}}>{profile.verificationAdminNote}</p>}
        {["draft","rejected"].includes(profile.verificationStatus)&&<form onSubmit={submitIdentity} className="mt-4 space-y-3"><div className="grid sm:grid-cols-2 gap-3"><Field label="ID type"><select value={identity.idType} onChange={(e)=>setIdentity({...identity,idType:e.target.value})}><option value="nin">NIN</option><option value="drivers_license">Driver&apos;s licence</option><option value="passport">Passport</option><option value="pvc">Permanent voter card</option></select></Field><Field label="ID number"><input required minLength={4} maxLength={30} value={identity.idNumber} onChange={(e)=>setIdentity({...identity,idNumber:e.target.value.replace(/[^A-Za-z0-9-]/g,"").slice(0,30)})}/></Field></div><div className="grid sm:grid-cols-2 gap-3"><PhotoBox title="Live selfie" image={identity.selfie}><button type="button" onClick={()=>setCameraOpen(true)} className="button-secondary">{identity.selfie?"Retake selfie":"Open front camera"}</button></PhotoBox><PhotoBox title="Government ID" image={identity.document}><label className="button-secondary block text-center cursor-pointer">{identity.document?"Choose another ID":"Upload ID photo"}<input type="file" accept="image/*" className="sr-only" onChange={async(e)=>{const file=e.target.files?.[0];if(file)try{setIdentity({...identity,document:await compressImage(file)});}catch(err){setError(err.message);}e.target.value="";}}/></label></PhotoBox></div><button disabled={busy==="identity"||!identity.selfie||!identity.document} className="w-full px-4 py-3 rounded-xl font-semibold disabled:opacity-50" style={{backgroundColor:MARIGOLD,color:INK}}>{busy==="identity"?"Submitting…":"Submit identity for review"}</button></form>}
      </Card>}
    </div>}
    {cameraOpen&&<LiveSelfieCamera onClose={()=>setCameraOpen(false)} onSave={(value)=>{setIdentity({...identity,selfie:value});setCameraOpen(false);}}/>}
  </Page>;
}

function Page({children}) { return <main className="min-h-screen px-4 py-6" style={{backgroundColor:CANVAS}}><div className="max-w-5xl mx-auto">{children}</div></main>; }
function Card({children}) { return <section className="p-5 rounded-2xl border bg-white" style={{borderColor:"#DDD8CC",boxShadow:"0 14px 45px rgba(27,36,48,.08)"}}>{children}</section>; }
function Metric({label,value}) { return <div className="p-4 rounded-xl" style={{backgroundColor:CANVAS}}><div className="text-xs" style={{color:SLATE}}>{label}</div><div className="text-2xl font-semibold mt-1" style={{color:INK}}>{value}</div></div>; }
function Field({label,wide=false,children}) { return <label className={wide?"sm:col-span-2 text-xs font-medium":"text-xs font-medium"} style={{color:INK}}>{label}{React.cloneElement(children,{className:"w-full mt-1 px-3 py-2 rounded-lg border bg-white outline-none",style:{borderColor:"#CFC8B8"}})}</label>; }
function PhotoBox({title,image,children}) { return <div className="p-3 rounded-xl border" style={{borderColor:image?SAGE:"#DDD8CC",backgroundColor:"#FAF9F6"}}><div className="text-sm font-semibold mb-2" style={{color:INK}}>{title}</div>{image&&<img src={image} alt={title} className="w-full h-40 object-contain rounded-lg bg-white mb-3"/>}{children}</div>; }

function LiveSelfieCamera({onSave,onClose}) {
  const videoRef = useRef(null); const streamRef = useRef(null); const [error,setError] = useState(""); const [starting,setStarting] = useState(true);
  useEffect(()=>{let active=true;(async()=>{try{if(!navigator.mediaDevices?.getUserMedia)throw new Error("Live camera is unavailable in this browser.");const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"user"},width:{ideal:1280},height:{ideal:960}},audio:false});if(!active){stream.getTracks().forEach((track)=>track.stop());return;}streamRef.current=stream;if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}}catch(err){setError(err.message||"Camera permission is required.");}finally{if(active)setStarting(false);}})();return()=>{active=false;streamRef.current?.getTracks().forEach((track)=>track.stop());};},[]);
  const capture=()=>{const video=videoRef.current;if(!video?.videoWidth)return;const scale=Math.min(1,1280/Math.max(video.videoWidth,video.videoHeight));const canvas=document.createElement("canvas");canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);canvas.getContext("2d").drawImage(video,0,0,canvas.width,canvas.height);onSave(canvas.toDataURL("image/jpeg",.82));};
  return <div className="fixed inset-0 z-50 p-4 flex items-center justify-center" style={{backgroundColor:"rgba(15,20,28,.92)"}}><div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden"><div className="p-4 flex justify-between"><div><div className="font-semibold" style={{color:INK}}>Live driver selfie</div><div className="text-xs mt-1" style={{color:SLATE}}>Face the front camera in good lighting. Gallery photos are disabled.</div></div><button onClick={onClose}>Close</button></div><div className="aspect-[4/3] bg-black flex items-center justify-center">{starting?<span className="text-white">Opening camera…</span>:error?<div className="m-4 p-3 rounded-lg" style={{backgroundColor:"#FFF1EF",color:BERRY}}>{error}</div>:<video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"/>}</div><div className="p-4"><button onClick={capture} disabled={starting||Boolean(error)} className="w-full px-4 py-3 rounded-xl font-semibold disabled:opacity-50" style={{backgroundColor:MARIGOLD,color:INK}}>Take live selfie</button></div></div></div>;
}
