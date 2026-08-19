export const ANALYTICS_EVENTS = [
  "profile_view",
  "listing_view",
  "catalogue_download",
  "search_query",
  "call_click",
  "rfq_submit",
  "rfq_open",
  "rfq_match",
  "quote_submit",
  "message_sent",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

/** Events the browser may record. Loop events stay server-only. */
export const CLIENT_ANALYTICS_EVENTS = [
  "listing_view",
  "catalogue_download",
  "call_click",
  "search_query",
] as const;

export type ClientAnalyticsEventName = (typeof CLIENT_ANALYTICS_EVENTS)[number];

export function isClientAnalyticsEvent(name: string): name is ClientAnalyticsEventName {
  return (CLIENT_ANALYTICS_EVENTS as readonly string[]).includes(name);
}

export const EVENT_LABEL: Record<AnalyticsEventName, string> = {
  profile_view: "Profile view",
  listing_view: "Listing view",
  catalogue_download: "Catalogue download",
  search_query: "Search",
  call_click: "Call click",
  rfq_submit: "RFQ submitted",
  rfq_open: "RFQ opened",
  rfq_match: "Supplier matched",
  quote_submit: "Quote submitted",
  message_sent: "Message sent",
};
