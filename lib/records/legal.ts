export const TERMS_VERSION = "2026-09-pilot";
export function registrationAcceptance(form: FormData) {
  return (
    form.get("terms") === "on" &&
    (form.get("source") !== "shelter_registration" ||
      form.get("declaration") === "on")
  );
}
