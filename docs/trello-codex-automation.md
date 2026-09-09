# Trello → Codex → Review

Implementação opt-in em Node 24/npm, Next.js App Router e Supabase PostgreSQL. O endpoint pode correr no alojamento Next.js existente. O agente exige um daemon numa máquina Unix com disco persistente; não corre numa função serverless. Não existe configuração de deployment específica neste repositório.

## Arquitetura e estado

`POST /api/webhooks/trello` → valida HMAC e evento → RPC transacional → `trello_events` + `trello_jobs` → worker → clone/branch por card → `codex exec` → verificações → branch pronta → comentário e movimento para Review.

O webhook não chama o agente nem a API Trello. Responde 202 depois do commit da fila, 204 para eventos irrelevantes, 401 para assinatura inválida, 413 acima de 1 MiB e 503 para indisponibilidade/desativação. HEAD responde 200 para o handshake. A assinatura SHA-1 HMAC usa **o application secret do Trello**, corpo original e callback URL exato, incluindo slash/query. Não é o token nem um segredo arbitrário.

IDs são usados internamente. Uma entrada por card e uma chave única por action ID impedem duplicação. Apenas movimentos para Ready e criação/cópia/entrada de card nessa lista são aceites; comentários e movimentos para Review não geram ciclos. O worker relê board, lista e estado closed antes de executar. Cards que saíram da fila exigem intervenção, não são desenvolvidos silenciosamente. Cards existentes em Ready antes de criar o webhook devem sair e voltar à lista.

Estados:

| Estado | Significado |
|---|---|
| READY | Evento aceite, nunca iniciado |
| CLAIMED | Exclusão adquirida atomicamente |
| IN_PROGRESS | Branch preparada, trabalho ou entrega em curso |
| PAUSED | Retomável após backoff |
| REVIEW | Verificações concluídas, comentário entregue e card movido |
| DONE | Humano confirmou conclusão |
| FAILED | Intervenção necessária; cinco tentativas ou erro permanente |

`trello_jobs` guarda branch, owner, run UUID, tentativas e checkpoint (último commit, completed, remaining, testes, limitações). A base tem RLS sem políticas públicas; RPCs são exclusivas de service_role. O utilizador do browser não acede a tarefas. Usar preferencialmente um projeto Supabase dedicado à automação para reduzir o alcance da service role; aplicar nele esta migração isolada.

Claims usam `FOR UPDATE SKIP LOCKED` e saves condicionados pelo run UUID/estado ativo. **Não expiram por tempo:** um agente desconectado pode continuar vivo. Cada host/workspace mantém lock exclusivo e registo do grupo de processos Codex. Num restart no mesmo host/root, o worker verifica que o processo anterior e o grupo do agente terminaram e converte os seus claims em PAUSED. Se o agente ainda vive, a inicialização recusa e o supervisor deve tentar mais tarde. Um PID reutilizado ou lock incompleto bloqueia conservadoramente; inspecionar manualmente. Não partilhar o diretório entre hosts nem iniciar múltiplos supervisores sobre o mesmo root. Outros hosts podem consumir cards diferentes; nunca roubam claims antigos.

O disco em `.trello-worker/` contém clones independentes (sem copiar `.env.local`), reports e registos de processos. Conservar este disco e fazer backups. O Codex escreve `CODEX_CHECKPOINT.md` e commits; alterações não commitadas sobrevivem no clone. Após crash antes do save na base, a retoma reconstrói contexto pelo Git e pelo ficheiro. Se o host/disco se perder antes do push, alterações locais não podem ser recuperadas apenas pelo Trello. Fazer backups ou ativar push e checkpoints remotos operacionais.

Quando o desenvolvimento terminou, `delivery_pending` é persistido **antes** de comentar/mover. Uma falha Trello retoma apenas a entrega. Comentários usam marcadores e consultam os últimos 1000 comentários para reconciliar POSTs ambíguos; não existe garantia de exactly-once externa. Um card com mais de 1000 comentários entre retries pode receber comentário repetido. PUT da lista é idempotente.

## Configuração

1. Instalar Node 24, Git e Codex CLI no host dedicado. `codex exec --help` deve suportar `--ignore-user-config`, `--sandbox`, `--output-schema` e `--output-last-message`. Autenticar com `codex login` sob a conta do daemon. Não há integração com sessões anteriores da app desktop.
2. `npm ci`; copiar `.env.example` para `.env.local`. Nunca copiar secrets para os clones.
3. Aplicar `supabase/migrations/202609090002_trello_automation.sql` ao Supabase configurado, pelo processo de migrações do projeto (local: `npm run local:start`, depois `npx supabase migration up --local`). Na produção, rever/aplicar as migrações pendentes pelo pipeline/CLI Supabase existente. Não executar baseline sobre base existente.
4. Configurar as variáveis abaixo no servidor e no daemon. O Next.js carrega `.env.local`; os scripts usam `node --env-file=.env.local`.

