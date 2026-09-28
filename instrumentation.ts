import * as Sentry from "@sentry/nextjs";
import { sentryDataCollection } from "./lib/sentry-privacy";

// Error alerts are sent to Sentry only when SENTRY_DSN is configured.
export function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    dataCollection: sentryDataCollection,
    tracesSampleRate: 0,
  });
}

export const onRequestError = Sentry.captureRequestError;
