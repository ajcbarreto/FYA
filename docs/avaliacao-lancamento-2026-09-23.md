# FYA — avaliação de produto e arquitetura para lançamento

Data: 23 de setembro de 2026. Perspetiva: Product Owner e arquitetura.

> Avaliação histórica. A decisão posterior do proprietário exclui devoluções e episódios de readoção. As recomendações abaixo sobre esse tema não fazem parte do âmbito aprovado. Consultar [a entrega de 24/09](entrega-centro-registos.md) para o estado atual, validação e pendências.

## Decisão proposta

A FYA tem uma base funcional de intermediação de adoções. Ainda não há evidência suficiente para recomendar um lançamento público alargado ou posicioná-la como uma solução completa de gestão de canis. Recomendo preparar um piloto assistido, corrigir os bloqueios abaixo e demonstrar redução de trabalho administrativo antes de investir em aquisição em escala.

Proposta de valor a validar: **ajudar as equipas dos canis a gerir cada animal e cada adoção num único lugar, com menos trabalho e acompanhamento até à integração na família.**

Assumo Portugal como primeiro mercado, pela linguagem e pelo contexto do projeto. Segmento inicial sugerido: associações e canis com várias pessoas a acompanhar adoções e processos hoje dispersos por folhas de cálculo e mensagens. É uma hipótese a validar, não uma conclusão de entrevistas. Os centros municipais podem exigir processos e requisitos de contratação diferentes.

## Âmbito e confiança

Análise do código, migrações, documentação, CI e testes locais. Não foram inspecionados o alojamento, configurações de produção, contratos, backups reais ou utilização por canis. Não houve entrevistas nem auditoria visual nesta análise. Uma capacidade ausente do repositório pode existir num processo manual externo; deverá ser demonstrada.

Verificações executadas: `npm test` — 21 testes aprovados; `npm run typecheck` e `npm run lint` — aprovados. `npm run build` não pôde ser validado: o Turbopack falhou ao abrir uma porta local com `Operation not permitted`, incluindo na segunda tentativa com escalamento solicitado. Não foi demonstrado um defeito de código a partir desta falha ambiental. Os testes E2E não foram executados nesta avaliação. O conjunto PGlite valida regras de base de dados, mas não prova o funcionamento integrado de Auth, cookies, Storage, Realtime e entrega externa de email.

## O que já existe e merece ser preservado

- Catálogo PT/EN, filtros, fotografias, detalhe do animal, favoritos e páginas públicas dos canis.
- Registo de adotante e canil, áreas privadas por papel e administração.
- Candidatura por etapas com rascunho, acompanhamento de estado, mensagens e visitas.
- Conclusão de adoção com regras transacionais e fecho de candidaturas concorrentes no fluxo previsto.
- RLS, proteção de privilégios, idempotência, migrações e testes de regras importantes.
- Notificações internas e outbox de email com tentativas limitadas.
- Avaliações moderadas, gostos e links externos de donativos para canis verificados.

A stack Next.js, TypeScript e Supabase é adequada para continuar. A prioridade é completar o domínio, a operação e a validação; não há evidência que justifique uma reescrita ou microserviços.

## Bloqueios e riscos concretos antes do lançamento público

