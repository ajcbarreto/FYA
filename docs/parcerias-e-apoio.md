# Parcerias e apoio privado aos canis

## Percursos

- `/pt/parcerias` (também `/en/parcerias`): página pública com patrocínios, produtos/serviços e publicidade responsável. Formulário sem necessidade de conta, autorização de contacto e referência após registo. A submissão não publica anúncios. A administração contacta a marca externamente através do email indicado.
- `/pt/canil/ajuda-fya`: responsáveis e editores criam pedidos e respondem; leitores consultam. Toda a equipa autorizada vê os pedidos do seu canil. Os pedidos resolvidos/fechados deixam de aceitar respostas da equipa; um administrador pode reabrir com uma atualização.
- `/pt/admin/contactos`: separadores para parcerias e apoio, filtro por estado, prioridade, notas internas e histórico. Listas e histórico têm 25 registos por página. Cada atualização regista autor, mensagem, estado e prioridade na mesma transação.
- `/pt/admin`: contadores de pedidos por concluir e ligações para as filas. Novas entradas aparecem nos menus de administração, canil e no rodapé público.

As respostas ficam na aplicação. Não são enviados emails automaticamente, nem existem SLAs prometidos. As notas internas nunca são visíveis aos canis; propostas e contactos de marcas são exclusivos da administração.

## Ativação

Aplicar `202609280001_contact_requests.sql` depois de alinhar as migrações anteriores. Depende de `private.is_admin`, `private.shelter_access`, equipas e perfis. A função `contact_requests_version` permite mostrar uma mensagem de indisponibilidade quando a nova migração ainda não existe. O formulário público precisa de `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor; esta chave nunca chega ao navegador. Sem configuração ou migração, o formulário apresenta erro e mantém o conteúdo para nova tentativa.

Limites no banco: três propostas por email em 24 horas e dez pedidos por canil em 24 horas. Existe campo anti-bot no formulário público. Antes de campanhas de grande tráfego, avaliar um desafio anti-bot adicional: limitar por email não impede abuso com endereços diferentes.

## Administrador

A role existente é `profiles.role = 'admin'`. Esta entrega não promove contas. Confirmar primeiro o utilizador real no Supabase Auth e, através de acesso administrativo à BD, atribuir a role ao UUID exato. Nunca permitir a escolha da role admin no registo público. Não foi possível confirmar a role da conta de produção do proprietário nesta entrega.

## Privacidade e validação

O texto informativo de privacidade foi atualizado. Contactos de marcas sem conta exigem identificação por referência/email quando forem tratados pedidos de acesso ou eliminação. Não há subscrição automática de marketing. A definição da entidade responsável, contactos e prazos de conservação continua pendente do lançamento.

Testes SQL cobrem isolamento entre perfis, notas privadas, escritas diretas proibidas, estados por tipo e limites de submissão. O teste de navegador cobre proposta de marca, acompanhamento administrativo, pedido do canil, resposta, resolução, invisibilidade de notas privadas e apresentação responsiva.
