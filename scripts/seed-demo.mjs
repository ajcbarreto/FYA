// Demo catalogue for local review: shelters, animals with photos, adopters and activity.
// Run after `npm run local:seed`. Restricted to the local Supabase instance, like seed-local.
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
loadEnvFile(process.env.FYA_E2E_ENV ?? ".env.test.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!["http://127.0.0.1:54321", "http://127.0.0.1:54331"].includes(url))
  throw new Error("Demo seed is restricted to the dedicated local instance");
const container = url.endsWith(":54331")
  ? "supabase_db_fya-launch-test"
  : "supabase_db_fya-local";
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const password = "Fya-local-Only-2026!";
const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=1200&fit=crop&q=80`;
const sql = (value) =>
  value === null || value === undefined
    ? "null"
    : `'${String(value).replaceAll("'", "''")}'`;
const psql = (input) =>
  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      container,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-q",
      "-1",
    ],
    { input, stdio: ["pipe", "ignore", "inherit"] },
  );

const shelters = [
  {
    email: "shelter@fya.test",
    name: "Associação Patas do Tejo",
    location: "Lisboa",
    verified: true,
    image: "1525253086316-d0c936c814f8",
    mission:
      "Resgatamos cães e gatos abandonados na zona ribeirinha de Lisboa, tratamos da sua saúde e procuramos famílias responsáveis para cada um.",
    phone: "+351 912 345 678",
    hours: "Sábados e domingos, das 10h às 13h e das 15h às 18h.",
  },
  {
    email: "other-shelter@fya.test",
    name: "Abrigo Quinta da Esperança",
    location: "Sintra",
    verified: true,
    image: "1548199973-03cce0bbc87b",
    mission:
      "Uma quinta com espaço para correr, onde cães recuperam a confiança antes de seguirem para uma nova casa.",
    phone: "+351 913 222 111",
    hours: "Visitas por marcação, de terça a domingo.",
  },
  {
    email: "refugio.porto@fya.test",
    name: "Refúgio Animal do Porto",
    location: "Porto",
    verified: true,
    image: "1415369629372-26f2fe60c467",
    mission:
      "Acolhemos gatos e cães de colónias urbanas, com esterilização, vacinação e acompanhamento depois da adoção.",
    phone: "+351 914 555 010",
    hours: "Segunda a sexta, das 17h às 19h; sábados das 10h às 17h.",
  },
  {
    email: "quatropatas.coimbra@fya.test",
    name: "Amigos de Quatro Patas",
    location: "Coimbra",
    verified: true,
    image: "1534361960057-19889db9621e",
    mission:
      "Associação de voluntários que acolhe animais em famílias de acolhimento temporário até encontrarem um lar definitivo.",
    phone: "+351 915 777 330",
    hours: "Encontros com as famílias de acolhimento por marcação.",
  },
  {
    email: "gatil.faro@fya.test",
    name: "Gatil Sol do Algarve",
    location: "Faro",
    verified: true,
    image: "1450778869180-41d0601e046e",
    mission:
      "Gatil dedicado a gatos adultos e seniores, muitas vezes esquecidos, que merecem uma segunda oportunidade.",
    phone: "+351 916 404 040",
    hours: "Quartas e sábados, das 14h às 18h.",
  },
  {
    email: "sospatudos.braga@fya.test",
    name: "SOS Patudos Braga",
    location: "Braga",
    verified: false,
    image: "1552053831-71594a27632d",
    mission:
      "Grupo recente de voluntários em Braga. Ainda estamos a concluir a verificação na FYA.",
    phone: "+351 917 100 200",
    hours: "Por marcação.",
  },
];

