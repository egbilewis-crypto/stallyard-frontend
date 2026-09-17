import React from "react";

// Loaded only when a signed-in member opens the Seller Dashboard.
export default function SellerDashboard({ scope }) {
  const {
    BERRY,
    CANVAS,
    FULFILLMENT_COLOR,
    FULFILLMENT_LABEL,
    INK,
    LISTING_MANAGE_TABS,
    MARIGOLD,
    Pencil,
    Plus,
    SAGE,
    SALES_TABS,
    SHIPPING_CARRIERS,
    SLATE,
    Tag,
    TrackingTimeline,
    Trash2,
    activeReturnsDisputes,
    approveReturn,
    buildTrackingUrl,
    cancellationRate,
    casualSellerContactReady,
    casualSellerStatus,
    completedOrdersCount,
    currentMember,
    currentUser,
    deleteListing,
    deliveryEstimateDrafts,
    denyReturn,
    disputeRate,
    duplicateListing,
    endVacation,
    filteredMyListings,
    filteredMySales,
    formatMoney,
    getMyDisputeForOrder,
    getSellerOrderStatus,
    handleProofOfDeliverySelect,
    hasSellerListingAccess,
    manageListingsTab,
    markListingInStock,
    markListingSoldOut,
    myListings,
    myRecentActivity,
    mySales,
    mySoldItems,
    myWarnings,
    myWithdrawals,
    needsIdVerification,
    onTimeShippingRate,
    openStorefront,
    orderNumber,
    ordersInTransit,
    ordersWaitingToShip,
    pauseListing,
    quickEditDraft,
    quickEditId,
    quickUpdateListing,
    redeemDeliveryToken,
    redeemTokenDrafts,
    redeemingTokenKey,
    refundOrder,
    requestWithdrawal,
    resetForm,
    respondToCancellation,
    respondToDispute,
    resumeListing,
    returnRate,
    runSelfDeliveryStep,
    salesTab,
    selfDeliveryActionKey,
    setCasualVerificationOpen,
    setDeliveryEstimateDrafts,
    setDeliverySelfieCameraTarget,
    setIdVerifyOpen,
    setManageListingsTab,
    setPackingSlipOrder,
    setQuickEditDraft,
    setQuickEditId,
    setRedeemTokenDrafts,
    setSalesTab,
    setTrackingDrafts,
    setVacationForm,
    setVacationOpen,
    setView,
    setWithdrawAmount,
    startEdit,
    startSellerLocationSharing,
    stopSellerLocationSharing,
    trackingDrafts,
    updateEstimatedDelivery,
    updateItemCarrier,
    updateItemFulfillment,
    updateItemTracking,
    uploadingPodKey,
    walletHeld,
    walletNetAvailable,
    withdrawAmount,
  } = scope;

  return (
<div>
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <div>
                <h2 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                  Seller dashboard
                </h2>
                <p className="text-sm mt-1" style={{ color: SLATE }}>
                  Manage your listings, orders, deliveries, payouts, messages, and seller performance.
                </p>
              </div>
              {currentUser && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setView("wallet")}
                    className="px-3 py-1.5 rounded-lg border text-sm font-medium bg-white"
                    style={{ borderColor: SAGE, color: INK }}
                  >
                    Seller wallet · {formatMoney(walletNetAvailable, "NGN")}
                  </button>
                  {hasSellerListingAccess && (
                    <button
                      onClick={() => {
                        resetForm();
                        setView("sell");
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: MARIGOLD, color: INK }}
                    >
                      <Plus size={16} />
                      Create a listing
                    </button>
                  )}
                </div>
              )}
            </div>
            {currentUser && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 my-5">
                {[
                  { label: "Overview", action: () => document.getElementById("seller-overview")?.scrollIntoView({ behavior: "smooth" }) },
                  { label: "Listings", action: () => document.getElementById("seller-listings")?.scrollIntoView({ behavior: "smooth" }) },
                  { label: "Orders & delivery", action: () => document.getElementById("seller-sales")?.scrollIntoView({ behavior: "smooth" }) },
                  { label: "Seller wallet", action: () => setView("wallet") },
                  { label: "Messages", action: () => setView("messages") },
                  { label: "My Stall", action: () => openStorefront(currentUser) },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium bg-white text-left sm:text-center"
                    style={{ borderColor: "#DDD8CC", color: INK }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {currentUser && !hasSellerListingAccess && (
              <div className="mb-4 p-4 rounded-lg border flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: SAGE, backgroundColor: "#EDF4EE" }}>
                <div><p className="text-sm font-medium" style={{ color: INK }}>Automatic casual-seller verification</p><p className="text-xs mt-1" style={{ color: SLATE }}>Verify your email and phone first, then complete your live selfie and Nigerian ID check to publish up to ₦500,000 in combined active listings.</p></div>
                <button disabled={!casualSellerContactReady} title={!casualSellerContactReady ? "Verify both your email and phone number first" : undefined} onClick={() => setCasualVerificationOpen(true)} className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: SAGE, color: "white" }}>{casualSellerContactReady ? "Start verification" : "Verify email and phone first"}</button>
              </div>
            )}
            {currentUser && hasSellerListingAccess && !currentMember?.isApproved && (
              <div className="mb-4 p-4 rounded-lg border bg-white" style={{ borderColor: SAGE }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: INK }}>Casual Seller allowance</p>
                    <p className="text-xs mt-1" style={{ color: SLATE }}>
                      {formatMoney(Number(casualSellerStatus?.currentActiveValue || 0), "NGN")} active · {formatMoney(Number(casualSellerStatus?.remainingValue ?? 500000), "NGN")} remaining
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView("sell")}
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: MARIGOLD, color: INK }}
                  >
                    Upgrade to Verified Seller
                  </button>
                </div>
                <div className="h-2 rounded-full overflow-hidden mt-3" style={{ backgroundColor: "#E8E5DC" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: SAGE,
                      width: `${Math.min(100, Math.max(0, (Number(casualSellerStatus?.currentActiveValue || 0) / 500000) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: SLATE }}>
                  ₦500,000 combined active-listing limit. Draft, sold, cancelled, expired and removed listings do not count. Verified Sellers may maintain up to ₦20,000,000.
                </p>
              </div>
            )}
            {currentUser && currentMember?.isApproved && currentMember?.sellerTier !== "premium" && (
              <div className="mb-4 p-4 rounded-lg border bg-white" style={{ borderColor: MARIGOLD }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: INK }}>Verified Seller allowance</p>
                    <p className="text-xs mt-1" style={{ color: SLATE }}>
                      {formatMoney(Number(casualSellerStatus?.currentActiveValue || 0), "NGN")} active · {formatMoney(Math.max(0, 20000000 - Number(casualSellerStatus?.currentActiveValue || 0)), "NGN")} remaining
                    </p>
                  </div>
                  <Tag color={MARIGOLD}>Verified Seller</Tag>
                </div>
                <div className="h-2 rounded-full overflow-hidden mt-3" style={{ backgroundColor: "#E8E5DC" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: MARIGOLD,
                      width: `${Math.min(100, Math.max(0, (Number(casualSellerStatus?.currentActiveValue || 0) / 20000000) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: SLATE }}>
                  ₦20,000,000 combined active-listing limit. Only active listings count. Premium Seller approval is required above ₦20,000,000.
                </p>
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
                  onClick={() => setView("sell")}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  Review requirements and re-apply
                </button>
              </div>
            )}
            {currentUser && needsIdVerification && (
              <div
                className="mb-4 p-4 rounded-lg border flex items-center justify-between gap-3 flex-wrap"
                style={{ borderColor: MARIGOLD, backgroundColor: "#FBF0DC" }}
              >
                <p className="text-sm" style={{ color: INK }}>
                  Complete seller verification before listing items.
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
                    ID verification exemption on file
                  </p>
                ) : null}
                <h3 id="seller-overview" className="text-sm font-semibold mb-3 mt-4 scroll-mt-24" style={{ color: INK }}>
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
                      {(() => {
                        // Stallyard is Nigeria-only, so marketplace values are NGN.
                        const byCurrency = {};
                        myListings.forEach((l) => {
                          const cur = l.currency || "NGN";
                          byCurrency[cur] = (byCurrency[cur] || 0) + Number(l.price || 0);
                        });
                        const entries = Object.entries(byCurrency);
                        return entries.length
                          ? entries.map(([cur, amount]) => formatMoney(amount, cur)).join(" + ")
                          : formatMoney(0, "NGN");
                      })()}
                    </div>
                    <div className="text-xs" style={{ color: SLATE }}>
                      total inventory value
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                    <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                      {(() => {
                        // Stallyard is Nigeria-only, so marketplace values are NGN.
                        const byCurrency = {};
                        mySoldItems
                          .filter((i) => i.fulfillmentStatus !== "cancelled")
                          .forEach((i) => {
                            const cur = i.currency || "NGN";
                            byCurrency[cur] = (byCurrency[cur] || 0) + Number(i.price || 0) * (i.qty || 1);
                          });
                        const entries = Object.entries(byCurrency);
                        return entries.length
                          ? entries.map(([cur, amount]) => formatMoney(amount, cur)).join(" + ")
                          : formatMoney(0, "NGN");
                      })()}
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
                        {formatMoney(walletNetAvailable, "NGN")}
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
                        {formatMoney(walletHeld, "NGN")}
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
                    <span style={{ color: SLATE }}>₦</span>
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
                              {formatMoney(Number(w.amount), "NGN")} to your bank
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

                <div id="seller-listings" className="flex items-center gap-2 mb-3 overflow-x-auto scroll-mt-24">
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
                            {l.status === "active" && (
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
                            {l.status === "active" && (
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

                <h3 id="seller-sales" className="text-lg font-semibold mt-10 mb-3 scroll-mt-24" style={{ color: INK, fontFamily: "'DM Serif Display', serif" }}>
                  Orders & delivery
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
                              {o.paymentStatus === "refund_pending" && <Tag color={MARIGOLD}>Refund pending</Tag>}
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
                              <div><span className="font-medium">Deliver to:</span> {o.shippingAddress.fullName}</div>
                              <div>{o.shippingAddress.street}, {o.shippingAddress.city}{o.shippingAddress.state ? `, ${o.shippingAddress.state}` : ""} {o.shippingAddress.zip}, {o.shippingAddress.country}</div>
                              {o.shippingAddress.phone && <div className="mt-1"><span className="font-medium">Contact:</span> <a href={`tel:${o.shippingAddress.phone}`} className="underline">{o.shippingAddress.phone}</a></div>}
                              {o.shippingAddress.deliveryInstructions && <div className="mt-1"><span className="font-medium">Private instructions:</span> {o.shippingAddress.deliveryInstructions}</div>}
                              {o.shippingAddress.preferredDeliveryTime && <div className="mt-1"><span className="font-medium">Preferred time:</span> {o.shippingAddress.preferredDeliveryTime}</div>}
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([o.shippingAddress.street, o.shippingAddress.city, o.shippingAddress.state, o.shippingAddress.country].filter(Boolean).join(", "))}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 underline font-medium">Open address in map</a>
                              {(o.shippingAddress.locationPhotos || []).length > 0 && (
                                <div className="mt-2"><div className="font-medium mb-1">Private location photos</div><div className="flex gap-2 flex-wrap">{o.shippingAddress.locationPhotos.map((photo, index) => <img key={index} src={photo} alt={`Delivery location ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" style={{ borderColor: "#DDD8CC" }} />)}</div></div>
                              )}
                            </div>
                          )}
                          {(o.payouts || []).length > 0 && (() => {
                            const payout = o.payouts[0];
                            const label = { queued: "Payout queued", processing: "Payout processing", paid: "Paid to bank", failed: "Payout failed", reversed: "Payout reversed", request_unknown: "Payout being verified", needs_bank: "Bank details required" }[payout.status] || payout.status;
                            return <div className="text-xs mb-3 p-2 rounded-lg border" style={{ borderColor: payout.status === "paid" ? SAGE : payout.status === "failed" || payout.status === "reversed" ? BERRY : MARIGOLD }}><span className="font-semibold">{label}</span> · {formatMoney(payout.amount, "NGN")}{payout.failureReason ? <div className="mt-1">{payout.failureReason}</div> : null}</div>;
                          })()}
                          {o.isDisputed && getMyDisputeForOrder(o.id) && (
                            <div className="mb-3 p-3 rounded-lg border" style={{ borderColor: BERRY, backgroundColor: "#FFF7F5" }}>
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                <span className="text-xs font-semibold" style={{ color: BERRY }}>Active dispute — payment locked</span>
                                <Tag color={MARIGOLD}>
                                  {getMyDisputeForOrder(o.id).status === "in_review" ? "Under review" : "Open"}
                                </Tag>
                              </div>
                              <p className="text-xs mb-1" style={{ color: INK }}>
                                <span className="font-medium">Reason:</span> {getMyDisputeForOrder(o.id).reason || "Not specified"}
                              </p>
                              {getMyDisputeForOrder(o.id).buyer_statement && (
                                <p className="text-xs mb-2" style={{ color: SLATE }}>
                                  <span className="font-medium" style={{ color: INK }}>Buyer statement:</span> {getMyDisputeForOrder(o.id).buyer_statement}
                                </p>
                              )}
                              <button
                                onClick={() => respondToDispute(getMyDisputeForOrder(o.id).id)}
                                className="text-xs font-medium underline"
                                style={{ color: INK }}
                              >
                                {getMyDisputeForOrder(o.id).seller_statement ? "Update my response" : "Respond to dispute"}
                              </button>
                            </div>
                          )}
                          <div className="space-y-2">
                            {myItems.map((i) => {
                              const trackKey = `${o.id}-${i.id}`;
                              const trackDraft =
                                trackingDrafts[trackKey] !== undefined
                                  ? trackingDrafts[trackKey]
                                  : i.trackingNumber || "";
                              const estimateDraft = deliveryEstimateDrafts[trackKey] || {
                                start: i.estimatedDeliveryStart || "",
                                end: i.estimatedDeliveryEnd || "",
                              };
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
                                      {i.deliveryTokenSentAt && <Tag color={MARIGOLD}>Token received</Tag>}
                                      <select
                                        value={i.fulfillmentStatus || "new"}
                                        onChange={(e) => updateItemFulfillment(o.id, i.id, e.target.value)}
                                        className="px-2 py-1 rounded-lg border outline-none text-xs"
                                        style={{ borderColor: "#DDD8CC", color: INK }}
                                        disabled={i.carrier === "Self delivery"}
                                        title={i.carrier === "Self delivery" ? "Use the Self delivery steps below" : "Update fulfillment status"}
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
                                  <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: CANVAS }}>
                                    <TrackingTimeline
                                      item={i}
                                      orderCreatedAt={o.createdAt}
                                      ink={INK}
                                      slate={SLATE}
                                      sage={SAGE}
                                      berry={BERRY}
                                    />
                                  </div>
                                  {i.cancellationStatus === "requested" && (
                                    <div className="mt-2 p-2 rounded-lg border" style={{ borderColor: MARIGOLD, backgroundColor: CANVAS }}>
                                      <div className="font-medium" style={{ color: INK }}>Buyer requested cancellation</div>
                                      <div className="mt-1">Reason: {i.cancellationReason}</div>
                                      <div className="flex gap-3 mt-2">
                                        <button onClick={() => respondToCancellation(o.id, i.id, "approved")} className="font-medium underline" style={{ color: SAGE }}>Approve</button>
                                        <button onClick={() => respondToCancellation(o.id, i.id, "denied")} className="font-medium underline" style={{ color: BERRY }}>Deny</button>
                                      </div>
                                    </div>
                                  )}
                                  {i.cancellationStatus === "approved" && <div className="mt-2"><Tag color={SAGE}>Cancellation approved — refund review</Tag></div>}
                                  {i.cancellationStatus === "denied" && <div className="mt-2"><Tag color={BERRY}>Cancellation denied</Tag></div>}
                                  {i.deliveryTokenSentAt && i.deliveryToken && !["shipped", "delivered"].includes(i.fulfillmentStatus) && (
                                    <div className="mt-2 p-2 rounded-lg border" style={{ borderColor: SAGE, backgroundColor: CANVAS }}>
                                      <div className="text-xs font-medium" style={{ color: INK }}>Buyer sent delivery token</div>
                                      <div className="text-lg font-semibold tracking-widest" style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>{i.deliveryToken}</div>
                                      <div className="text-xs" style={{ color: SLATE }}>The token is also in Messages. Delivery photo is still required before payment release.</div>
                                    </div>
                                  )}
                                  {!['cancelled', 'returned'].includes(i.fulfillmentStatus) && (
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
                                      {i.carrier !== "Self delivery" && (
                                        <>
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
                                        </>
                                      )}
                                    </div>
                                  )}
                                  {i.carrier === "Self delivery" && !['cancelled', 'returned'].includes(i.fulfillmentStatus) && (
                                    <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: MARIGOLD, backgroundColor: "#FFF9EF" }}>
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div>
                                          <div className="text-sm font-semibold" style={{ color: INK }}>Self delivery</div>
                                          <div className="text-xs mt-0.5" style={{ color: SLATE }}>
                                            Complete each step in order. The buyer can follow the progress.
                                          </div>
                                        </div>
                                        <Tag color={i.selfDeliveryStatus === "delivered" ? SAGE : MARIGOLD}>
                                          {({ started: "Started", on_my_way: "On my way", arrived: "I’m here", delivered: "Delivered" }[i.selfDeliveryStatus] || "Not started")}
                                        </Tag>
                                      </div>

                                      {!i.selfDeliveryStatus && (
                                        <button
                                          type="button"
                                          onClick={() => runSelfDeliveryStep(o.id, i.id, "start")}
                                          disabled={selfDeliveryActionKey === `${o.id}-${i.id}-start`}
                                          className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                                          style={{ backgroundColor: INK, color: "white" }}
                                        >
                                          {selfDeliveryActionKey === `${o.id}-${i.id}-start` ? "Starting…" : "Start self delivery"}
                                        </button>
                                      )}

                                      {i.selfDeliveryStatus === "started" && (
                                        <button
                                          type="button"
                                          onClick={() => runSelfDeliveryStep(o.id, i.id, "on_my_way")}
                                          disabled={selfDeliveryActionKey === `${o.id}-${i.id}-on_my_way`}
                                          className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                                          style={{ backgroundColor: MARIGOLD, color: INK }}
                                        >
                                          {selfDeliveryActionKey === `${o.id}-${i.id}-on_my_way` ? "Saving…" : "On my way"}
                                        </button>
                                      )}

                                      {i.selfDeliveryStatus === "on_my_way" && (
                                        <div className="mt-3 p-3 rounded-lg bg-white border" style={{ borderColor: "#E7DDC9" }}>
                                          {!i.deliveryPersonSelfieUrl ? (
                                            <>
                                              <div className="text-xs font-semibold" style={{ color: INK }}>Required: delivery-person selfie</div>
                                              <div className="text-xs mt-1" style={{ color: SLATE }}>Take a current photo of the person making this delivery before continuing.</div>
                                              <button
                                                type="button"
                                                onClick={() => setDeliverySelfieCameraTarget({ orderId: o.id, itemId: i.id })}
                                                className="inline-block mt-2 px-3 py-2 rounded-lg border bg-white text-xs font-medium"
                                                style={{ borderColor: INK, color: INK }}
                                              >
                                                Open live selfie camera
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <div className="flex items-center gap-3 flex-wrap">
                                                <img src={i.deliveryPersonSelfieUrl} alt="Delivery person selfie" className="w-20 h-20 rounded-lg object-cover border" style={{ borderColor: "#DDD8CC" }} />
                                                <div>
                                                  <div className="text-xs font-semibold" style={{ color: SAGE }}>Delivery-person selfie saved</div>
                                                  <div className="text-xs mt-1" style={{ color: SLATE }}>GPS sharing is optional. Use the location controls below if desired.</div>
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => runSelfDeliveryStep(o.id, i.id, "arrived")}
                                                disabled={selfDeliveryActionKey === `${o.id}-${i.id}-arrived`}
                                                className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                                                style={{ backgroundColor: MARIGOLD, color: INK }}
                                              >
                                                {selfDeliveryActionKey === `${o.id}-${i.id}-arrived` ? "Saving…" : "I’m here"}
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      )}

                                      {i.selfDeliveryStatus === "arrived" && (
                                        <div className="mt-3 p-3 rounded-lg bg-white border" style={{ borderColor: "#E7DDC9" }}>
                                          <div className="text-xs font-semibold" style={{ color: INK }}>Required: delivery-proof photo</div>
                                          <div className="text-xs mt-1" style={{ color: SLATE }}>Upload the handoff photo before completing delivery.</div>
                                          {i.proofOfDeliveryUrl ? (
                                            <img src={i.proofOfDeliveryUrl} alt="Delivery proof" className="mt-2 w-24 h-24 rounded-lg object-cover border" style={{ borderColor: "#DDD8CC" }} />
                                          ) : (
                                            <label className="inline-block mt-2 px-3 py-2 rounded-lg border bg-white text-xs font-medium cursor-pointer" style={{ borderColor: INK, color: INK }}>
                                              {uploadingPodKey === trackKey ? "Uploading…" : "Take/upload delivery photo"}
                                              <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploadingPodKey === trackKey} onChange={(e) => handleProofOfDeliverySelect(e, o.id, i.id)} />
                                            </label>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => runSelfDeliveryStep(o.id, i.id, "delivered")}
                                            disabled={!i.proofOfDeliveryUrl || selfDeliveryActionKey === `${o.id}-${i.id}-delivered`}
                                            className="block mt-2 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                                            style={{ backgroundColor: SAGE, color: "white" }}
                                          >
                                            {selfDeliveryActionKey === `${o.id}-${i.id}-delivered` ? "Completing…" : "Delivered"}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {!['cancelled', 'returned', 'delivered'].includes(i.fulfillmentStatus) && (
                                    <div className="mt-2 p-2 rounded-lg border" style={{ borderColor: "#DDD8CC", backgroundColor: CANVAS }}>
                                      <div className="text-xs font-medium mb-1" style={{ color: INK }}>Estimated delivery</div>
                                      <div className="text-xs mb-2" style={{ color: SLATE }}>
                                        Enter one date for “expected by,” or add an end date to show a delivery range.
                                      </div>
                                      <div className="flex items-end gap-2 flex-wrap">
                                        <label className="text-xs">
                                          <span className="block mb-1">Start date</span>
                                          <input
                                            type="date"
                                            value={estimateDraft.start}
                                            onChange={(e) => setDeliveryEstimateDrafts((drafts) => ({
                                              ...drafts,
                                              [trackKey]: { ...estimateDraft, start: e.target.value },
                                            }))}
                                            className="px-2 py-1 rounded-lg border outline-none bg-white"
                                            style={{ borderColor: "#DDD8CC", color: INK }}
                                          />
                                        </label>
                                        <label className="text-xs">
                                          <span className="block mb-1">End date (optional)</span>
                                          <input
                                            type="date"
                                            min={estimateDraft.start || undefined}
                                            value={estimateDraft.end}
                                            onChange={(e) => setDeliveryEstimateDrafts((drafts) => ({
                                              ...drafts,
                                              [trackKey]: { ...estimateDraft, end: e.target.value },
                                            }))}
                                            className="px-2 py-1 rounded-lg border outline-none bg-white"
                                            style={{ borderColor: "#DDD8CC", color: INK }}
                                          />
                                        </label>
                                        <button
                                          onClick={async () => {
                                            const saved = await updateEstimatedDelivery(o.id, i.id, estimateDraft.start, estimateDraft.end);
                                            if (saved) setDeliveryEstimateDrafts((drafts) => {
                                              const next = { ...drafts };
                                              delete next[trackKey];
                                              return next;
                                            });
                                          }}
                                          className="px-3 py-1 rounded-lg text-xs font-medium"
                                          style={{ backgroundColor: MARIGOLD, color: INK }}
                                        >
                                          Save estimate
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {i.fulfillmentStatus === "shipped" && (i.carrier !== "Self delivery" || !!i.deliveryPersonSelfieUrl) && (
                                    <div className="mt-2 p-2 rounded-lg border" style={{ borderColor: SAGE, backgroundColor: CANVAS }}>
                                      <div className="text-xs font-medium" style={{ color: INK }}>Live delivery location</div>
                                      <div className="text-xs mt-1" style={{ color: SLATE }}>
                                        Optional. The buyer can see your phone’s location only for this delivery. Keep this page open for live updates.
                                      </div>
                                      {i.liveLocationEnabled && i.liveLocationUpdatedAt && (
                                        <div className="text-xs mt-1" style={{ color: SAGE }}>
                                          Sharing active · Last updated {new Date(i.liveLocationUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                      )}
                                      <div className="flex gap-2 mt-2 flex-wrap">
                                        <button
                                          onClick={() => startSellerLocationSharing(o.id, i.id)}
                                          className="px-3 py-1 rounded-lg text-xs font-medium"
                                          style={{ backgroundColor: SAGE, color: "white" }}
                                        >
                                          {i.liveLocationEnabled ? "Resume phone updates" : "Start sharing location"}
                                        </button>
                                        {i.liveLocationEnabled && (
                                          <button
                                            onClick={() => stopSellerLocationSharing(o.id, i.id)}
                                            className="px-3 py-1 rounded-lg border text-xs font-medium bg-white"
                                            style={{ borderColor: BERRY, color: BERRY }}
                                          >
                                            Stop sharing
                                          </button>
                                        )}
                                      </div>
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
                                          {uploadingPodKey === trackKey ? "Uploading…" : "Upload delivery photo"}
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
                                    (o.paymentStatus === "released" ? (
                                      <div className="mt-2">
                                        <Tag color={SAGE}>Delivery completed — payment released</Tag>
                                      </div>
                                    ) : (
                                      <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: CANVAS }}>
                                        <div className="text-xs font-medium mb-1" style={{ color: INK }}>
                                          Buyer's delivery code
                                        </div>
                                        <div className="text-xs mb-2" style={{ color: SLATE }}>
                                          At handoff, ask the buyer for the 10-digit token, upload the delivery photo, then enter the token below.
                                        </div>
                                        {i.deliveryTokenSentAt && i.deliveryToken && (
                                          <div className="mb-2 p-2 rounded-lg border" style={{ borderColor: SAGE, backgroundColor: "white" }}>
                                            <div className="text-xs font-medium" style={{ color: INK }}>Buyer sent this token</div>
                                            <div className="text-lg font-semibold tracking-widest" style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>{i.deliveryToken}</div>
                                            <div className="text-xs" style={{ color: SLATE }}>It was also added to your Messages.</div>
                                          </div>
                                        )}
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
                                            disabled={
                                              redeemingTokenKey === i.id ||
                                              !(redeemTokenDrafts[i.id] || "").trim() ||
                                              !i.proofOfDeliveryUrl
                                            }
                                            className="px-2 py-1 rounded-lg text-xs font-medium disabled:opacity-50"
                                            style={{ backgroundColor: MARIGOLD, color: INK }}
                                          >
                                            {redeemingTokenKey === i.id ? "Checking…" : "Release payment"}
                                          </button>
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: SLATE }}>
                                          Upload the delivery picture first, then enter the 10-digit token the buyer gives you after receiving and inspecting the item. Both are required to release payment.
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
                                        {["held", "released"].includes(o.paymentStatus) && (
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
  );
}
