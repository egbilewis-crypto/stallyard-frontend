import React from "react";

const BUYER_PRE_DRAFTED_MESSAGES = [
  "Is this item still available?",
  "What condition is the item in?",
  "Does it have any damage or faults?",
  "What accessories are included?",
  "Is the price negotiable?",
  "Can you deliver to my location?",
  "When can you deliver it?",
  "I have placed my order.",
  "I’m ready to inspect the item.",
];

const SELLER_PRE_DRAFTED_MESSAGES = [
  "Yes, the item is available.",
  "The price is firm.",
  "I can accept a reasonable offer.",
  "The item is in the condition shown.",
  "I can deliver to your location.",
  "Your order is being prepared.",
  "I’m on my way.",
  "I have arrived.",
  "Please inspect the item carefully.",
  "Only release your delivery token when you are satisfied.",
];

export default function Messages({ scope }) {
  const {
    BERRY,
    Flag,
    INK,
    MARIGOLD,
    SAGE,
    SLATE,
    Tag,
    X,
    activeThread,
    activeThreadOrderId,
    addToCartAtPrice,
    currentUser,
    formatMoney,
    listings,
    markThreadRead,
    members,
    messageError,
    messageReadState,
    myThreads,
    offerAmount,
    offerModalOpen,
    openSellerReport,
    reportMessage,
    reportMessageId,
    reportReasonDraft,
    respondToOffer,
    sendMessage,
    sendOffer,
    setActiveThreadId,
    setActiveThreadOrderId,
    setMessageError,
    setOfferAmount,
    setOfferModalOpen,
    setReportMessageId,
    setReportReasonDraft,
    view,
  } = scope;

  const preDraftedMessages = activeThread?.buyerUsername === currentUser
    ? BUYER_PRE_DRAFTED_MESSAGES
    : SELLER_PRE_DRAFTED_MESSAGES;

  return (
    <>
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
                                ? ` — ${lastMsg.type === "offer" ? `Offer: ${formatMoney(lastMsg.amount, "NGN")}` : lastMsg.text}`
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
                  {activeThread.buyerUsername === currentUser && (
                    <button
                      onClick={() => {
                        const seller = members.find((member) => member.username === activeThread.sellerUsername);
                        openSellerReport(seller?.backendId, activeThread.sellerName || activeThread.sellerUsername, activeThreadOrderId || null);
                      }}
                      className="ml-auto text-xs font-medium underline"
                      style={{ color: BERRY }}
                    >
                      Report seller
                    </button>
                  )}
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

                <div
                  className="mb-3 rounded-lg border p-3 text-xs"
                  style={{ borderColor: "#DDD8CC", backgroundColor: "#F8F6F0", color: SLATE }}
                >
                  For your safety, only Stallyard’s approved messages can be sent. Phone numbers, email addresses,
                  payment details, external links, social-media handles, and requests to transact outside Stallyard
                  are not allowed. Keep communication and payment on Stallyard to remain protected.
                </div>

                <div className="mb-3">
                  <p className="text-xs font-medium mb-2" style={{ color: INK }}>
                    Choose a message to send
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {preDraftedMessages.map((message) => (
                      <button
                        key={message}
                        type="button"
                        onClick={() => sendMessage(activeThread.id, message)}
                        className="text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-[#FBF0DC]"
                        style={{ borderColor: "#DDD8CC", color: INK }}
                      >
                        {message}
                      </button>
                    ))}
                  </div>
                </div>

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
                  <span className="text-xs" style={{ color: SLATE }}>
                    Free-typed messages and photo attachments are disabled.
                  </span>
                </div>
              </div>
            )}
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
    </>
  );
}
