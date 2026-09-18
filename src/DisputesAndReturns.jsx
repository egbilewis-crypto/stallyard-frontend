export default function DisputesAndReturns({ scope }) {
  const {
    Array,
    BERRY,
    Boolean,
    CANVAS,
    CURRENCIES,
    Date,
    FULFILLMENT_LABEL,
    INK,
    MARIGOLD,
    Number,
    SAGE,
    SLATE,
    String,
    Tag,
    activeDisputeCaseId,
    adminDisputeSearch,
    adminDisputeStatusFilter,
    adminDisputes,
    adminTab,
    currentMember,
    disputeAdminDrafts,
    formatMoney,
    hasAdminPermission,
    openAdminNotes,
    orderNumber,
    orders,
    partialRefundOrder,
    refundOrder,
    releasePayout,
    saveAdminDisputeCase,
    savingDisputeCaseId,
    setActiveDisputeCaseId,
    setAdminDisputeSearch,
    setAdminDisputeStatusFilter,
    setDisputeAdminDrafts,
  } = scope;

  return (
    
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
            
  );
}