| Prioridade | Evidência no projeto | Impacto | Critério de aceitação proposto |
| --- | --- | --- | --- |
| P0 | `tests/e2e/auth.spec.ts` procura um seletor de papel e espera `success=`; o formulário atual usa papel oculto, exige telefone e encaminha para `check-email`. A CI não executa E2E. | A presença de testes dá uma confiança que já não corresponde ao percurso atual. | Atualizar e executar os percursos reais de registo dos dois papéis, confirmação, recuperação, candidatura, chat, fotos, visitas e adoção num ambiente isolado; torná-los uma condição de publicação. |
| P0 | `app/[locale]/auth/register/page.tsx` tem checkbox de termos sem `name` nem `required`; `app/auth/register/actions.ts` não valida nem regista aceitação. Não foram encontradas páginas dedicadas de termos/privacidade nem processos implementados de exportação/apagamento. | Falta evidência de informação ao utilizador e de gestão dos seus direitos. | Publicar textos e contactos aplicáveis, definir finalidades, bases legais e retenção; registar versão/data de aceitação quando necessária; disponibilizar um processo verificável de pedidos de acesso e apagamento. Consentimento de marketing separado, caso exista. |
| P0 | `deleteAnimal` elimina fisicamente; a FK `pedidos_adocao.animal_id` tem `ON DELETE CASCADE`. | Eliminar um animal pode apagar candidaturas e perder o histórico operacional. | Arquivar por defeito; restringir eliminação definitiva; testar preservação de processos e aplicar uma política explícita de retenção. |
| P0 | `updateAnimalStatus` e edição do animal escrevem diretamente o estado, incluindo `adotado`; o fecho das restantes candidaturas acontece na RPC de transição da candidatura. | Uma alteração manual pode deixar o animal e os pedidos incoerentes. | Centralizar as transições; suportar adoção externa explicitamente; qualquer forma de conclusão deve atualizar pedidos e visitas de forma consistente. |
| P0 | `requireVerificationToPublish` tem valor por defeito `false`; a função de leitura de configurações regressa aos valores por defeito em erro. | O modelo de confiança depende de configuração e do comportamento perante falhas. | Definir e testar aprovação de organizações, suspensão e visibilidade pública; a publicação deve falhar de forma segura se não conseguir verificar a autorização. |
| P0 | Há outbox e endpoint de jobs, mas não foi demonstrada a configuração operacional externa. | Emails podem ficar por entregar e incidentes podem passar despercebidos. | Demonstrar envio, retry, alerta de jobs esgotados, monitorização, responsável por incidentes e ensaio de restauro da base e dos ficheiros. |
| P1 | `getOwnedShelter` usa um único `owner_profile_id`; não há modelo de membros por organização. | Equipas ficam dependentes de uma conta ou tentadas a partilhá-la. | Convites, contas individuais, papéis e revogação; testes de isolamento entre organizações, incluindo ficheiros e Realtime. Essencial antes de pilotos com equipas. |
| P1 | `pedidos_one_completed` permite uma única adoção concluída por animal durante toda a sua existência; não há ciclo de devolução. | Um animal devolvido não tem um percurso correto de nova adoção. | Introduzir episódios de acolhimento/adoção, preservar o histórico e impedir apenas adoções simultâneas incompatíveis. |
| P1 | As `observacoes_canil` são apresentadas ao adotante. | A equipa pode confundir observações partilhadas com notas privadas. | Rotulagem explícita e armazenamento separado de notas internas, com permissões próprias. |
| P1 | A auditoria regista ator, entidade, operação e data apenas em parte das tabelas. | Não permite reconstruir suficientemente alterações operacionais críticas. | Auditar mudanças relevantes de estado, acessos da equipa, publicação e arquivo; guardar motivo e alteração mínima necessária sem copiar dados pessoais indiscriminadamente. |

P0 significa bloqueio ao lançamento público na avaliação proposta; P1 significa necessário para cumprir a promessa de operação em equipa, ou para a fase imediatamente seguinte. Nem todos os P1 precisam de bloquear um piloto assistido com âmbito explícito.

## O que falta para ser uma excelente ajuda para os canis

| Capacidade | Entrega inicial recomendada | Benefício e forma de validar |
| --- | --- | --- |
| Ficha operacional do animal | Identificador interno, entrada, origem, localização/box, data de nascimento estimada, situação de saúde e comportamento observados, documentos privados, responsável. Separar publicação de situação operacional. | A equipa encontra a informação necessária sem procurar em conversas. Observar cinco tarefas reais antes/depois. |
| Trabalho do dia | Tarefas por animal/candidatura, responsável, prazo, atrasos, lembretes e visão de hoje. | Reduzir esquecimentos e passagem informal de trabalho entre turnos. Medir tarefas vencidas e tempo de coordenação. |
| Gestão de candidaturas | Fila única, responsável, filtros globais, prazo de resposta, respostas modelo, notas privadas e motivo de fecho; permitir desistência do adotante. | Reduzir tempo até à primeira resposta e trabalho repetido. |
| Agenda | Disponibilidade do canil, capacidade por horário, reagendamento, lembretes e faltas. As propostas de visita já existentes são a base. | Evitar sobreposições e reduzir visitas falhadas. |
| Entrega e documentação | Checklist configurável, documentos e comprovativos privados, confirmação da entrega, adoção externa e devolução. | Tornar a conclusão um processo verificável e não apenas uma mudança de estado. |
| Pós-adoção | Contactos programados a 7/30/90 dias, formulário simples, sinalização de dificuldades e tarefa para a equipa. | Medir acompanhamento e estabilidade da adoção; intervalos a validar com os canis. |
| Entrada sem retrabalho | Importação CSV com pré-visualização, deteção de duplicados, erros por linha e apoio inicial; exportação dos dados próprios. | Reduzir a barreira de migração. CSV é prioritário face a integrações específicas. |
| Divulgação | Links partilháveis por animal, imagem social, ficha imprimível/QR e alertas de anúncios desatualizados. | Publicar uma vez e reutilizar; manter o catálogo credível. |
| Indicadores | Tempo de resposta, dias no abrigo, candidaturas por fase, adoções, devoluções, acompanhamento e qualidade dos dados. | Demonstrar impacto sem depender apenas de visitas ao site. |