| Variável | Uso |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | URL da base, já existente |
| SUPABASE_SERVICE_ROLE_KEY | Servidor/worker; nunca pública |
| TRELLO_AUTOMATION_ENABLED | `true` ativa; vazia/false desativa |
| TRELLO_BOARD_ID | ID do board autorizado |
| TRELLO_READY_LIST_ID | ID da lista “Ready for Codex” |
| TRELLO_REVIEW_LIST_ID | ID da lista “Review” (ou nome escolhido) |
| TRELLO_KEY / TRELLO_TOKEN | Credenciais da conta bot |
| TRELLO_APP_SECRET | Secret correspondente à API key, valida assinatura |
| TRELLO_WEBHOOK_URL | URL HTTPS pública exata terminada em `/api/webhooks/trello` |
| TRELLO_WORKSPACE_ROOT | Disco persistente absoluto; default `.trello-worker` |
| TRELLO_BASE_BRANCH | Default `main` |
| TRELLO_CODEX_BIN | Executável; default `codex` |
| TRELLO_PUSH | `true` faz push normal da branch; default não faz push |

O ficheiro de exemplo contém apenas placeholders para estas variáveis. Não usar prefixo NEXT_PUBLIC em secrets. Configurar identidade Git (`user.name`, `user.email`) da conta daemon e acesso ao remoto `origin`. O runner aceita remotos GitHub HTTPS sem credenciais embutidas ou SSH. A branch é `codex/trello-<ID completo>`; nomes do card nunca entram em comandos shell. Branches existentes com sufixo também são descobertas; ambiguidades exigem intervenção. Não há force push, merge ou eliminação de branches implementados.

## Passos exatos no Trello

