/**
 * In dev we use `current_partner_id` to switch between different partners, but
 * this can interfere with various network operations since we frequently pass
 * url query params directly to Metaphysics. So remove it from the url on boot.
 */

export const stripCurrentPartnerIDFromUrl = () => {
  const url = new URL(window.location.href)

  if (url.searchParams.has("current_partner_id")) {
    url.searchParams.delete("current_partner_id")

    // Silently update the url without reloading the page
    window.history.replaceState({}, "", url)
  }
}
