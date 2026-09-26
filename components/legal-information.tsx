import Link from "next/link";
export function LegalInformation({
  locale,
  kind,
}: {
  locale: string;
  kind: "terms" | "privacy";
}) {
  const pt = locale === "pt";
  const entity = process.env.LEGAL_ENTITY_NAME,
    support = process.env.SUPPORT_EMAIL,
    privacy = process.env.PRIVACY_EMAIL;
  const ready = Boolean(
    entity && support && privacy && process.env.LEGAL_APPROVED_AT,
  );
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl space-y-6 p-8">
      <h1 className="page-title">
        {kind === "terms"
          ? pt
            ? "Condições de utilização"
            : "Terms of use"
          : pt
            ? "Privacidade"
            : "Privacy"}
      </h1>
      {!ready && (
        <p role="status" className="rounded-xl bg-muted p-5">
          {pt
            ? "Informação preliminar do piloto. A identificação da entidade, os contactos e a revisão jurídica estão pendentes. Esta página ainda não é a versão final para lançamento público."
            : "Preliminary pilot information. Entity identification, contacts and legal review are pending. This is not the final version for public launch."}
        </p>
      )}
      <p>
        {pt ? "Entidade responsável" : "Responsible entity"}:{" "}
        {entity || (pt ? "Por definir" : "To be defined")}
      </p>
      <p>
        {pt ? "Apoio" : "Support"}:{" "}
        {support || (pt ? "Por definir" : "To be defined")}
      </p>
      <p>
        {pt ? "Contacto de privacidade" : "Privacy contact"}:{" "}
        {privacy || (pt ? "Por definir" : "To be defined")}
      </p>
      {kind === "terms" ? (
        <>
          <p>
            {pt
              ? "A FYA permite aos canis organizar registos e processos de adoção. O canil avalia as candidaturas e confirma as condições de entrega. A candidatura não garante uma adoção."
              : "FYA helps shelters organise records and adoption processes. The shelter assesses applications and confirms handover conditions. An application does not guarantee adoption."}
          </p>
          <p>
            {pt
              ? "Usa uma conta individual, mantém os dados corretos e carrega apenas conteúdos que tens autorização para utilizar e partilhar. Documentos privados devem ser partilhados apenas com os destinatários adequados."
              : "Use an individual account, keep information accurate and upload only content you are authorised to use and share. Private documents should only be shared with appropriate recipients."}
          </p>
          <p>
            {pt
              ? "A FYA não processa os donativos apresentados em links externos e não substitui os registos oficiais do animal."
              : "FYA does not process donations linked to external sites and does not replace official animal records."}
          </p>
        </>
      ) : (
        <>
          <p>
            {pt
              ? "A aplicação usa dados de conta, respostas de candidatura e mensagens para suportar a adoção. Os canis mantêm os registos internos dos animais; documentos selecionados podem ser disponibilizados ao adotante numa partilha com prazo."
              : "The application uses account data, application answers and messages to support adoption. Shelters maintain internal animal records; selected documents may be made available to an adopter through a time-limited share."}
          </p>
          <p>
            {pt
              ? "As notas internas e os documentos não fazem parte do catálogo público. São utilizados cookies necessários à sessão e à preferência de idioma."
              : "Internal notes and documents are not part of the public catalogue. Cookies are used for sessions and language preferences."}
          </p>
          <p>
            {pt
              ? "Antes do lançamento público serão definidos os prazos de conservação, as bases legais, as responsabilidades e a informação sobre fornecedores e transferências aplicáveis."
              : "Retention periods, legal bases, responsibilities and information about applicable providers and transfers must be defined before public launch."}
          </p>
          <p>
            {pt
              ? "Os pedidos de contacto para o piloto recolhem nome, organização, localidade, email e a mensagem opcional. Estes dados ficam acessíveis à administração para responder ao pedido; não são publicados nem usados para subscrever marketing. Os limites de submissão comparam email e data para reduzir abuso. Os prazos e contactos finais serão definidos antes da abertura pública."
              : "Pilot contact requests collect name, organisation, location, email and an optional message. Administrators can access these details to respond; they are not public and do not subscribe you to marketing. Submission limits compare email and date to reduce abuse. Final retention periods and contacts must be set before public launch."}
          </p>
          <p>
            {pt
              ? "Ao registar uma promessa de ajuda, o nome e email da conta e a mensagem indicada são partilhados com a equipa do canil para combinar a entrega. Estes dados e os registos individuais de receção não são públicos. Os totais das campanhas são confirmados manualmente pelos canis; o pagamento é externo à FYA."
              : "When recording a support promise, your account name and email and your message are shared with the shelter team to arrange delivery. These details and individual receipt records are not public. Campaign totals are manually confirmed by shelters; payments happen outside FYA."}
          </p>
          <Link className="underline" href={`/${locale}/conta/privacidade`}>
            {pt
              ? "Consultar os meus dados e registar um pedido"
              : "Access my data and submit a request"}
          </Link>
        </>
      )}
      <p className="text-sm text-muted-foreground">
        {pt ? "Versão do piloto" : "Pilot version"}: 2026-09-pilot
      </p>
    </main>
  );
}
