// Lazily loaded admin-only interface. Public shoppers never download this chunk.
export default function SuperAdminDashboard({ scope }) {
  const {
    ADMIN_ROLE_LABELS,
    ADMIN_ROLE_ORDER,
    Array,
    BACKEND_URL,
    BERRY,
    Boolean,
    CANVAS,
    CATEGORIES,
    CATEGORY_COLOR,
    CURRENCIES,
    Date,
    FULFILLMENT_LABEL,
    INK,
    ImageIcon,
    MARIGOLD,
    Math,
    Number,
    Object,
    Pencil,
    Plus,
    React,
    SAGE,
    SLATE,
    Set,
    StarDisplay,
    String,
    TICKET_STATUS_LABEL,
    Tag,
    Trash2,
    X,
    accountReports,
    activeAdminOrderId,
    activeDisputeCaseId,
    activeTicketId,
    addBanner,
    addFaq,
    adminApproveListing,
    adminApproveMember,
    adminAutoVerifySeller,
    adminDisputeSearch,
    adminDisputeStatusFilter,
    adminDisputes,
    adminListingSearch,
    adminListingStatusFilter,
    adminMemberFilter,
    adminMemberSearch,
    adminOrderSearch,
    adminOrderStatusFilter,
    adminRejectListing,
    adminRemoveListing,
    adminRemoveMember,
    adminReportData,
    adminReportError,
    adminReportFrom,
    adminReportLoading,
    adminReportTo,
    adminReportType,
    adminResolveAccountReport,
    adminResolveMessageReport,
    adminResolveReviewReport,
    adminRestoreListing,
    adminSetRole,
    adminStaff,
    adminStaffError,
    adminStaffFilter,
    adminStaffSearch,
    adminTab,
    adminTakeDownListing,
    adminTempPasswordGeneratingId,
    adminTickets,
    adminToggleFeature,
    adminToggleImageVisibility,
    adminToggleSuspend,
    adminToggleVerify,
    adminTotpCodeInput,
    adminTotpError,
    adminTotpSetup,
    adminUpdateTicketStatus,
    auditActionFilter,
    auditDateFilter,
    auditLog,
    auditSearch,
    authFetch,
    authImageUploading,
    bannerForm,
    bannerImageUploading,
    buyerRiskData,
    buyerRiskError,
    buyerRiskFilter,
    buyerRiskLoading,
    buyerRiskSearch,
    casualSellerAdminLoading,
    casualSellerApplications,
    casualSellerReports,
    confirmAdminTotpSetup,
    confirmingAdminTotpSetup,
    content,
    contentTab,
    currentMember,
    currentUser,
    decidePremiumSellerApplication,
    dismissImageFlag,
    disputeAdminDrafts,
    downloadAdminReportCsv,
    downloadCasualSellerReport,
    downloadPremiumSellerReport,
    downloadVerifiedSellerReport,
    editingFaqId,
    expandedBuyerRiskId,
    expandedDocsUsername,
    expandedListingImagesId,
    expandedSellerPerformanceId,
    expandedStaffId,
    faqForm,
    fetchAdminReport,
    fetchAdminStaff,
    fetchAuditLog,
    fetchBuyerRisk,
    fetchCasualSellerVerification,
    fetchReconciliation,
    fetchSellerPerformance,
    fetchSystemHealth,
    fetchVerifiedSellerApplications,
    formatMoney,
    generateAdminTemporaryPassword,
    handleAuthImageSelect,
    handleBannerImageSelect,
    handleHomepageAdImageSelect,
    handleHomepageAdMobileImageSelect,
    hasAdminPermission,
    hideImageReason,
    hidingImageDraft,
    homepageAdSaving,
    homepageAdUploading,
    homepageAds,
    listings,
    loadingAdminStaff,
    loadingAuditLog,
    loadingTicketMessages,
    members,
    messageReports,
    newTicketMessageInput,
    openAdminDisputes,
    openAdminNotes,
    openAdminWarnings,
    openCasualApplicationEvidence,
    openTicketThread,
    orderNumber,
    orders,
    partialRefundOrder,
    paystackCheckingOrderId,
    paystackChecks,
    persistSettings,
    premiumSellerApplications,
    premiumSellerReports,
    reconciliationData,
    reconciliationError,
    reconciliationFilter,
    reconciliationLoading,
    reconciliationSearch,
    refundAdminFilter,
    refundAdminSearch,
    refundOrder,
    releasePayout,
    removeArticle,
    removeAuthImage,
    removeBanner,
    removeFaq,
    revealCasualSellerReportPassword,
    revealPremiumSellerReportPassword,
    revealVerifiedSellerReportPassword,
    reviewReports,
    revokeAdminStaffSessions,
    runPremiumSellerReportNow,
    runVerifiedSellerReportNow,
    saveAdminDisputeCase,
    saveHomepageAd,
    savingDisputeCaseId,
    sellerPerformanceData,
    sellerPerformanceError,
    sellerPerformanceFilter,
    sellerPerformanceLoading,
    sellerPerformanceSearch,
    sellerReports,
    sendTicketMessage,
    sendingTicketMessage,
    setActiveAdminOrderId,
    setActiveDisputeCaseId,
    setActiveTicketId,
    setAddMemberOpen,
    setAdminDisputeSearch,
    setAdminDisputeStatusFilter,
    setAdminListingSearch,
    setAdminListingStatusFilter,
    setAdminMemberFilter,
    setAdminMemberSearch,
    setAdminOrderSearch,
    setAdminOrderStatusFilter,
    setAdminReportData,
    setAdminReportError,
    setAdminReportFrom,
    setAdminReportTo,
    setAdminReportType,
    setAdminStaffFilter,
    setAdminStaffSearch,
    setAdminTab,
    setAdminTotpCodeInput,
    setAdminTotpError,
    setAdminTotpSetup,
    setArticleForm,
    setArticleModalOpen,
    setAuditActionFilter,
    setAuditDateFilter,
    setAuditSearch,
    setBannerForm,
    setBuyerRiskFilter,
    setBuyerRiskSearch,
    setContentTab,
    setDisputeAdminDrafts,
    setEditingArticleId,
    setEditingFaqId,
    setExpandedBuyerRiskId,
    setExpandedDocsUsername,
    setExpandedListingImagesId,
    setExpandedSellerPerformanceId,
    setExpandedStaffId,
    setFaqForm,
    setHideImageReason,
    setHidingImageDraft,
    setHomepageAds,
    setNewTicketMessageInput,
    setOrders,
    setReconciliationFilter,
    setReconciliationSearch,
    setRefundAdminFilter,
    setRefundAdminSearch,
    setRejectModalUsername,
    setRejectReasonDraft,
    setSellerPerformanceFilter,
    setSellerPerformanceSearch,
    setSettings,
    setTicketMessages,
    settings,
    showToast,
    startAdminTotpSetup,
    startEdit,
    startingAdminTotpSetup,
    systemHealth,
    systemHealthError,
    systemHealthLoading,
    ticketMessages,
    updateBanner,
    updateFaq,
    updateSellerReport,
    verifiedSellerApplications,
    verifiedSellerReports,
    verifyPaystackReconciliation,
    view,
    viewPremiumSellerDocument,
    viewVerifiedSellerBankStatement,
    viewVerifiedSellerIdentification,
    window,
    withdrawals,
  } = scope;
  return (
    <>
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
                { id: "members", label: `Members (${members.length})`, permission: "seller_verification" },
                { id: "staff", label: `Admin staff`, requireSuperAdmin: true },
                { id: "orders", label: `Orders (${orders.length})`, permission: "order_access" },
                { id: "disputes", label: `Disputes (${openAdminDisputes.length})`, permission: "dispute_resolution" },
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
                  id: "sellerReports",
                  label: `Seller reports (${sellerReports.filter((r) => ["open", "in_review"].includes(r.status)).length})`,
                  permission: "seller_report_review",
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
                { id: "homepageAds", label: "Homepage ads", requireSuperAdmin: true },
                { id: "reconciliation", label: "Reconciliation", permission: "finance" },
                { id: "sellerPerformance", label: "Seller performance", permission: "seller_verification" },
                { id: "buyerRisk", label: "Buyer risk", requireSuperAdmin: true },
                { id: "casualVerification", label: "Casual seller verification", requireSuperAdmin: true },
                {
                  id: "refunds",
                  label: `Refunds (${orders.filter((o) => o.refundStatus || o.paymentStatus === "refunded" || o.paymentStatus === "refund_pending").length})`,
                  permission: "finance",
                },
                {
                  id: "withdrawals",
                  label: `Withdrawals (${withdrawals.filter((w) => w.status === "processing").length})`,
                  permission: "finance",
                },
                { id: "reportsExport", label: "Reports & exports", permission: "finance_or_seller" },
                { id: "systemHealth", label: "System health", requireSuperAdmin: true },
                { id: "auditLog", label: "Audit log", requireSuperAdmin: true },
              ]
                .filter((t) => {
                  const isSuperAdmin = !currentMember?.adminRole || currentMember.adminRole === "super_admin";
                  if (t.requireSuperAdmin) return isSuperAdmin;
                  if (t.permission === "finance_or_content") {
                    return isSuperAdmin || hasAdminPermission(currentMember, "finance") || hasAdminPermission(currentMember, "content_management");
                  }
                  if (t.permission === "finance_or_seller") {
                    return isSuperAdmin || hasAdminPermission(currentMember, "finance") || hasAdminPermission(currentMember, "seller_verification");
                  }
                  if (t.permission) return hasAdminPermission(currentMember, t.permission);
                  return true; // no permission listed = every admin role can view
                })
                .map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setAdminTab(t.id);
                    if (t.id === "members") fetchVerifiedSellerApplications();
                    if (t.id === "auditLog") fetchAuditLog();
                    if (t.id === "staff") fetchAdminStaff();
                    if (t.id === "reconciliation") fetchReconciliation();
                    if (t.id === "sellerPerformance") fetchSellerPerformance();
                    if (t.id === "buyerRisk") fetchBuyerRisk();
                    if (t.id === "casualVerification") fetchCasualSellerVerification();
                    if (t.id === "systemHealth") fetchSystemHealth();
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


            {adminTab === "homepageAds" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div>
                <div className="mb-5">
                  <h3 className="text-xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                    Homepage ads
                  </h3>
                  <p className="text-sm mt-1" style={{ color: SLATE }}>
                    The homepage uses one responsive carousel with up to three slides. Add a wide desktop image and an optional square mobile image to each slide. Images are automatically cropped, converted to WebP, and optimized for fast loading.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {homepageAds.map((ad) => (
                    <div key={ad.slot} className="rounded-xl border bg-white p-4" style={{ borderColor: "#DDD8CC" }}>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div>
                          <p className="font-semibold" style={{ color: INK }}>Ad {ad.slot}</p>
                          <p className="text-xs" style={{ color: SLATE }}>
                            {`Carousel slide ${ad.slot}${ad.slot === 1 ? " — loads first" : " — deferred"}`}
                          </p>
                        </div>
                        {ad.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setHomepageAds((ads) => ads.map((item) => item.slot === ad.slot ? { ...item, imageUrl: "", posterUrl: "" } : item))}
                            className="text-xs underline"
                            style={{ color: BERRY }}
                          >
                            Remove media
                          </button>
                        )}
                      </div>

                      <div className="rounded-lg overflow-hidden border mb-3 bg-gray-50" style={{ borderColor: "#DDD8CC", aspectRatio: "4 / 1" }}>
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={`Slide ${ad.slot} desktop preview`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ color: SLATE }}>
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>

                      <label className="block text-xs font-medium mb-1" style={{ color: INK }}>Desktop image — 1600 × 400</label>
                      <label
                        className="mb-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer"
                        style={{ borderColor: "#DDD8CC", color: SLATE }}
                      >
                        <ImageIcon size={16} />
                        {homepageAdUploading === ad.slot ? "Uploading…" : ad.imageUrl ? "Change desktop image" : "Choose desktop image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={homepageAdUploading === ad.slot}
                          onChange={(e) => handleHomepageAdImageSelect(e, ad.slot)}
                        />
                      </label>

                      <label className="block text-xs font-medium mb-1" style={{ color: INK }}>Mobile image — 800 × 800 (optional)</label>
                      {ad.posterUrl && (
                        <div className="mb-2 mx-auto w-28 aspect-square rounded-lg overflow-hidden border" style={{ borderColor: "#DDD8CC" }}>
                          <img src={ad.posterUrl} alt={`Slide ${ad.slot} mobile preview`} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label
                        className="mb-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer"
                        style={{ borderColor: "#DDD8CC", color: SLATE }}
                      >
                        <ImageIcon size={16} />
                        {homepageAdUploading === ad.slot ? "Uploading…" : ad.posterUrl ? "Change mobile image" : "Choose mobile image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={homepageAdUploading === ad.slot}
                          onChange={(e) => handleHomepageAdMobileImageSelect(e, ad.slot)}
                        />
                      </label>
                      <p className="text-xs mb-3" style={{ color: SLATE }}>If omitted, the desktop image will be cropped automatically on phones.</p>

                      <label className="block text-xs font-medium mb-1" style={{ color: INK }}>Hyperlink</label>
                      <input
                        value={ad.linkUrl}
                        onChange={(e) => setHomepageAds((ads) => ads.map((item) => item.slot === ad.slot ? { ...item, linkUrl: e.target.value } : item))}
                        placeholder="https://example.com or /category/..."
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm mb-3"
                        style={{ borderColor: "#DDD8CC" }}
                      />

                      <button
                        type="button"
                        onClick={() => saveHomepageAd(ad.slot)}
                        disabled={homepageAdSaving === ad.slot || homepageAdUploading === ad.slot}
                        className="w-full px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        style={{ backgroundColor: MARIGOLD, color: INK }}
                      >
                        {homepageAdSaving === ad.slot ? "Saving…" : `Save slide ${ad.slot}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === "overview" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: SLATE }}>
                  Marketplace totals
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {(() => {
                    // Stallyard is Nigeria-only, so marketplace values are NGN.
                    const salesByCurrency = {};
                    const commissionByCurrency = {};
                    orders.forEach((o) => {
                      const cur = o.currency || "NGN";
                      salesByCurrency[cur] = (salesByCurrency[cur] || 0) + (o.total || 0);
                      commissionByCurrency[cur] = (commissionByCurrency[cur] || 0) + (o.commissionAmount || 0);
                    });
                    const formatByCurrency = (byCurrency) => {
                      const entries = Object.entries(byCurrency);
                      if (entries.length === 0) return formatMoney(0, "NGN");
                      return entries.map(([cur, amount]) => formatMoney(amount, cur)).join(" + ");
                    };
                    return [
                      {
                        label: "Total sales",
                        value: formatByCurrency(salesByCurrency),
                        color: SAGE,
                      },
                      {
                        label: "Marketplace commission",
                        value: formatByCurrency(commissionByCurrency),
                        color: SAGE,
                      },
                      { label: "Total users", value: members.length, color: INK, tab: "members" },
                      {
                        label: "Approved listings",
                        value: listings.filter((l) => l.status === "active").length,
                        color: INK,
                        tab: "listings",
                      },
                    ];
                  })().map((s) => (
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
                    const openSellerReports = sellerReports.filter((r) => ["open", "in_review"].includes(r.status)).length;
                    const systemAlerts = withdrawals.filter((w) => w.status === "failed").length;

                    return [
                      { label: "Pending orders", value: pendingOrders, tab: "orders" },
                      { label: "Awaiting delivery confirmation", value: awaitingConfirmation, tab: "orders" },
                      { label: "Seller apps awaiting verification", value: pendingSellerApps, tab: "members" },
                      { label: "Open disputes", value: openAdminDisputes.length, tab: "disputes" },
                      { label: "Refund requests", value: refundRequests, tab: "orders" },
                      { label: "Suspended users", value: suspendedUsers, tab: "members" },
                      { label: "Suspicious activity reports", value: suspiciousActivity, tab: "accountReports" },
                      { label: "Seller reports", value: openSellerReports, tab: "accountReports" },
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
                        value: `${CURRENCIES.NGN.symbol}${moneyAwaitingPayout.toFixed(2)}`,
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
                <div className="flex gap-2 flex-wrap mb-3">
                  <input value={adminListingSearch} onChange={(e) => setAdminListingSearch(e.target.value)}
                    placeholder="Search title, seller, category or listing ID"
                    className="flex-1 min-w-[240px] px-3 py-2 rounded-lg border bg-white text-sm"
                    style={{ borderColor: "#DDD8CC", color: INK }} />
                  <select value={adminListingStatusFilter} onChange={(e) => setAdminListingStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-white text-sm" style={{ borderColor: "#DDD8CC", color: INK }}>
                    <option value="all">All statuses</option><option value="pending">Pending</option><option value="active">Active</option>
                    <option value="draft">Draft</option><option value="paused">Paused</option><option value="sold">Sold</option>
                    <option value="rejected">Rejected</option><option value="removed">Taken down</option>
                  </select>
                </div>
                {listings.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No listings on the marketplace yet.
                  </p>
                )}
                {listings
                  .filter((l) => {
                    if (adminListingStatusFilter !== "all" && (l.status || "pending") !== adminListingStatusFilter) return false;
                    const q = adminListingSearch.trim().toLowerCase();
                    if (!q) return true;
                    return [l.id, l.title, l.sellerName, l.ownerUsername, l.category, l.brand, l.sku]
                      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
                  })
                  .map((l) => (
                  <div key={l.id}>
                  <div
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
                        onClick={() => setExpandedListingImagesId((id) => (id === l.id ? null : l.id))}
                        className="text-xs font-medium underline"
                        style={{ color: SLATE }}
                      >
                        Photos ({(l.allImages || l.images || []).length})
                      </button>
                      <button
                        onClick={() => adminToggleFeature(l.id)}
                        className="text-xs font-medium underline"
                        style={{ color: SLATE }}
                      >
                        {l.isFeatured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        onClick={() => openAdminNotes("listing", l.id, `Listing: ${l.title}`)}
                        className="text-xs font-medium underline"
                        style={{ color: SLATE }}
                      >
                        Internal notes
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
                  {expandedListingImagesId === l.id && (
                    <div className="p-3 rounded-lg border bg-white mt-1 mb-2" style={{ borderColor: "#DDD8CC" }}>
                      <p className="text-xs mb-2" style={{ color: SLATE }}>
                        All photos on this listing, at full resolution. Hiding a photo removes it from what buyers
                        see, without touching the rest of the listing.
                      </p>
                      {(l.allImages || l.images || []).length === 0 ? (
                        <p className="text-xs" style={{ color: SLATE }}>
                          No photos on this listing.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {(l.allImages || l.images || []).map((url, idx) => {
                            const isHidden = (l.hiddenImageUrls || []).includes(url);
                            const flagEntry = (l.flaggedImages || []).find((f) => f.url === url);
                            const isDraftingHide = hidingImageDraft?.listingId === l.id && hidingImageDraft?.url === url;
                            return (
                              <div key={idx} className="relative">
                                <img
                                  src={url}
                                  alt={`${l.title} photo ${idx + 1}`}
                                  className="w-28 h-28 object-cover rounded-lg"
                                  style={{ opacity: isHidden ? 0.4 : 1, border: flagEntry ? `2px solid ${MARIGOLD}` : "none" }}
                                />
                                {flagEntry && (
                                  <span
                                    className="absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: MARIGOLD, color: INK }}
                                    title={flagEntry.reasons.join("; ")}
                                  >
                                    ⚠ Flagged
                                  </span>
                                )}
                                {isHidden && (
                                  <span
                                    className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: BERRY, color: "white" }}
                                  >
                                    Hidden
                                  </span>
                                )}
                                {isDraftingHide ? (
                                  <div
                                    className="absolute inset-0 p-1.5 flex flex-col justify-end gap-1"
                                    style={{ backgroundColor: "rgba(27,36,48,0.85)" }}
                                  >
                                    <input
                                      autoFocus
                                      value={hideImageReason}
                                      onChange={(e) => setHideImageReason(e.target.value)}
                                      placeholder="Reason (optional)"
                                      className="w-full px-1.5 py-1 rounded text-xs"
                                      style={{ border: "none" }}
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          adminToggleImageVisibility(l.id, url, true, hideImageReason.trim());
                                          setHidingImageDraft(null);
                                          setHideImageReason("");
                                        }}
                                        className="flex-1 text-xs py-0.5 rounded font-medium"
                                        style={{ backgroundColor: BERRY, color: "white" }}
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => {
                                          setHidingImageDraft(null);
                                          setHideImageReason("");
                                        }}
                                        className="flex-1 text-xs py-0.5 rounded font-medium"
                                        style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      isHidden
                                        ? adminToggleImageVisibility(l.id, url, false)
                                        : setHidingImageDraft({ listingId: l.id, url })
                                    }
                                    className="absolute bottom-0 left-0 right-0 text-center text-xs py-0.5 rounded-b-lg"
                                    style={{ backgroundColor: "rgba(27,36,48,0.75)", color: "white" }}
                                  >
                                    {isHidden ? "Unhide" : "Hide"}
                                  </button>
                                )}
                                {flagEntry && !isDraftingHide && (
                                  <button
                                    onClick={() => dismissImageFlag(l.id, url)}
                                    className="absolute bottom-5 left-0 right-0 text-center text-xs py-0.5"
                                    style={{ backgroundColor: "rgba(232,169,77,0.9)", color: INK }}
                                  >
                                    Dismiss flag
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                ))}
              </div>
            )}

            {adminTab === "members" && hasAdminPermission(currentMember, "seller_verification") && (
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
                {(!currentMember?.adminRole || currentMember.adminRole === "super_admin") && verifiedSellerApplications.filter((application) => application.status === "pending").length > 0 && (
                  <div className="mb-4 p-4 rounded-xl border" style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: INK }}>Verified-seller applications awaiting approval</h4>
                    <div className="space-y-2">{verifiedSellerApplications.filter((application) => application.status === "pending").map((application) => (
                      <div key={application.id} className="bg-white p-3 rounded-lg flex items-center justify-between gap-3 flex-wrap">
                        <div><strong className="text-sm" style={{ color: INK }}>{application.display_name || application.username}</strong><p className="text-xs" style={{ color: SLATE }}>@{application.username} · {application.reference} · requested ceiling ₦{Number(application.requested_limit).toLocaleString("en-NG")}</p><p className="text-xs mt-1" style={{ color: SLATE }}>{application.id_type || "Identification"}</p></div>
                        <div className="flex gap-3 flex-wrap">
                          <button onClick={() => viewVerifiedSellerIdentification(application, "front")} className="text-xs font-medium underline" style={{ color: INK }}>View ID front</button>
                          {application.has_id_back && <button onClick={() => viewVerifiedSellerIdentification(application, "back")} className="text-xs font-medium underline" style={{ color: INK }}>View ID back</button>}
                          <button onClick={() => viewVerifiedSellerBankStatement(application)} className="text-xs font-medium underline" style={{ color: INK }}>View bank statement</button>
                          <button onClick={() => adminAutoVerifySeller(application)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: SAGE, color: "white" }}>Approve Verified Seller</button>
                          <button onClick={() => { setRejectModalUsername(application.username); setRejectReasonDraft(""); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: BERRY, color: "white" }}>Reject</button>
                        </div>
                      </div>
                    ))}</div>
                  </div>
                )}
                {(!currentMember?.adminRole || currentMember.adminRole === "super_admin") && premiumSellerApplications.filter((application) => application.status === "pending").length > 0 && (
                  <div className="mb-4 p-4 rounded-xl border" style={{ borderColor: SAGE, backgroundColor: "#EDF4EE" }}>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: INK }}>Premium Seller applications awaiting approval</h4>
                    <div className="space-y-2">{premiumSellerApplications.filter((application) => application.status === "pending").map((application) => (
                      <div key={application.id} className="bg-white p-3 rounded-lg flex items-center justify-between gap-3 flex-wrap">
                        <div><strong className="text-sm" style={{ color: INK }}>{application.display_name || application.username}</strong><p className="text-xs" style={{ color: SLATE }}>@{application.username} · {application.reference} · requested {formatMoney(Number(application.requested_limit), "NGN")}</p></div>
                        <div className="flex gap-2 flex-wrap"><button onClick={() => viewPremiumSellerDocument(application)} className="text-xs font-medium underline" style={{ color: INK }}>View supporting document</button><button onClick={() => decidePremiumSellerApplication(application, true)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: SAGE, color: "white" }}>Approve Premium Seller</button><button onClick={() => decidePremiumSellerApplication(application, false)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: BERRY, color: "white" }}>Reject</button></div>
                      </div>
                    ))}</div>
                  </div>
                )}
                {(!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
                  <div className="mb-4 p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                      <div>
                        <h4 className="font-semibold text-sm" style={{ color: INK }}>Verified Seller daily approval reports</h4>
                        <p className="text-xs mt-1" style={{ color: SLATE }}>Super Admin only. Reports are sent daily after 8:00 AM Lagos time, retained securely, and every download is logged.</p>
                      </div>
                      <button onClick={runVerifiedSellerReportNow} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: INK, color: "white" }}>Generate report now</button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {verifiedSellerReports.map((report) => (
                        <div key={report.id} className="p-2 rounded-lg border text-xs" style={{ borderColor: "#DDD8CC", color: INK }}>
                          <strong>{String(report.report_date).slice(0, 10)}</strong><br />
                          {report.application_count} approval{Number(report.application_count) === 1 ? "" : "s"} · {report.email_status}
                          <div className="flex gap-3 mt-2">
                            <button onClick={() => downloadVerifiedSellerReport(report)} className="font-semibold underline">Download PDF</button>
                            <button onClick={() => revealVerifiedSellerReportPassword(report)} className="font-semibold underline" style={{ color: BERRY }}>Reveal password</button>
                          </div>
                        </div>
                      ))}
                      {!verifiedSellerReports.length && <p className="text-xs" style={{ color: SLATE }}>No Verified Seller reports have been generated yet.</p>}
                    </div>
                  </div>
                )}
                {(!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
                  <div className="mb-4 p-4 rounded-xl border bg-white" style={{ borderColor: SAGE }}>
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-3"><div><h4 className="font-semibold text-sm" style={{ color: INK }}>Premium Seller daily approval reports</h4><p className="text-xs mt-1" style={{ color: SLATE }}>Password-protected, retained securely and available only to authorized administration.</p></div><button onClick={runPremiumSellerReportNow} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: INK, color: "white" }}>Generate report now</button></div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{premiumSellerReports.map((report) => <div key={report.id} className="p-2 rounded-lg border text-xs" style={{ borderColor: "#DDD8CC", color: INK }}><strong>{String(report.report_date).slice(0,10)}</strong><br />{report.application_count} approval{Number(report.application_count)===1?"":"s"} · {report.email_status}<div className="flex gap-3 mt-2"><button onClick={()=>downloadPremiumSellerReport(report)} className="font-semibold underline">Download PDF</button><button onClick={()=>revealPremiumSellerReportPassword(report)} className="font-semibold underline" style={{ color:BERRY }}>Reveal password</button></div></div>)}{!premiumSellerReports.length && <p className="text-xs" style={{ color:SLATE }}>No Premium Seller reports have been generated yet.</p>}</div>
                  </div>
                )}
                <p className="text-xs mb-2" style={{ color: SLATE }}>
                  Admin staff are listed separately from regular members, each sorted A–Z — documents for each
                  member are under "View documents" below their info.
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                  <input value={adminMemberSearch} onChange={(e) => setAdminMemberSearch(e.target.value)}
                    placeholder="Search name, username, email, phone or country"
                    className="flex-1 min-w-[240px] px-3 py-2 rounded-lg border bg-white text-sm"
                    style={{ borderColor: "#DDD8CC", color: INK }} />
                  <select value={adminMemberFilter} onChange={(e) => setAdminMemberFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-white text-sm" style={{ borderColor: "#DDD8CC", color: INK }}>
                    <option value="all">All members</option><option value="admins">Admin staff</option><option value="pending">Seller applications</option>
                    <option value="approved">Approved sellers</option><option value="buyers">Buyer only</option><option value="suspended">Suspended</option>
                    <option value="verified">Identity verified</option>
                  </select>
                </div>
                <div className="space-y-2">
                  {members
                    .filter((m) => {
                      if (adminMemberFilter === "admins" && !m.isAdmin) return false;
                      if (adminMemberFilter === "pending" && m.verificationStatus !== "pending") return false;
                      if (adminMemberFilter === "approved" && (!m.isApproved || m.isAdmin)) return false;
                      if (adminMemberFilter === "buyers" && (m.isAdmin || m.isApproved || m.verificationStatus === "pending")) return false;
                      if (adminMemberFilter === "suspended" && !m.isSuspended) return false;
                      if (adminMemberFilter === "verified" && !m.isVerified) return false;
                      const q = adminMemberSearch.trim().toLowerCase();
                      if (!q) return true;
                      return [m.displayName, m.username, m.email, m.phone, m.country, m.officeLocation]
                        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
                    })
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
                          {m.isVerified && <Tag color={SAGE}>Identity verified</Tag>}
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
                        {(hasAdminPermission(currentMember, "user_management") || hasAdminPermission(currentMember, "seller_verification")) && (
                          <button
                            onClick={() => openAdminNotes("member", m.backendId, `Member: ${m.displayName} (@${m.username})`)}
                            className="text-xs font-medium underline mt-1 ml-3"
                            style={{ color: SLATE }}
                          >
                            Internal notes
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

            {adminTab === "staff" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (() => {
              const q = adminStaffSearch.trim().toLowerCase();
              const filtered = adminStaff.filter((s) => {
                const active = !!s.is_admin;
                const role = active ? (s.admin_role || "super_admin") : "revoked";
                if (adminStaffFilter === "active" && !active) return false;
                if (adminStaffFilter === "revoked" && active) return false;
                if (adminStaffFilter === "no2fa" && !!s.two_factor_enabled) return false;
                if (adminStaffFilter === "suspended" && !s.is_suspended) return false;
                if (adminStaffFilter !== "all" && !["active", "revoked", "no2fa", "suspended"].includes(adminStaffFilter) && role !== adminStaffFilter) return false;
                if (!q) return true;
                return [s.display_name, s.username, s.email, role, ADMIN_ROLE_LABELS[role]].filter(Boolean).join(" ").toLowerCase().includes(q);
              });
              const activeCount = adminStaff.filter((s) => s.is_admin).length;
              const mfaMissing = adminStaff.filter((s) => s.is_admin && !s.two_factor_enabled).length;
              return (
                <div>
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: INK }}>Admin / Staff Accounts</h3>
                      <p className="text-sm mt-1" style={{ color: SLATE }}>
                        Manage privileged staff access, roles, multi-factor status and active sessions. Super Admin can issue a 10-minute recovery password; role changes invalidate existing sessions automatically.
                      </p>
                    </div>
                    <button onClick={fetchAdminStaff} className="px-3 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: "#DDD8CC", color: INK }}>
                      {loadingAdminStaff ? "Refreshing…" : "Refresh"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      ["Active staff", activeCount],
                      ["Former/revoked", Math.max(0, adminStaff.length - activeCount)],
                      ["2FA attention", mfaMissing],
                      ["Super Admins", adminStaff.filter((s) => s.is_admin && (!s.admin_role || s.admin_role === "super_admin")).length],
                    ].map(([label, value]) => (
                      <div key={label} className="p-3 bg-white border rounded-xl" style={{ borderColor: "#DDD8CC" }}>
                        <div className="text-xs" style={{ color: SLATE }}>{label}</div>
                        <div className="text-xl font-semibold mt-1" style={{ color: INK }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 flex-wrap mb-4">
                    <input
                      value={adminStaffSearch}
                      onChange={(e) => setAdminStaffSearch(e.target.value)}
                      placeholder="Search staff name, username, email or role"
                      className="px-3 py-2 rounded-lg border outline-none text-sm flex-1 min-w-[220px]"
                      style={{ borderColor: "#DDD8CC" }}
                    />
                    <select value={adminStaffFilter} onChange={(e) => setAdminStaffFilter(e.target.value)} className="px-3 py-2 rounded-lg border bg-white text-sm" style={{ borderColor: "#DDD8CC" }}>
                      <option value="all">All staff</option>
                      <option value="active">Active</option>
                      <option value="revoked">Revoked</option>
                      <option value="no2fa">2FA attention</option>
                      <option value="suspended">Suspended</option>
                      {ADMIN_ROLE_ORDER.map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
                    </select>
                  </div>

                  {adminStaffError && (
                    <div className="p-3 rounded-lg border mb-4 text-sm" style={{ borderColor: BERRY, color: BERRY, backgroundColor: BERRY + "08" }}>
                      {adminStaffError}
                    </div>
                  )}

                  {!loadingAdminStaff && !adminStaffError && adminStaff.length === 0 && (
                    <div className="p-5 rounded-xl border bg-white text-sm" style={{ borderColor: "#DDD8CC", color: SLATE }}>
                      No staff records loaded yet. Click Refresh.
                    </div>
                  )}

                  <div className="space-y-3">
                    {filtered.map((staff) => {
                      const active = !!staff.is_admin;
                      const role = active ? (staff.admin_role || "super_admin") : null;
                      const isSelf = staff.username === currentUser;
                      const expanded = expandedStaffId === staff.id;
                      return (
                        <div key={staff.id} className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="min-w-0">
                              <div className="font-semibold flex items-center gap-2 flex-wrap" style={{ color: INK }}>
                                {staff.display_name || staff.username}
                                {active ? <Tag color={SAGE}>Active staff</Tag> : <Tag color={SLATE}>Access revoked</Tag>}
                                {staff.is_suspended && <Tag color={BERRY}>Suspended</Tag>}
                                {active && staff.two_factor_enabled ? <Tag color={SAGE}>2FA on</Tag> : active ? <Tag color={BERRY}>2FA attention</Tag> : null}
                                {isSelf && <Tag color={MARIGOLD}>You</Tag>}
                              </div>
                              <div className="text-xs mt-1" style={{ color: SLATE }}>@{staff.username} · {staff.email || "no email"}</div>
                              <div className="text-xs mt-1" style={{ color: SLATE }}>
                                Role: <strong>{active ? (ADMIN_ROLE_LABELS[role] || role) : "None"}</strong>
                                {staff.last_login_at ? ` · Last login ${new Date(staff.last_login_at).toLocaleString()}` : " · No recorded login"}
                              </div>
                              <div className="text-xs mt-1" style={{ color: SLATE }}>
                                {staff.last_action_at ? `Last admin action ${new Date(staff.last_action_at).toLocaleString()}` : "No recorded admin actions"}
                                {` · ${Number(staff.action_count || 0)} logged action${Number(staff.action_count || 0) === 1 ? "" : "s"}`}
                              </div>
                            </div>

                            {!isSelf && (
                              <div className="flex gap-2 flex-wrap items-end">
                                <div>
                                  <label className="block text-[11px] mb-1" style={{ color: SLATE }}>Role</label>
                                  <select
                                    value={role || ""}
                                    onChange={async (e) => {
                                      const nextRole = e.target.value || null;
                                      const reason = window.prompt("Optional reason for this role/access change:", "") || "";
                                      const ok = await adminSetRole(staff.username, nextRole, reason);
                                      if (ok) await fetchAdminStaff();
                                    }}
                                    className="px-2 py-1.5 rounded-lg border bg-white text-xs"
                                    style={{ borderColor: "#DDD8CC" }}
                                  >
                                    <option value="">No admin access</option>
                                    {ADMIN_ROLE_ORDER.map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
                                  </select>
                                </div>
                                {active && (
                                  <>
                                    <button
                                      onClick={() => generateAdminTemporaryPassword(staff)}
                                      disabled={adminTempPasswordGeneratingId === staff.id}
                                      className="px-3 py-2 rounded-lg border text-xs font-medium disabled:opacity-50"
                                      style={{ borderColor: MARIGOLD, color: INK }}
                                    >
                                      {adminTempPasswordGeneratingId === staff.id ? "Generating…" : "10-min password"}
                                    </button>
                                    <button onClick={() => revokeAdminStaffSessions(staff)} className="px-3 py-2 rounded-lg border text-xs font-medium" style={{ borderColor: "#DDD8CC", color: INK }}>
                                      Revoke sessions
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={async () => { await adminToggleSuspend(staff.username); await fetchAdminStaff(); }}
                                  className="px-3 py-2 rounded-lg border text-xs font-medium"
                                  style={{ borderColor: staff.is_suspended ? SAGE : BERRY, color: staff.is_suspended ? SAGE : BERRY }}
                                >
                                  {staff.is_suspended ? "Unsuspend" : "Suspend"}
                                </button>
                              </div>
                            )}
                          </div>

                          <button onClick={() => setExpandedStaffId(expanded ? null : staff.id)} className="text-xs underline mt-3" style={{ color: SLATE }}>
                            {expanded ? "Hide role history" : "View role history"}
                          </button>
                          {expanded && (
                            <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid #EEE9DE" }}>
                              {(staff.role_history || []).length === 0 ? (
                                <p className="text-xs" style={{ color: SLATE }}>No role changes recorded since Staff Management was enabled.</p>
                              ) : (staff.role_history || []).map((h) => (
                                <div key={h.id} className="text-xs p-2 rounded-lg" style={{ backgroundColor: CANVAS, color: SLATE }}>
                                  <strong style={{ color: INK }}>{h.old_role ? (ADMIN_ROLE_LABELS[h.old_role] || h.old_role) : "No admin access"}</strong>
                                  {" → "}
                                  <strong style={{ color: INK }}>{h.new_role ? (ADMIN_ROLE_LABELS[h.new_role] || h.new_role) : "No admin access"}</strong>
                                  {` · ${new Date(h.created_at).toLocaleString()}`}
                                  {h.changed_by_username ? ` · by @${h.changed_by_username}` : ""}
                                  {h.reason ? <div className="mt-1">Reason: {h.reason}</div> : null}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {adminTab === "sellerPerformance" && hasAdminPermission(currentMember, "seller_verification") && (
              <div>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: INK }}>Seller performance & risk review</h3>
                    <p className="text-xs mt-1 max-w-2xl" style={{ color: SLATE }}>
                      Operational indicators based on real marketplace activity. Scores help prioritize manual review only — they never suspend, reject, or penalize a seller automatically.
                    </p>
                  </div>
                  <button onClick={fetchSellerPerformance} disabled={sellerPerformanceLoading}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border disabled:opacity-50"
                    style={{ borderColor: "#DDD8CC", color: INK, backgroundColor: "white" }}>
                    {sellerPerformanceLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {sellerPerformanceError && (
                  <div className="p-3 rounded-lg border mb-4 text-sm" style={{ borderColor: BERRY, color: BERRY, backgroundColor: "white" }}>
                    {sellerPerformanceError}
                  </div>
                )}

                {sellerPerformanceData && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: "Sellers", value: sellerPerformanceData.summary?.sellerCount || 0 },
                        { label: "Needs review", value: sellerPerformanceData.summary?.needsReview || 0 },
                        { label: "Open disputes", value: sellerPerformanceData.summary?.openDisputes || 0 },
                        { label: "Active ship reminders", value: sellerPerformanceData.summary?.activeShipReminders || 0 },
                      ].map((card) => (
                        <div key={card.label} className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                          <div className="text-xs uppercase tracking-wide" style={{ color: SLATE }}>{card.label}</div>
                          <div className="text-2xl font-semibold mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{card.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {["all", "review", "watch", "good"].map((key) => (
                        <button key={key} onClick={() => setSellerPerformanceFilter(key)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border"
                          style={{
                            borderColor: sellerPerformanceFilter === key ? INK : "#DDD8CC",
                            backgroundColor: sellerPerformanceFilter === key ? INK : "white",
                            color: sellerPerformanceFilter === key ? "white" : SLATE,
                          }}>
                          {key === "all" ? "All" : key === "review" ? "Needs review" : key === "watch" ? "Watch" : "Good standing"}
                        </button>
                      ))}
                      <input value={sellerPerformanceSearch} onChange={(e) => setSellerPerformanceSearch(e.target.value)}
                        placeholder="Search seller, username, email or phone"
                        className="min-w-[240px] flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none bg-white"
                        style={{ borderColor: "#DDD8CC" }} />
                    </div>

                    <div className="space-y-3">
                      {(sellerPerformanceData.sellers || [])
                        .filter((seller) => {
                          if (sellerPerformanceFilter !== "all" && seller.healthBand !== sellerPerformanceFilter) return false;
                          const q = sellerPerformanceSearch.trim().toLowerCase();
                          if (!q) return true;
                          return [seller.displayName, seller.username, seller.email, seller.phone]
                            .some((v) => String(v || "").toLowerCase().includes(q));
                        })
                        .map((seller) => {
                          const expanded = expandedSellerPerformanceId === seller.userId;
                          const bandColor = seller.healthBand === "review" ? BERRY : seller.healthBand === "watch" ? MARIGOLD : SAGE;
                          return (
                            <div key={seller.userId} className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#DDD8CC" }}>
                              <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold" style={{ color: INK }}>{seller.displayName || seller.username}</span>
                                    <Tag color={bandColor}>{seller.healthLabel}</Tag>
                                    {seller.isSuspended && <Tag color={BERRY}>Suspended</Tag>}
                                    {seller.verificationStatus === "pending" && <Tag color={MARIGOLD}>Verification pending</Tag>}
                                  </div>
                                  <div className="text-xs mt-1" style={{ color: SLATE }}>
                                    @{seller.username} · {seller.orderCount} order{seller.orderCount === 1 ? "" : "s"} · {seller.reviewCount} review{seller.reviewCount === 1 ? "" : "s"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-5 flex-wrap">
                                  <div className="text-right">
                                    <div className="text-[10px] uppercase" style={{ color: SLATE }}>Health score</div>
                                    <div className="text-xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: bandColor }}>{seller.healthScore}/100</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] uppercase" style={{ color: SLATE }}>Rating</div>
                                    <div className="text-sm font-semibold" style={{ color: INK }}>{seller.reviewCount ? `${seller.averageRating.toFixed(1)} / 5` : "No reviews"}</div>
                                  </div>
                                  <button onClick={() => setExpandedSellerPerformanceId(expanded ? null : seller.userId)}
                                    className="text-xs font-medium underline" style={{ color: INK }}>
                                    {expanded ? "Hide details" : "View details"}
                                  </button>
                                </div>
                              </div>

                              {expanded && (
                                <div className="p-4 pt-0 border-t" style={{ borderColor: "#EFEBE0" }}>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                    {[
                                      ["Completed deliveries", seller.completedDeliveries],
                                      ["Returns", `${seller.returnedCount} (${seller.returnRate.toFixed(1)}%)`],
                                      ["Cancellations", `${seller.cancelledCount} (${seller.cancelRate.toFixed(1)}%)`],
                                      ["Open disputes", seller.openDisputes],
                                      ["All disputes", seller.disputeCount],
                                      ["Warnings", seller.warningCount],
                                      ["Ship reminders", seller.shipReminderCount],
                                      ["Avg. time to ship", seller.averageHoursToShip == null ? "—" : `${seller.averageHoursToShip.toFixed(1)}h`],
                                    ].map(([label, value]) => (
                                      <div key={label} className="p-2.5 rounded-lg" style={{ backgroundColor: CANVAS }}>
                                        <div className="text-[10px] uppercase tracking-wide" style={{ color: SLATE }}>{label}</div>
                                        <div className="text-sm font-semibold mt-0.5" style={{ color: INK }}>{value}</div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                      <div className="text-xs font-semibold mb-2" style={{ color: INK }}>Why this score</div>
                                      {seller.riskSignals.length ? (
                                        <div className="space-y-1.5">
                                          {seller.riskSignals.map((signal, idx) => (
                                            <div key={idx} className="text-xs flex items-start gap-2" style={{ color: signal.severity === "high" ? BERRY : SLATE }}>
                                              <span>•</span><span>{signal.message}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : <p className="text-xs" style={{ color: SAGE }}>No performance warning signals detected.</p>}
                                    </div>
                                    <div className="text-xs space-y-1.5" style={{ color: SLATE }}>
                                      <div><strong style={{ color: INK }}>Gross merchandise:</strong> {formatMoney(seller.grossMerchandise, "NGN")}</div>
                                      <div><strong style={{ color: INK }}>Available seller balance:</strong> {formatMoney(seller.availableBalance, "NGN")}</div>
                                      <div><strong style={{ color: INK }}>Last login:</strong> {seller.lastLoginAt ? new Date(seller.lastLoginAt).toLocaleString() : "No login recorded"}</div>
                                      <div><strong style={{ color: INK }}>Joined:</strong> {seller.joinedAt ? new Date(seller.joinedAt).toLocaleDateString() : "—"}</div>
                                      <div><strong style={{ color: INK }}>Verification:</strong> {seller.verificationStatus || "none"}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
            )}

            {adminTab === "buyerRisk" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: INK }}>Buyer risk & fraud review</h3>
                    <p className="text-xs mt-1 max-w-2xl" style={{ color: SLATE }}>
                      Operational risk signals for human review only. Stallyard does not automatically suspend or punish a buyer from this score.
                    </p>
                  </div>
                  <button onClick={fetchBuyerRisk} disabled={buyerRiskLoading}
                    className="px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
                    style={{ borderColor: "#DDD8CC", color: INK }}>
                    {buyerRiskLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {buyerRiskError && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FDECEC", color: BERRY }}>{buyerRiskError}</div>}

                {buyerRiskData && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Buyers", value: buyerRiskData.summary?.buyerCount || 0 },
                        { label: "High risk", value: buyerRiskData.summary?.highRisk || 0 },
                        { label: "Watch", value: buyerRiskData.summary?.watch || 0 },
                        { label: "Open reports", value: buyerRiskData.summary?.openReports || 0 },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                          <div className="text-xs" style={{ color: SLATE }}>{label}</div>
                          <div className="text-xl font-semibold mt-1" style={{ color: INK }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                      {[['all','All'],['low','Low'],['watch','Watch'],['high','High']].map(([key,label]) => (
                        <button key={key} onClick={() => setBuyerRiskFilter(key)} className="px-3 py-1.5 rounded-full text-xs font-medium border"
                          style={{ borderColor: buyerRiskFilter === key ? INK : "#DDD8CC", backgroundColor: buyerRiskFilter === key ? INK : "white", color: buyerRiskFilter === key ? "white" : SLATE }}>
                          {label}
                        </button>
                      ))}
                      <input value={buyerRiskSearch} onChange={(e) => setBuyerRiskSearch(e.target.value)}
                        placeholder="Search buyer, email, phone..." className="px-3 py-2 rounded-lg border text-sm flex-1 min-w-[220px] outline-none"
                        style={{ borderColor: "#DDD8CC", color: INK }} />
                    </div>

                    <div className="space-y-3">
                      {(buyerRiskData.buyers || [])
                        .filter((buyer) => {
                          if (buyerRiskFilter !== 'all' && buyer.riskBand !== buyerRiskFilter) return false;
                          const q = buyerRiskSearch.trim().toLowerCase();
                          if (!q) return true;
                          return [buyer.username, buyer.displayName, buyer.email, buyer.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
                        })
                        .map((buyer) => {
                          const expanded = expandedBuyerRiskId === buyer.userId;
                          const bandColor = buyer.riskBand === 'high' ? BERRY : buyer.riskBand === 'watch' ? MARIGOLD : SAGE;
                          return (
                            <div key={buyer.userId} className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: bandColor + '70' }}>
                              <button onClick={() => setExpandedBuyerRiskId(expanded ? null : buyer.userId)} className="w-full text-left p-4">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <div>
                                    <div className="font-semibold" style={{ color: INK }}>{buyer.displayName || buyer.username}</div>
                                    <div className="text-xs mt-0.5" style={{ color: SLATE }}>@{buyer.username} · {buyer.email || 'No email'}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Tag color={bandColor}>{buyer.riskBand === 'high' ? 'High risk' : buyer.riskBand === 'watch' ? 'Watch' : 'Low risk'}</Tag>
                                    <span className="text-sm font-semibold" style={{ color: INK }}>{buyer.riskScore}/100 risk</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                                  {[
                                    ['Orders', buyer.orderCount],
                                    ['Returns', `${buyer.returnRate.toFixed(1)}%`],
                                    ['Disputes', `${buyer.disputeRate.toFixed(1)}%`],
                                    ['Refunds', buyer.refundCount],
                                    ['Failed pays', buyer.failedPaymentCount],
                                  ].map(([label,value]) => (
                                    <div key={label} className="p-2 rounded-lg" style={{ backgroundColor: CANVAS }}>
                                      <div className="text-[11px]" style={{ color: SLATE }}>{label}</div>
                                      <div className="text-sm font-semibold" style={{ color: INK }}>{value}</div>
                                    </div>
                                  ))}
                                </div>
                              </button>
                              {expanded && (
                                <div className="px-4 pb-4 border-t" style={{ borderColor: "#EEE9DE" }}>
                                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                      <div className="text-xs font-semibold mb-2" style={{ color: INK }}>Why this buyer is flagged</div>
                                      {buyer.riskSignals.length ? (
                                        <div className="space-y-1.5">
                                          {buyer.riskSignals.map((signal, idx) => (
                                            <div key={idx} className="text-xs flex items-start gap-2" style={{ color: signal.severity === 'high' ? BERRY : SLATE }}><span>•</span><span>{signal.message}</span></div>
                                          ))}
                                        </div>
                                      ) : <p className="text-xs" style={{ color: SAGE }}>No meaningful buyer-risk signals detected.</p>}
                                    </div>
                                    <div className="text-xs space-y-1.5" style={{ color: SLATE }}>
                                      <div><strong style={{ color: INK }}>Completed purchases:</strong> {buyer.completedItems}</div>
                                      <div><strong style={{ color: INK }}>Cancelled items:</strong> {buyer.cancelledItems}</div>
                                      <div><strong style={{ color: INK }}>Return requests:</strong> {buyer.returnCount}</div>
                                      <div><strong style={{ color: INK }}>Disputes:</strong> {buyer.disputeCount} ({buyer.openDisputes} open)</div>
                                      <div><strong style={{ color: INK }}>Refunds:</strong> {buyer.refundCount}</div>
                                      <div><strong style={{ color: INK }}>Suspicious activity reports:</strong> {buyer.reportCount} ({buyer.openReportCount} open)</div>
                                      <div><strong style={{ color: INK }}>Failed payments:</strong> {buyer.failedPaymentCount}</div>
                                      <div><strong style={{ color: INK }}>Last login:</strong> {buyer.lastLoginAt ? new Date(buyer.lastLoginAt).toLocaleString() : 'No login recorded'}</div>
                                      <div><strong style={{ color: INK }}>Verification:</strong> email {buyer.isEmailVerified ? '✓' : '—'} · phone {buyer.isPhoneVerified ? '✓' : '—'}</div>
                                      <div><strong style={{ color: INK }}>Account:</strong> {buyer.isSuspended ? 'Suspended' : 'Active'}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
            )}

            {adminTab === "casualVerification" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
                  <div><h3 className="text-xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>Casual seller verification</h3><p className="text-sm mt-1" style={{ color: SLATE }}>Permanent identity evidence and daily PDF records. Access is recorded.</p></div>
                  <button onClick={fetchCasualSellerVerification} className="px-3 py-2 rounded-lg border text-sm">{casualSellerAdminLoading ? "Loading…" : "Refresh"}</button>
                </div>
                <div className="grid lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-3">
                    {(casualSellerApplications || []).map((application) => (
                      <div key={application.id} className="p-4 rounded-xl border bg-white flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: "#DDD8CC" }}>
                        <div><div className="flex items-center gap-2"><strong style={{ color: INK }}>{application.legal_name}</strong><Tag color={application.status === "approved" ? SAGE : application.status === "suspended" ? BERRY : MARIGOLD}>{application.status}</Tag></div><p className="text-xs mt-1" style={{ color: SLATE }}>@{application.username} · {application.reference} · selfie-and-liveness verification</p></div>
                        <button onClick={() => openCasualApplicationEvidence(application)} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: INK, color: "white" }}>Review evidence</button>
                      </div>
                    ))}
                    {!casualSellerApplications.length && <p className="text-sm" style={{ color: SLATE }}>No casual-seller applications yet.</p>}
                  </div>
                  <div className="p-4 rounded-xl border bg-white h-fit" style={{ borderColor: "#DDD8CC" }}>
                    <h4 className="font-semibold mb-3" style={{ color: INK }}>Daily PDF reports</h4>
                    <div className="space-y-2">{casualSellerReports.map((report) => <div key={report.id} className="w-full text-left p-2 rounded-lg border text-xs" style={{ borderColor: "#DDD8CC", color: INK }}><strong>{String(report.report_date).slice(0, 10)}</strong><br />{report.application_count} applications · {report.email_status}<div className="flex gap-3 mt-2"><button onClick={() => downloadCasualSellerReport(report)} className="font-semibold underline">Download PDF</button><button onClick={() => revealCasualSellerReportPassword(report)} className="font-semibold underline" style={{ color: BERRY }}>Reveal password</button></div></div>)}</div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === "orders" && hasAdminPermission(currentMember, "order_access") && (() => {
              const activeOrder = activeAdminOrderId != null
                ? orders.find((o) => Number(o.id) === Number(activeAdminOrderId))
                : null;

              if (activeOrder) {
                const orderDispute = adminDisputes.find((d) => Number(d.order_id) === Number(activeOrder.id));
                const sellerUsernames = [...new Set((activeOrder.items || []).map((i) => i.ownerUsername).filter(Boolean))];
                const sellerWithdrawals = withdrawals.filter((w) => sellerUsernames.includes(w.sellerUsername));
                const sellerPayout = Number(activeOrder.subtotal || 0) + Number(activeOrder.shippingTotal || 0) - Number(activeOrder.commissionAmount || 0);
                const paystackCheck = paystackChecks[activeOrder.id];
                const lifecycle = [
                  { label: "Order placed", at: activeOrder.createdAt, done: true },
                  { label: "Payment held", at: activeOrder.createdAt, done: ["held", "released", "refund_pending", "refunded"].includes(activeOrder.paymentStatus) },
                  { label: "Seller shipped", at: (activeOrder.items || []).map((i) => i.shippedAt).filter(Boolean).sort((a,b) => a-b)[0] || null, done: (activeOrder.items || []).some((i) => i.shippedAt || ["shipped", "delivered", "returned"].includes(i.fulfillmentStatus)) },
                  { label: "Delivery proof uploaded", at: null, done: (activeOrder.items || []).some((i) => !!i.proofOfDeliveryUrl) },
                  { label: "Buyer confirmed delivery", at: (activeOrder.items || []).map((i) => i.buyerConfirmedAt).filter(Boolean).sort((a,b) => a-b)[0] || null, done: (activeOrder.items || []).some((i) => !!i.buyerConfirmedAt) },
                  { label: "Seller payment released", at: null, done: activeOrder.paymentStatus === "released" },
                  { label: "Refund completed", at: activeOrder.refundedAt || null, done: activeOrder.paymentStatus === "refunded" || activeOrder.refundStatus === "processed" },
                ];

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setActiveAdminOrderId(null)}
                        className="text-sm font-medium underline"
                        style={{ color: SLATE }}
                      >
                        ← Back to orders
                      </button>
                      <div className="flex gap-2 flex-wrap">
                        {activeOrder.isDisputed && <Tag color={BERRY}>Disputed</Tag>}
                        <Tag color={activeOrder.paymentStatus === "released" ? SAGE : activeOrder.paymentStatus === "held" ? MARIGOLD : BERRY}>
                          {activeOrder.paymentStatus || "unknown"}
                        </Tag>
                        {activeOrder.refundStatus && <Tag color={activeOrder.refundStatus === "processed" ? SAGE : activeOrder.refundStatus === "failed" ? BERRY : MARIGOLD}>Refund {activeOrder.refundStatus}</Tag>}
                      </div>
                    </div>

                    <div className="p-5 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: SLATE }}>Order detail</p>
                          <h3 className="text-2xl mt-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>{orderNumber(activeOrder.id)}</h3>
                          <p className="text-sm mt-1" style={{ color: SLATE }}>Placed {new Date(activeOrder.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{formatMoney(activeOrder.total, activeOrder.currency)}</div>
                          <div className="text-xs mt-1" style={{ color: SLATE }}>{activeOrder.currency}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                        <h4 className="font-semibold mb-3" style={{ color: INK }}>Buyer & delivery address</h4>
                        <div className="text-sm space-y-1" style={{ color: SLATE }}>
                          <div><strong style={{ color: INK }}>Buyer:</strong> {activeOrder.buyerName || activeOrder.buyerUsername || "Unknown"}</div>
                          {activeOrder.buyerUsername && <div><strong style={{ color: INK }}>Username:</strong> @{activeOrder.buyerUsername}</div>}
                          <div className="pt-2">
                            <strong style={{ color: INK }}>Ship to:</strong><br />
                            {[activeOrder.shippingAddress?.fullName, activeOrder.shippingAddress?.street, activeOrder.shippingAddress?.city, activeOrder.shippingAddress?.state, activeOrder.shippingAddress?.zip, activeOrder.shippingAddress?.country].filter(Boolean).join(", ") || "No shipping address recorded"}
                            {activeOrder.shippingAddress?.phone && <div className="mt-1"><strong>Contact:</strong> {activeOrder.shippingAddress.phone}</div>}
                            {activeOrder.shippingAddress?.deliveryInstructions && <div className="mt-1"><strong>Delivery instructions:</strong> {activeOrder.shippingAddress.deliveryInstructions}</div>}
                            {activeOrder.shippingAddress?.preferredDeliveryTime && <div className="mt-1"><strong>Preferred time:</strong> {activeOrder.shippingAddress.preferredDeliveryTime}</div>}
                            {(activeOrder.shippingAddress?.locationPhotos || []).length > 0 && <div className="flex gap-2 flex-wrap mt-2">{activeOrder.shippingAddress.locationPhotos.map((photo, index) => <img key={index} src={photo} alt={`Delivery location ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" />)}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                        <h4 className="font-semibold mb-3" style={{ color: INK }}>Money breakdown</h4>
                        <div className="text-sm space-y-2" style={{ color: SLATE }}>
                          <div className="flex justify-between"><span>Items subtotal</span><strong style={{ color: INK }}>{formatMoney(activeOrder.subtotal, activeOrder.currency)}</strong></div>
                          <div className="flex justify-between"><span>Shipping</span><strong style={{ color: INK }}>{formatMoney(activeOrder.shippingTotal, activeOrder.currency)}</strong></div>
                          <div className="flex justify-between"><span>Tax</span><strong style={{ color: INK }}>{formatMoney(activeOrder.taxAmount, activeOrder.currency)}</strong></div>
                          <div className="flex justify-between"><span>Stallyard commission ({Math.round(Number(activeOrder.commissionRate || 0) * 100)}%)</span><strong style={{ color: INK }}>{formatMoney(activeOrder.commissionAmount, activeOrder.currency)}</strong></div>
                          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "#EFEBE0" }}><span>Seller payable</span><strong style={{ color: SAGE }}>{formatMoney(sellerPayout, activeOrder.currency)}</strong></div>
                          <div className="flex justify-between"><span>Buyer total</span><strong style={{ color: INK }}>{formatMoney(activeOrder.total, activeOrder.currency)}</strong></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                      <h4 className="font-semibold mb-3" style={{ color: INK }}>Payment & Paystack</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm" style={{ color: SLATE }}>
                        <div><strong style={{ color: INK }}>Payment status:</strong> {activeOrder.paymentStatus || "Unknown"}</div>
                        <div><strong style={{ color: INK }}>Paystack reference:</strong> <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{activeOrder.paystackReference || "Not recorded"}</span></div>
                        {(activeOrder.payouts || []).length > 0 && (
                          <div className="mt-2"><strong style={{ color: INK }}>Seller bank payouts:</strong>{activeOrder.payouts.map((payout) => <div key={payout.id} className="mt-1 pl-2">Seller #{payout.sellerId} · {formatMoney(payout.amount, "NGN")} · {payout.status}{payout.reference ? ` · ${payout.reference}` : ""}{payout.failureReason ? ` · ${payout.failureReason}` : ""}{["failed", "reversed", "needs_bank"].includes(payout.status) && <button type="button" className="ml-2 underline font-medium" onClick={async () => { const res = await authFetch(`${BACKEND_URL}/seller-payouts/${payout.id}/retry`, { method: "POST" }); const data = await res.json().catch(() => ({})); if (!res.ok) return showToast(data.error || "Payout retry failed"); setOrders((all) => all.map((order) => order.id === activeOrder.id ? { ...order, payouts: order.payouts.map((p) => p.id === payout.id ? { ...p, status: data.payout.status, reference: data.payout.paystack_reference, failureReason: data.payout.failure_reason || "" } : p) } : order)); showToast("Payout retry submitted to Paystack"); }}>Retry safely</button>}</div>)}</div>
                        )}
                        <div><strong style={{ color: INK }}>Channel:</strong> {activeOrder.paymentChannel || "—"}</div>
                        <div><strong style={{ color: INK }}>Card / bank:</strong> {[activeOrder.paymentCardType, activeOrder.paymentBank, activeOrder.paymentLast4 ? `•••• ${activeOrder.paymentLast4}` : ""].filter(Boolean).join(" · ") || "—"}</div>
                      </div>
                      {hasAdminPermission(currentMember, "finance") && (
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => verifyPaystackReconciliation(activeOrder.id)}
                            disabled={paystackCheckingOrderId === activeOrder.id || !activeOrder.paystackReference}
                            className="px-3 py-2 rounded-lg text-xs font-medium border disabled:opacity-50"
                            style={{ borderColor: "#DDD8CC", color: INK }}
                          >
                            {paystackCheckingOrderId === activeOrder.id ? "Checking Paystack…" : "Verify with Paystack"}
                          </button>
                          {paystackCheck && (
                            <span className="text-xs" style={{ color: paystackCheck.matches === false ? BERRY : SAGE }}>
                              {paystackCheck.matches === false ? "Paystack mismatch — review required" : "Paystack verification matched"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                      <h4 className="font-semibold mb-3" style={{ color: INK }}>Items, shipment & delivery</h4>
                      <div className="space-y-4">
                        {(activeOrder.items || []).map((i) => {
                          const tokenStatus = i.deliveryTokenRedeemedAt ? "Redeemed" : i.deliveryTokenGeneratedAt ? "Generated after payment — visible only to buyer" : "Not generated";
                          return (
                            <div key={i.id} className="p-3 rounded-lg border" style={{ borderColor: "#EFEBE0" }}>
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                  <div className="font-medium" style={{ color: INK }}>{i.emoji} {i.title}</div>
                                  <div className="text-xs mt-1" style={{ color: SLATE }}>Seller: {i.sellerName || i.ownerUsername || "Unknown"} · Qty {i.qty}</div>
                                </div>
                                <div className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{formatMoney(Number(i.price || 0) * Number(i.qty || 1), activeOrder.currency)}</div>
                              </div>
                              <div className="grid md:grid-cols-2 gap-2 text-xs mt-3" style={{ color: SLATE }}>
                                <div><strong style={{ color: INK }}>Fulfillment:</strong> {FULFILLMENT_LABEL[i.fulfillmentStatus] || i.fulfillmentStatus}</div>
                                <div><strong style={{ color: INK }}>Carrier:</strong> {i.carrier || "—"}</div>
                                <div><strong style={{ color: INK }}>Tracking:</strong> {i.trackingNumber || "—"}</div>
                                <div><strong style={{ color: INK }}>Shipped:</strong> {i.shippedAt ? new Date(i.shippedAt).toLocaleString() : "Not yet"}</div>
                                <div><strong style={{ color: INK }}>Delivery token:</strong> {tokenStatus}</div>
                                <div><strong style={{ color: INK }}>Buyer confirmed:</strong> {i.buyerConfirmedAt ? new Date(i.buyerConfirmedAt).toLocaleString() : "Not yet"}</div>
                                <div><strong style={{ color: INK }}>Return:</strong> {i.returnStatus || "None"}</div>
                                <div><strong style={{ color: INK }}>Return tracking:</strong> {i.returnTrackingNumber || "—"}</div>
                              </div>
                              {i.returnReason && <p className="text-xs mt-2" style={{ color: BERRY }}><strong>Return reason:</strong> {i.returnReason}{i.returnNote ? ` — ${i.returnNote}` : ""}</p>}
                              <div className="mt-3 flex gap-2 flex-wrap">
                                {i.proofOfDeliveryUrl && (
                                  <a href={i.proofOfDeliveryUrl} target="_blank" rel="noreferrer">
                                    <img src={i.proofOfDeliveryUrl} alt="Proof of delivery" className="w-24 h-24 object-cover rounded-lg border" style={{ borderColor: "#DDD8CC" }} />
                                  </a>
                                )}
                                {(i.returnEvidenceUrls || []).map((url, idx) => (
                                  <a key={url} href={url} target="_blank" rel="noreferrer">
                                    <img src={url} alt={`Return evidence ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border" style={{ borderColor: "#DDD8CC" }} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border bg-white" style={{ borderColor: orderDispute ? BERRY : "#DDD8CC" }}>
                        <h4 className="font-semibold mb-2" style={{ color: INK }}>Dispute</h4>
                        {orderDispute ? (
                          <div className="text-sm space-y-1" style={{ color: SLATE }}>
                            <div><strong style={{ color: INK }}>Case:</strong> #{orderDispute.id}</div>
                            <div><strong style={{ color: INK }}>Status:</strong> {orderDispute.status}</div>
                            <div><strong style={{ color: INK }}>Reason:</strong> {orderDispute.reason || "—"}</div>
                            {orderDispute.resolution && <div><strong style={{ color: INK }}>Decision:</strong> {orderDispute.resolution}</div>}
                            <button type="button" onClick={() => { setActiveDisputeCaseId(orderDispute.id); setAdminTab("disputes"); }} className="text-xs font-medium underline mt-2" style={{ color: BERRY }}>Open dispute case</button>
                          </div>
                        ) : <p className="text-sm" style={{ color: SLATE }}>No dispute case for this order.</p>}
                      </div>

                      <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                        <h4 className="font-semibold mb-2" style={{ color: INK }}>Refund</h4>
                        <div className="text-sm space-y-1" style={{ color: SLATE }}>
                          <div><strong style={{ color: INK }}>Status:</strong> {activeOrder.refundStatus || (activeOrder.paymentStatus === "refunded" ? "processed" : "No refund")}</div>
                          {activeOrder.refundType && <div><strong style={{ color: INK }}>Type:</strong> {activeOrder.refundType === "partial" ? "Partial refund" : "Full refund"}</div>}
                          {activeOrder.refundAmount > 0 && <div><strong style={{ color: INK }}>Amount:</strong> {formatMoney(activeOrder.refundAmount, activeOrder.currency)}</div>}
                          {activeOrder.refundReason && <div><strong style={{ color: INK }}>Reason:</strong> {activeOrder.refundReason}</div>}
                          {activeOrder.paystackRefundId && <div><strong style={{ color: INK }}>Paystack refund ID:</strong> {activeOrder.paystackRefundId}</div>}
                          {activeOrder.refundRequestedAt && <div><strong style={{ color: INK }}>Requested:</strong> {new Date(activeOrder.refundRequestedAt).toLocaleString()}</div>}
                          {activeOrder.refundedAt && <div><strong style={{ color: INK }}>Completed:</strong> {new Date(activeOrder.refundedAt).toLocaleString()}</div>}
                          {activeOrder.refundFailureReason && <div style={{ color: BERRY }}><strong>Problem:</strong> {activeOrder.refundFailureReason}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                      <h4 className="font-semibold mb-3" style={{ color: INK }}>Lifecycle</h4>
                      <div className="space-y-2">
                        {lifecycle.map((step) => (
                          <div key={step.label} className="flex items-center gap-3 text-sm">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: step.done ? SAGE : "#DDD8CC" }} />
                            <span style={{ color: step.done ? INK : SLATE }}>{step.label}</span>
                            <span className="text-xs" style={{ color: SLATE }}>{step.at ? new Date(step.at).toLocaleString() : step.done ? "Completed" : "Pending"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                      <h4 className="font-semibold mb-2" style={{ color: INK }}>Seller withdrawal activity</h4>
                      <p className="text-xs mb-3" style={{ color: SLATE }}>Withdrawals are seller-level records and are not directly tied to a single order, so these entries are shown only as context for sellers on this order.</p>
                      {sellerWithdrawals.length === 0 ? <p className="text-sm" style={{ color: SLATE }}>No withdrawal activity recorded for this order's seller(s).</p> : (
                        <div className="space-y-2">
                          {sellerWithdrawals.slice(0, 8).map((w) => (
                            <div key={w.id} className="flex justify-between gap-3 text-sm border-t pt-2" style={{ borderColor: "#EFEBE0", color: SLATE }}>
                              <span>{w.sellerUsername} · {w.status} · {new Date(w.requestedAt).toLocaleString()}</span>
                              <strong style={{ color: INK }}>{formatMoney(w.amount, activeOrder.currency)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {hasAdminPermission(currentMember, "finance") && (
                      <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                        <h4 className="font-semibold mb-2" style={{ color: INK }}>Admin money actions</h4>
                        <p className="text-xs mb-3" style={{ color: SLATE }}>Use money actions only after reviewing the payment, delivery evidence, and any dispute or return above.</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          {activeOrder.paymentStatus === "held" && !activeOrder.isDisputed && (
                            <button onClick={() => releasePayout(activeOrder.id)} className="text-sm font-medium underline" style={{ color: SAGE }}>Release payout</button>
                          )}
                          {["held", "released"].includes(activeOrder.paymentStatus) && (
                            <button onClick={() => refundOrder(activeOrder.id)} className="text-sm font-medium underline" style={{ color: BERRY }}>Refund buyer</button>
                          )}
                          {activeOrder.isDisputed && <span className="text-xs" style={{ color: BERRY }}>Payout release is blocked while the dispute is active.</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <input value={adminOrderSearch} onChange={(e) => setAdminOrderSearch(e.target.value)}
                      placeholder="Search order #, buyer, seller, item or Paystack ref"
                      className="flex-1 min-w-[240px] px-3 py-2 rounded-lg border bg-white text-sm"
                      style={{ borderColor: "#DDD8CC", color: INK }} />
                    <select value={adminOrderStatusFilter} onChange={(e) => setAdminOrderStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border bg-white text-sm" style={{ borderColor: "#DDD8CC", color: INK }}>
                      <option value="all">All payments</option><option value="held">Held</option><option value="released">Released</option>
                      <option value="refund_pending">Refund pending</option><option value="refunded">Refunded</option><option value="disputed">Disputed</option>
                    </select>
                  </div>
                  {orders.length === 0 && <p className="text-sm" style={{ color: SLATE }}>No orders placed yet.</p>}
                  {orders
                    .filter((o) => {
                      if (adminOrderStatusFilter === "disputed") { if (!o.isDisputed) return false; }
                      else if (adminOrderStatusFilter !== "all" && o.paymentStatus !== adminOrderStatusFilter) return false;
                      const q = adminOrderSearch.trim().toLowerCase();
                      if (!q) return true;
                      const sellers = (o.items || []).map((i) => `${i.sellerName || ""} ${i.ownerUsername || ""}`).join(" ");
                      const items = (o.items || []).map((i) => i.title || "").join(" ");
                      return [o.id, orderNumber(String(o.id)), o.buyerName, o.buyerUsername, o.paystackReference, sellers, items]
                        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
                    })
                    .slice().sort((a, b) => b.createdAt - a.createdAt)
                    .map((o) => (
                      <div key={o.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                          <span className="text-sm font-medium flex items-center gap-2 flex-wrap" style={{ color: INK }}>
                            {o.buyerName}
                            {o.isDisputed && <Tag color={BERRY}>Disputed</Tag>}
                            {o.paymentStatus === "held" && <Tag color={MARIGOLD}>Held</Tag>}
                            {o.paymentStatus === "released" && <Tag color={SAGE}>Released</Tag>}
                            {o.paymentStatus === "refunded" && <Tag color={BERRY}>Refunded</Tag>}
                            {o.paymentStatus === "refund_pending" && <Tag color={MARIGOLD}>Refund pending</Tag>}
                          </span>
                          <span className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{formatMoney(o.total, o.currency)}</span>
                        </div>
                        <div className="text-xs mb-2 flex items-center gap-2" style={{ color: SLATE }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{orderNumber(o.id)}</span>
                          · {new Date(o.createdAt).toLocaleString()}
                        </div>
                        <div className="text-xs mb-3" style={{ color: SLATE }}>{(o.items || []).map((i) => i.title).filter(Boolean).join(", ") || "No item details available"}</div>
                        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t" style={{ borderColor: "#EFEBE0" }}>
                          <div className="text-xs" style={{ color: SLATE }}>
                            Commission {formatMoney(Number(o.commissionAmount || 0), o.currency)} · Seller payable {formatMoney(Number(o.subtotal || 0) + Number(o.shippingTotal || 0) - Number(o.commissionAmount || 0), o.currency)}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button type="button" onClick={() => openAdminNotes("order", o.id, `Order ${orderNumber(o.id)}`)} className="px-3 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: "#DDD8CC", color: SLATE }}>Internal notes</button>
                            <button type="button" onClick={() => setActiveAdminOrderId(o.id)} className="px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: INK, color: "white" }}>View order detail</button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              );
            })()}

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

                    <label className="block text-sm font-medium mb-1 mt-6" style={{ color: INK }}>
                      Tax rate
                    </label>
                    <p className="text-xs mb-3" style={{ color: SLATE }}>
                      A flat rate applied to every checkout's item subtotal (not shipping), added on top of what
                      the buyer pays.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={Math.round((settings.taxRate || 0) * 1000) / 10}
                        onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) / 100 })}
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

            {adminTab === "reconciliation" && hasAdminPermission(currentMember, "finance") && (
              <div>
                <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: INK }}>Payment reconciliation</h3>
                    <p className="text-xs mt-1" style={{ color: SLATE }}>
                      Compare buyer payments, held/released funds, commission, refunds, and seller withdrawals. Red flags mean the money trail needs review.
                    </p>
                  </div>
                  <button
                    onClick={fetchReconciliation}
                    disabled={reconciliationLoading}
                    className="px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
                    style={{ borderColor: "#DDD8CC", color: INK }}
                  >
                    {reconciliationLoading ? "Refreshing…" : "Refresh totals"}
                  </button>
                </div>

                {reconciliationError && (
                  <div className="p-3 mb-4 rounded-lg text-sm" style={{ backgroundColor: BERRY + "10", color: BERRY }}>
                    {reconciliationError}
                  </div>
                )}
                {reconciliationLoading && !reconciliationData && (
                  <p className="text-sm" style={{ color: SLATE }}>Loading finance records…</p>
                )}
                {reconciliationData && (() => {
                  const records = reconciliationData.records || [];
                  const q = reconciliationSearch.trim().toLowerCase();
                  const filtered = records.filter((r) => {
                    if (reconciliationFilter === "flagged" && !(r.flags || []).length) return false;
                    if (reconciliationFilter === "held" && r.paymentStatus !== "held") return false;
                    if (reconciliationFilter === "released" && r.paymentStatus !== "released") return false;
                    if (reconciliationFilter === "refunds" && !["refund_pending", "refunded"].includes(r.paymentStatus)) return false;
                    if (!q) return true;
                    return [orderNumber(r.orderId), r.buyerUsername, r.paystackReference, r.paymentStatus]
                      .filter(Boolean).join(" ").toLowerCase().includes(q);
                  });
                  return (
                    <>
                      <div className="space-y-4 mb-6">
                        {(reconciliationData.byCurrency || []).map((c) => (
                          <div key={c.currency} className="p-4 rounded-xl border bg-white" style={{ borderColor: "#DDD8CC" }}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold" style={{ color: INK }}>{c.currency} money position</h4>
                              <Tag color={(reconciliationData.alerts?.high || 0) > 0 ? BERRY : SAGE}>
                                {reconciliationData.alerts?.total || 0} reconciliation alert{(reconciliationData.alerts?.total || 0) === 1 ? "" : "s"}
                              </Tag>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                ["Buyer payments", c.grossPayments],
                                ["Held", c.held],
                                ["Released", c.released],
                                ["Seller payable (released)", c.releasedSellerPayable],
                                ["Recorded commission", c.recordedCommission],
                                ["Refund pending", c.refundPending],
                                ["Refunded", c.refunded],
                                ["Tax recorded", c.tax],
                              ].map(([label, amount]) => (
                                <div key={label} className="p-3 rounded-lg" style={{ backgroundColor: CANVAS }}>
                                  <div className="text-[11px] uppercase tracking-wide" style={{ color: SLATE }}>{label}</div>
                                  <div className="font-semibold mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{formatMoney(amount, c.currency)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 rounded-xl border bg-white mb-6" style={{ borderColor: "#DDD8CC" }}>
                        <h4 className="font-semibold mb-3" style={{ color: INK }}>Seller withdrawals</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div><div className="text-xs" style={{ color: SLATE }}>Paid</div><div className="font-semibold" style={{ color: INK }}>{formatMoney(reconciliationData.withdrawals?.paid || 0, "NGN")}</div></div>
                          <div><div className="text-xs" style={{ color: SLATE }}>Processing</div><div className="font-semibold" style={{ color: MARIGOLD }}>{formatMoney(reconciliationData.withdrawals?.processing || 0, "NGN")}</div></div>
                          <div><div className="text-xs" style={{ color: SLATE }}>Failed</div><div className="font-semibold" style={{ color: BERRY }}>{formatMoney(reconciliationData.withdrawals?.failed || 0, "NGN")}</div></div>
                        </div>
                        <p className="text-[11px] mt-2" style={{ color: SLATE }}>Withdrawals are shown in NGN because Stallyard is currently Nigeria-only.</p>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-3">
                        {[
                          ["all", "All"], ["flagged", "Flagged"], ["held", "Held"], ["released", "Released"], ["refunds", "Refunds"],
                        ].map(([key, label]) => (
                          <button key={key} onClick={() => setReconciliationFilter(key)} className="px-3 py-1.5 rounded-full text-xs font-medium border"
                            style={{ borderColor: reconciliationFilter === key ? INK : "#DDD8CC", backgroundColor: reconciliationFilter === key ? INK : "white", color: reconciliationFilter === key ? "white" : SLATE }}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <input value={reconciliationSearch} onChange={(e) => setReconciliationSearch(e.target.value)} placeholder="Search order, buyer, Paystack reference or status"
                        className="w-full px-3 py-2 rounded-lg border text-sm mb-4" style={{ borderColor: "#DDD8CC", color: INK }} />

                      <div className="space-y-3">
                        {filtered.length === 0 && <p className="text-sm" style={{ color: SLATE }}>No records match this view.</p>}
                        {filtered.map((r) => {
                          const check = paystackChecks[r.orderId];
                          const hasFlags = (r.flags || []).length > 0;
                          return (
                            <div key={r.orderId} className="p-4 rounded-lg border bg-white" style={{ borderColor: hasFlags ? BERRY + "66" : "#DDD8CC" }}>
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{orderNumber(r.orderId)}</span>
                                    <Tag color={r.paymentStatus === "released" ? SAGE : r.paymentStatus === "held" ? MARIGOLD : BERRY}>{r.paymentStatus}</Tag>
                                    {hasFlags && <Tag color={BERRY}>{r.flags.length} alert{r.flags.length === 1 ? "" : "s"}</Tag>}
                                  </div>
                                  <p className="text-xs mt-1" style={{ color: SLATE }}>Buyer: {r.buyerUsername || "Unknown"}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{formatMoney(r.total, r.currency)}</div>
                                  <div className="text-[11px]" style={{ color: SLATE }}>Seller payable: {formatMoney(r.sellerPayable, r.currency)}</div>
                                </div>
                              </div>
                              <div className="grid sm:grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t" style={{ color: SLATE, borderColor: "#EFEBE0" }}>
                                <div><strong style={{ color: INK }}>Commission:</strong> {formatMoney(r.commissionAmount, r.currency)}</div>
                                <div><strong style={{ color: INK }}>Tax:</strong> {formatMoney(r.taxAmount, r.currency)}</div>
                                <div className="break-all"><strong style={{ color: INK }}>Paystack:</strong> {r.paystackReference || "Missing"}</div>
                              </div>
                              {hasFlags && (
                                <div className="mt-3 space-y-1">
                                  {r.flags.map((f) => <div key={f.code} className="text-xs" style={{ color: f.severity === "high" ? BERRY : MARIGOLD }}>• {f.message}</div>)}
                                </div>
                              )}
                              {check && (
                                <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: check.matches ? SAGE + "12" : BERRY + "10", color: check.matches ? SAGE : BERRY }}>
                                  <strong>{check.matches ? "Paystack match confirmed" : "Paystack mismatch"}</strong>
                                  {` — Paystack ${formatMoney(check.paystack?.amount || 0, check.paystack?.currency || r.currency)}, status ${check.paystack?.status || "unknown"}.`}
                                </div>
                              )}
                              <button onClick={() => verifyPaystackReconciliation(r.orderId)} disabled={paystackCheckingOrderId === r.orderId || !r.paystackReference}
                                className="mt-3 text-xs font-medium underline disabled:opacity-40" style={{ color: INK }}>
                                {paystackCheckingOrderId === r.orderId ? "Checking Paystack…" : "Verify with Paystack"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {adminTab === "refunds" && hasAdminPermission(currentMember, "finance") && (
              <div>
                {(() => {
                  const refundOrders = orders
                    .filter((o) => o.refundStatus || o.paymentStatus === "refunded" || o.paymentStatus === "refund_pending")
                    .sort((a, b) => (b.refundRequestedAt || b.createdAt) - (a.refundRequestedAt || a.createdAt));
                  const q = refundAdminSearch.trim().toLowerCase();
                  const filtered = refundOrders.filter((o) => {
                    const status = o.paymentStatus === "refunded" ? "processed" : (o.refundStatus || "pending");
                    const bucket = status === "failed" ? "failed"
                      : status === "request_unknown" || status === "needs-attention" ? "attention"
                      : status === "processed" ? "processed"
                      : "pending";
                    if (refundAdminFilter !== "all" && bucket !== refundAdminFilter) return false;
                    if (!q) return true;
                    const haystack = [orderNumber(o.id), o.buyerName, o.buyerUsername, o.paystackReference, o.paystackRefundId, o.refundReason]
                      .filter(Boolean).join(" ").toLowerCase();
                    return haystack.includes(q);
                  });
                  const counts = {
                    all: refundOrders.length,
                    pending: refundOrders.filter((o) => o.paymentStatus === "refund_pending" && !["failed", "request_unknown", "needs-attention"].includes(o.refundStatus)).length,
                    attention: refundOrders.filter((o) => ["request_unknown", "needs-attention"].includes(o.refundStatus)).length,
                    failed: refundOrders.filter((o) => o.refundStatus === "failed").length,
                    processed: refundOrders.filter((o) => o.paymentStatus === "refunded" || o.refundStatus === "processed").length,
                  };
                  const pendingAmount = refundOrders
                    .filter((o) => o.paymentStatus === "refund_pending")
                    .reduce((sum, o) => sum + Number(o.total || 0), 0);
                  return (
                    <>
                      <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                        <div>
                          <h3 className="text-lg font-semibold" style={{ color: INK }}>Refund management</h3>
                          <p className="text-xs mt-1" style={{ color: SLATE }}>Track every Paystack refund from request through final processing. Only Paystack-confirmed processed refunds are shown as refunded.</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs" style={{ color: SLATE }}>Currently pending</div>
                          <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{formatMoney(pendingAmount, "NGN")}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {[
                          ["all", "All", counts.all],
                          ["pending", "Pending", counts.pending],
                          ["attention", "Needs attention", counts.attention],
                          ["failed", "Failed", counts.failed],
                          ["processed", "Processed", counts.processed],
                        ].map(([key, label, count]) => (
                          <button key={key} onClick={() => setRefundAdminFilter(key)} className="px-3 py-1.5 rounded-full text-xs font-medium border"
                            style={{ borderColor: refundAdminFilter === key ? INK : "#DDD8CC", backgroundColor: refundAdminFilter === key ? INK : "white", color: refundAdminFilter === key ? "white" : SLATE }}>
                            {label} ({count})
                          </button>
                        ))}
                      </div>
                      <input value={refundAdminSearch} onChange={(e) => setRefundAdminSearch(e.target.value)} placeholder="Search order, buyer, Paystack reference, refund ID or reason"
                        className="w-full px-3 py-2 rounded-lg border text-sm mb-4" style={{ borderColor: "#DDD8CC", color: INK }} />
                      {filtered.length === 0 ? (
                        <p className="text-sm p-4 rounded-lg border bg-white" style={{ color: SLATE, borderColor: "#DDD8CC" }}>No refunds match this view.</p>
                      ) : (
                        <div className="space-y-3">
                          {filtered.map((o) => {
                            const status = o.paymentStatus === "refunded" ? "processed" : (o.refundStatus || "pending");
                            const needsAttention = ["request_unknown", "needs-attention"].includes(status);
                            const statusLabel = status === "request_unknown" ? "Request unknown"
                              : status === "needs-attention" ? "Needs attention"
                              : status === "processed" ? "Processed"
                              : status === "failed" ? "Failed"
                              : status === "requesting" ? "Requesting"
                              : status.charAt(0).toUpperCase() + status.slice(1);
                            const statusColor = status === "processed" ? SAGE : status === "failed" ? BERRY : needsAttention ? BERRY : MARIGOLD;
                            const requestedBy = members.find((m) => m.backendId === o.refundRequestedBy);
                            return (
                              <div key={o.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: needsAttention || status === "failed" ? BERRY + "66" : "#DDD8CC" }}>
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-sm" style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>{orderNumber(o.id)}</span>
                                      <Tag color={statusColor}>{statusLabel}</Tag>
                                      {o.isDisputed && <Tag color={BERRY}>Disputed</Tag>}
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: SLATE }}>Buyer: {o.buyerName || o.buyerUsername}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{formatMoney(o.total, o.currency)}</div>
                                    <div className="text-[11px]" style={{ color: SLATE }}>Full refund</div>
                                  </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2 text-xs mt-3 pt-3 border-t" style={{ color: SLATE, borderColor: "#EFEBE0" }}>
                                  <div><strong style={{ color: INK }}>Reason:</strong> {o.refundReason || "Not recorded"}</div>
                                  <div><strong style={{ color: INK }}>Requested:</strong> {o.refundRequestedAt ? new Date(o.refundRequestedAt).toLocaleString() : "Unknown"}</div>
                                  <div><strong style={{ color: INK }}>Requested by:</strong> {requestedBy?.displayName || requestedBy?.username || (o.refundRequestedBy ? `Admin #${o.refundRequestedBy}` : "Unknown")}</div>
                                  <div><strong style={{ color: INK }}>Completed:</strong> {o.refundedAt ? new Date(o.refundedAt).toLocaleString() : "—"}</div>
                                  <div className="break-all"><strong style={{ color: INK }}>Paystack transaction:</strong> {o.paystackReference || "—"}</div>
                                  <div className="break-all"><strong style={{ color: INK }}>Paystack refund ID:</strong> {o.paystackRefundId || "—"}</div>
                                </div>
                                {o.refundFailureReason && (
                                  <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: BERRY + "10", color: BERRY }}>
                                    <strong>Paystack / processing note:</strong> {o.refundFailureReason}
                                  </div>
                                )}
                                <div className="flex gap-3 mt-3 flex-wrap">
                                  {status === "failed" && o.paymentStatus !== "refund_pending" && (
                                    <button onClick={() => refundOrder(o.id)} className="text-xs font-medium underline" style={{ color: BERRY }}>Retry refund</button>
                                  )}
                                  {needsAttention && (
                                    <span className="text-xs font-medium" style={{ color: BERRY }}>Manual review required — verify this transaction in Paystack before taking another money action.</span>
                                  )}
                                  <button onClick={() => setAdminTab("orders")} className="text-xs font-medium underline" style={{ color: SLATE }}>Open orders</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  );
                })()}
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
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-lg" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>Dispute cases</h3>
                    <p className="text-xs" style={{ color: SLATE }}>
                      Review both sides, delivery/return evidence, payment status, private notes, and the final decision. The dispute payment lock now stays on until the chosen financial outcome is actually completed. Paystack refunds resolve only after Paystack confirms processing; seller-release cases resolve in the same transaction as the release.
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Tag color={BERRY}>{adminDisputes.filter((d) => d.status === "open").length} open</Tag>
                    <Tag color={MARIGOLD}>{adminDisputes.filter((d) => d.status === "in_review").length} reviewing</Tag>
                    <Tag color={SAGE}>{adminDisputes.filter((d) => d.status === "resolved").length} resolved</Tag>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <input value={adminDisputeSearch} onChange={(e) => setAdminDisputeSearch(e.target.value)}
                    placeholder="Search case, order, buyer, seller or reason"
                    className="flex-1 min-w-[240px] px-3 py-2 rounded-lg border bg-white text-sm"
                    style={{ borderColor: "#DDD8CC", color: INK }} />
                  <select value={adminDisputeStatusFilter} onChange={(e) => setAdminDisputeStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-white text-sm" style={{ borderColor: "#DDD8CC", color: INK }}>
                    <option value="all">All cases</option><option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option>
                  </select>
                </div>
                {adminDisputes.length === 0 && (
                  <p className="text-sm" style={{ color: SLATE }}>No dispute cases yet.</p>
                )}
                {adminDisputes
                  .filter((d) => {
                    if (adminDisputeStatusFilter !== "all" && d.status !== adminDisputeStatusFilter) return false;
                    const q = adminDisputeSearch.trim().toLowerCase();
                    if (!q) return true;
                    return [d.id, d.order_id, d.buyer_name, d.buyer_username, d.reason, d.buyer_statement, ...(d.items || []).flatMap((i) => [i.seller_name, i.seller_username, i.title])]
                      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
                  })
                  .map((d) => {
                  const o = orders.find((order) => Number(order.id) === Number(d.order_id));
                  const expanded = activeDisputeCaseId === d.id;
                  const draft = disputeAdminDrafts[d.id] || {};
                  const statusValue = draft.status ?? d.status ?? "open";
                  const resolutionValue = draft.resolution ?? d.resolution ?? "";
                  const resolutionNoteValue = draft.resolutionNote ?? d.resolution_note ?? "";
                  const adminNotesValue = draft.adminNotes ?? d.admin_notes ?? "";
                  const evidence = [
                    ...(Array.isArray(d.evidence_urls) ? d.evidence_urls : []),
                    ...(o?.items || []).flatMap((i) => [i.proofOfDeliveryUrl, ...(i.returnEvidenceUrls || [])].filter(Boolean)),
                  ].filter((url, idx, arr) => url && arr.indexOf(url) === idx);
                  return (
                    <div key={d.id} className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: d.status === "resolved" ? "#DDD8CC" : BERRY }}>
                      <button
                        type="button"
                        onClick={() => setActiveDisputeCaseId(expanded ? null : d.id)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold" style={{ color: INK }}>Case #{d.id} · {orderNumber(String(d.order_id))}</span>
                              <Tag color={d.status === "resolved" ? SAGE : d.status === "in_review" ? MARIGOLD : BERRY}>
                                {d.status === "in_review" ? "In review" : d.status === "resolved" ? "Resolved" : "Open"}
                              </Tag>
                              {o?.paymentStatus && <Tag color={o.paymentStatus === "held" ? MARIGOLD : o.paymentStatus === "released" ? SAGE : BERRY}>{o.paymentStatus}</Tag>}
                            </div>
                            <p className="text-xs mt-1" style={{ color: SLATE }}>
                              Buyer: {d.buyer_name || d.buyer_username || o?.buyerName || "Unknown"} · Seller: {d.seller_names || d.seller_usernames || (o?.items || []).map((i) => i.sellerName).filter(Boolean).join(", ") || "Unknown"}
                            </p>
                            <p className="text-xs mt-1" style={{ color: INK }}><span className="font-medium">Reason:</span> {d.reason || "Not specified"}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                              {formatMoney(Number(d.total ?? o?.total ?? 0), d.currency || o?.currency || "NGN")}
                            </div>
                            <div className="text-xs" style={{ color: SLATE }}>
                              Opened {new Date(d.opened_at || o?.createdAt || Date.now()).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </button>
                      {expanded && (
                        <div className="p-4 pt-0 border-t" style={{ borderColor: "#EFEBE0" }}>
                          <div className="flex justify-end mt-3">
                            <button type="button" onClick={() => openAdminNotes("dispute", d.id, `Dispute case #${d.id}`)} className="px-3 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: "#DDD8CC", color: SLATE }}>Internal notes</button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3 mt-4">
                            <div className="p-3 rounded-lg" style={{ backgroundColor: CANVAS }}>
                              <div className="text-xs font-semibold mb-1" style={{ color: INK }}>Buyer statement</div>
                              <p className="text-xs whitespace-pre-wrap" style={{ color: SLATE }}>{d.buyer_statement || "No buyer statement provided."}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: CANVAS }}>
                              <div className="text-xs font-semibold mb-1" style={{ color: INK }}>Seller statement</div>
                              <p className="text-xs whitespace-pre-wrap" style={{ color: SLATE }}>{d.seller_statement || "Seller has not responded yet."}</p>
                            </div>
                          </div>

                          {o && (
                            <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: "#DDD8CC" }}>
                              <div className="text-xs font-semibold mb-2" style={{ color: INK }}>Order & delivery timeline</div>
                              <div className="text-xs mb-2" style={{ color: SLATE }}>
                                Order placed {new Date(o.createdAt).toLocaleString()} · Payment: {o.paymentStatus}
                              </div>
                              {(o.items || []).map((i) => (
                                <div key={i.id} className="text-xs py-1 border-t" style={{ borderColor: "#EFEBE0", color: SLATE }}>
                                  <span className="font-medium" style={{ color: INK }}>{i.title}</span> · {FULFILLMENT_LABEL[i.fulfillmentStatus] || i.fulfillmentStatus}
                                  {i.shippedAt ? ` · shipped ${new Date(i.shippedAt).toLocaleString()}` : ""}
                                  {i.buyerConfirmedAt ? ` · delivery confirmed ${new Date(i.buyerConfirmedAt).toLocaleString()}` : ""}
                                  {i.returnStatus ? ` · return ${i.returnStatus}` : ""}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-3">
                            <div className="text-xs font-semibold mb-2" style={{ color: INK }}>Evidence</div>
                            {evidence.length === 0 ? (
                              <p className="text-xs" style={{ color: SLATE }}>No delivery or return evidence images are attached to this case yet.</p>
                            ) : (
                              <div className="flex gap-2 flex-wrap">
                                {evidence.map((url, idx) => (
                                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
                                    <img src={url} alt={`Dispute evidence ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border" style={{ borderColor: "#DDD8CC" }} />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 mt-4">
                            <label className="text-xs font-medium" style={{ color: INK }}>
                              Case status
                              <select
                                value={statusValue}
                                onChange={(e) => setDisputeAdminDrafts((all) => ({ ...all, [d.id]: { ...(all[d.id] || {}), status: e.target.value } }))}
                                className="mt-1 w-full px-3 py-2 rounded-lg border bg-white outline-none"
                                style={{ borderColor: "#DDD8CC" }}
                              >
                                <option value="open">Open</option>
                                <option value="in_review">In review</option>
                                <option
                                  value="resolved"
                                  disabled={
                                    (resolutionValue === "buyer_refund" && o?.paymentStatus !== "refunded") ||
                                    (resolutionValue === "seller_release" && o?.paymentStatus !== "released") ||
                                    (resolutionValue === "partial_refund" && !(o?.refundType === "partial" && o?.refundStatus === "processed" && o?.paymentStatus === "released"))
                                  }
                                >Resolved</option>
                              </select>
                            </label>
                            <label className="text-xs font-medium" style={{ color: INK }}>
                              Decision
                              <select
                                value={resolutionValue}
                                onChange={(e) => setDisputeAdminDrafts((all) => ({ ...all, [d.id]: { ...(all[d.id] || {}), resolution: e.target.value } }))}
                                className="mt-1 w-full px-3 py-2 rounded-lg border bg-white outline-none"
                                style={{ borderColor: "#DDD8CC" }}
                              >
                                <option value="">No decision yet</option>
                                <option value="buyer_refund">Refund buyer</option>
                                <option value="seller_release">Release to seller</option>
                                <option value="partial_refund">Partial refund / negotiated outcome</option>
                                <option value="no_action">No financial action</option>
                                <option value="cancelled">Case cancelled</option>
                              </select>
                            </label>
                          </div>
                          <label className="block text-xs font-medium mt-3" style={{ color: INK }}>
                            Decision explanation (visible in the case record)
                            <textarea
                              value={resolutionNoteValue}
                              onChange={(e) => setDisputeAdminDrafts((all) => ({ ...all, [d.id]: { ...(all[d.id] || {}), resolutionNote: e.target.value } }))}
                              rows={3}
                              className="mt-1 w-full px-3 py-2 rounded-lg border outline-none resize-y"
                              style={{ borderColor: "#DDD8CC" }}
                              placeholder="Explain why the case was decided this way…"
                            />
                          </label>
                          <label className="block text-xs font-medium mt-3" style={{ color: INK }}>
                            Private admin notes (never shown to buyer or seller)
                            <textarea
                              value={adminNotesValue}
                              onChange={(e) => setDisputeAdminDrafts((all) => ({ ...all, [d.id]: { ...(all[d.id] || {}), adminNotes: e.target.value } }))}
                              rows={3}
                              className="mt-1 w-full px-3 py-2 rounded-lg border outline-none resize-y"
                              style={{ borderColor: "#DDD8CC" }}
                              placeholder="Internal observations, calls, fraud concerns, follow-up items…"
                            />
                          </label>
                          <div className="flex items-center gap-3 flex-wrap mt-3">
                            <button
                              onClick={() => saveAdminDisputeCase(d)}
                              disabled={savingDisputeCaseId === d.id}
                              className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"
                              style={{ backgroundColor: INK, color: "white" }}
                            >
                              {savingDisputeCaseId === d.id ? "Saving…" : "Save case"}
                            </button>
                            {o && ["held", "released"].includes(o.paymentStatus) && resolutionValue === "buyer_refund" && (
                              <button onClick={() => refundOrder(o.id)} className="text-xs font-medium underline" style={{ color: BERRY }}>Send Paystack refund</button>
                            )}
                            {o && o.paymentStatus === "refund_pending" && resolutionValue === "buyer_refund" && (
                              <span className="text-xs" style={{ color: MARIGOLD }}>Waiting for Paystack to confirm the refund. The dispute remains locked.</span>
                            )}
                            {resolutionValue === "partial_refund" && o && (
                              <div className="w-full p-3 rounded-lg border" style={{ borderColor: "#E8D7B5", backgroundColor: "#FFF9EE" }}>
                                <div className="text-xs font-semibold mb-2" style={{ color: INK }}>Partial refund through Paystack</div>
                                <div className="flex gap-2 flex-wrap items-end">
                                  <label className="text-xs">
                                    Refund amount ({CURRENCIES[o.currency]?.symbol || "₦"})
                                    <input
                                      type="number" min="0.01" step="0.01"
                                      value={(disputeAdminDrafts[d.id] || {}).partialRefundAmount || ""}
                                      onChange={(e) => setDisputeAdminDrafts((all) => ({ ...all, [d.id]: { ...(all[d.id] || {}), partialRefundAmount: e.target.value } }))}
                                      className="mt-1 w-40 px-3 py-2 rounded-lg border bg-white outline-none"
                                      style={{ borderColor: "#DDD8CC" }}
                                      placeholder="0.00"
                                    />
                                  </label>
                                  {hasAdminPermission(currentMember, "finance") ? (
                                    <button
                                      onClick={() => partialRefundOrder(d, o, (disputeAdminDrafts[d.id] || {}).partialRefundAmount, resolutionNoteValue)}
                                      disabled={o.paymentStatus === "refund_pending"}
                                      className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"
                                      style={{ backgroundColor: BERRY, color: "white" }}
                                    >
                                      {o.paymentStatus === "refund_pending" ? "Refund pending…" : "Send partial refund"}
                                    </button>
                                  ) : (
                                    <span className="text-xs" style={{ color: SLATE }}>A Finance Admin or Super Admin must send the money after the dispute decision is recorded.</span>
                                  )}
                                </div>
                                <p className="text-[11px] mt-2" style={{ color: SLATE }}>For safety, partial refunds are currently supported only on single-seller orders. The dispute stays locked until Paystack confirms the refund; then the remaining seller proceeds are released automatically.</p>
                                {o.refundType === "partial" && o.refundAmount > 0 && (
                                  <p className="text-xs mt-2" style={{ color: o.refundStatus === "processed" ? SAGE : MARIGOLD }}>
                                    Partial refund: {formatMoney(o.refundAmount, o.currency)} · {o.refundStatus || "pending"}
                                  </p>
                                )}
                              </div>
                            )}
                            {o && o.paymentStatus === "held" && resolutionValue === "seller_release" && statusValue !== "resolved" && (
                              <button onClick={() => releasePayout(o.id)} className="text-xs font-medium underline" style={{ color: SAGE }}>Release seller payment & resolve case</button>
                            )}
                            {d.resolved_at && <span className="text-xs" style={{ color: SLATE }}>Resolved {new Date(d.resolved_at).toLocaleString()}{d.resolved_by_name ? ` by ${d.resolved_by_name}` : ""}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

            {adminTab === "sellerReports" && hasAdminPermission(currentMember, "seller_report_review") && (
              <div className="space-y-3">
                <h3 className="text-xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>Seller reports</h3>
                {sellerReports.length === 0 && <p className="text-sm" style={{ color: SLATE }}>No seller reports.</p>}
                {sellerReports.map((r) => (
                  <div key={r.id} className="p-4 rounded-lg border bg-white" style={{ borderColor: ["open", "in_review"].includes(r.status) ? BERRY : "#DDD8CC" }}>
                    <div className="flex justify-between gap-2 flex-wrap"><span className="text-sm font-medium" style={{ color: INK }}>{r.reference} · Report against {r.seller_display_name || r.seller_username}</span><Tag color={r.status === "resolved" ? SAGE : r.status === "dismissed" ? SLATE : MARIGOLD}>{r.status.replace("_", " ")}</Tag></div>
                    <div className="text-xs mt-1" style={{ color: SLATE }}>Reported by {r.reporter_display_name || r.reporter_username}{r.order_id ? ` · ${orderNumber(r.order_id)}` : ""} · {new Date(r.created_at).toLocaleString()}</div>
                    <div className="text-xs font-medium mt-2" style={{ color: INK }}>{String(r.reason).replaceAll("_", " ")}</div>
                    <div className="text-sm p-3 rounded-lg mt-2" style={{ backgroundColor: CANVAS, color: INK }}>{r.details}</div>
                    {(r.evidence_urls || []).length > 0 && <div className="flex gap-2 mt-2 flex-wrap">{r.evidence_urls.map((url, index) => <a key={index} href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Report evidence ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" /></a>)}</div>}
                    {r.admin_note && <div className="text-xs mt-2" style={{ color: SLATE }}>Admin note: {r.admin_note}</div>}
                    {["open", "in_review"].includes(r.status) && <div className="flex gap-3 mt-3">{r.status === "open" && <button onClick={() => updateSellerReport(r.id, "in_review")} className="text-xs font-medium underline" style={{ color: MARIGOLD }}>Start review</button>}<button onClick={() => updateSellerReport(r.id, "resolved")} className="text-xs font-medium underline" style={{ color: SAGE }}>Resolve</button><button onClick={() => updateSellerReport(r.id, "dismissed")} className="text-xs font-medium underline" style={{ color: SLATE }}>Dismiss</button></div>}
                  </div>
                ))}
              </div>
            )}

            {adminTab === "accountReports" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold" style={{ color: INK }}>Seller reports</h3>
                {sellerReports.length === 0 && <p className="text-sm" style={{ color: SLATE }}>No seller reports.</p>}
                {sellerReports.map((r) => (
                  <div key={`seller-report-${r.id}`} className="p-4 rounded-lg border bg-white" style={{ borderColor: ["open", "in_review"].includes(r.status) ? BERRY : "#DDD8CC" }}>
                    <div className="flex justify-between gap-2 flex-wrap">
                      <div className="text-sm font-medium" style={{ color: INK }}>{r.reference} · Report against {r.seller_display_name || r.seller_username}</div>
                      <Tag color={r.status === "resolved" ? SAGE : r.status === "dismissed" ? SLATE : MARIGOLD}>{r.status.replace("_", " ")}</Tag>
                    </div>
                    <div className="text-xs mt-1" style={{ color: SLATE }}>Reported by {r.reporter_display_name || r.reporter_username}{r.order_id ? ` · Order ${orderNumber(r.order_id)}` : ""} · {new Date(r.created_at).toLocaleString()}</div>
                    <div className="text-xs font-medium mt-2" style={{ color: INK }}>{String(r.reason).replaceAll("_", " ")}</div>
                    <div className="text-sm p-3 rounded-lg mt-2" style={{ backgroundColor: CANVAS, color: INK }}>{r.details}</div>
                    {(r.evidence_urls || []).length > 0 && <div className="flex gap-2 mt-2 flex-wrap">{r.evidence_urls.map((url, index) => <a key={index} href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Report evidence ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" /></a>)}</div>}
                    {r.admin_note && <div className="text-xs mt-2" style={{ color: SLATE }}>Admin note: {r.admin_note}</div>}
                    {["open", "in_review"].includes(r.status) && <div className="flex gap-3 mt-3 flex-wrap">
                      {r.status === "open" && <button onClick={() => updateSellerReport(r.id, "in_review")} className="text-xs font-medium underline" style={{ color: MARIGOLD }}>Start review</button>}
                      <button onClick={() => updateSellerReport(r.id, "resolved")} className="text-xs font-medium underline" style={{ color: SAGE }}>Resolve</button>
                      <button onClick={() => updateSellerReport(r.id, "dismissed")} className="text-xs font-medium underline" style={{ color: SLATE }}>Dismiss</button>
                    </div>}
                  </div>
                ))}
                <h3 className="text-lg font-semibold pt-4" style={{ color: INK }}>Account security reports</h3>
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

            {adminTab === "reportsExport" && (() => {
              const isSuperAdmin = !currentMember?.adminRole || currentMember.adminRole === "super_admin";
              const canFinance = isSuperAdmin || hasAdminPermission(currentMember, "finance");
              const canSellers = isSuperAdmin || hasAdminPermission(currentMember, "seller_verification") || canFinance;
              const reportOptions = [
                ...(canFinance ? [
                  ["orders", "Orders"], ["sales", "Sales"], ["commissions", "Commissions"],
                  ["payouts", "Seller payouts"], ["refunds", "Refunds"], ["taxes", "Taxes"],
                ] : []),
                ...(canSellers ? [["sellers", "Sellers"]] : []),
              ];
              const effectiveReportType = reportOptions.some(([value]) => value === adminReportType) ? adminReportType : (reportOptions[0]?.[0] || "sellers");
              const summary = adminReportData?.summary || {};
              const currencies = summary.currencies && typeof summary.currencies === "object" ? Object.entries(summary.currencies) : [];
              return (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>Reports & exports</h3>
                    <p className="text-sm mt-1" style={{ color: SLATE }}>
                      Generate operational and financial reports from Stallyard's database, preview the results, and download them as CSV for accounting or recordkeeping.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#DDD8CC" }}>
                    <div className="grid md:grid-cols-4 gap-3 items-end">
                      <label className="text-sm" style={{ color: INK }}>
                        <span className="block text-xs font-medium mb-1" style={{ color: SLATE }}>Report</span>
                        <select value={effectiveReportType} onChange={(e) => { setAdminReportType(e.target.value); setAdminReportData(null); setAdminReportError(""); }}
                          className="w-full border rounded-lg px-3 py-2 bg-white" style={{ borderColor: "#DDD8CC" }}>
                          {reportOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </label>
                      <label className="text-sm" style={{ color: INK }}>
                        <span className="block text-xs font-medium mb-1" style={{ color: SLATE }}>From</span>
                        <input type="date" value={adminReportFrom} onChange={(e) => setAdminReportFrom(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2" style={{ borderColor: "#DDD8CC" }} />
                      </label>
                      <label className="text-sm" style={{ color: INK }}>
                        <span className="block text-xs font-medium mb-1" style={{ color: SLATE }}>To</span>
                        <input type="date" value={adminReportTo} onChange={(e) => setAdminReportTo(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2" style={{ borderColor: "#DDD8CC" }} />
                      </label>
                      <button onClick={() => fetchAdminReport(effectiveReportType)} disabled={adminReportLoading}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        style={{ backgroundColor: INK, color: "white" }}>
                        {adminReportLoading ? "Generating…" : "Generate report"}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {[
                        ["7 days", 7], ["30 days", 30], ["90 days", 90],
                      ].map(([label, days]) => (
                        <button key={label} onClick={() => {
                          const to = new Date(); const from = new Date(); from.setDate(from.getDate() - days);
                          setAdminReportFrom(from.toISOString().slice(0, 10)); setAdminReportTo(to.toISOString().slice(0, 10));
                        }} className="px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: "#DDD8CC", color: SLATE }}>{label}</button>
                      ))}
                      <button onClick={() => { setAdminReportFrom(""); setAdminReportTo(""); }}
                        className="px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: "#DDD8CC", color: SLATE }}>All time</button>
                    </div>
                  </div>

                  {adminReportError && (
                    <div className="rounded-xl border p-4 text-sm" style={{ borderColor: BERRY + "55", backgroundColor: BERRY + "0D", color: BERRY }}>
                      {adminReportError}
                    </div>
                  )}

                  {adminReportData && (
                    <>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-semibold" style={{ color: INK }}>{(adminReportData.type || adminReportType).replace(/_/g, " ")} report</div>
                          <div className="text-xs" style={{ color: SLATE }}>
                            {adminReportData.rows.length.toLocaleString()} row{adminReportData.rows.length === 1 ? "" : "s"} · generated {adminReportData.generatedAt ? new Date(adminReportData.generatedAt).toLocaleString() : "now"}
                          </div>
                        </div>
                        <button onClick={downloadAdminReportCsv} disabled={!adminReportData.rows.length}
                          className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
                          style={{ borderColor: SAGE, color: SAGE }}>Download CSV</button>
                      </div>

                      {currencies.length > 0 && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {currencies.map(([currency, c]) => (
                            <div key={currency} className="bg-white rounded-xl border p-4" style={{ borderColor: "#DDD8CC" }}>
                              <div className="text-xs uppercase tracking-wide" style={{ color: SLATE }}>{currency}</div>
                              <div className="text-lg font-semibold mt-1" style={{ color: INK }}>{formatMoney(c.gross || 0, currency)} gross</div>
                              <div className="text-xs mt-1" style={{ color: SLATE }}>{c.orders || 0} orders · {formatMoney(c.commission || 0, currency)} commission · {formatMoney(c.tax || 0, currency)} tax</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {adminReportData.type === "payouts" && (
                        <div className="grid sm:grid-cols-3 gap-3">
                          {[['Paid', summary.paid, SAGE], ['Processing', summary.processing, MARIGOLD], ['Failed', summary.failed, BERRY]].map(([label, value, color]) => (
                            <div key={label} className="bg-white rounded-xl border p-4" style={{ borderColor: "#DDD8CC" }}>
                              <div className="text-xs" style={{ color: SLATE }}>{label}</div><div className="text-xl font-semibold mt-1" style={{ color }}>{formatMoney(value || 0, "NGN")}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#DDD8CC" }}>
                        {adminReportData.rows.length === 0 ? (
                          <div className="p-6 text-center text-sm" style={{ color: SLATE }}>No records matched this report and date range.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs min-w-[900px]">
                              <thead style={{ backgroundColor: CANVAS }}><tr>{adminReportData.columns.map((c) => <th key={c} className="text-left px-3 py-2 font-semibold whitespace-nowrap" style={{ color: INK }}>{c.replace(/_/g, " ")}</th>)}</tr></thead>
                              <tbody>
                                {adminReportData.rows.slice(0, 100).map((row, idx) => (
                                  <tr key={idx} className="border-t" style={{ borderColor: "#EEE9DE" }}>
                                    {adminReportData.columns.map((c) => {
                                      const value = row?.[c];
                                      const display = typeof value === "boolean" ? (value ? "Yes" : "No") : (value === null || value === undefined || value === "" ? "—" : String(value));
                                      return <td key={c} className="px-3 py-2 whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis" style={{ color: SLATE }}>{display}</td>;
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {adminReportData.rows.length > 100 && <div className="px-4 py-3 border-t text-xs" style={{ borderColor: "#EEE9DE", color: SLATE }}>Preview shows first 100 rows. The CSV download contains all {adminReportData.rows.length.toLocaleString()} rows.</div>}
                      </div>

                      <p className="text-xs" style={{ color: SLATE }}>
                        CSV files open in Excel, Google Sheets, and most accounting tools. Report generation is recorded in the admin audit log.
                      </p>
                    </>
                  )}
                </div>
              );
            })()}

            {adminTab === "systemHealth" && (!currentMember.adminRole || currentMember.adminRole === "super_admin") && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>System health</h3>
                    <p className="text-sm mt-1" style={{ color: SLATE }}>
                      Live and non-destructive configuration checks for Stallyard's critical infrastructure. These checks do not send emails or SMS messages, charge cards, create biometric sessions, or consume moderation requests.
                    </p>
                  </div>
                  <button onClick={fetchSystemHealth} disabled={systemHealthLoading}
                    className="px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
                    style={{ borderColor: "#DDD8CC", color: INK }}>
                    {systemHealthLoading ? "Checking…" : "Run health check"}
                  </button>
                </div>

                {systemHealthError && (
                  <div className="rounded-xl border p-4 text-sm" style={{ borderColor: BERRY + "55", backgroundColor: BERRY + "0D", color: BERRY }}>
                    {systemHealthError}
                  </div>
                )}

                {systemHealth && (() => {
                  const services = Array.isArray(systemHealth.services) ? systemHealth.services : [];
                  const statusStyle = (status) => status === "healthy"
                    ? { bg: SAGE + "18", border: SAGE + "55", color: SAGE, label: "Healthy" }
                    : status === "configured"
                    ? { bg: MARIGOLD + "18", border: MARIGOLD + "55", color: "#8A6D3B", label: "Configured" }
                    : status === "not_configured"
                    ? { bg: "#66708512", border: "#66708544", color: SLATE, label: "Not configured" }
                    : { bg: BERRY + "0D", border: BERRY + "55", color: BERRY, label: "Needs attention" };
                  const healthyCount = services.filter((s) => s.status === "healthy").length;
                  const problemCount = services.filter((s) => s.status === "unhealthy").length;
                  return (
                    <>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="bg-white border rounded-xl p-4" style={{ borderColor: "#DDD8CC" }}>
                          <div className="text-xs uppercase tracking-wide" style={{ color: SLATE }}>Overall</div>
                          <div className="text-2xl font-semibold mt-1" style={{ color: problemCount ? BERRY : SAGE }}>
                            {problemCount ? "Needs attention" : "Operational"}
                          </div>
                        </div>
                        <div className="bg-white border rounded-xl p-4" style={{ borderColor: "#DDD8CC" }}>
                          <div className="text-xs uppercase tracking-wide" style={{ color: SLATE }}>Live checks healthy</div>
                          <div className="text-2xl font-semibold mt-1" style={{ color: INK }}>{healthyCount}</div>
                        </div>
                        <div className="bg-white border rounded-xl p-4" style={{ borderColor: "#DDD8CC" }}>
                          <div className="text-xs uppercase tracking-wide" style={{ color: SLATE }}>Last checked</div>
                          <div className="text-sm font-medium mt-2" style={{ color: INK }}>
                            {systemHealth.checkedAt ? new Date(systemHealth.checkedAt).toLocaleString() : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {services.map((service) => {
                          const s = statusStyle(service.status);
                          return (
                            <div key={service.key} className="rounded-xl border p-4" style={{ borderColor: s.border, backgroundColor: s.bg }}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-semibold" style={{ color: INK }}>{service.name}</div>
                                  <div className="text-xs mt-0.5" style={{ color: SLATE }}>{service.purpose}</div>
                                </div>
                                <span className="text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                                  style={{ backgroundColor: "white", color: s.color }}>{s.label}</span>
                              </div>
                              <p className="text-sm mt-3" style={{ color: service.status === "unhealthy" ? BERRY : INK }}>
                                {service.message || "No details"}
                              </p>
                              <div className="flex justify-between gap-3 mt-3 text-xs" style={{ color: SLATE }}>
                                <span>{service.liveCheck ? "Live check" : "Configuration check"}</span>
                                {service.latencyMs != null && <span>{service.latencyMs} ms</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#DDD8CC" }}>
                        <h4 className="font-semibold" style={{ color: INK }}>How to read this page</h4>
                        <p className="text-sm mt-2" style={{ color: SLATE }}>
                          <strong>Healthy</strong> means Stallyard successfully contacted the service or confirmed an operational queue. <strong>Configured</strong> means required server settings are present, but the check intentionally avoids making a billable, biometric, or user-facing API request. <strong>Needs attention</strong> means a live check failed or an operational queue appears stalled. No secret keys or full deployment identifiers are returned to the browser.
                        </p>
                      </div>
                    </>
                  );
                })()}

                {!systemHealth && !systemHealthLoading && !systemHealthError && (
                  <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: "#DDD8CC", color: SLATE }}>
                    Run a health check to see the current status of Stallyard's services.
                  </div>
                )}
              </div>
            )}

            {adminTab === "auditLog" && (!currentMember?.adminRole || currentMember.adminRole === "super_admin") && (() => {
              const now = Date.now();
              const cutoff = auditDateFilter === "24h" ? now - 24 * 60 * 60 * 1000
                : auditDateFilter === "7d" ? now - 7 * 24 * 60 * 60 * 1000
                : auditDateFilter === "30d" ? now - 30 * 24 * 60 * 60 * 1000
                : 0;
              const q = auditSearch.trim().toLowerCase();
              const actions = [...new Set(auditLog.map((entry) => entry.action).filter(Boolean))].sort();
              const filtered = auditLog.filter((entry) => {
                if (auditActionFilter !== "all" && entry.action !== auditActionFilter) return false;
                if (cutoff && new Date(entry.created_at).getTime() < cutoff) return false;
                if (!q) return true;
                return [entry.action, entry.details, entry.display_name, entry.username]
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(q));
              });
              return (
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold" style={{ color: INK }}>Admin audit log</h3>
                    <p className="text-xs mt-1" style={{ color: SLATE }}>
                      Sensitive admin actions are recorded here so you can see who changed what and when. Entries are append-only from the dashboard.
                    </p>
                  </div>
                  <button onClick={fetchAuditLog} className="px-3 py-2 rounded-lg border text-xs font-medium" style={{ borderColor: "#DDD8CC", color: INK }}>Refresh</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                  <input
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search admin, action, or details"
                    className="px-3 py-2 rounded-lg border text-sm bg-white"
                    style={{ borderColor: "#DDD8CC", color: INK }}
                  />
                  <select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm bg-white" style={{ borderColor: "#DDD8CC", color: INK }}>
                    <option value="all">All actions</option>
                    {actions.map((action) => <option key={action} value={action}>{action.replaceAll("_", " ")}</option>)}
                  </select>
                  <select value={auditDateFilter} onChange={(e) => setAuditDateFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm bg-white" style={{ borderColor: "#DDD8CC", color: INK }}>
                    <option value="all">All dates</option>
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </div>
                {loadingAuditLog ? (
                  <p className="text-sm" style={{ color: SLATE }}>Loading...</p>
                ) : auditLog.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>No audit log entries yet.</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>No audit entries match those filters.</p>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((entry) => (
                      <div key={entry.id} className="p-3 rounded-lg border bg-white text-sm" style={{ borderColor: "#DDD8CC" }}>
                        <div className="flex items-start justify-between gap-3">
                          <div style={{ color: INK }}>{entry.details}</div>
                          <span className="text-[10px] px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: "#F1EEE6", color: SLATE }}>
                            {(entry.action || "admin_action").replaceAll("_", " ")}
                          </span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: SLATE }}>
                          {entry.display_name || entry.username || "Unknown admin"} · {new Date(entry.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              );
            })()}

            {adminTab === "supportTickets" && hasAdminPermission(currentMember, "support_tickets") && (
              <div className="space-y-4">
                {activeTicketId ? (() => {
                  const ticket = adminTickets.find((t) => t.id === activeTicketId) || null;
                  return (
                    <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#DDD8CC" }}>
                      <button
                        onClick={() => { setActiveTicketId(null); setTicketMessages([]); }}
                        className="text-sm font-medium underline mb-4"
                        style={{ color: SLATE }}
                      >
                        ← Back to support tickets
                      </button>
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                        <div>
                          <h3 className="text-xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>{ticket?.subject || "Support ticket"}</h3>
                          {ticket && <p className="text-xs mt-1" style={{ color: SLATE }}>From {ticket.display_name || ticket.username} · {new Date(ticket.updated_at).toLocaleString()}</p>}
                        </div>
                        {ticket && (
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
                        )}
                      </div>
                      {loadingTicketMessages ? (
                        <p className="text-sm" style={{ color: SLATE }}>Loading…</p>
                      ) : (
                        <div className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto">
                          {ticketMessages.map((m) => {
                            const fromAdmin = m.is_admin;
                            return (
                              <div key={m.id} className={`flex ${fromAdmin ? "justify-start" : "justify-end"}`}>
                                <div className="max-w-[80%] px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: fromAdmin ? "#F1EFE7" : INK, color: fromAdmin ? INK : "white" }}>
                                  <div className="text-xs font-medium mb-1" style={{ color: fromAdmin ? SLATE : "#C9CCD3" }}>{m.display_name || m.username}</div>
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
                          placeholder="Write an admin reply…"
                          className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <button onClick={sendTicketMessage} disabled={sendingTicketMessage} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ backgroundColor: MARIGOLD, color: INK }}>
                          Send
                        </button>
                      </div>
                    </div>
                  );
                })() : (
                  <>
                    {adminTickets.length === 0 && <p className="text-sm" style={{ color: SLATE }}>No support tickets.</p>}
                    {adminTickets.slice().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).map((t) => (
                      <div key={t.id} className="flex items-center gap-2">
                        <button
                          onClick={() => openTicketThread(t.id)}
                          className="flex-1 text-left flex items-center justify-between gap-3 p-4 rounded-lg border bg-white"
                          style={{ borderColor: t.status === "open" ? BERRY : "#DDD8CC" }}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: INK }}>{t.subject}</div>
                            <div className="text-xs" style={{ color: SLATE }}>{t.display_name || t.username} · {new Date(t.updated_at).toLocaleString()}</div>
                          </div>
                          <Tag color={t.status === "resolved" ? SAGE : t.status === "in_progress" ? MARIGOLD : BERRY}>{TICKET_STATUS_LABEL[t.status] || t.status}</Tag>
                        </button>
                        <button type="button" onClick={() => openAdminNotes("support_ticket", t.id, `Support ticket #${t.id}: ${t.subject}`)} className="px-3 py-2 rounded-lg text-xs font-medium border bg-white shrink-0" style={{ borderColor: "#DDD8CC", color: SLATE }}>Notes</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
    </>
  );
}

