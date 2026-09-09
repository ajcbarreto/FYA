# Página pública do canil

Aplicar a migração `supabase/migrations/202609090001_shelter_support.sql` antes de publicar este código. Não voltar a executar o baseline.

Em Canil → Configurações, o proprietário pode indicar um link HTTPS para donativos e explicar como será utilizado o apoio. O botão público só aparece em canis verificados. A FYA não processa pagamentos nem apresenta montantes angariados.

Os gostos requerem login, são únicos por utilizador/canil e podem ser removidos. A lista de utilizadores que gostaram não é pública. Ainda não existe contador agregado nem notificação de gosto ao proprietário.

Os comentários usam as avaliações existentes: incluem classificação, ficam pendentes e são moderados em Canil → Avaliações. Não são um chat público.

Validação de produção: editar e guardar o link como proprietário; confirmar que outra conta não o pode editar; colocar/remover um gosto e recarregar; enviar uma avaliação, aprovar no painel e verificar a sua publicação. Confirmar layout em ecrã móvel e desktop após aplicação da migração.
