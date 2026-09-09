export const requestTransitions = {
  pendente: ["entrevista", "rejeitado"],
  entrevista: ["aprovado", "rejeitado"],
  aprovado: ["concluido", "rejeitado"],
  rejeitado: [],
  concluido: [],
} as const;
