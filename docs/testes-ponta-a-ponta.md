# Testes reais da FYA

Estado: roteiro preparado; execução autenticada pendente de uma instância Supabase de desenvolvimento. Os testes PGlite existentes não validam cookies, Auth, Storage ou Realtime reais.

## Preparação

1. Usar uma base de desenvolvimento descartável, sem dados pessoais reais. Seguir o README para aplicar as migrações numa base nova ou adaptar uma base existente.
2. Configurar `.env.local` a partir de `.env.example`, com URL e chave pública dessa instância. Nunca colocar a chave service role numa variável pública ou no browser.
3. Usar sempre a mesma origem, por exemplo `http://localhost:3000`, incluindo `NEXT_PUBLIC_APP_URL` e as URLs permitidas de autenticação. Reiniciar a aplicação depois de alterar variáveis; reconstruir antes de usar `npm run start`.
4. Criar dois adotantes, dois abrigos e um administrador de teste. Criar as contas pelos fluxos Auth; provisionar o administrador pela administração da base, conforme o README. Usar endereços controlados pela equipa para confirmação e recuperação.
5. Abrir sessões de browser isoladas para o adotante e o abrigo. Duas tabs da mesma sessão partilham cookies e não representam dois utilizadores independentes.
6. Criar animais fictícios identificados como teste, com e sem fotografia. Verificar um dos abrigos através do administrador.

## Cenários e critérios de aceitação

| Área | Ação | Resultado esperado |
| --- | --- | --- |
| Registo | Registar adotante e abrigo, confirmar email se exigido | Perfil e área privada corretos; nunca obter papel de administrador pelo registo |
| Sessão | Login válido/inválido, recarregar, sair e voltar a URL privada | Erro claro para credenciais inválidas; sessão preservada ao recarregar; acesso bloqueado depois de sair |
| Recuperação | Pedir recuperação e definir nova palavra-passe | Link válido regressa à aplicação e a nova palavra-passe funciona |
| Permissões | Adotante abre URL de admin ou abrigo; abrigo B tenta aceder a dados do A | Acesso recusado e nenhum dado privado exposto |
| Animais | Abrigo cria, edita e carrega foto | Dados e imagem corretos no catálogo; erro claro para ficheiro inválido |
| Favoritos | Guardar/remover, recarregar e entrar noutra conta | Estado persistente e isolado por conta |
| Candidatura | Preencher etapas, sair/voltar, enviar e repetir envio | Rascunho recuperado; uma única candidatura ativa e conversa |
| Chat | Adotante e abrigo enviam mensagens em sessões separadas | Mensagens chegam sem recarregamento manual e pertencem à conversa certa |
| Falha do chat | Perder ligação, tentar enviar, recuperar e repetir | Texto preservado, erro visível, recuperação sem mensagens duplicadas |
| Histórico | Abrir conversa com mais de 50 mensagens e carregar anteriores | Histórico completo, ordenado e sem saltos inesperados de scroll |
| Isolamento do chat | Outro adotante/abrigo tenta abrir a conversa | Sem leitura ou envio não autorizado |
| Visitas | Agendar, confirmar e tentar concluir visita futura | Estados válidos aceites; conclusão futura recusada |
| Adoção | Dois adotantes candidatam-se; abrigo conclui uma adoção pelo fluxo permitido | Animal adotado, outras candidaturas fechadas e visitas pendentes canceladas |
| Notificações | Criar candidatura e mudar estado | Notificação apenas para destinatários previstos; leitura persistente |
| Email | Com serviço configurado, disparar evento e provocar falha controlada de entrega | Job persistido, entregue ou disponível para retry; sem entrega a terceiros reais |
| Mobile/PT/EN | Repetir login, candidatura e chat em ecrã estreito e nos dois idiomas | Campos e ações utilizáveis, sem overflow; textos e idioma coerentes |

## Evidência a guardar

Para cada cenário, registar data, versão do código, conta de teste, passos, resultado esperado/observado e estado (passou/falhou/bloqueado). Guardar erros relevantes sem tokens, passwords ou dados pessoais. Não considerar um cenário aprovado apenas porque a página abriu ou o teste SQL passou.

## Prioridade depois desta execução

1. Corrigir os defeitos encontrados nos fluxos reais antes de acrescentar funcionalidades.
2. Automatizar os percursos de login, candidatura e chat em browser, com contas e dados isolados por execução.
3. Validar acessibilidade por teclado e desempenho com dados representativos; medir antes de otimizar.
4. Ativar e verificar entrega de email, recuperação de jobs e observabilidade de erros no alojamento.
5. Avaliar pesquisa global de conversas: atualmente a pesquisa está limitada à página apresentada.
