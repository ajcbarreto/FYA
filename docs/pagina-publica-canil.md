# Página pública do canil

## Funcionalidades

- Animais organizados por estado, com pesquisa e filtros por espécie, porte e idade; apresentação progressiva de seis animais.
- Campanhas de dinheiro e bens com objetivos, valores confirmados, prazo e ligação para apoiar. Os pagamentos continuam externos ou manuais; não existe integração Stripe nesta entrega.
- Novidades do canil e atualizações de campanhas, por data.
- Horários e instruções de visita geridos em **Canil → Informação pública e novidades**. Contactos e descrição continuam nas configurações.
- Avaliações novas apenas para adotantes com adoção concluída nesse canil. O nome público do perfil acompanha a avaliação. Avaliações antigas mantêm-se sem o selo de adoção confirmada.
- Respostas públicas de responsáveis/editores do canil, denúncias privadas e moderação pela administração FYA. O canil não pode aprovar nem ocultar as próprias avaliações.
- Decisões de moderação com motivo interno e histórico. Uma denúncia não oculta automaticamente a avaliação. Edições de avaliações rejeitadas, pendentes ou denunciadas aguardam análise.

## Ativação da base de dados

A migração `202609270001_shelter_experience.sql` depende das migrações anteriores de equipas, operações e apoios, incluindo as funções privadas de autorização. Antes de a aplicar em produção, comparar o histórico remoto com os ficheiros em `supabase/migrations/`, corrigir divergências e aplicar as migrações em falta pela ordem existente. Não executar apenas a última migração numa base desatualizada.

A função `shelter_experience_version()` sinaliza que a migração terminou. Sem ela, a página pública mantém a informação existente e não consulta as novas estruturas nem permite as novas escritas. A ausência conhecida de campanhas também é tolerada; outros erros não são ocultados.

A auditoria de produção desta entrega encontrou estruturas anteriores ainda em falta. A implementação local não significa que a migração tenha sido aplicada em produção.

## Limites de apresentação

A página destaca seis campanhas, cinco atualizações dessas campanhas e cinco novidades, apresentando os cinco conteúdos mais recentes no conjunto de novidades. As avaliações públicas e a fila de moderação têm limite de 100 registos; a gestão de novidades apresenta 50 e o histórico recente de decisões 20. Estes limites devem evoluir para paginação quando o volume o justificar.

## Validação

Testes SQL verificam autorizações, adoção concluída, privacidade de denúncias e histórico de moderação. Testes de navegador percorrem publicação de informação, filtros, avaliação, resposta e decisão administrativa, além dos tamanhos de ecrã de 320 a 1440 pixels. Usam o Supabase isolado de testes, sem modificar dados de produção.

## Pesquisa de abrigos e mapa

A listagem tem pesquisa literal por nome, localidade e missão, sem distinguir acentos; filtros por localidade e espécie; opção de animais disponíveis para adoção; e ordenação por nome ou número de animais disponíveis. Espécie e disponibilidade têm de corresponder ao mesmo animal. Os parâmetros ficam no URL e podem ser limpos em conjunto.

O mini mapa permite selecionar um dos abrigos dos resultados que tenham localidade preenchida. Mostra uma localização aproximada da localidade, não uma morada de visita confirmada nem um conjunto de marcadores georreferenciados. Só contacta o fornecedor externo quando o visitante escolhe carregar o mapa; existe também ligação para abrir a pesquisa no Google Maps. Para posições exatas será necessário recolher moradas ou coordenadas validadas pelos canis.

A validação de navegador destas últimas alterações ficou pendente devido ao bloqueio da revisão automática por limite de utilização. Os testes unitários dos filtros e as verificações de tipos/lint passaram.
