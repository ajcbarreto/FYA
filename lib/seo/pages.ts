// Titles (topic only; " | FYA" is appended) and descriptions for fixed pages.
// Indexable pages are checked in tests: title 50–60 characters with the
// brand, description 140–160 characters.

type Copy = { title: string; description: string };
type PageCopy = { pt: Copy; en: Copy; noindex?: boolean };

export const pageCopy = {
  home: {
    pt: {
      title: "Adoção de cães e gatos de canis e associações",
      description:
        "Vê animais para adoção publicados por canis e associações, envia a candidatura online, fala com a equipa e combina uma visita antes de decidir.",
    },
    en: {
      title: "Adopt dogs and cats from shelters and rescues",
      description:
        "See animals for adoption published by shelters and rescue groups, apply online, talk to the team and arrange a visit before you decide to adopt.",
    },
  },
  pets: {
    pt: {
      title: "Cães e gatos para adoção em canis e associações",
      description:
        "Catálogo de cães, gatos e outros animais para adoção. Filtra por espécie, idade, porte, compatibilidade e localidade e lê a ficha feita pelo canil.",
    },
    en: {
      title: "Animals for adoption from shelters and rescues",
      description:
        "Browse dogs, cats and other animals for adoption. Filter by species, age, size, compatibility and location, and read the profile from the shelter.",
    },
  },
  shelters: {
    pt: {
      title: "Lista de canis e associações com animais para adoção",
      description:
        "Canis e associações registados na FYA, com localização, apresentação e os animais que cada um tem para adoção. Contacta a equipa diretamente.",
    },
    en: {
      title: "Shelters and rescue groups with animals to adopt",
      description:
        "Shelters and rescue groups registered on FYA, with their location, an introduction and the animals each one has for adoption. Contact them directly.",
    },
  },
  stories: {
    pt: {
      title: "Animais já adotados através de canis e associações",
      description:
        "Animais que já encontraram família através dos canis e associações da FYA. Vê as adoções concluídas e os animais que ainda esperam por uma casa.",
    },
    en: {
      title: "Animals adopted through shelters and rescue groups",
      description:
        "Animals that have found a family through the shelters and rescue groups on FYA. See completed adoptions and the animals still waiting for a home.",
    },
  },
  match: {
    pt: {
      title: "Que animal adotar? Três perguntas para escolher",
      description:
        "Responde a três perguntas sobre o animal que procuras, a tua casa e o tempo que tens, e abre o catálogo já filtrado com animais mais compatíveis.",
    },
    en: {
      title: "Which animal should you adopt? Three questions",
      description:
        "Answer three questions about the animal you want, your home and the time you have, and open the catalog already filtered for compatible animals.",
    },
  },
  help: {
    pt: {
      title: "Centro de ajuda: guias para canis e associações",
      description:
        "Guias passo a passo para canis e associações: registar animais, organizar documentos e dossiers, responder a candidaturas e acompanhar adoções.",
    },
    en: {
      title: "Help centre for animal shelters and rescue groups",
      description:
        "Step-by-step guides for shelters and rescue groups: registering animals, organising documents, answering applications and following up adoptions.",
    },
  },
  forShelters: {
    pt: {
      title: "Plataforma de gestão para canis e associações",
      description:
        "Registos dos animais, candidaturas, documentos, equipa e acompanhamento depois da adoção num só sítio. Pede uma demonstração e conhece o piloto.",
    },
    en: {
      title: "Management platform for shelters and rescues",
      description:
        "Animal records, applications, documents, your team and follow-up after adoption in one place. Request a demonstration and learn about the pilot.",
    },
  },
  privacy: {
    pt: {
      title: "Privacidade e proteção de dados de adotantes e canis",
      description:
        "Que dados pessoais a FYA usa durante o piloto (conta, candidaturas e mensagens), como os canis guardam os registos e que cookies o site utiliza.",
    },
    en: {
      title: "Privacy and personal data of adopters and shelters",
      description:
        "Which personal data FYA uses during the pilot (account, applications and messages), how shelters keep their records and which cookies the site uses.",
    },
  },
  terms: {
    pt: {
      title: "Condições de utilização e regras do período piloto",
      description:
        "Regras da FYA durante o piloto: o canil avalia as candidaturas, cada pessoa usa uma conta própria e os donativos em links externos não passam pela FYA.",
    },
    en: {
      title: "Terms of use and pilot rules for adopters and shelters",
      description:
        "FYA rules during the pilot: the shelter assesses applications, each person uses their own account, and donations via external links do not go through FYA.",
    },
  },
  login: {
    noindex: true,
    pt: {
      title: "Entrar",
      description:
        "Entra na tua conta FYA para acompanhar candidaturas, falar com os canis e gerir os animais do teu canil.",
    },
    en: {
      title: "Sign in",
      description:
        "Sign in to your FYA account to follow applications, talk to shelters and manage your shelter's animals.",
    },
  },
  register: {
    noindex: true,
    pt: {
      title: "Criar conta de adotante",
      description:
        "Cria uma conta de adotante na FYA para enviar candidaturas, falar com os canis e guardar animais nos favoritos.",
    },
    en: {
      title: "Create an adopter account",
      description:
        "Create an adopter account on FYA to send applications, talk to shelters and save animals to your favourites.",
    },
  },
  shelterRegistration: {
    noindex: true,
    pt: {
      title: "Registo de canis e associações",
      description:
        "Cria a conta do teu canil ou associação na FYA para publicar animais, receber candidaturas e organizar a equipa.",
    },
    en: {
      title: "Shelter and rescue group registration",
      description:
        "Create your shelter or rescue group account on FYA to publish animals, receive applications and organise your team.",
    },
  },
  forgotPassword: {
    noindex: true,
    pt: {
      title: "Recuperar palavra-passe",
      description:
        "Pede um email para definir uma nova palavra-passe da tua conta FYA.",
    },
    en: {
      title: "Reset your password",
      description:
        "Request an email to set a new password for your FYA account.",
    },
  },
  resetPassword: {
    noindex: true,
    pt: {
      title: "Definir nova palavra-passe",
      description: "Define a nova palavra-passe da tua conta FYA.",
    },
    en: {
      title: "Set a new password",
      description: "Set the new password for your FYA account.",
    },
  },
  checkEmail: {
    noindex: true,
    pt: {
      title: "Confirma o teu email",
      description: "Enviámos um email para confirmares a tua conta FYA.",
    },
    en: {
      title: "Check your email",
      description: "We sent you an email to confirm your FYA account.",
    },
  },
  mfa: {
    noindex: true,
    pt: {
      title: "Verificação em dois passos",
      description: "Confirma o segundo fator de autenticação da tua conta FYA.",
    },
    en: {
      title: "Two-step verification",
      description:
        "Confirm the second authentication factor for your FYA account.",
    },
  },
  notifications: {
    noindex: true,
    pt: { title: "Notificações", description: "As tuas notificações na FYA." },
    en: { title: "Notifications", description: "Your notifications on FYA." },
  },
  invitations: {
    noindex: true,
    pt: {
      title: "Convites de equipa",
      description:
        "Aceita os convites para te juntares à equipa de um canil na FYA.",
    },
    en: {
      title: "Team invitations",
      description: "Accept invitations to join a shelter team on FYA.",
    },
  },
  accountSupport: {
    noindex: true,
    pt: {
      title: "As minhas ajudas",
      description: "Os apoios que registaste a canis e associações na FYA.",
    },
    en: {
      title: "My support",
      description:
        "The support you pledged to shelters and rescue groups on FYA.",
    },
  },
  accountPrivacy: {
    noindex: true,
    pt: {
      title: "Os meus dados",
      description: "Exporta os teus dados ou faz pedidos de privacidade à FYA.",
    },
    en: {
      title: "My data",
      description: "Export your data or make privacy requests to FYA.",
    },
  },
  userArea: {
    noindex: true,
    pt: {
      title: "Área do adotante",
      description:
        "Candidaturas, mensagens, favoritos e definições da tua conta FYA.",
    },
    en: {
      title: "Adopter area",
      description:
        "Applications, messages, favourites and settings for your FYA account.",
    },
  },
  shelterArea: {
    noindex: true,
    pt: {
      title: "Área do canil",
      description:
        "Gestão dos animais, candidaturas, equipa e agenda do canil na FYA.",
    },
    en: {
      title: "Shelter area",
      description:
        "Manage your shelter's animals, applications, team and agenda on FYA.",
    },
  },
  adminArea: {
    noindex: true,
    pt: {
      title: "Administração",
      description: "Administração da plataforma FYA.",
    },
    en: {
      title: "Administration",
      description: "FYA platform administration.",
    },
  },
} satisfies Record<string, PageCopy>;

export type PageKey = keyof typeof pageCopy;
