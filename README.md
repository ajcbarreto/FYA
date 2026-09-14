# FYA · Found Your Animal

Plataforma de adoção com catálogo PT/EN, candidaturas, mensagens, visitas e áreas de adotante, abrigo e administração. Next.js 16 / React 19 / TypeScript / Tailwind 4 / Supabase.

## Desenvolvimento

Requer Node.js 24 e npm. Instala as dependências com `npm ci`, copia `.env.example` para `.env.local` e configura as variáveis do teu projeto Supabase de desenvolvimento. `npm run dev` inicia a aplicação em `http://localhost:3000`.

Sem credenciais, a página inicial e a estrutura do catálogo podem ser vistas, mas os dados e os fluxos autenticados não estão disponíveis. Não existe fallback silencioso para animais fictícios.

A fonte é local ao sistema, pelo que o build não depende do Google Fonts. A fotografia editorial da página inicial é identificada como ilustrativa; animais sem fotografia têm um placeholder neutro.

## Base de dados

Os scripts na raiz de `supabase/` são históricos. A instalação atual usa exclusivamente as migrações ordenadas em `supabase/migrations/`.

### Base nova de desenvolvimento

Aplicar `202609070000_baseline.sql` e depois `202609070001_hardening.sql` na mesma instância Supabase, pela ordem indicada. Não criar utilizadores nem expor a base entre as duas migrações: a segunda aplica as restrições finais. O schema `auth`, o Storage e os papéis `anon`, `authenticated` e `service_role` são fornecidos pelo Supabase.

Depois, criar contas de teste pelo Auth. Contas públicas nunca podem criar administradores; um administrador inicial deve ser provisionado pela administração da base. Os seeds de demonstração são opcionais e só devem ser usados em bases descartáveis. Não são parte das migrações.

### Base existente

Não executar a baseline sobre uma base existente. Primeiro comparar o schema instalado com a baseline e correr `supabase/preflight.sql`. Resolver manualmente incoerências, duplicados e administradores inesperados. Confirmar que todos os scripts históricos representados na baseline estão instalados; se faltar algum objeto, preparar uma migração de adaptação antes do hardening.

Só depois aplicar `202609070001_hardening.sql`, inicialmente numa cópia de desenvolvimento. A migração é transacional e falha perante adoções concluídas duplicadas; não elimina dados para resolver conflitos. Se usares a CLI Supabase, registar a baseline como já aplicada apenas depois de confirmar equivalência do schema.

Publicar o código em conjunto com a migração: as novas candidaturas dependem das RPCs `submit_adoption` e `transition_adoption`. O rollback da aplicação não deve reabrir as permissões antigas.

### Tipos e testes

- `npm run db:types` gera os tipos TypeScript a partir das migrações executadas em PostgreSQL local via PGlite.
- `npm test` testa permissões, transições, idempotência, validação e redirecionamentos sem credenciais externas.
- Os testes simulam os objetos Auth/Storage geridos pelo Supabase. Não substituem testes da API, cookies, upload e Realtime numa instância Supabase real.

## Emails

`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` e `EMAIL_FROM` são exclusivamente do servidor. Nunca usar o prefixo `NEXT_PUBLIC_` nestas chaves.

A candidatura e a mudança de estado criam jobs na `email_outbox` na mesma transação. A aplicação tenta entregá-los depois da resposta HTTP. Para recuperar falhas mesmo sem tráfego, configurar no ambiente de alojamento uma chamada periódica a `GET /api/jobs/email` com `Authorization: Bearer <CRON_SECRET>` (por exemplo, a cada 10 minutos). O endpoint recusa pedidos sem o segredo configurado.

O worker reclama até 20 jobs, bloqueia entregas concorrentes, usa uma chave de idempotência por email e limita a cinco tentativas. Inspecionar jobs com `sent_at is null and attempts >= 5` para intervenção manual. O sistema de notificações dentro da aplicação funciona independentemente do email.

## Verificação

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

A CI executa estes comandos e verifica se os tipos gerados estão sincronizados. Depois das migrações, validar com dois adotantes, dois abrigos e um administrador: isolamento de dados, candidatura repetida, mudanças de estado, visitas, fotos, favoritos e reconexão do chat.

Detalhes das alterações e limites da validação estão em `docs/modernizacao-entrega.md`.