// [shelter index, name, species, breed, sex, age, size, status, compat, photos, description]
const animals = [
  [
    0,
    "Bolota",
    "cao",
    "Beagle",
    "femea",
    3,
    "medio",
    "disponivel",
    ["children", "apartment"],
    ["1543466835-00a7907e9de1"],
    "Curiosa e muito meiga, adora passeios longos e farejar tudo pelo caminho. Dá-se bem com crianças.",
  ],
  [
    0,
    "Tejo",
    "cao",
    "Rafeiro",
    "macho",
    5,
    "grande",
    "disponivel",
    ["trained"],
    ["1544568100-847a948585b9"],
    "Encontrado junto ao rio, é calmo em casa e cheio de energia na rua. Já sabe passear à trela.",
  ],
  [
    0,
    "Mia",
    "gato",
    "Europeu comum",
    "femea",
    2,
    "pequeno",
    "disponivel",
    ["apartment", "seniors"],
    ["1514888286974-6c03e2ca1dba"],
    "Tranquila e observadora. Ideal para um apartamento sossegado.",
  ],
  [
    0,
    "Pimenta",
    "cao",
    "Jack Russell",
    "femea",
    4,
    "pequeno",
    "reservado",
    ["children"],
    ["1561037404-61cd46aa615b"],
    "Pequena, rápida e brincalhona. Precisa de uma família ativa.",
  ],
  [
    0,
    "Simba",
    "gato",
    "Europeu comum",
    "macho",
    1,
    "pequeno",
    "disponivel",
    ["children", "apartment"],
    ["1529778873920-4da4926a72c2"],
    "Jovem e brincalhão, passa o dia a caçar brinquedos e a pedir colo.",
  ],
  [
    0,
    "Lua",
    "cao",
    "Cavalier King Charles",
    "femea",
    7,
    "pequeno",
    "disponivel",
    ["seniors", "apartment", "trained"],
    ["1560807707-8cc77767d783"],
    "Senhora calma e carinhosa, perfeita para quem procura companhia tranquila.",
  ],
  [
    0,
    "Rocky",
    "cao",
    "Bulldog francês",
    "macho",
    6,
    "pequeno",
    "em_tratamento",
    [],
    ["1583337130417-3346a1be7dee", "1583511655857-d19b40a7a54e"],
    "Está a recuperar de uma cirurgia respiratória. Ficará disponível em breve.",
  ],
  [
    1,
    "Ouro",
    "cao",
    "Golden Retriever",
    "macho",
    4,
    "grande",
    "disponivel",
    ["children", "trained"],
    ["1558788353-f76d92427f16"],
    "Gentil com toda a gente, adora água e brincar à apanhada.",
  ],
  [
    1,
    "Canela",
    "cao",
    "Retriever cruzado",
    "femea",
    2,
    "grande",
    "disponivel",
    ["children"],
    ["1552053831-71594a27632d"],
    "Doce e atenta, aprende depressa. Ideal para casa com jardim.",
  ],
  [
    1,
    "Faísca",
    "cao",
    "Corgi cruzado",
    "macho",
    3,
    "medio",
    "disponivel",
    ["apartment"],
    ["1537151625747-768eb6cf92b2"],
    "Orelhas atentas e personalidade enorme. Adora petiscos e truques.",
  ],
  [
    1,
    "Nuvem",
    "cao",
    "Bichon cruzado",
    "femea",
    2,
    "pequeno",
    "disponivel",
    ["apartment", "seniors"],
    ["1576201836106-db1758fd1c97"],
    "Uma bola de pelo branco que corre pela relva como se não houvesse amanhã.",
  ],
  [
    1,
    "Maré",
    "cao",
    "Rafeiro",
    "femea",
    5,
    "medio",
    "disponivel",
    ["trained"],
    ["1530281700549-e82e7bf110d6"],
    "Apaixonada pela praia. Calma em casa e ótima companheira de corrida.",
  ],
  [
    2,
    "Tigre",
    "gato",
    "Europeu tigrado",
    "macho",
    4,
    "pequeno",
    "disponivel",
    ["apartment", "seniors"],
    ["1518791841217-8f162f1e1131"],
    "Grande dorminhoco, escolhe sempre o melhor lugar ao sol.",
  ],
  [
    2,
    "Luna",
    "gato",
    "Europeu comum",
    "femea",
    1,
    "pequeno",
    "disponivel",
    ["children", "apartment"],
    ["1573865526739-10659fec78a5"],
    "Curiosa e aventureira, investiga cada caixa nova que aparece.",
  ],
  [
    2,
    "Pantufa",
    "gato",
    "Persa cruzado",
    "femea",
    8,
    "pequeno",
    "disponivel",
    ["seniors"],
    ["1513245543132-31f507417b26"],
    "Senhora de pelo longo e feitio tranquilo. Precisa de escovagem regular.",
  ],
  [
    2,
    "Duque",
    "cao",
    "Pastor australiano cruzado",
    "macho",
    3,
    "grande",
    "disponivel",
    ["trained"],
    ["1587300003388-59208cc962cb"],
    "Inteligente e cheio de energia, ideal para quem gosta de desporto ao ar livre.",
  ],
  [
    2,
    "Boneca",
    "cao",
    "Pug",
    "femea",
    5,
    "pequeno",
    "disponivel",
    ["apartment", "seniors"],
    ["1517849845537-4d257902454a"],
    "Ressona um pouco, mas compensa com carinho sem fim.",
  ],
  [
    3,
    "Biscoito",
    "cao",
    "Rafeiro",
    "macho",
    1,
    "medio",
    "disponivel",
    ["children"],
    ["1507146426996-ef05306b995a"],
    "Cachorro alegre em família de acolhimento, já está a aprender a fazer as necessidades na rua.",
  ],
  [
    3,
    "Kiko",
    "cao",
    "Rafeiro",
    "macho",
    2,
    "medio",
    "disponivel",
    ["children", "apartment"],
    ["1477884213360-7e9d7dcc1e48"],
    "Sorriso permanente e muita vontade de agradar.",
  ],
  [
    3,
    "Fifi",
    "gato",
    "Europeu comum",
    "femea",
    3,
    "pequeno",
    "disponivel",
    ["apartment"],
    ["1543852786-1cf6624b9987"],
    "Conversadora e sociável, recebe as visitas à porta.",
  ],
  [
    3,
    "Gomes",
    "cao",
    "Dachshund cruzado",
    "macho",
    4,
    "pequeno",
    "disponivel",
    ["apartment", "trained"],
    ["1588943211346-0908a1fb0b01"],
    "Adora rebolar na relva e dormir de barriga para o ar.",
  ],
  [
    4,
    "Laranja",
    "gato",
    "Europeu ruivo",
    "macho",
    9,
    "pequeno",
    "disponivel",
    ["seniors", "apartment"],
    ["1519052537078-e6302a4968d4"],
    "Sénior meigo que só pede uma almofada e alguém com quem ronronar.",
  ],
  [
    4,
    "Estrela",
    "gato",
    "Europeu comum",
    "femea",
    6,
    "pequeno",
    "disponivel",
    ["seniors"],
    ["1574158622682-e40e69881006"],
    "Olhos verdes enormes e muita doçura. Prefere casas calmas.",
  ],
  [
    4,
    "Mel",
    "gato",
    "Europeu ruivo",
    "femea",
    2,
    "pequeno",
    "disponivel",
    ["children", "apartment"],
    ["1596854407944-bf87f6fdd49e"],
    "Brincalhona e atrevida, adora brinquedos com penas.",
  ],
  [
    4,
    "Riscas",
    "gato",
    "Europeu tigrado",
    "macho",
    7,
    "pequeno",
    "disponivel",
    ["seniors"],
    ["1495360010541-f48722b34f7d"],
    "Independente mas fiel, gosta de rotinas e de janelas com vista.",
  ],
  [
    5,
    "Faro",
    "cao",
    "Rafeiro",
    "macho",
    3,
    "medio",
    "disponivel",
    ["trained"],
    ["1525253086316-d0c936c814f8"],
    "Resgatado recentemente, muito sociável com outros cães.",
  ],
];

