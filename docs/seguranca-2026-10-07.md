# Revisão de segurança e erros — 7 de outubro de 2026

## Âmbito

Revisão do código local: autenticação e MFA, Server Actions, endpoints HTTP, redirecionamentos, clientes privilegiados, caches públicos, documentos/Storage, importação/exportação, migrações, permissões RLS e funções SECURITY DEFINER. As migrações foram executadas integralmente em PostgreSQL local em memória e numa instância Supabase isolada. Não foram alteradas bases remotas nem publicado código.

## Problemas confirmados e corrigidos

| Problema | Evidência e correção |
| --- | --- |
| Acesso sem MFA por propriedade ou equipa de um canil | As políticas RLS bloqueavam administradores com `aal1`, mas `my_shelters` retornava dados e as funções SECURITY DEFINER aceitavam propriedade/equipa através de `shelter_access`. Estas funções agora exigem `admin_mfa_ok`; o acesso a documentos também verifica MFA. As tabelas criadas depois da migração MFA receberam a política restritiva em falta. Teste reproduziu a falha antes da correção. |
| Contorno do limite de três anúncios particulares | Arquivar um anúncio, inserir outro e restaurar o primeiro permitia quatro ativos. Um trigger verifica inserções e reativações e serializa a verificação por canil para impedir inserções concorrentes. Teste reproduziu a falha antes da correção. |
| Candidaturas de particulares sem email para o responsável | A criação da candidatura procurava apenas `canis.email_contacto`, que permanece vazio para proteger contactos privados de particulares. A fila transacional consulta agora o email privado do proprietário quando `tipo='particular'`. O endereço não passa para o catálogo público. |
| Modelo CSV inválido | O ficheiro de exemplo usava `cão`, mas o importador exige `cao`. Corrigido e coberto por teste que importa o próprio modelo. |
| URL de recuperação dependente de cabeçalhos do pedido | O destino de recuperação era construído a partir de Origin/Host. Passa a usar a origem configurada da aplicação, evitando destinos controlados pelo pedido. A recuperação completa é validada no browser com a caixa de correio local. |
| Ausência de proteção contra enquadramento e deteção de conteúdo | Acrescentados `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, restrições a `base-uri` e `object-src` e política de referrer. Desativado o cabeçalho de identificação do framework. Esta CSP é parcial e não restringe scripts. |
| Dependências com avisos conhecidos | Atualizações compatíveis instaladas e versões fixadas no lockfile. Next.js atualizado de 16.3.4 para 16.4.0. A ferramenta CLI shadcn foi movida para desenvolvimento. Auditoria de produção final: zero avisos. |

## Dependências e risco residual

A auditoria inicial reportou 16 entradas (2 críticas, 12 altas e 2 moderadas). Contagens incluem dependências afetadas por propagação do mesmo problema; não representam 16 explorações distintas da aplicação.

A versão antiga do Next.js estava no intervalo do [aviso de ImageResponse](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j). Não foi encontrado uso de `next/og`/`ImageResponse` no código da aplicação; não foi demonstrada exploração desta falha na FYA. Também foram atualizadas dependências transitivas, incluindo Sharp, SDK MCP, proxy-addr e source-map-js.

A auditoria completa continua a reportar 9 entradas de gravidade alta exclusivamente em desenvolvimento, derivadas da cadeia `braces`/`micromatch`/`fast-glob` usada por ESLint e shadcn/ts-morph. O npm sugere versões antigas incompatíveis como solução e não disponibiliza uma atualização compatível que elimine o problema raiz. Não aplicar `npm audit fix --force`. Evitar fornecer padrões glob não confiáveis a estas ferramentas; manter acompanhamento dos avisos e atualizar quando existir correção compatível. [Aviso de braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

## Validação

- 60 testes locais passaram, incluindo isolamento entre utilizadores/canis, papéis, transições de adoção, documentos, tarefas, donativos, convites e regressões desta revisão.
- 11 testes de integração passaram em Chromium e Supabase real isolado: registo e confirmação de email, login/logout, recuperação de palavra-passe, MFA administrativo, fotos, favoritos, candidatura, chat Realtime/reconexão, visitas, adoção concluída, upload privado e revogação de dossier, equipas, importação e respostas a candidaturas.
- Os testes novos confirmaram na API real que administradores sem MFA não obtêm dados pelas RPCs de canil e que duas inserções concorrentes com dois anúncios ativos produzem apenas um terceiro anúncio.
- Os cabeçalhos de segurança foram verificados em respostas HTTP reais.
- Análise ESLint e verificação TypeScript passaram; os tipos da base foram regenerados sem alterações ao ficheiro gerado.
- Compilação de produção passou com `npm run build -- --webpack`. O Turbopack falhou no ambiente de execução ao tentar abrir uma porta local (`Operation not permitted`); o comando padrão com Turbopack não ficou validado. A primeira tentativa com Webpack coincidiu com a regeneração de tipos pelos testes de browser; repetida depois dos testes, passou.
- Auditoria npm de produção: 0 avisos. Auditoria completa: 9 avisos altos em desenvolvimento.

## Ativação

Aplicar `supabase/migrations/202610070001_security_review.sql`, depois das migrações anteriores, primeiro numa cópia da base e depois na base de destino antes de publicar esta versão. A migração é transacional e não elimina anúncios existentes que já ultrapassem o limite. Sem aplicação na base de destino, as correções SQL não ficam ativas nesse ambiente.

Configurar `NEXT_PUBLIC_APP_URL` com a origem correta antes de publicar; os links de recuperação agora dependem dessa configuração (ou do domínio de produção fornecido pela Vercel). Publicar usando o lockfile atualizado.

## Limites

Esta revisão não certifica ausência de vulnerabilidades. Não foram realizados testes de intrusão no alojamento público, auditoria de histórico de segredos, testes de carga ou verificação dos controlos do fornecedor em produção. Captcha, MFA alojado, alertas e envio real de emails continuam dependentes da configuração de produção. Os testes locais usam emails fictícios e uma caixa de correio de teste; não enviam mensagens a pessoas.
