# Apoios e donativos

Implementado: campanhas monetárias com ligação HTTPS externa, necessidades de bens/serviços, objetivos e prazos, associação facultativa a um animal, páginas públicas partilháveis, promessas privadas, confirmação de receção pela equipa e atualizações públicas. Só canis verificados podem publicar.

No painel, abrir **Apoios e donativos**, criar a campanha e assinalar **Publicar**. A imagem utiliza a fotografia pública do animal associado ou do canil. O apoiante pode consultar/cancelar promessas pendentes em **As minhas ajudas**.

Só valores ou bens recebidos devem ser confirmados. Promessas e cliques não aumentam o total. As correções exigem um motivo e preservam o histórico; não movimentam dinheiro. Contactos, mensagens e notas de receção não são públicos.

## Limites

- Stripe, pagamentos recorrentes, reconciliação automática e comprovativos fiscais ficam para uma fase posterior.
- A confirmação de uma promessa abrange a quantidade total. Nas entregas parciais, registar manualmente e cancelar a promessa original antes de outra confirmação para evitar duplicação.
- Listas limitadas a 100 campanhas/receções/promessas e 50 atualizações, conforme indicado na interface.
- Até 10 novas promessas por utilizador/hora; repetições da mesma submissão são idempotentes.
- Não envia emails nem publica nas redes sociais.

## Ativação e verificação

Aplicar `supabase/migrations/202609250001_shelter_support.sql` depois das migrações anteriores e antes de publicar o código. A base remota não foi alterada.

Passaram 37 testes automáticos, incluindo permissões, cêntimos, idempotência, correção de totais, prazos e verificação do canil. TypeScript e lint passaram.

A migração foi aplicada exclusivamente na instância local isolada `fya-launch-test`. O teste de navegador `tests/e2e/support.spec.ts` passou: campanha publicada, promessa privada sem alterar o total, confirmação pela equipa e correção do registo. A base remota não foi alterada. O bloqueio inicial do ambiente foi ultrapassado por execução autorizada.

A compilação de produção (`npm run build -- --webpack`) também passou. As correções de CSS e os limites da inspeção visual estão em `docs/revisao-visual-2026-09-26.md`.
