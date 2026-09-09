# FYA — análise técnica e plano de modernização

Data: 7 de setembro de 2026.

## Conclusão

Modernizar de forma incremental, preservando Next.js, React, TypeScript, Tailwind e Supabase. O maior benefício está na segurança das permissões, na consistência dos dados e na qualidade das interações. Trocar de framework não resolve os problemas identificados.

Esta é uma análise transversal do repositório e dos fluxos principais, com inspeção estática de páginas, componentes, ações, acesso a dados e SQL. Não é uma certificação de todas as linhas nem uma auditoria da instância Supabase em produção. A avaliação visual, os testes com contas reais e as medições de desempenho ficam pendentes de um ambiente funcional.

## Base existente

- Next.js 16.2.4 com App Router, Server Components e Server Actions; React 19.2.4; TypeScript; Tailwind 4; Radix/shadcn; ícones Lucide.
- Supabase para autenticação, PostgreSQL, Storage e Realtime; integração de email com Resend.
- Áreas de adotante, canil e administração; catálogo, favoritos, candidaturas, mensagens, visitas, avaliações, notificações e páginas PT/EN.
- Há fundamentos úteis: paginação no catálogo, imagens com Next Image, carregamento com Suspense, consultas independentes em paralelo e algumas verificações de propriedade nas ações.
- Não foram encontrados testes automatizados ou configuração de CI no inventário. O README é o template inicial e falta um exemplo de configuração de ambiente.

## Problemas prioritários

### P0 — autorização na base de dados

1. **Registo pode atribuir administrador a partir de dados do utilizador.** `supabase/profiles.sql` e `supabase/canil_fixes.sql` aceitam `admin` em `raw_user_meta_data.role`. A ação de registo da aplicação limita as opções, mas isso não protege o endpoint direto do Supabase. Remover essa possibilidade dos triggers e atribuir privilégios apenas por operações administrativas confiáveis. `lib/auth/role.ts` também deve deixar de usar metadados editáveis como fallback de autorização.
2. **Atualizações próprias não limitam colunas sensíveis.** A policy de atualização de `profiles` verifica o ID, mas não impede alterações de `role`; as policies de `canis` permitem ao proprietário atualizar a linha sem proteger `verificado`. Confirmar os grants efetivos e restringir as colunas ou usar operações controladas. A RLS protege linhas; não substitui a proteção de campos administrativos.
3. **Adotantes podem atualizar o próprio pedido sem proteger o estado.** `supabase/adoption_requests_messages.sql` permite atualizar a linha própria; combinado com `adoption_complete_cycle.sql`, mudar o estado para `concluido` pode acionar o trigger privilegiado que marca o animal como adotado. Proteger estados, relações e notas internas na base de dados, e testar chamadas diretas à API.
4. **Policies de profiles consultam profiles.** As policies administrativas fazem subconsultas à própria tabela protegida, com risco de recursão RLS e falhas de leitura. Validar numa base isolada e implementar uma verificação de privilégios sem recursão e com permissões restritas.

Estas conclusões descrevem os scripts presentes. A exploração e os efeitos concretos dependem dos scripts e grants instalados no servidor; não foram executadas tentativas contra produção.

Referência: a [documentação do Supabase sobre RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) esclarece que os metadados do utilizador são editáveis e não devem sustentar autorização.

### P1 — funcionamento, integridade e confiança