1. Criar uma conta bot com acesso apenas ao board de desenvolvimento. Restringir quem pode mover cards para Ready: essa ação autoriza execução de código.
2. Criar listas **Ready for Codex** e **Review**. Usar IDs das listas, não os nomes no código.
3. Em [Power-Up Admin](https://trello.com/power-ups/admin), criar/selecionar um Power-Up e gerar a API key. Obter o application secret correspondente. Usar o fluxo de token descrito em [Authorization](https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/), com permissões read/write e expiração adequada. Guardar key/token/secret em `.env.local`/secret manager.
4. Obter board ID pelo JSON do board/API. Com board e credenciais configurados, `npm run trello:admin -- lists` mostra nomes/IDs. Preencher os dois IDs.
5. Publicar o endpoint HTTPS ou usar um túnel HTTPS para `npm run dev`. Definir a URL pública exata em TRELLO_WEBHOOK_URL e ativar a automação nos dois processos. Verificar `curl -I https://SEU_HOST/api/webhooks/trello` → 200.
6. `npm run trello:admin -- register` cria o webhook de board ou reutiliza o existente com o mesmo callback/model. Guarda o ID apresentado. O Trello faz HEAD durante o registo. Ver [protocolo oficial](https://developer.atlassian.com/cloud/trello/guides/rest-api/webhooks/).
7. Iniciar `npm run trello:worker`. Criar um card pequeno com descrição, critérios de aceitação e checklist. Movê-lo para Ready.
8. Confirmar comentário Development started, branch, checkpoint e Ready for review; rever alterações e fazer o merge manualmente. Depois `npm run trello:admin -- done CARD_ID` marca DONE.

## Executar, testar e fazer deploy

```sh
npm ci
npm run dev
# Outro terminal, na raiz do repositório:
npm run trello:worker
# Processar no máximo um job elegível:
npm run trello:worker -- --once
npm run trello:admin -- status
npm test
npm run lint
npm run typecheck
npm run build
# Envia duas vezes um webhook assinado para um card real de teste em Ready:
npm run trello:admin -- smoke CARD_ID
```

O smoke enfileira trabalho real: usar apenas card de teste autorizado. A segunda entrega deve indicar queued=false. Testes automatizados usam PostgreSQL PGlite e APIs externas simuladas; não requerem Trello/Codex autenticado nem alteram boards.

Deployment: publicar a aplicação pelo alojamento Next.js que já usas (`npm ci && npm run build`, `npm start` num servidor Node). Aplicar migração, configurar secrets só no servidor, expor HTTPS e criar webhook. Executar o worker separadamente com systemd/launchd ou supervisor equivalente, cwd na raiz de um checkout dedicado, uma única instância por workspace, restart com atraso e volume persistente. Dar ao shutdown tempo para terminar a tarefa (o processo do agente tem timeout de 30 minutos; os checks têm timeouts individuais). SIGTERM/SIGINT param o consumo após a tarefa atual. Em crash abrupto, o supervisor relança e a verificação de processos evita retomar enquanto o agente anterior vive.

O runner usa a interface `prepare(job,card) → branch` e `run(job,card,onCheckpoint) → {ready,commit,completed,remaining,...}`. Outro adaptador pode implementar esta interface sem mudar o webhook/store. A invocação suportada é [Codex non-interactive](https://learn.chatgpt.com/docs/non-interactive-mode), via subprocesso e stdin, sem API inventada. Cada retoma inicia nova sessão reconstruída a partir do estado persistente.

## Segurança e operação

O agente recebe título, descrição, labels, checklists e 30 comentários recentes como dados não confiáveis. Usa sandbox workspace-write, sem user config e sem credenciais Trello/Supabase herdadas no ambiente. A conta dedicada deve ter CODEX_HOME sem plugins/MCP/hooks com privilégios desnecessários. Sandbox/prompt não substituem isolamento do sistema: o processo pode ler ficheiros acessíveis à conta, e os scripts npm/testes são código executável. Correr numa VM/container/conta dedicada, sem secrets de produção no HOME, sem mounts de outros projetos e com saída de rede restringida. Os checks externos do runner também devem correr nesse isolamento. A autenticação Git pode dar permissões de escrita; preferir execução sem push e aprovação humana. O scan de nomes de ficheiros sensíveis não é um scanner completo de secrets.

O worker instala dependências com `npm ci --ignore-scripts` antes do agente e das verificações finais. Projetos futuros que precisem de postinstall nativo requerem política explícita no runner. Este repo não tem essa necessidade identificada. O agente deve resolver falhas antes de devolver ready; falhas dos checks impostos pelo runner pausam a execução e a tentativa seguinte corrige. Build/testes dependentes de serviços podem exigir fixtures/configuração sem secrets de produção.

Logs JSON contêm evento, card, run e branch; erros de rede/subprocesso não são despejados. Reports e CODEX_CHECKPOINT podem conter especificação do card: proteger o volume. Há backoff exponencial (até uma hora), cinco tentativas máximas e FAILED para 401/403/404. Não há alerta externo, dashboard nem limpeza automática do histórico; monitorizar logs e `status`, conservar eventos enquanto necessários para deduplicação.

Para desativar: parar o daemon graciosamente e definir TRELLO_AUTOMATION_ENABLED=false no servidor e no daemon. Remover/desativar o webhook na API Trello se a pausa for longa (503 provoca retries e o Trello pode desativá-lo). Ao reativar, inspecionar o webhook e reenviar os cards cujo evento não chegou. Não existe polling de reconciliação de todos os cards: a retoma automática consulta os jobs PAUSED persistidos.

Recuperação manual:

```sh
npm run trello:admin -- status
# Corrigir credenciais/testes/posição do card, depois:
npm run trello:admin -- retry CARD_ID
# Apenas depois de confirmar que worker e todos os subprocessos antigos pararam:
npm run trello:admin -- recover CARD_ID --confirmed-stopped
npm run trello:worker -- --once
```

Nunca fazer recover só porque claimed_at é antigo. Para migração de host, parar processos antigos, copiar workspace/checkpoints, manter branch/remoto e recuperar explicitamente. Para locks corrompidos, confirmar processos parados antes de remover `worker.lock`/`worker.lock.recovery`. Não apagar clones para resolver falhas: inspecionar `git status`, `git log`, `git diff origin/main...HEAD` e CODEX_CHECKPOINT.md. Não usar reset --hard.

## Exemplo do ciclo

Card “Adicionar filtro por idade”, ID `0123456789abcdef01234567`, passa de Backlog para Ready. O evento cria READY; o worker reclama e prepara `codex/trello-0123456789abcdef01234567`. Codex implementa o filtro e faz um commit, mas encontra um limite durante testes. O checkpoint guarda commit, trabalho concluído e testes pendentes; fica PAUSED. Após backoff, outra execução lê o mesmo clone/branch/card e termina apenas o que falta. Testes, lint, typecheck e build passam. O worker guarda delivery_pending, publica Ready for review, move para Review e grava REVIEW. Se a API falhar nesse passo, só a entrega é repetida. O humano revê a branch (faz push/abre PR se TRELLO_PUSH não estiver ativo), aprova/mergeia manualmente e marca DONE. Repetir o webhook original não reinicia o card.

## Limites de entrega

A implementação deixa uma branch pronta para PR e pode fazer push normal; não cria PR automaticamente. Playwright continua disponível para tarefas relevantes, mas não é obrigatório em todas as execuções por exigir Supabase/browser configurados. A validação automatizada desta integração não substitui um smoke real após preencher credenciais e publicar o callback. Não foram configurados serviços externos, aplicadas migrações remotas, criados webhooks reais ou consumidas execuções Codex durante a implementação.

Validação neste ambiente: testes automatizados, lint e typecheck passam. O build de produção passou com `npm run build -- --webpack`; o Turbopack padrão encontrou `Operation not permitted` ao abrir uma porta interna do sandbox. O script build existente foi mantido. O runner acompanha alterações de CODEX_CHECKPOINT.md a cada 30 segundos, guarda checkpoints e comenta apenas quando há alterações, além dos resumos de início/pausa/revisão.