const adopters = [
  ["adopter@fya.test", "Ana Martins"],
  ["other@fya.test", "Rui Costa"],
  ["marta.silva@fya.test", "Marta Silva"],
  ["joao.ferreira@fya.test", "João Ferreira"],
  ["ines.sousa@fya.test", "Inês Sousa"],
  ["pedro.almeida@fya.test", "Pedro Almeida"],
];

const { data: existing, error: listError } = await admin.auth.admin.listUsers({
  perPage: 1000,
});
if (listError) throw listError;
async function ensureUser(email, role, name, shelterName, location) {
  const found = existing.users.find((u) => u.email === email);
  if (found) return found.id;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      full_name: name,
      shelter_name: shelterName,
      shelter_location: location,
    },
  });
  if (error) throw error;
  return data.user.id;
}

const ids = {};
for (const s of shelters)
  ids[s.email] = await ensureUser(
    s.email,
    "canil",
    `Equipa ${s.name}`,
    s.name,
    s.location,
  );
for (const [email, name] of adopters)
  ids[email] = await ensureUser(email, "user", name);

const statements = [];
for (const [email, name] of adopters)
  statements.push(
    `update public.profiles set full_name=${sql(name)} where id=${sql(ids[email])};`,
  );
for (const s of shelters) {
  statements.push(
    `update public.profiles set full_name=${sql(`Equipa ${s.name}`)} where id=${sql(ids[s.email])};`,
  );
  statements.push(`update public.canis set nome=${sql(s.name)}, localizacao=${sql(s.location)}, missao=${sql(s.mission)},
    telefone=${sql(s.phone)}, email_contacto=${sql(s.email)}, verificado=${s.verified}, image_url=${sql(photo(s.image))},
    donation_url=${s.verified ? sql("https://www.example.org/donativos") : "null"},
    donation_message=${sql("Ração, mantas e apoio para despesas veterinárias fazem toda a diferença.")}
    where owner_profile_id=${sql(ids[s.email])};`);
  statements.push(`insert into public.shelter_public_details(canil_id, visit_hours, visit_instructions)
    select id, ${sql(s.hours)}, ${sql("Marca a visita com antecedência através da FYA.")} from public.canis where owner_profile_id=${sql(ids[s.email])}
    on conflict (canil_id) do update set visit_hours=excluded.visit_hours, visit_instructions=excluded.visit_instructions;`);
  if (s.verified) {
    statements.push(`insert into public.shelter_news(id, canil_id, title, body, published)
      select md5('demo-news-'||c.id)::uuid, c.id, ${sql("Dia aberto este sábado")},
        ${sql("Vem conhecer os nossos animais, falar com os voluntários e saber como podes ajudar. Haverá lanche para toda a família.")}, true
      from public.canis c where owner_profile_id=${sql(ids[s.email])} on conflict (id) do nothing;`);
  }
}
const shelterId = (i) =>
  `(select id from public.canis where owner_profile_id=${sql(ids[shelters[i].email])})`;
