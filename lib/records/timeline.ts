const labels: Record<string, [string, string]> = {
  restored: ["Animal retirado do arquivo", "Animal restored from archive"],
  handover_updated: [
    "Checklist de entrega atualizada",
    "Handover checklist updated",
  ],
  registered: ["Animal registado", "Animal registered"],
  history_started: [
    "Início do histórico detalhado",
    "Detailed history started",
  ],
  archived: ["Animal arquivado", "Animal archived"],
  status_changed: ["Estado do animal alterado", "Animal status changed"],
  publication_changed: ["Publicação alterada", "Publication changed"],
  public_details_updated: [
    "Ficha pública atualizada",
    "Public profile updated",
  ],
  record_updated: ["Registo privado atualizado", "Private record updated"],
  document_added: ["Documento adicionado", "Document added"],
  document_removed: ["Documento removido", "Document removed"],
  document_updated: ["Documento atualizado", "Document updated"],
  dossier_shared: ["Dossier partilhado", "Dossier shared"],
  share_revoked: ["Partilha revogada", "Share revoked"],
  application_received: ["Candidatura recebida", "Application received"],
  application_status_changed: [
    "Estado da candidatura alterado",
    "Application status changed",
  ],
  visit_updated: [
    "Visita registada ou atualizada",
    "Visit recorded or updated",
  ],
  task_updated: ["Tarefa registada ou atualizada", "Task recorded or updated"],
  task_completed: ["Tarefa concluída", "Task completed"],
};
export function timelineLabel(kind: string, locale: string) {
  return (
    labels[kind]?.[locale === "pt" ? 0 : 1] ??
    (locale === "pt" ? "Alteração registada" : "Change recorded")
  );
}
