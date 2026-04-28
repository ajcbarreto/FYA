# FYA - Fluxo da Aplicacao (simples e claro)

Este documento explica:
- como o login decide para onde cada utilizador vai,
- porque os menus do canil podem nao aparecer,
- e o flow principal de cada area (`user`, `canil`, `admin`).

---

## 1) Login e Roles

### Roles suportadas
- `user`
- `canil`
- `admin`

### Onde a role e lida
- A role oficial da aplicacao vem da tabela `public.profiles.role`.
- O login faz:
  1. autentica email/password,
  2. le `profiles.role`,
  3. redireciona:
     - `admin` -> `/{locale}/admin`
     - `canil` -> `/{locale}/canil`
     - resto -> `/{locale}/user`

### Protecao de rotas (RBAC)
- `proxy.ts` protege:
  - `/user` -> role `user`
  - `/canil` -> role `canil`
  - `/admin` -> role `admin`
- Se o utilizador nao tiver role correta, e redirecionado.

---

## 2) Porque o menu do canil pode nao aparecer

Causas mais comuns:

1. **Role errada no `profiles`**
   - Mesmo com email `canil@fya.local`, se `profiles.role` nao for `canil`, os links de canil nao aparecem e o acesso ao dashboard canil falha.

2. **Seed SQL nao executado**
   - Se o script de seed nao foi corrido, o perfil pode ter ficado com role default `user`.

3. **Navbar em ecras pequenos**
   - Agora existe menu responsivo com links de role tambem no mobile.

### Como validar rapidamente no Supabase

```sql
select id, email, role
from public.profiles
where lower(email) = lower('canil@fya.local');
```

Se o `role` nao for `canil`, corrigir:

```sql
update public.profiles
set role = 'canil'
where lower(email) = lower('canil@fya.local');
```

---

## 3) Flow da area Canil

Rotas principais:
- `/{locale}/canil` -> dashboard do canil
- `/{locale}/canil/perfil` -> pagina publica/perfil do canil
- `/{locale}/canil/animais` -> inventario + estado dos animais
- `/{locale}/canil/pedidos` -> pedidos recebidos (backend real)
- `/{locale}/canil/mensagens` -> conversas com adotantes (backend real)
- `/{locale}/canil/configuracoes` -> dados do canil

### O que o canil consegue fazer
- atualizar estado de animal,
- rever pedidos e mudar status (`pendente`, `entrevista`, `aprovado`, `rejeitado`),
- responder mensagens,
- editar informacao do canil.

---

## 4) Flow da area User (adotante)

Rotas principais:
- `/{locale}/user` -> dashboard do adotante
- `/{locale}/user/pedidos` -> pedidos enviados
- `/{locale}/user/mensagens` -> mensagens com canis
- `/{locale}/pets` -> catalogo
- `/{locale}/pets/{petId}` -> detalhe + candidatura

### O que o user consegue fazer
- enviar candidatura no detalhe do pet,
- abrir conversa automaticamente com o canil,
- acompanhar estado dos pedidos,
- continuar conversa com o canil.

---

## 5) Flow de pedidos e mensagens (end-to-end)

1. User abre `pets/{petId}`.
2. User submete candidatura (`submitAdoptionRequest`).
3. Sistema:
   - cria/atualiza `pedidos_adocao`,
   - cria conversa em `conversas_adocao` (se necessario),
   - envia primeira mensagem em `mensagens_adocao`.
4. Canil ve pedido em `/canil/pedidos`.
5. Canil atualiza estado e notas.
6. User acompanha estado em `/user/pedidos`.
7. Ambos trocam mensagens nas respetivas paginas de mensagens.

---

## 6) Tabelas novas no Supabase

Scripts:
- `supabase/adoption_requests_messages.sql`
- `supabase/seed_demo_data.sql` (dados exemplo)

Tabelas:
- `pedidos_adocao`
- `conversas_adocao`
- `mensagens_adocao`

Com RLS para garantir que:
- user so ve os seus pedidos/conversas,
- canil so ve pedidos/conversas do seu canil,
- admin pode atuar como excecao de gestao.

---

## 7) Checklist de arranque local

1. Garantir users no Auth:
   - `admin@fya.local`
   - `canil@fya.local`
   - `user@fya.local`
2. Executar SQL base:
   - `profiles.sql`
   - `canis_animais_policies.sql`
3. Executar:
   - `adoption_requests_messages.sql`
   - `seed_demo_data.sql`
4. Confirmar role do canil:
   - query em `profiles` para `canil@fya.local`.
5. Login com `canil@fya.local` e abrir `/{locale}/canil`.