statements.push(`insert into public.support_projects(id, canil_id, kind, title, description, goal, unit, donation_url, published, received)
  values (md5('demo-support-money')::uuid, ${shelterId(0)}, 'money', 'Cirurgia do Rocky',
    'Ajuda-nos a pagar a cirurgia respiratória do Rocky e os cuidados pós-operatórios.', 800, 'EUR', 'https://www.example.org/donativos', true, 320),
  (md5('demo-support-goods')::uuid, ${shelterId(0)}, 'goods', 'Ração para o inverno',
    'Precisamos de sacos de ração de 15 kg para os cães adultos durante o inverno.', 40, 'sacos', null, true, 12)
  on conflict (id) do nothing;`);
for (const [
  shelter,
  name,
  species,
  breed,
  sex,
  age,
  size,
  status,
  compat,
  photos,
  description,
] of animals) {
  const animalId = `md5('demo-animal-'||${sql(name)}||'-'||${shelter})::uuid`;
  statements.push(`insert into public.animais(id, canil_id, nome, especie, raca, sexo, idade_anos, porte, status, descricao, compatibilidades, published)
    values (${animalId}, ${shelterId(shelter)}, ${sql(name)}, '${species}', ${sql(breed)}, '${sex}', ${age}, '${size}', '${status}', ${sql(description)},
      array[${compat.map(sql).join(",")}]::text[], true)
    on conflict (id) do update set status=excluded.status, descricao=excluded.descricao, compatibilidades=excluded.compatibilidades;`);
  photos.forEach((p, index) =>
    statements.push(`insert into public.animal_fotos(id, animal_id, storage_path, public_url, is_primary)
      values (md5('demo-photo-'||${sql(p)})::uuid, ${animalId}, ${sql(`demo/${p}.jpg`)}, ${sql(photo(p))}, ${index === 0})
      on conflict (id) do nothing;`),
  );
}
const reviews = [
  [
    0,
    "marta.silva@fya.test",
    5,
    "Equipa incansável. Acompanharam-nos antes e depois da adoção da nossa cadela.",
    "aprovada",
  ],
  [
    0,
    "joao.ferreira@fya.test",
    4,
    "Processo simples e transparente. Recomendo uma visita ao fim de semana.",
    "aprovada",
  ],
  [
    0,
    "ines.sousa@fya.test",
    5,
    "Os voluntários conhecem cada animal pelo nome e pela personalidade.",
    "pendente",
  ],
  [
    1,
    "pedro.almeida@fya.test",
    5,
    "Os cães vivem num espaço enorme e vê-se que são bem tratados.",
    "aprovada",
  ],
  [
    2,
    "marta.silva@fya.test",
    4,
    "Muito cuidadosos na escolha da família certa para cada gato.",
    "aprovada",
  ],
  [
    4,
    "joao.ferreira@fya.test",
    5,
    "Adotámos um gato sénior e foi a melhor decisão do ano.",
    "aprovada",
  ],
];
for (const [shelter, email, rating, comment, state] of reviews)
  statements.push(`insert into public.avaliacoes_canil(id, canil_id, author_profile_id, rating, comentario, estado, author_name)
    values (md5('demo-review-'||${sql(email)}||${shelter})::uuid, ${shelterId(shelter)}, ${sql(ids[email])}, ${rating}, ${sql(comment)}, '${state}',
      (select full_name from public.profiles where id=${sql(ids[email])}))
    on conflict (id) do nothing;`);
