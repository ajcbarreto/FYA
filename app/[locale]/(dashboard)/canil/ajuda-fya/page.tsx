import { ContactInbox, type ContactSearch } from "@/components/contact-inbox";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ContactSearch>;
}) {
  return (
    <ContactInbox
      locale={(await params).locale}
      admin={false}
      search={await searchParams}
    />
  );
}
