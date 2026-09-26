# Centro de registos e operação — entrega de 24/09/2026

Esta entrega transforma a ficha pública num ponto de entrada para um registo privado do animal e acrescenta ferramentas de trabalho em equipa. O código e as migrações estão no repositório; a base remota e o alojamento não foram atualizados nesta intervenção.

**Decisão de produto: não existe funcionalidade de devolução.** A adoção concluída é final. Esta decisão substitui as propostas de episódios/devoluções na avaliação inicial de 23/09.

## Utilização

- **Animais → animal → Registos:** referência interna, microchip, datas, origem, localização, observações de saúde/comportamento e notas privadas. O catálogo não apresenta estes campos.
- **Documentos:** carregar PDF, JPEG ou PNG até 10 MiB por ficheiro. A aplicação verifica o tipo e a assinatura do ficheiro. Os documentos ficam num bucket privado, separado das fotografias públicas. Isto não constitui análise antivírus.
- **Dossier de adoção:** marcar documentos partilháveis, selecionar a candidatura e os documentos e enviar o dossier. O email contém uma ligação autenticada; não contém anexos nem notas internas. O destinatário tem de entrar com a conta da candidatura. A partilha expira em 7, 14 ou 30 dias e pode ser revogada. São suportadas candidaturas em entrevista, aprovadas ou concluídas; não existe envio livre para qualquer endereço.
- **Equipa:** convidar leitores ou editores pelo email da conta; aceitar em `/pt/convites`. Os convites são disponibilizados na aplicação, sem email de convite nesta versão. O responsável pode revogar acessos. Uma pessoa pode selecionar entre os canis a que pertence.
- **Trabalho do dia:** tarefas, responsáveis, prazos, resultado, notas internas de candidaturas, próximas visitas, métricas e estado dos envios de dossiers. Adoções concluídas geram tarefas de acompanhamento a 7, 30 e 90 dias.
- **Agenda:** configurar horários e capacidade, confirmar e reagendar visitas. As regras de capacidade são verificadas na base de dados.
- **Importação:** pré-visualizar até 200 animais por CSV, corrigir erros e importar numa transação. Referências internas duplicadas no canil são recusadas. Os animais importados começam como não publicados. Existe exportação CSV protegida contra fórmulas de folha de cálculo.
- **Entrega:** configurar checklist na equipa e preencher na ficha do animal. Pode ser obrigatória para concluir a adoção. A adoção externa também passa pelas regras de conclusão.
- **Arquivo:** a ação de remoção arquiva o animal e preserva o histórico. A conclusão/arquivo trata candidaturas e visitas de forma transacional. Apenas canis verificados podem publicar.
- **Privacidade:** exportação dos dados de conta abrangidos pela página e pedidos de acesso, retificação ou apagamento, com resposta administrativa. O apagamento efetivo exige tratamento pelo responsável; marcar um pedido como resolvido não elimina automaticamente os dados.

## Candidaturas e respostas modelo

Em **Pedidos de adoção**, pesquisar pelo nome do animal, nome ou email do adotante. Combinar estado, responsável, antiguidade mínima em dias e candidaturas ativas sem resposta. A pesquisa e a contagem abrangem todo o canil, com páginas de 25 resultados e ordenação por antiguidade ou mais recentes. Os filtros mantêm-se ao paginar e após alterações bem-sucedidas.

Só o responsável do canil e os editores podem receber atribuições, editar modelos ou responder. Leitores consultam a fila. A remoção de um editor da equipa liberta as candidaturas atribuídas. A atribuição não modifica notas internas nem o estado do pedido.

**Gerir respostas modelo** permite criar, editar e eliminar textos partilhados pela equipa. Há sugestões iniciais para entrevista, pedido de informação e decisão. Os marcadores `{animal}`, `{adotante}` e `{canil}` são substituídos ao inserir o modelo no texto. A mensagem continua editável e só é enviada quando a pessoa clica em **Enviar mensagem**. É registada na conversa com o adotante; não muda o estado da candidatura e não é um envio de email. Rever os campos entre parênteses retos dos modelos iniciais antes de enviar. Rascunhos desta resposta não são persistidos ao sair ou atualizar a página.

O destaque de mais de 48 horas aplica-se a candidaturas ativas sem mensagem nem nota partilhada da equipa. Notas internas e mudanças de estado sem texto não contam como resposta. A primeira resposta passa a ter data própria, que não é substituída por respostas posteriores. Para dados históricos, usa-se a primeira mensagem existente ou a data de revisão associada à nota partilhada atual; esta última é uma aproximação, pois o histórico anterior não guardava a primeira edição.

## Ativação

Numa base nova, aplicar todas as migrações versionadas por ordem. Numa base existente, confirmar o histórico instalado e testar primeiro numa cópia, seguindo o README. Não voltar a aplicar a baseline.

