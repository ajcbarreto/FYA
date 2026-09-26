export type Guide = {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  destination: string;
  steps: string[];
  faq: [string, string][];
  video?: { src: string; captions: string };
};
export function helpGuides(locale: string): Guide[] {
  const pt = locale === "pt";
  return pt
    ? [
        {
          slug: "registar-animal",
          title: "Registar e publicar um animal",
          summary:
            "Cria a ficha pública, acrescenta fotografias e organiza os registos privados.",
          minutes: 3,
          destination: "canil/animais",
          steps: [
            "Abre Meus Pets e escolhe adicionar um animal. Preenche nome, espécie, sexo, porte, idade e descrição pública.",
            "Guarda os dados e acrescenta fotografias do animal. Confirma que não contêm documentos ou dados de pessoas.",
            "Abre Registos para preencher referência interna, microchip, entrada, localização, saúde e comportamento. Estes campos são privados.",
            "A publicação depende da verificação do canil. Confirma o estado de publicação nos Registos e abre a ficha pública para rever o resultado.",
            "Para deixar de divulgar um animal preservando o histórico, utiliza Arquivar.",
          ],
          faq: [
            [
              "O microchip aparece no catálogo?",
              "Não. O microchip pertence ao registo privado da equipa.",
            ],
            [
              "Posso importar os animais que já tenho?",
              "Sim. Em Importar e exportar, usa o formato CSV indicado, revê a pré-visualização e confirma a importação. Os animais começam não publicados.",
            ],
          ],
        },
        {
          slug: "documentos-dossier",
          title: "Documentos e dossier de adoção",
          summary:
            "Reúne a documentação e partilha apenas os ficheiros adequados com a família.",
          minutes: 3,
          destination: "canil/animais",
          steps: [
            "Abre o animal e entra em Registos. Na secção de documentos, escolhe um título, categoria e ficheiro PDF, JPEG ou PNG até 10 MiB.",
            "Marca como partilháveis os documentos que a família pode receber. Mantém os restantes privados.",
            "Preenche a informação de entrega. As notas internas, de saúde e comportamento não são automaticamente copiadas para o dossier.",
            "Escolhe uma candidatura em entrevista, aprovada ou concluída, seleciona os documentos e define a validade de 7, 14 ou 30 dias.",
            "Envia a partilha. O email leva uma ligação segura; o destinatário entra com a conta da candidatura para aceder.",
            "Consulta o estado do envio em Trabalho do dia. Se necessário, revoga a partilha nos Registos.",
          ],
          faq: [
            [
              "O email leva anexos?",
              "Não. Leva uma ligação autenticada para os documentos selecionados.",
            ],
            [
              "Não consigo enviar.",
              "Verifica se existe uma candidatura elegível e documentos partilháveis. O administrador da FYA tem de configurar o serviço de email.",
            ],
          ],
        },
        {
          slug: "candidaturas-respostas",
          title: "Gerir candidaturas e respostas modelo",
          summary:
            "Encontra pedidos pendentes, atribui responsáveis e prepara respostas.",
          minutes: 3,
          destination: "canil/pedidos",
          steps: [
            "Abre Pedidos de adoção e pesquisa pelo animal, nome ou email do adotante.",
            "Combina filtros de estado, responsável e antiguidade. Usa Só candidaturas ativas sem resposta para encontrar quem espera pelo primeiro contacto.",
            "Escolhe um responsável pela candidatura e guarda. Esta ação não altera as notas internas nem o estado.",
            "Em Gerir respostas modelo, cria textos da equipa com {animal}, {adotante} e {canil}.",
            "Abre Responder ao adotante, seleciona o modelo e insere-o. Revê e edita o texto antes de enviar. A mensagem aparece na conversa.",
            "Atualiza o estado separadamente. As notas do formulário de estado são partilhadas; usa Trabalho do dia para notas internas.",
          ],
          faq: [
            [
              "Uma nota interna conta como resposta?",
              "Não. O indicador conta mensagens ou notas partilhadas com o adotante.",
            ],
            [
              "Um modelo aprova a candidatura?",
              "Não. Enviar uma mensagem mantém o estado da candidatura.",
            ],
          ],
        },
        {
          slug: "equipa-tarefas-visitas",
          title: "Organizar equipa, tarefas e visitas",
          summary:
            "Distribui o trabalho e prepara horários para receber as famílias.",
          minutes: 3,
          destination: "canil/operacao",
          steps: [
            "Em Equipa e canis, o responsável convida pessoas pelo email da conta e escolhe leitura ou edição.",
            "Cada pessoa aceita o convite na página Convites de equipa. Quem participa em vários canis pode selecionar o canil ativo.",
            "Em Trabalho do dia, cria uma tarefa, associa o animal, define prazo e responsável. Regista o resultado quando terminares.",
            "Na Agenda, cria disponibilidades e define a capacidade de cada horário.",
            "Nas candidaturas, abre Questionário e visitas para confirmar ou reagendar propostas.",
            "Revoga os acessos de quem deixa a equipa. Os leitores consultam informação; os editores podem fazer alterações.",
          ],
          faq: [
            [
              "O convite chega por email?",
              "Nesta versão, o convite é aceite dentro da FYA, em Convites de equipa.",
            ],
            [
              "Os lembretes funcionam automaticamente?",
              "São preparados pela aplicação, mas a entrega depende da configuração de email e da execução periódica dos envios.",
            ],
          ],
        },
        {
          slug: "entrega-acompanhamento",
          title: "Concluir a adoção e acompanhar a família",
          summary:
            "Confirma a entrega e acompanha a adaptação a 7, 30 e 90 dias.",
          minutes: 3,
          destination: "canil/operacao",
          steps: [
            "Em Equipa e canis, configura a checklist de entrega e escolhe se o seu preenchimento é obrigatório.",
            "Na ficha de Registos, confirma os itens realizados e prepara o dossier para a família.",
            "Nas candidaturas, passa pelas etapas aplicáveis até Adoção concluída. A conclusão é final nesta versão.",
            "Para uma adoção realizada fora da plataforma, usa a ação de adoção externa nos Registos.",
            "Consulta Trabalho do dia: a conclusão de uma candidatura gera seguimentos a 7, 30 e 90 dias.",
            "Após cada contacto, regista as observações e conclui a tarefa. Se a família precisar de ajuda, cria uma tarefa para a equipa.",
          ],
          faq: [
            [
              "A checklist substitui os procedimentos externos?",
              "Não. A equipa continua responsável pelos procedimentos e comprovativos aplicáveis.",
            ],
            [
              "Existe um processo de devolução?",
              "Não. Esta versão não inclui devoluções nem reabertura de adoções concluídas.",
            ],
          ],
        },
      ]
    : [
        {
          slug: "registar-animal",
          title: "Register and publish an animal",
          summary:
            "Create a public profile, add photos and organise private records.",
          minutes: 3,
          destination: "canil/animais",
          steps: [
            "Open My Pets and add an animal. Fill in its name, species, sex, size, age and public description.",
            "Save and add animal photos. Keep documents and personal data out of public images.",
            "Open Records for the internal reference, microchip, intake, location, health and behaviour notes. These fields are private.",
            "Publication requires shelter verification. Check publication in Records and review the public profile.",
            "Use Archive to stop advertising while preserving history.",
          ],
          faq: [
            [
              "Is the microchip public?",
              "No. It belongs to the private team record.",
            ],
            [
              "Can I import existing animals?",
              "Yes. Use Import and export, review the CSV preview and confirm. Imported animals start unpublished.",
            ],
          ],
        },
        {
          slug: "documentos-dossier",
          title: "Documents and adoption dossier",
          summary:
            "Collect documents and share selected files with the family.",
          minutes: 3,
          destination: "canil/animais",
          steps: [
            "Open an animal’s Records and upload a PDF, JPEG or PNG up to 10 MiB with a title and category.",
            "Mark only appropriate files as shareable.",
            "Fill in handover information. Internal, health and behaviour notes are not automatically included.",
            "Choose an interview, approved or completed application, select documents and a 7, 14 or 30-day expiry.",
            "Send the share. The email contains a secure link; the recipient signs in with the application account.",
            "Check delivery in Daily work and revoke the share in Records if needed.",
          ],
          faq: [
            [
              "Are documents attached to the email?",
              "No. The email contains an authenticated link.",
            ],
            [
              "Why can I not send?",
              "Check the eligible application and shareable files. FYA’s administrator must configure email delivery.",
            ],
          ],
        },
        {
          slug: "candidaturas-respostas",
          title: "Applications and reply templates",
          summary:
            "Find waiting applications, assign owners and prepare replies.",
          minutes: 3,
          destination: "canil/pedidos",
          steps: [
            "Open Adoption Requests and search by animal, applicant name or email.",
            "Combine status, assignee and age filters. Select unanswered active applications to find people waiting.",
            "Save an assignee. This does not change notes or application status.",
            "Create team templates with {animal}, {adotante} and {canil}.",
            "Open Reply to applicant, insert a template, review and edit it, then send it to the conversation.",
            "Change status separately. Status notes are shared; use Daily work for internal notes.",
          ],
          faq: [
            [
              "Do internal notes count as a response?",
              "No. Only messages or shared notes count.",
            ],
            [
              "Does a reply approve the application?",
              "No. Sending a message preserves the status.",
            ],
          ],
        },
        {
          slug: "equipa-tarefas-visitas",
          title: "Team, tasks and visits",
          summary: "Assign work and arrange availability for families.",
          minutes: 3,
          destination: "canil/operacao",
          steps: [
            "In Team and shelters, the owner invites readers or editors by their account email.",
            "Members accept in Team invitations. Members of multiple shelters can choose their active shelter.",
            "Create tasks in Daily work with an animal, deadline and assignee. Record outcomes on completion.",
            "Set available slots and capacity in the Calendar.",
            "Open Questionnaire and visits on an application to confirm or reschedule proposals.",
            "Revoke access when someone leaves. Readers can view; editors can make changes.",
          ],
          faq: [
            [
              "Are invitations emailed?",
              "Currently invitations are accepted inside FYA, on Team invitations.",
            ],
            [
              "Are reminders automatic?",
              "The app prepares reminders, but delivery requires configured email and a scheduled worker.",
            ],
          ],
        },
        {
          slug: "entrega-acompanhamento",
          title: "Complete adoption and follow up",
          summary: "Check the handover and follow up at 7, 30 and 90 days.",
          minutes: 3,
          destination: "canil/operacao",
          steps: [
            "Configure the handover checklist in Team and shelters and choose whether it is mandatory.",
            "Check completed items in the animal’s Records and prepare the family dossier.",
            "Progress the application through the applicable stages to Adoption completed. Completion is final.",
            "For adoption outside FYA, use the external adoption action in Records.",
            "A completed application creates follow-up tasks at 7, 30 and 90 days in Daily work.",
            "Record outcomes after contact and create further support tasks if needed.",
          ],
          faq: [
            [
              "Does the checklist replace external procedures?",
              "No. The shelter remains responsible for applicable procedures and records.",
            ],
            [
              "Is there a return process?",
              "No. Returns and reopening completed adoptions are not included.",
            ],
          ],
        },
      ];
}
export function searchGuides(locale: string, query: string) {
  const normal = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const terms = normal(query.trim().slice(0, 160)).split(/\s+/).filter(Boolean);
  return helpGuides(locale).filter((g) =>
    terms.every((t) =>
      normal(
        [g.title, g.summary, ...g.steps, ...g.faq.flat()].join(" "),
      ).includes(t),
    ),
  );
}
