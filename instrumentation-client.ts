import * as Sentry from "@sentry/nextjs";
import { sentryDataCollection } from "./lib/sentry-privacy";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn)
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    dataCollection: sentryDataCollection,
    tracesSampleRate: 0,
  });
