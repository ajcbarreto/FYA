import type { AdoptionRequestRow } from "@/lib/adoption/db";
import { getRowAnimal, localizeRequestStatus, mapRequestApplicantName } from "@/lib/adoption/db";

// Escapa um campo para CSV (RFC 4180): wrap em aspas e duplica aspas internas
// se contiver virgulas, aspas ou newlines.
function csvField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export function buildRequestsCsv(requests: AdoptionRequestRow[], locale: string) {
  const header = [
    "id",
    "candidato",
    "animal",
    "estado",
    "data_criacao",
    "data_revisao",
    "mensagem_inicial",
    "observacoes_canil",
  ];

  const lines = requests.map((request) => {
    const animal = getRowAnimal(request);
    return [
      csvField(request.id),
      csvField(mapRequestApplicantName(request, locale)),
      csvField(animal?.nome ?? ""),
      csvField(localizeRequestStatus(request.status, locale)),
      csvField(request.created_at),
      csvField(request.reviewed_at ?? ""),
      csvField(request.mensagem_inicial ?? ""),
      csvField(request.observacoes_canil ?? ""),
    ].join(",");
  });

  // BOM para abrir limpinho no Excel.
  return `﻿${[header.join(","), ...lines].join("\n")}\n`;
}

export function csvResponse(body: string, filename: string) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
