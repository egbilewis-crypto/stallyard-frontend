import React from "react";

// Loaded only when a signed-in member opens the Buyer Dashboard.
export default function BuyerDashboard({ scope }) {
  const {
    BERRY,
    CANVAS,
    INK,
    MARIGOLD,
    SAGE,
    SLATE,
    Store,
    Tag,
    Wallet,
    buyerActiveOrdersCount,
    buyerCompletedCount,
    buyerOpenDisputesCount,
    buyerOrdersInTransit,
    buyerOrdersWaitingToShip,
    buyerTokensReadyCount,
    currentMember,
    currentUser,
    formatMoney,
    listings,
    markThreadRead,
    messageReadState,
    myOrders,
    myPaymentMethods,
    myThreads,
    orderNumber,
    paymentMethodLabel,
    recentlyViewedIds,
    sellerReports,
    setActiveThreadId,
    setActiveThreadOrderId,
    setBuyerOrderSearch,
    setBuyerOrderStatusFilter,
    setNotifPanelOpen,
    setSelected,
    setShowAllSellerReports,
    setView,
    showAllSellerReports,
    unreadNotifCount,
    unreadThreadsCount,
    walletNetAvailable,
  } = scope;

  return (
<div>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
              <h2 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                Dashboard
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {!currentMember?.isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setView("dashboard");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: INK }}
                  >
                    <Store size={17} />
                    Seller Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setView("wallet")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-semibold"
                  style={{ borderColor: SAGE, color: INK }}
                >
                  <Wallet size={17} />
                  Seller wallet · {formatMoney(walletNetAvailable, "NGN")}
                </button>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: SLATE }}>
              Everything about your orders, messages, and alerts in one place.
            </p>

            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: SLATE }}>
              Needs your attention
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <button
                onClick={() => setView("orders")}
                className="p-3 rounded-lg border bg-white text-left"
                style={{ borderColor: buyerTokensReadyCount ? MARIGOLD : "#DDD8CC" }}
              >
                <div
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: buyerTokensReadyCount ? MARIGOLD : INK }}
                >
                  {buyerTokensReadyCount}
                </div>
                <div className="text-xs font-medium" style={{ color: INK }}>
                  delivery token{buyerTokensReadyCount === 1 ? "" : "s"} ready
                </div>
                {buyerTokensReadyCount > 0 && (
                  <div className="text-xs mt-1" style={{ color: SLATE }}>
                    Review the order and send only after accepting the item →
                  </div>
                )}
              </button>
              <button
                onClick={() => setView("messages")}
                className="p-3 rounded-lg border bg-white text-left"
                style={{ borderColor: "#DDD8CC" }}
              >
                <div
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: unreadThreadsCount ? MARIGOLD : INK }}
                >
                  {unreadThreadsCount}
                </div>
                <div className="text-xs" style={{ color: SLATE }}>
                  unread messages
                </div>
              </button>
              <button
                onClick={() => {
                  setBuyerOrderSearch("");
                  setBuyerOrderStatusFilter("disputed");
                  setView("orders");
                }}
                className="p-3 rounded-lg border bg-white text-left"
                style={{ borderColor: "#DDD8CC" }}
              >
                <div
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: buyerOpenDisputesCount ? BERRY : INK }}
                >
                  {buyerOpenDisputesCount}
                </div>
                <div className="text-xs" style={{ color: SLATE }}>
                  open disputes
                </div>
              </button>
              <button
                onClick={() => setNotifPanelOpen(true)}
                className="p-3 rounded-lg border bg-white text-left"
                style={{ borderColor: "#DDD8CC" }}
              >
                <div
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: unreadNotifCount ? MARIGOLD : INK }}
                >
                  {unreadNotifCount}
                </div>
                <div className="text-xs" style={{ color: SLATE }}>
                  new alerts
                </div>
              </button>
            </div>

            {sellerReports.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: SLATE }}>My seller reports</h3>
                <div className="space-y-2">{(showAllSellerReports ? sellerReports : sellerReports.slice(0, 3)).map((report) => (
                  <div key={report.id} className="p-3 rounded-lg border bg-white text-xs" style={{ borderColor: "#DDD8CC" }}>
                    <div className="flex justify-between gap-2"><span className="font-medium" style={{ color: INK }}>{report.reference}</span><Tag color={report.status === "resolved" ? SAGE : report.status === "dismissed" ? SLATE : MARIGOLD}>{String(report.status).replace("_", " ")}</Tag></div>
                    <div className="mt-1" style={{ color: SLATE }}>{report.seller_display_name || report.seller_username} · {String(report.reason).replaceAll("_", " ")}{report.order_id ? ` · ${orderNumber(report.order_id)}` : ""}</div>
                  </div>
                ))}</div>
                {sellerReports.length > 3 && <button onClick={() => setShowAllSellerReports((shown) => !shown)} className="text-xs font-medium underline mt-2" style={{ color: SLATE }}>{showAllSellerReports ? "Show less" : `View all ${sellerReports.length} reports`}</button>}
              </div>
            )}

            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: SLATE }}>
              Orders
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3B6E8F" }}>
                  {buyerOrdersWaitingToShip}
                </div>
                <div className="text-xs" style={{ color: SLATE }}>
                  waiting to ship
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6B8F71" }}>
                  {buyerOrdersInTransit}
                </div>
                <div className="text-xs" style={{ color: SLATE }}>
                  in transit
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#2F6B3A" }}>
                  {buyerCompletedCount}
                </div>
                <div className="text-xs" style={{ color: SLATE }}>
                  completed
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-white" style={{ borderColor: "#DDD8CC" }}>
                <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                  {buyerActiveOrdersCount}
                </div>
                <div className="text-xs" style={{ color: SLATE }}>
                  active orders
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: SLATE }}>
                    Recent orders
                  </h3>
                  <button
                    onClick={() => setView("orders")}
                    className="text-xs font-medium underline"
                    style={{ color: SLATE }}
                  >
                    View all →
                  </button>
                </div>
                {myOrders.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No orders yet. Anything you buy will show up here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myOrders.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setBuyerOrderSearch(orderNumber(o.id));
                          setBuyerOrderStatusFilter("all");
                          setView("orders");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full text-left p-3 rounded-lg border bg-white"
                        style={{ borderColor: "#DDD8CC" }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-medium"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                          >
                            {orderNumber(o.id)}
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                          >
                            {formatMoney(o.total, o.currency)}
                          </span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: SLATE }}>
                          {new Date(o.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: SLATE }}>
                    Recent messages
                  </h3>
                  <button
                    onClick={() => setView("messages")}
                    className="text-xs font-medium underline"
                    style={{ color: SLATE }}
                  >
                    View all →
                  </button>
                </div>
                {myThreads.length === 0 ? (
                  <p className="text-sm" style={{ color: SLATE }}>
                    No messages yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myThreads.slice(0, 3).map((t) => {
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
                            setView("messages");
                          }}
                          className="w-full text-left flex items-center gap-2 p-3 rounded-lg border bg-white"
                          style={{ borderColor: isUnread ? MARIGOLD : "#DDD8CC" }}
                        >
                          <span className="text-xl shrink-0">{t.listingEmoji}</span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate" style={{ color: INK, fontWeight: isUnread ? 700 : 500 }}>
                              {otherName}
                            </div>
                            <div className="text-xs truncate" style={{ color: SLATE }}>
                              {lastMsg ? (lastMsg.type === "offer" ? `Offer: ${formatMoney(lastMsg.amount, "NGN")}` : lastMsg.text) : ""}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {recentlyViewedIds.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: SLATE }}>
                  Recently viewed
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {recentlyViewedIds
                    .map((id) => listings.find((l) => l.id === id))
                    .filter(Boolean)
                    .map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setSelected(l);
                          setView("browse");
                        }}
                        className="w-32 shrink-0 text-left rounded-lg border bg-white overflow-hidden"
                        style={{ borderColor: "#DDD8CC" }}
                      >
                        {l.images && l.images.length > 0 ? (
                          <img src={l.images[0]} alt={l.title} className="w-full h-24 object-cover" />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center text-3xl" style={{ backgroundColor: CANVAS }}>
                            {l.emoji}
                          </div>
                        )}
                        <div className="p-2">
                          <div className="text-xs truncate" style={{ color: INK }}>
                            {l.title}
                          </div>
                          <div
                            className="text-xs font-semibold"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                          >
                            {formatMoney(l.price, l.currency)}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {myPaymentMethods.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: SLATE }}>
                  Payment methods used
                </h3>
                <div className="space-y-2">
                  {myPaymentMethods.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white"
                      style={{ borderColor: "#DDD8CC" }}
                    >
                      <span className="text-sm" style={{ color: INK }}>
                        {paymentMethodLabel(m)}
                      </span>
                      <span className="text-xs" style={{ color: SLATE }}>
                        Last used{" "}
                        {new Date(m.lastUsedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: SLATE }}>
                  Shown for your reference only — payments are handled securely by Paystack, and Stallyard never sees or stores full card numbers.
                </p>
              </div>
            )}
          </div>
  );
}