Saúde deve começar por registos e lembretes definidos pelos profissionais, não por recomendações clínicas automáticas. Microchip, documentos e dados de adotantes exigem acesso restrito; não pertencem à ficha pública.

Em Portugal, o processo deve contemplar a comunicação da transmissão de titularidade ao SIAC. Um registo na FYA não a substitui. Começar por checklist e comprovativo, sem prometer integração automática sem confirmar acesso e condições. Fonte: [SIAC — transmissão de titularidade](https://www.siac.pt/pt/transmissao-de-titularidade).

Na proteção de dados, mapear responsabilidades entre FYA, canis e fornecedores, bem como informação, retenção e exercício de direitos. Validar juridicamente os textos e bases aplicáveis antes da abertura pública. Fonte: [CNPD — direitos dos titulares](https://www.cnpd.pt/cidadaos/direitos/).

## Arquitetura recomendada

Manter um monólito modular, com fronteiras claras: organizações/acessos, animais, candidaturas, visitas, tarefas, documentos e notificações. Preservar as garantias transacionais já existentes.

1. **Organizações e membros:** evoluir `canis` com `shelter_memberships` e convites. Papéis iniciais: responsável, colaborador e leitura; só criar papéis adicionais perante necessidades reais. Uma pessoa pode pertencer a mais de uma organização. Rever todas as policies, RPCs, consultas e Storage; não basta adicionar um seletor na interface.
2. **Animal, publicação e episódios:** distinguir a identidade permanente do animal, os episódios de acolhimento e a sua presença no catálogo. Uma devolução inicia novo episódio e preserva adoções anteriores. Rascunhos e registos internos não podem ficar acessíveis pela API pública.
3. **Transições únicas:** todas as mudanças críticas passam por operações de domínio transacionais, com autorização na base, idempotência, motivo e auditoria. Abranger adoções externas, desistência, arquivo e devolução.
4. **Documentos separados das fotografias:** fotografias públicas mantêm o seu circuito; contratos, identificação e documentos clínicos usam bucket privado, autorização e URLs temporários. Incluir limites e validação dos ficheiros.
5. **Tarefas e comunicação:** usar o padrão outbox existente para eventos relevantes; guardar erro, próxima tentativa e resultado; dar visibilidade operacional a falhas. Evitar envio de mensagens em cada alteração irrelevante.
6. **Operação:** ambientes separados, migrações reproduzíveis, revisão de dependências, observabilidade sem dados pessoais excessivos, limites de abuso, proteção reforçada de administradores, backups e restauro testado. Confirmar quais destas medidas já existem no alojamento.
7. **Escala com medição:** medir consultas, paginação, índices, fotografias e ligações Realtime com volume representativo; definir um orçamento de desempenho e custos antes de crescer. Não é possível dimensionar custos só pelo código.

A migração `202609090002_trello_automation.sql` introduz orquestração de desenvolvimento na base da aplicação. Avaliar a separação num schema/serviço próprio e o ciclo de retenção, mantendo as restrições de acesso existentes. Não constitui por si só um bloqueio ao produto.

O README de instalação menciona inicialmente apenas baseline e hardening, mas existem migrações posteriores. Consolidar uma única instrução de instalação/atualização que aplique toda a sequência adequada, com distinção clara entre base nova e existente.

## Estratégia de entrada e sustentabilidade

Entrar com profundidade numa região ou rede de parceiros, com inventário atualizado e resposta consistente. Um catálogo nacional com pouca oferta ativa ou canis sem capacidade de resposta enfraquece a experiência.

Piloto proposto: 3–5 organizações, durante 4–6 semanas após os bloqueios críticos estarem resolvidos. Acompanhar pessoas que realmente recebem animais, publicam, respondem, entregam e fazem seguimento. Importar dados com apoio e estabelecer um canal de suporte com responsável e horário.

Antes de desenvolver módulos extensos, realizar 8–12 entrevistas/observações: tarefas que mais tempo consomem, ferramentas atuais, volume de animais/pedidos, falhas recorrentes, acesso móvel, responsabilidades, orçamento e quem decide. Não recolher dados pessoais de adotantes para estas entrevistas.

Hipótese comercial: catálogo e adoção acessíveis, com financiamento da operação por subscrição de organizações com capacidade, redes/municípios ou parceiros institucionais. Testar vontade e capacidade de pagamento; não há evidência para fixar preços nesta análise. Medir custo por canil ativo, incluindo suporte, integração inicial, infraestrutura e comunicação. Evitar depender de taxas por adoção para validar o modelo.

Não priorizaria aplicação nativa, pagamentos próprios, gamificação, feed social ou IA de seleção de adotantes. O matching atual é uma tradução de respostas em filtros (`app/match/actions.ts`); comunicar isso com clareza e validar compatibilidade com a equipa do canil. A decisão de adoção permanece humana.

## Sequência de entrega

| Fase | Entregas | Condição para avançar |
| --- | --- | --- |
| 1 — Preparar piloto | Corrigir incoerências de estados/arquivo, E2E, informação legal, operação de email, restauro e verificação; entrevistar parceiros. | Percursos críticos demonstrados e responsáveis operacionais definidos. |
| 2 — Resolver o trabalho diário | Membros, importação assistida, ficha mínima, tarefas, fila de candidaturas e notas privadas. | Canis conseguem operar com contas individuais e completar trabalho real. |
| 3 — Fechar o ciclo | Entrega/documentação, devolução, acompanhamento e indicadores. | Percurso completo validado, incluindo exceções e adoções externas. |
| 4 — Lançar e crescer | Melhorias do piloto, divulgação com parceiros, suporte e sustentabilidade. | Critérios de qualidade, utilização e impacto atingidos. |

Não é uma estimativa de calendário: esforço depende da equipa, disponibilidade dos parceiros e resultados da primeira fase. Dimensionar após dividir as prioridades em histórias e validar dependências.

## Critérios mensuráveis de lançamento

Metas propostas para negociar no arranque do piloto; não são resultados já obtidos:

- Zero falhas críticas conhecidas de autorização, perda de dados ou incoerência no ciclo de adoção; testar tentativas entre organizações.
- Percursos E2E críticos aprovados em cada versão candidata, incluindo dispositivos móveis e ambos os idiomas suportados; validar teclado, foco e erros de formulários.
- Pelo menos três organizações ativas semanalmente durante quatro semanas, com uma tarefa operacional real concluída; login isolado não conta como utilização.
- Pelo menos 80% das tarefas observadas concluídas sem intervenção da equipa FYA; amostra e tarefas registadas.
- Redução inicial pretendida de 30% do tempo administrativo em tarefas comparáveis, medida face à situação anterior e ajustada ao volume.
- Pelo menos 90% dos anúncios ativos confirmados como atualizados nos últimos 30 dias.
- Primeira resposta humana em até dois dias úteis em pelo menos 90% dos pedidos, sujeito à capacidade acordada com os parceiros; medir também pedidos sem resposta.
- Seguimento de 30 dias registado em pelo menos 80% das adoções elegíveis. Adoções recentes ainda fora da janela não entram no denominador.
- Email e alertas de falha verificados, restauro demonstrado e procedimentos de suporte e privacidade ensaiados.
- Custos de operação e apoio por organização conhecidos antes da expansão.

Indicador de impacto principal sugerido: adoções com acompanhamento e integração confirmada aos 90 dias. Complementar com tempo poupado à equipa, tempo no abrigo e devoluções; nunca premiar apenas velocidade ou quantidade de adoções. Usar indicadores mais precoces durante o piloto, pois 90 dias não cabem na sua duração inicial.

## Próximas decisões de produto

Confirmar o segmento inicial e os parceiros; escolher a pessoa responsável pelo piloto; validar as três tarefas mais dispendiosas; fechar o âmbito da primeira versão e a promessa comercial. A primeira entrega técnica deve abordar integridade do ciclo, arquivo, E2E e acesso em equipa, acompanhada da preparação operacional e legal.