Novas migrações, pela ordem obrigatória:

1. `202609230001_records_operations.sql`
2. `202609230002_operations_access.sql`
3. `202609230003_team_preferences.sql`
4. `202609240001_import_privacy.sql`
5. `202609240002_agenda.sql`
6. `202609240003_handover_metrics.sql`
7. `202609240004_reminders.sql`
8. `202609240005_application_queue.sql`
9. `202609240006_guidance_timeline_pilots.sql` — ver [entrega de ajuda e divulgação](entrega-ajuda-divulgacao.md).

Publicar o código depois de aplicar e verificar as migrações no ambiente de destino. Estas migrações alteram permissões, funções e regras existentes, além de criar tabelas. Preservar um backup e planear a recuperação antes da atualização. Nunca tornar o bucket `animal-documents` público.

Configurar as variáveis de `.env.example`. A partilha por email requer `RESEND_API_KEY`, `EMAIL_FROM`, `SUPABASE_SERVICE_ROLE_KEY` e o endereço público correto. Configurar domínio/remetente no fornecedor e testar entrega com contas controladas. Programar `GET /api/jobs/email` com `Authorization: Bearer <CRON_SECRET>`, por exemplo a cada 10 minutos. Sem este agendamento, lembretes futuros e tentativas pendentes não têm entrega garantida. Monitorizar erros HTTP e jobs esgotados; tarefas concluídas e visitas canceladas deixam de originar os respetivos lembretes pendentes.

`LEGAL_ENTITY_NAME`, `SUPPORT_EMAIL`, `PRIVACY_EMAIL` e `LEGAL_APPROVED_AT` continuam pendentes por indicação do proprietário. Os textos legais apresentam esse estado e precisam de revisão antes do lançamento público. Registar uma data na configuração não substitui essa revisão.

```sh
npm run check:launch
```

Este comando verifica presença de configuração, HTTPS e comprimento do segredo de cron. Não valida credenciais, domínio de email, prontidão legal ou funcionamento do alojamento.

## Verificação e limites

Resultado local em 24/09, após a fila de candidaturas: 30 testes de lógica/base de dados aprovados; sete percursos existentes de browser aprovados na suite e o novo percurso de pesquisa/atribuição/modelos aprovado numa execução dirigida após corrigir os seletores do teste. TypeScript, lint e build de produção com Webpack aprovados. Os tipos gerados coincidem com as migrações.

Os testes de base de dados verificam permissões, isolamento, ficheiros/partilhas, expiração e revogação, importação atómica, arquivo, conclusão, seguimentos, agenda, checklist e lembretes. Os testes de browser usam Supabase local real para Auth, Storage e Realtime, incluindo registo, recuperação de acesso, candidaturas, chat, visitas, documentos, acesso do destinatário, revogação e equipas. Existe uma verificação móvel da ficha de registos. Isto não equivale a uma auditoria completa de acessibilidade, idiomas ou dispositivos.

```sh
npm run typecheck
npm run lint
npm test
npm run build -- --webpack
npm run test:prepare-isolated
FYA_E2E_ENV=.env.launch-test.local npm run local:seed
npx playwright install chromium
FYA_E2E_ENV=.env.launch-test.local npm run test:e2e
```

O ambiente isolado usa o projeto Supabase `fya-launch-test` e portas distintas do desenvolvimento normal. Credenciais de teste ficam em ficheiros locais ignorados pelo Git. A CI inclui os testes de browser. O build local com Turbopack encontrou uma restrição de abertura de portas do sandbox; a alternativa de validação é Webpack.

Não foi enviado email externo nem demonstrado restauro de produção. Antes do lançamento: testar envio e falhas no fornecedor, ensaiar restauro da base **e dos ficheiros**, configurar monitorização e responsáveis de suporte, verificar redirects de Auth/domínio e validar os percursos com canis piloto.

## Âmbito ainda por desenvolver ou validar

A avaliação inicial é um roteiro mais amplo do que esta entrega. A ficha imprimível/QR foi acrescentada na entrega de 25/09. Continuam por desenvolver alertas de anúncios desatualizados e indicadores de impacto mais completos. Pesquisa e filtros globais, atribuição manual de candidaturas e respostas modelo foram acrescentados nesta entrega. As páginas operacionais apresentam limites explícitos de 100 tarefas/candidaturas; não são relatórios ilimitados. A exportação de conta é parcial e o pedido de acesso permite solicitar informação adicional.

Validação de mercado, preços, parceiros, tempos poupados, testes de carga, custos, políticas de retenção, operação de incidentes e medidas adicionais para contas administrativas exigem trabalho próprio antes da expansão. Não há integração automática com registos externos nem recomendações clínicas automáticas.
