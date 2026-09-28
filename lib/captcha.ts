import "server-only";

/** Token posted by the Turnstile widget, if the widget is enabled. */
export function captchaToken(form: FormData) {
  const token = String(form.get("cf-turnstile-response") ?? "");
  return token || undefined;
}

/**
 * Verifies a Turnstile token for forms that do not go through Supabase Auth.
 * Auth forms pass the token to Supabase, which verifies it itself.
 * Without TURNSTILE_SECRET_KEY the check is disabled.
 */
export async function verifyCaptcha(form: FormData) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const token = captchaToken(form);
  if (!token) return false;
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: token }),
        signal: AbortSignal.timeout(5000),
      },
    );
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("[captcha] Verification unavailable", error);
    return false;
  }
}
