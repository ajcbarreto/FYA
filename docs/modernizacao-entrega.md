# Modernização FYA — entrega local

Atualizado em 8 de setembro de 2026.

## Implementado

- Nova identidade visual: verde profundo, fundo claro, títulos editoriais, cartões consistentes, navegação simplificada, novo rodapé e página inicial. Tratamento comum de formulários e cabeçalhos das áreas privadas.
- Catálogo com localização, idade e compatibilidades observadas pelo abrigo; opções ligadas à configuração administrativa e validadas por valores canónicos. Paginação fora do intervalo corrigida; retorno do detalhe preserva a pesquisa.
- Detalhe redesenhado, sem vacinação, peso, taxa, horário ou certificação inventados. Fotografias em falta têm placeholder neutro. O perfil do proprietário encaminha para o mesmo perfil público real.
- Favoritos com feedback imediato, estado pendente e recuperação de erros, sem redirect após guardar.
- Candidatura em três etapas, rascunho por conta/animal na sessão do browser por até 24 horas, revisão das respostas e erro junto ao formulário. A gravação de pedido, conversa, mensagem e job de email é transacional e não duplica candidaturas ativas em tentativas repetidas.
- Linha de progresso e próximo passo nas candidaturas. O painel do abrigo apresenta apenas transições válidas. Pedidos e conversas paginados; pesquisa de conversas identificada como pesquisa na página atual.
- Chat sem redirect ao enviar, com confirmação, preservação do texto em falha, IDs de mensagem reutilizados ao repetir envio, recuperação de ligação, histórico paginado e scroll que respeita a leitura de mensagens anteriores.
- Edição do nome da conta e acesso ao fluxo de recuperação de palavra-passe.
- Menu mobile com diálogo Radix, foco gerido e Escape; idioma do documento correto no primeiro carregamento e nas navegações PT/EN; link para saltar para o conteúdo; respeito por movimento reduzido.
- Falhas de dados críticas deixaram de ser apresentadas como listas vazias ou métricas zero; páginas têm recuperação de erro.
- Configuração Supabase do browser corrigida para acessos literais às variáveis públicas. Renovação de sessão nas rotas localizadas e preservação dos cookies nos redirects. Autorização sem fallback em metadados editáveis.
- Migração de segurança: proteção dos campos de privilégio/verificação; policies sem recursão em profiles; escritas de candidaturas via RPC; relações e transições protegidas; isolamento de visitas, mensagens, moderação e uploads; uma adoção concluída por animal; fecho das restantes candidaturas; auditoria de alterações.
- Emails em outbox persistente, entrega depois da resposta HTTP, endpoint protegido para novas tentativas, limite de tentativas e idempotência. Conteúdo dinâmico escapado nos emails.
- Migrações ordenadas, preflight de leitura para bases existentes, geração reproduzível de tipos, clientes Supabase tipados e CI de lint, tipos, testes e build.
- Next.js / eslint-config-next atualizados para 16.3.4; atualizações compatíveis de dependências. A fonte usa a pilha do sistema e não exige Google Fonts no build.

## Verificações

- Lint e TypeScript executados sem erros antes da compilação final.
- Testes locais em PostgreSQL/PGlite: registo sem privilégio de admin, proteção de role/verificação, isolamento entre adotantes e abrigos, RPC idempotente, estados legais, visitas, mensagens, moderação, conclusão da adoção, fecho de outras candidaturas, outbox e auditoria.
- Testes de validação de respostas, configuração de filtros e redirects locais.
- Build de produção executado; resultado final confirmado na resposta de entrega.
- `npm audit fix`: zero vulnerabilidades conhecidas no resultado da auditoria no momento da execução. Isto não é uma garantia geral de ausência de vulnerabilidades.
- Inspeção visual da página inicial em desktop e a 390×844; catálogo mobile; teste de abertura/Escape/retorno do foco do menu e ausência de overflow horizontal na página inicial. Não foram medidos Core Web Vitals.

## Limites e ativação

Não foram encontradas credenciais do Supabase no ambiente deste checkout. Não foram aplicadas migrações, alterados dados de produção, configurados serviços externos ou publicada a aplicação. Os testes usam PostgreSQL local com substitutos dos objetos Auth/Storage geridos pelo Supabase; não são testes do serviço de autenticação, Storage e Realtime reais.

Para ativar os fluxos, configurar `.env.local`, comparar o schema existente, executar `supabase/preflight.sql` e aplicar apenas a migração de hardening se a baseline já estiver representada. Seguir as instruções separadas no README para uma base nova. Código e migração devem ser publicados em conjunto.

A entrega de email requer as variáveis do servidor e, para tentativas autónomas sem tráfego, o agendamento do endpoint no alojamento. Confirmar os resultados com contas de teste reais, incluindo fotos, cookies, rascunho, envio/reconexão do chat e uma adoção completa, antes de disponibilizar as alterações a utilizadores.
