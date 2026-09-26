# Ajuda, entrada de canis e divulgação — 25/09/2026

## Implementado

| Área | Acesso | Comportamento |
| --- | --- | --- |
| Centro de ajuda | `/pt/ajuda` e `/en/ajuda` | Cinco guias completos em cada idioma, pesquisa sem distinção de acentos, perguntas frequentes e atalhos para as funcionalidades. |
| Ajuda contextual | Registos, candidaturas, equipa, agenda e operação | Ligação direta para o guia relevante. |
| Primeiros passos | `/pt/canil/primeiros-passos` | Progresso calculado a partir do perfil, verificação, animais e publicação; convite de equipa opcional. Não é uma checklist que se marca manualmente. |
| Cronologia | Registos → Ver cronologia | Histórico privado da equipa, paginado, incluindo ficha, documentos, partilhas, estados, candidaturas, visitas, tarefas e checklist de entrega. |
| Impressão e QR | Ficha pública ou Registos → Ficha imprimível e QR | Impressão pelo browser, incluindo guardar PDF; QR gerado localmente e sem serviço externo. Usa sempre o acesso anónimo, mesmo quando quem imprime é o dono do canil. |
| Captação de piloto | `/pt/para-canis` e `/en/para-canis` | Apresentação, guias de demonstração e formulário de contacto sem exigir conta. Não cria subscrição nem confirma participação. |
| Gestão dos contactos | `/pt/admin/pilotos` | Administração pode consultar, registar notas e marcar novo/contactado/aceite/fechado. Não envia mensagens externas. |
| Comunicação | `docs/comunicacao/` e `public/media-kit/` | Biografias, seis propostas de publicação para duas semanas, sete artes em SVG/PNG e cinco guiões de vídeo. |

## Histórico e proteção de dados

A cronologia começa a guardar alterações detalhadas quando a migração é aplicada. Para os animais já existentes, regista a data original de criação e o início do histórico detalhado. Não reconstrói visitas, documentos removidos ou outros acontecimentos anteriores. Os eventos não podem ser alterados pela equipa através da API. Não copiam notas clínicas/internas nem conteúdo dos documentos; mostram o tipo de evento e metadados mínimos, como título do documento e horário de visita.

A ficha imprimível usa apenas dados públicos atuais. Animais não publicados/arquivados ficam indisponíveis nesta página, mesmo para o proprietário. A impressão física ou um PDF já descarregado não podem ser revogados; o QR conduz à ficha pública com a disponibilidade atual. O endereço vem de `NEXT_PUBLIC_APP_URL`. Enquanto estiver configurado localhost, o QR é apenas para demonstração local.

Os contactos de piloto ficam numa tabela protegida e são consultados apenas por administradores. A submissão passa pelo servidor e requer `SUPABASE_SERVICE_ROLE_KEY`. A função de inserção não pode ser chamada diretamente pelos papéis público/autenticado. A aceitação do uso dos dados para responder ao contacto é obrigatória; a versão dessa informação fica registada. Não se subscreve marketing nem se envia email automaticamente.

Há campo anti-bot e limites transacionais de três pedidos por email/dia e cinquenta por hora no total. Não são uma proteção completa contra abuso distribuído. Antes de campanhas públicas, configurar proteção adequada no alojamento, retenção, contactos e revisão da informação de privacidade, que permanecem pendentes. A administração tem de consultar a caixa de pedidos e assumir o acompanhamento.

## Publicação

Aplicar `202609240006_guidance_timeline_pilots.sql` depois das migrações anteriores e antes do código, primeiro numa cópia de teste. Inclui tabelas, permissões, funções, triggers e o início do histórico dos animais existentes. A base remota não foi alterada durante esta entrega.

Foi acrescentada a dependência `qrcode` para gerar QR localmente. `jsqr` é usado apenas nos testes para confirmar a descodificação. Usar `npm ci` na instalação.

## Materiais e vídeos

- [Kit de comunicação](comunicacao/kit-lancamento.md): textos, calendário, artes e preparação das contas.
- [Guiões dos cinco manuais](comunicacao/manuais-video.md): cenas, narração, tempos e pré-condições.
- `public/media-kit/`: avatar, capas Facebook/YouTube e quatro publicações, em SVG e PNG.

As contas sociais não foram criadas e nada foi publicado. Os vídeos ainda não foram gravados: o centro de ajuda apresenta os guias escritos e indica que os vídeos estão em preparação. Para ativar um vídeo, configurar `video.src` e `video.captions` no guia e idioma correspondente em `lib/help/guides.ts`, depois da gravação e revisão.

Gerar as artes com `npm run media:generate`; exportar para PNG com `npm run media:export`, com Chromium do Playwright instalado. O exportador verifica que o texto cabe nas telas. Rever também o recorte de cada plataforma na conta final.

## Validação

Resultado local em 25/09: 34 testes de lógica/base de dados aprovados; os dez percursos de browser validados (nove na suite completa e o teste de impressão repetido após ajustar a expectativa de HTTP ao streaming do Next.js). Os dois novos percursos foram depois repetidos juntos e passaram, incluindo capturas móveis. TypeScript, lint e build de produção com Webpack aprovados; tipos gerados sincronizados. O PDF de demonstração ocupa uma página A4 e o QR foi descodificado a partir da imagem apresentada no browser. As sete artes foram exportadas para PNG, com verificação de limites do texto.

Os testes automatizados cobrem pesquisa PT/EN, descodificação do QR, eventos e isolamento da cronologia, bloqueio de escrita de eventos, submissão de contactos, limites e permissões administrativas. O browser verifica também primeiros passos, impressão em A4/PDF, ausência de dados privados, acesso negado após retirar publicação, formulário de piloto em telemóvel e acompanhamento administrativo. A validação é local; não demonstra envio externo de emails nem prontidão de produção.
