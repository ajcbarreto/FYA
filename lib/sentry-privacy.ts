import type { BrowserOptions } from "@sentry/nextjs";

// Adopter and shelter data must not leave through error reports: send the error only.
export const sentryDataCollection: BrowserOptions["dataCollection"] = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
};
