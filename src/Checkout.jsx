export default function Checkout({ scope }) {
  const {
    BERRY,
    CANVAS,
    INK,
    MARIGOLD,
    Minus,
    Plus,
    SLATE,
    ShoppingBag,
    Tag,
    Trash2,
    X,
    cartCurrency,
    cartItems,
    cartOpen,
    cartShipping,
    cartSubtotal,
    cartTax,
    cartTotal,
    checkout,
    checkoutSubmitting,
    checkoutVerifyError,
    checkoutVerifying,
    confirmedOrder,
    currentUser,
    formatMoney,
    handleDeliveryLocationPhotos,
    orderNumber,
    payWithSavedCard,
    removeFromCart,
    saveCardAtCheckout,
    saveShippingAddress,
    savedAddresses,
    savedCards,
    setCartOpen,
    setCheckoutVerifyError,
    setConfirmedOrder,
    setSaveCardAtCheckout,
    setSaveShippingAddress,
    setShippingForm,
    setView,
    settings,
    shippingError,
    shippingForm,
    updateCartQty,
    uploadingLocationPhotos,
  } = scope;

  return (
    <>
      {cartOpen && (
        <div
          className="fixed inset-0 z-40 flex justify-end"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setCartOpen(false)}
        >
          <div
            className="bg-white h-full w-full max-w-sm p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
                Your cart
              </h3>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart">
                <X size={20} style={{ color: SLATE }} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={32} className="mx-auto mb-3" style={{ color: SLATE }} />
                <p className="text-sm" style={{ color: SLATE }}>
                  Your cart is empty.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: INK }}>
                          {item.title}
                        </div>
                        <div
                          className="text-xs mt-0.5 flex items-center gap-2"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: SLATE }}
                        >
                          {formatMoney(item.price, item.currency)} each
                          {item.isOfferPrice && <Tag color={MARIGOLD}>Offer price</Tag>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            className="w-6 h-6 rounded-md border flex items-center justify-center"
                            style={{ borderColor: "#DDD8CC" }}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} style={{ color: SLATE }} />
                          </button>
                          <span
                            className="text-sm w-5 text-center"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                          >
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            className="w-6 h-6 rounded-md border flex items-center justify-center"
                            style={{ borderColor: "#DDD8CC" }}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} style={{ color: SLATE }} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span
                          className="text-sm font-medium"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                        >
                          {formatMoney(item.price * item.qty, item.currency)}
                        </span>
                        <button onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                          <Trash2 size={14} style={{ color: BERRY }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mb-4" style={{ borderColor: "#DDD8CC" }}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span style={{ color: SLATE }}>Subtotal</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                      {formatMoney(cartSubtotal, cartCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span style={{ color: SLATE }}>Shipping</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                      {cartShipping > 0 ? formatMoney(cartShipping, cartCurrency) : "Free"}
                    </span>
                  </div>
                  {cartTax > 0 && (
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span style={{ color: SLATE }}>Tax ({Math.round((settings.taxRate || 0) * 1000) / 10}%)</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                        {formatMoney(cartTax, cartCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#EFEBE0" }}>
                    <span className="text-sm" style={{ color: SLATE }}>
                      Total
                    </span>
                    <span
                      className="text-xl"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
                    >
                      {formatMoney(cartTotal, cartCurrency)}
                    </span>
                  </div>
                </div>

                {currentUser && (
                  <div className="border-t pt-4 mb-4" style={{ borderColor: "#DDD8CC" }}>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: INK }}>
                      Shipping address
                    </h4>
                    {savedAddresses.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {savedAddresses.map((a) => (
                          <button
                            key={a.id}
                            onClick={() =>
                              setShippingForm({
                                ...shippingForm,
                                fullName: a.full_name || shippingForm.fullName,
                                phone: a.phone || shippingForm.phone,
                                street: a.street,
                                city: a.city,
                                state: a.state,
                                zip: a.zip,
                                country: "Nigeria",
                                deliveryInstructions: a.delivery_instructions || "",
                                preferredDeliveryTime: a.preferred_delivery_time || "",
                                locationPhotos: a.location_photos || [],
                              })
                            }
                            className="text-xs px-2 py-1 rounded-full border"
                            style={{ borderColor: "#DDD8CC", color: INK }}
                          >
                            {a.label || `${a.city}, ${a.country}`}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <input
                        value={shippingForm.fullName}
                        onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                        placeholder="Full name"
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <input
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        placeholder="Recipient phone number"
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <input
                        value={shippingForm.street}
                        onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                        placeholder="Street address"
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <div className="flex gap-2">
                        <input
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          placeholder="City"
                          className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <input
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                          placeholder="State"
                          className="w-28 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                      </div>
                      <textarea
                        value={shippingForm.deliveryInstructions}
                        onChange={(e) => setShippingForm({ ...shippingForm, deliveryInstructions: e.target.value.slice(0, 1000) })}
                        placeholder="Private delivery instructions or nearby landmark (optional)"
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <input
                        value={shippingForm.preferredDeliveryTime}
                        onChange={(e) => setShippingForm({ ...shippingForm, preferredDeliveryTime: e.target.value.slice(0, 200) })}
                        placeholder="Preferred delivery time (optional)"
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: "#DDD8CC" }}
                      />
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-medium" style={{ color: INK }}>Private location photos (up to 5)</span>
                          <label className="text-xs font-medium underline cursor-pointer" style={{ color: SLATE }}>
                            {uploadingLocationPhotos ? "Processing…" : "Add photos"}
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleDeliveryLocationPhotos} disabled={uploadingLocationPhotos || (shippingForm.locationPhotos || []).length >= 5} />
                          </label>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {(shippingForm.locationPhotos || []).map((photo, index) => (
                            <div key={index} className="relative">
                              <img src={photo} alt={`Delivery location ${index + 1}`} className="w-16 h-16 object-cover rounded-lg border" style={{ borderColor: "#DDD8CC" }} />
                              <button type="button" onClick={() => setShippingForm((form) => ({ ...form, locationPhotos: form.locationPhotos.filter((_, i) => i !== index) }))} className="absolute -top-1 -right-1 bg-white border rounded-full" aria-label="Remove location photo"><X size={13} /></button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs mt-1" style={{ color: SLATE }}>Visible only to the seller handling this paid order and authorized support staff.</p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={shippingForm.zip}
                          onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                          placeholder="Postal code"
                          className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm"
                          style={{ borderColor: "#DDD8CC" }}
                        />
                        <input
                          value="Nigeria"
                          readOnly
                          aria-label="Country"
                          className="flex-1 px-3 py-2 rounded-lg border outline-none text-sm bg-gray-50"
                          style={{ borderColor: "#DDD8CC", color: INK }}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs pt-1" style={{ color: SLATE }}>
                        <input
                          type="checkbox"
                          checked={saveShippingAddress}
                          onChange={(e) => setSaveShippingAddress(e.target.checked)}
                        />
                        Save this address to my account for next time
                      </label>
                      {shippingError && (
                        <p className="text-xs" style={{ color: BERRY }}>
                          {shippingError}
                        </p>
                      )}
                      <p className="text-xs" style={{ color: SLATE }}>Your delivery details are shared only with the seller handling the paid order and authorized support staff.</p>
                    </div>
                  </div>
                )}

                {savedCards.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-2" style={{ color: SLATE }}>
                      Pay with a saved card
                    </p>
                    <div className="space-y-2">
                      {savedCards.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => payWithSavedCard(c.id)}
                          disabled={checkoutSubmitting}
                          className="w-full text-left px-3 py-2 rounded-lg border bg-white text-sm disabled:opacity-50"
                          style={{ borderColor: "#DDD8CC", color: INK }}
                        >
                          {c.card_type ? c.card_type.charAt(0).toUpperCase() + c.card_type.slice(1) : "Card"}
                          {c.last4 ? ` ending in ${c.last4}` : ""}
                          {c.is_default ? " (default)" : ""}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-center mt-2" style={{ color: SLATE }}>
                      Or pay with a new card below
                    </p>
                  </div>
                )}

                <button
                  onClick={checkout}
                  disabled={checkoutSubmitting}
                  className="w-full py-2.5 rounded-lg font-medium disabled:opacity-50"
                  style={{ backgroundColor: MARIGOLD, color: INK }}
                >
                  {checkoutSubmitting ? "Starting checkout…" : "Checkout"}
                </button>
                <label className="flex items-center gap-2 text-xs mt-2 justify-center" style={{ color: SLATE }}>
                  <input
                    type="checkbox"
                    checked={saveCardAtCheckout}
                    onChange={(e) => setSaveCardAtCheckout(e.target.checked)}
                  />
                  Save this card for future purchases
                </label>
                <p className="text-xs text-center mt-2" style={{ color: SLATE }}>
                  You'll be taken to Paystack to pay securely.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {checkoutVerifying && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(27,36,48,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            <p className="text-sm" style={{ color: INK }}>
              Confirming your payment…
            </p>
          </div>
        </div>
      )}

      {checkoutVerifyError && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(27,36,48,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            <h2 className="text-xl mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Couldn't confirm payment
            </h2>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              {checkoutVerifyError}
            </p>
            <button
              onClick={() => setCheckoutVerifyError("")}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: MARIGOLD, color: INK }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {confirmedOrder && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(27,36,48,0.6)" }}
          onClick={() => setConfirmedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConfirmedOrder(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              <X size={20} style={{ color: SLATE }} />
            </button>
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
              style={{ backgroundColor: "#E7EFE8" }}
            >
              ✓
            </div>
            <h3 className="text-xl mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: INK }}>
              Order confirmed
            </h3>
            <p className="text-sm mb-4" style={{ color: SLATE }}>
              Thanks! Your order has been placed.
            </p>
            <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: CANVAS }}>
              <div className="text-xs uppercase tracking-wide mb-1" style={{ color: SLATE }}>
                Confirmation number
              </div>
              <div
                className="text-lg font-semibold"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}
              >
                {orderNumber(confirmedOrder.id)}
              </div>
            </div>
            <div className="text-sm mb-4" style={{ color: SLATE }}>
              Total charged:{" "}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                {formatMoney(confirmedOrder.total, confirmedOrder.currency)}
              </span>
            </div>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                setView("orders");
              }}
              className="w-full py-2.5 rounded-lg font-medium"
              style={{ backgroundColor: MARIGOLD, color: INK }}
            >
              View my orders
            </button>
          </div>
        </div>
      )}
    </>
  );
}