for (const name of ["Bolota", "Ouro", "Laranja"])
  statements.push(`insert into public.favoritos(user_profile_id, animal_id)
    select ${sql(ids["adopter@fya.test"])}, id from public.animais where nome=${sql(name)} on conflict do nothing;`);
psql(statements.join("\n"));

// Adoption requests go through the same RPCs as the app, signed in as each person.
async function signedIn(email) {
  const client = createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false },
    },
  );
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}
const { data: animalRows, error: animalError } = await admin
  .from("animais")
  .select("id,nome,canil_id");
if (animalError) throw animalError;
const animalByName = (name) => animalRows.find((a) => a.nome === name)?.id;
const answers = {
  housing_type: "apartment",
  has_garden: false,
  household_size: "2",
  has_children: false,
  has_other_pets: false,
  experience: "some",
  hours_alone: "3-5",
  reason: "Queremos dar uma casa a um animal que precise de nós.",
};
const requests = [
  [
    "adopter@fya.test",
    "Bolota",
    "Olá! Adorámos a Bolota. Podemos marcar uma visita?",
    "entrevista",
  ],
  [
    "adopter@fya.test",
    "Simba",
    "Temos um apartamento sossegado e muito tempo para brincar.",
    null,
  ],
  [
    "marta.silva@fya.test",
    "Tejo",
    "Tenho experiência com cães grandes e uma casa com quintal.",
    null,
  ],
  [
    "joao.ferreira@fya.test",
    "Pimenta",
    "A Pimenta parece perfeita para a nossa família.",
    "aprovado",
  ],
  ["ines.sousa@fya.test", "Ouro", "Gostávamos muito de conhecer o Ouro.", null],
];
const shelterClients = {};
let created = 0;
for (const [email, animal, message, nextStatus] of requests) {
  const animalId = animalByName(animal);
  const client = await signedIn(email);
  const { error } = await client.rpc("submit_adoption", {
    p_animal: animalId,
    p_answers: answers,
    p_message: message,
  });
  if (error) {
    console.warn(`Skipped request ${email} → ${animal}: ${error.message}`);
    continue;
  }
  created++;
  if (!nextStatus) continue;
  const owner = shelters[animals.find((a) => a[1] === animal)[0]].email;
  shelterClients[owner] ??= await signedIn(owner);
  const { data: request } = await admin
    .from("pedidos_adocao")
    .select("id,status")
    .eq("animal_id", animalId)
    .eq("applicant_profile_id", ids[email])
    .maybeSingle();
  for (const status of ["entrevista", "aprovado"]) {
    if (!request || request.status === status) break;
    const { error: transitionError } = await shelterClients[owner].rpc(
      "transition_adoption",
      {
        p_request: request.id,
        p_status: status,
        p_notes: null,
      },
    );
    if (transitionError)
      console.warn(
        `Could not move ${animal} to ${status}: ${transitionError.message}`,
      );
    if (status === nextStatus) break;
  }
}

console.log(
  `Demo ready: ${shelters.length} shelters, ${animals.length} animals, ${adopters.length} adopters, ${created} adoption requests. Password for every account: see scripts/seed-local.mjs.`,
);
