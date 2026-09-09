export function loginErrorMessage(code: string | undefined, locale: string) {
  const pt = locale === "pt";
  if (code === "email_not_confirmed") {
    return pt
      ? "Confirma o teu email antes de entrar. Procura a mensagem de confirmação na caixa de entrada e no spam."
      : "Confirm your email before signing in. Check your inbox and spam for the confirmation message.";
  }
  if (code === "invalid_credentials") {
    return pt
      ? "Email ou palavra-passe incorretos. Se necessário, utiliza Recuperar palavra-passe."
      : "Incorrect email or password. Use password recovery if needed.";
  }
  if (code === "over_request_rate_limit") {
    return pt
      ? "Demasiadas tentativas. Aguarda alguns minutos antes de tentar novamente."
      : "Too many attempts. Wait a few minutes before trying again.";
  }
  return pt
    ? "Não foi possível iniciar sessão. Tenta novamente dentro de instantes."
    : "Unable to sign in. Please try again shortly.";
}