5. **Configuração do cliente Supabase:** `lib/supabase/config.ts` usa `process.env[name]`. O Next.js não incorpora consultas dinâmicas de variáveis no bundle do browser. Usar acessos literais às duas variáveis públicas e validar o chat após o build. Ver [documentação de variáveis de ambiente](https://nextjs.org/docs/pages/guides/environment-variables).
6. **Candidatura sem transação:** `app/adoption/actions.ts` grava pedido, conversa e mensagem em operações separadas. Uma falha intermédia deixa um processo incompleto. Criar uma operação transacional no PostgreSQL, com validação de disponibilidade e proteção contra submissões repetidas. O upsert atual também pode devolver uma candidatura em entrevista ao estado pendente.
7. **Transições de estado pouco controladas:** a ação aceita qualquer valor da lista sem verificar a transição anterior. Definir transições legais, garantir uma única adoção concluída por animal e tratar outras candidaturas abertas de forma consistente.
8. **Informação não suportada pelos dados:** o detalhe apresenta vacinação em dia, peso deduzido do porte, taxa fixa de 180€/$250 e serviços incluídos. A página inicial afirma 5.000+ famílias e proximidade sem cálculo correspondente; a lista de urgentes procura os mais recentes. Exibir apenas informação confirmada ou indicar explicitamente que é desconhecida.
9. **Fotografias de outros animais:** `imageForAnimal` escolhe imagens de stock como fallback. Usar um placeholder neutro de fotografia indisponível; um animal real não deve ser apresentado com a fotografia de outro.
10. **Erros confundidos com ausência de dados:** vários helpers devolvem `[]` ou zero perante erros. Separar sucesso vazio de indisponibilidade e disponibilizar nova tentativa; métricas não devem parecer zero por falha de consulta.
11. **Regras administrativas incompletamente aplicadas:** os filtros configuráveis são lidos pelo painel de administração, mas o catálogo usa opções fixas. A verificação para publicar existe em `createAnimal`, mas as policies SQL de inserção não impõem essa condição. Unificar as regras também na base de dados.
12. **Bootstrap da base pouco reproduzível:** existem scripts soltos, substituições de funções e criação de tabelas base dentro de `seed_demo_data.sql`. A ordem documentada não constitui uma migração completa reproduzível. Separar schema, migrações ordenadas e dados de demonstração.

### P2 — experiência e manutenção

13. **Favoritos e chat usam redirects após envio.** Atualizar a interface local com estado pendente, confirmação, rollback e mensagens de erro junto ao controlo. No chat, recuperar mensagens após reconexão; o estado inicial não é sincronizado com novas props da mesma conversa e não existe recuperação explícita de eventos perdidos.
14. **Histórico sem paginação explícita:** mensagens, pedidos e conversas são consultados sem limites próprios. Carregar as mensagens mais recentes e paginar o histórico, evitando depender do limite implícito da API.
15. **Paginação inconsistente fora do intervalo:** o catálogo consulta `currentPage` antes de limitar a página apresentada. Uma URL com página excessiva pode mostrar uma lista vazia e um indicador de página válida. Canonicalizar a URL ou repetir a consulta na página correta.
16. **Acessibilidade e idioma:** `app/layout.tsx` fixa `lang="en"` também em PT; o drawer mobile não implementa gestão de foco/Escape de um diálogo. Usar o componente acessível já disponível no ecossistema e rever labels dos selects, foco e navegação por teclado.
17. **Tipografia:** `app/globals.css` referencia `--font-sans` em si própria, enquanto a fonte carregada define `--font-geist-sans`. Corrigir a associação e verificar a fonte calculada no browser.
18. **Duplicação:** páginas extensas, classes de controlos repetidas, strings locais misturadas com dicionários e tipos Supabase manuais. Consolidar componentes e gerar tipos a partir do schema validado.
19. **Email no caminho da resposta:** notificações são aguardadas durante ações e não existe fila persistente de reenvio. Usar uma outbox transacional com tentativas limitadas e estado de entrega. Rever também o escape de conteúdo interpolado no HTML.

## Arquitetura proposta

Manter um monólito modular: páginas e componentes de apresentação → ações que autenticam e validam → serviços por domínio → consultas tipadas e operações transacionais → PostgreSQL com RLS. Evitar um backend separado sem uma necessidade concreta.

Organizar gradualmente por domínios: identidade, catálogo, candidaturas, mensagens, abrigos e administração. Centralizar a resolução de permissões, as regras de transição e os resultados de erro. Preservar renderização no servidor e introduzir componentes de cliente apenas para interações que beneficiam disso.

Consolidar um sistema visual com os componentes Radix/shadcn existentes: botões, campos, selects, diálogos, cartões de animais, estados vazios, skeletons e tabelas. Manter uma direção visual acolhedora, com fotografia real, hierarquia clara e menos ruído nos painéis. Validar desktop e telemóvel em fluxos completos antes de generalizar o redesign.

Atualizar patches e dependências num trabalho próprio, após verificar notas de versão e avisos de segurança. Este relatório não certifica que as versões instaladas são as últimas ou estão isentas de vulnerabilidades. Novas bibliotecas devem resolver lacunas concretas; não adicionar gestores globais de estado ou animação por defeito.

## Evolução funcional sugerida

| Área | Melhoria | Critério de aceitação |
| --- | --- | --- |
| Descoberta | Localização, idade, compatibilidade e filtros persistentes | URL partilhável reproduz os resultados; voltar do detalhe preserva filtros e página |
| Match | Recomendações explicadas com dados reais | Mostra razões e informação em falta; substituir a regra simplista que associa pouco tempo a porte pequeno |
| Candidatura | Formulário por etapas, rascunho e revisão | Retomar sem perder respostas; submissão repetida não duplica o processo |
| Acompanhamento | Linha temporal e próximo passo | Utilizador sabe o estado, a ação esperada e a visita marcada |
| Canil | Fila de pedidos e agenda integrada | Priorizar pendentes, rever respostas e marcar visitas com menos navegação |
| Mensagens | Confirmação de envio e recuperação de ligação | Envio falhado fica visível; reconexão recupera mensagens em falta sem duplicar |
| Administração | Verificação, auditoria de alterações e métricas reais | Operações privilegiadas são rastreáveis e não podem ser feitas pelo proprietário |

## Ordem de execução

1. **Fundação:** reproduzir schema num ambiente isolado, corrigir RLS e configuração do cliente, gerar tipos e testar a matriz de permissões com dois adotantes, dois canis e um administrador.
2. **Integridade:** operação transacional de candidatura, transições protegidas, dados reais no detalhe, migrações e estados de erro.
3. **Primeiro fluxo visual completo:** catálogo → detalhe → candidatura → acompanhamento, com componentes comuns e validação mobile/teclado.
4. **Fluidez operacional:** favoritos, chat, paginação, agenda e painel do canil; medir antes e depois com o mesmo volume de dados.
5. **Evolução:** match explicado, pesquisa guardada, notificações relevantes e métricas do percurso de adoção.

A duração depende do schema efetivo, dados existentes, ambiente de publicação e direção visual. Não há fundamento suficiente para prometer um prazo ou percentagem de ganho.

## Validação desta análise

- Instalação pelo lockfile: `npm ci --ignore-scripts --no-audit --no-fund` concluída.
- Build: tentado; bloqueado pela ligação ao Google Fonts ao obter Geist e Geist Mono. Não constitui prova de erro de compilação no código nem de build aprovado.
- TypeScript: `npx tsc --noEmit --incremental false` concluído sem erros.
- `npm run lint` falhou porque inclui também ficheiros gerados de worktrees preexistentes em `.claude/worktrees`. É necessário excluir esses diretórios da configuração; o resultado global não representa apenas o código desta aplicação.
- Lint limitado ao código principal: `npx eslint app components lib proxy.ts next.config.ts` concluído sem erros ou avisos.
- Não houve alterações funcionais, migrações executadas ou publicações. Não foram medidos Core Web Vitals nem testados fluxos autenticados no browser.

Para fechar a auditoria de execução: ambiente Supabase de desenvolvimento com schema efetivo e contas de teste, validação visual das rotas PT/EN, testes das permissões pela API, percurso completo de adoção e medição de desempenho em telemóvel. Metas propostas, não resultados: LCP até 2,5 s, INP até 200 ms e CLS até 0,1 no percentil 75.
