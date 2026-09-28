import type { Locale } from "@/lib/i18n/config";

type Dictionary = {
  nav: {
    home: string;
    pets: string;
    shelters: string;
    stories: string;
    notifications: string;
    login: string;
    register: string;
    userDashboard: string;
    userRequests: string;
    userMessages: string;
    userSettings: string;
    userFavorites: string;
    canilDashboard: string;
    canilSettings: string;
    admin: string;
    logout: string;
  };
  home: {
    hero: {
      eyebrow: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
      searchLabel: string;
      searchPlaceholder: string;
      searchAriaLabel: string;
      quickMeetLabel: string;
      species: {
        dog: string;
        cat: string;
        other: string;
      };
      heroImageAlt: string;
      illustrativeBadge: string;
      cardTitle: string;
      cardSubtitle: string;
    };
    trustBar: [string, string, string];
    featured: {
      eyebrow: string;
      title: string;
      viewAll: string;
      emptyDescription: string;
      exploreCatalog: string;
    };
    journey: {
      eyebrow: string;
      title: string;
      helpChoose: string;
      steps: [
        { title: string; text: string },
        { title: string; text: string },
        { title: string; text: string },
      ];
    };
  };
  footer: {
    tagline: string;
    findConnection: string;
    links: {
      pets: string;
      shelters: string;
      stories: string;
      about: string;
    };
    joinTitle: string;
    joinDescription: string;
    registerShelter: string;
    closingLine: string;
  };
  aboutFamily: {
    imageAlt: string;
    quote: string;
    eyebrow: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    closingQuote: string;
    cta: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    loginSubmit: string;
    registerTitle: string;
    registerSubtitle: string;
    fullName: string;
    email: string;
    password: string;
    accountType: string;
    adopter: string;
    canil: string;
    submit: string;
    invalidData: string;
    invalidCredentials: string;
    accountCreated: string;
    noAccount: string;
    hasAccount: string;
    goToRegister: string;
    goToLogin: string;
    shelterRegistrationTitle: string;
    shelterRegistrationSubtitle: string;
    shelterIdentitySection: string;
    shelterName: string;
    shelterLocation: string;
    shelterMission: string;
    contactPersonSection: string;
    contactRole: string;
    contactPhone: string;
    verificationSection: string;
    registrationCertificateLabel: string;
    registrationCertificateHint: string;
    shelterDeclaration: string;
    saveDraft: string;
    finalizeRegistration: string;
    shelterRegistrationLink: string;
  };
  petCatalog: {
    title: string;
    subtitle: string;
    resultCount: string;
    gridView: string;
    listView: string;
    filtersTitle: string;
    filtersSubtitle: string;
    clearFilters: string;
    sections: {
      species: string;
      ageRange: string;
      size: string;
      gender: string;
      compatibility: string;
    };
    speciesOptions: {
      dog: string;
      cat: string;
      other: string;
    };
    searchPlaceholder: string;
    pagination: {
      previous: string;
      next: string;
    };
    tags: {
      newArrival: string;
      urgent: string;
    };
  };
  petDetails: {
    backToCatalog: string;
    healthStatus: string;
    personality: string;
    storyTitle: string;
    medicalSummaryTitle: string;
    contactCardTitle: string;
    contactCardSubtitle: string;
    applyCta: string;
    saveCta: string;
    adoptionHintTitle: string;
    adoptionHintDescription: string;
    similarPetsTitle: string;
  };
  admin: {
    title: string;
    subtitle: string;
    filterConfigTitle: string;
    filterConfigDescription: string;
    species: string;
    ageRanges: string;
    sizes: string;
    genders: string;
    compatibilities: string;
    hint: string;
    save: string;
    success: string;
    unauthorized: string;
    genericError: string;
  };
  canilProfile: {
    title: string;
    subtitle: string;
    shelterRole: string;
    verifiedLabel: string;
    verifiedValue: string;
    unverifiedValue: string;
    emailLabel: string;
    phoneLabel: string;
    locationLabel: string;
    joinedLabel: string;
    notProvided: string;
    stats: {
      activePets: string;
      completedAdoptions: string;
      pendingRequests: string;
      responseTime: string;
      comingSoon: string;
    };
    aboutTitle: string;
    aboutDescription: string;
    tagsTitle: string;
    editProfile: string;
    managePets: string;
    quickActionsTitle: string;
    postNewPet: string;
    viewMessages: string;
    exportReport: string;
    profileProgressTitle: string;
    profileProgressDescription: string;
    openProfileCta: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  pt: {
    nav: {
      home: "Início",
      pets: "Animais",
      shelters: "Abrigos",
      stories: "Histórias",
      notifications: "Notificações",
      login: "Entrar",
      register: "Registar",
      userDashboard: "Dashboard Adotante",
      userRequests: "Meus Pedidos",
      userMessages: "Mensagens",
      userSettings: "Configurações",
      userFavorites: "Favoritos",
      canilDashboard: "Dashboard Canil",
      canilSettings: "Configurações do Canil",
      admin: "Admin",
      logout: "Sair",
    },
    home: {
      hero: {
        eyebrow: "Pequenos encontros. Grandes histórias.",
        titleLine1: "O teu melhor amigo",
        titleLine2: "está por aqui.",
        subtitle:
          "Há uma nova história à tua espera. Conhece animais para adoção e os abrigos que cuidam deles, até encontrarem um lugar a que chamar casa.",
        searchLabel: "Procurar um animal",
        searchPlaceholder: "Quem gostavas de conhecer?",
        searchAriaLabel: "Pesquisar",
        quickMeetLabel: "Quero conhecer",
        species: {
          dog: "Cães",
          cat: "Gatos",
          other: "Outros amigos",
        },
        heroImageAlt: "Retrato ilustrativo de um cão ao ar livre",
        illustrativeBadge: "Imagem ilustrativa",
        cardTitle: "Uma casa muda tudo.",
        cardSubtitle: "A próxima história pode ser a tua.",
      },
      trustBar: [
        "Adoção com responsabilidade",
        "Contacto direto com os abrigos",
        "Acompanhamento em cada passo",
      ],
      featured: {
        eyebrow: "À procura de uma família",
        title: "Um encontro que fica.",
        viewAll: "Conhecer todos",
        emptyDescription:
          "Cada adoção começa por conhecer melhor um animal. Explora o catálogo e encontra os próximos companheiros.",
        exploreCatalog: "Explorar catálogo",
      },
      journey: {
        eyebrow: "Mais perto de casa",
        title: "O início de uma boa história.",
        helpChoose: "Ajuda-me a escolher",
        steps: [
          {
            title: "Encontra uma ligação",
            text: "Descobre os animais, as suas histórias e as necessidades de cada um.",
          },
          {
            title: "Vamos conversar",
            text: "Apresenta-te ao abrigo, coloca as tuas dúvidas e combina uma visita.",
          },
          {
            title: "Abre a porta de casa",
            text: "Prepara a chegada com o abrigo e acompanha cada etapa da adoção.",
          },
        ],
      },
    },
    footer: {
      tagline:
        "Ajudamos animais e pessoas a escrever a sua próxima história. Juntos.",
      findConnection: "Encontra uma ligação",
      links: {
        pets: "Animais para adoção",
        shelters: "Conhecer os abrigos",
        stories: "Novos começos",
        about: "Sobre nós",
      },
      joinTitle: "Faz parte",
      joinDescription:
        "Representas um abrigo? Dá a conhecer os animais que esperam por uma família.",
      registerShelter: "Registar o meu abrigo",
      closingLine: "Mais encontros. Mais finais felizes.",
    },
    aboutFamily: {
      imageAlt:
        "Retrato ilustrado da família FYA: o casal e o filho junto ao rio",
      quote: "Uma família. Uma paixão em comum.",
      eyebrow: "Sobre nós",
      title: "O amor pelos animais começa em casa.",
      paragraph1:
        "Somos uma família — um casal e o nosso filho — unida pela paixão pelos animais. A FYA nasce dessa ligação e da vontade de a transformar em ajuda para quem mais precisa.",
      paragraph2:
        "Queremos dar mais visibilidade aos animais dos canis e abrigos e ajudar os animais abandonados a encontrar uma família. Aproximamos quem cuida deles de quem está pronto para lhes abrir a porta de casa, com tempo, carinho e responsabilidade.",
      closingQuote: "Porque todos merecem um lugar onde pertencer.",
      cta: "Conhece quem espera por uma família",
    },
    auth: {
      loginTitle: "Entrar",
      loginSubtitle: "Acede com o teu email e password.",
      loginSubmit: "Entrar",
      registerTitle: "Criar conta",
      registerSubtitle: "Escolhe o teu perfil: Adotante ou Canil.",
      fullName: "Nome completo",
      email: "Email",
      password: "Password",
      accountType: "Tipo de conta",
      adopter: "Adotante",
      canil: "Canil",
      submit: "Criar conta",
      invalidData: "Dados invalidos",
      invalidCredentials: "Credenciais invalidas",
      accountCreated: "Conta criada. Verifique o email",
      noAccount: "Ainda não tens conta?",
      hasAccount: "Já tens conta?",
      goToRegister: "Criar conta",
      goToLogin: "Entrar",
      shelterRegistrationTitle: "Registo de Canis - Joyful Sanctuary",
      shelterRegistrationSubtitle:
        "Torne-se um parceiro da FYA completando o registo do abrigo e os dados de verificação.",
      shelterIdentitySection: "Identidade do Abrigo",
      shelterName: "Nome do Abrigo / Canil",
      shelterLocation: "Localização (Cidade/Distrito)",
      shelterMission: "Declaração de Missao",
      contactPersonSection: "Pessoa de Contacto",
      contactRole: "Cargo / Função",
      contactPhone: "Telefone",
      verificationSection: "Verificação",
      registrationCertificateLabel:
        "Carregue o Certificado de Registro da Entidade",
      registrationCertificateHint: "PDF, JPG ou PNG (Max 5MB)",
      shelterDeclaration:
        "Confirmo que as informações fornecidas são verdadeiras e que tenho autoridade para representar este abrigo na plataforma FYA (Found Your Animal).",
      saveDraft: "Guardar Rascunho",
      finalizeRegistration: "Finalizar Registo",
      shelterRegistrationLink: "Registar canil com formulario completo",
    },
    petCatalog: {
      title: "Animais disponíveis para adoção",
      subtitle:
        "Explora animais de vários canis e encontra o teu próximo melhor amigo.",
      resultCount: "A mostrar 1.240 animais em procura de uma família.",
      gridView: "Grelha",
      listView: "Lista",
      filtersTitle: "Filtrar resultados",
      filtersSubtitle: "Encontra o match ideal",
      clearFilters: "Limpar filtros",
      sections: {
        species: "Espécie",
        ageRange: "Faixa etaria",
        size: "Porte",
        gender: "Género",
        compatibility: "Compatibilidade",
      },
      speciesOptions: {
        dog: "Cão",
        cat: "Gato",
        other: "Outro",
      },
      searchPlaceholder: "Pesquisa por raça ou nome...",
      pagination: {
        previous: "Pagina anterior",
        next: "Próxima página",
      },
      tags: {
        newArrival: "Novo",
        urgent: "Urgente",
      },
    },
    petDetails: {
      backToCatalog: "Voltar ao catálogo",
      healthStatus: "Estado de saúde",
      personality: "Personalidade",
      storyTitle: "História",
      medicalSummaryTitle: "Resumo médico",
      contactCardTitle: "Contacto do canil",
      contactCardSubtitle:
        "Responderemos em até 24 horas com os próximos passos da adoção.",
      applyCta: "Candidatar para adotar",
      saveCta: "Guardar pet",
      adoptionHintTitle: "Dica para adoção",
      adoptionHintDescription:
        "Partilha a tua rotina e experiência com animais para acelerar a avaliação.",
      similarPetsTitle: "Conhece mais amigos",
    },
    admin: {
      title: "Painel de administração",
      subtitle: "Configura os dados globais da plataforma.",
      filterConfigTitle: "Configuração dos filtros do catálogo",
      filterConfigDescription:
        "Define que opções aparecem no filtro do catálogo.",
      species: "Espécies",
      ageRanges: "Faixas etarias",
      sizes: "Portes",
      genders: "Generos",
      compatibilities: "Compatibilidades",
      hint: "Separar opções com virgulas (ex: Cão, Gato, Outro).",
      save: "Guardar configuração",
      success: "Configuração atualizada com sucesso.",
      unauthorized: "Não autorizado para esta operação.",
      genericError: "Não foi possível guardar. Tenta novamente.",
    },
    canilProfile: {
      title: "Perfil do Abrigo",
      subtitle:
        "Gere a identidade publica do teu abrigo na FYA (Found Your Animal).",
      shelterRole: "Abrigo",
      verifiedLabel: "Verificação",
      verifiedValue: "Verificado",
      unverifiedValue: "Pendente",
      emailLabel: "Email",
      phoneLabel: "Telefone",
      locationLabel: "Localização",
      joinedLabel: "Membro desde",
      notProvided: "Não definido",
      stats: {
        activePets: "Pets ativos",
        completedAdoptions: "Adoções concluídas",
        pendingRequests: "Pedidos pendentes",
        responseTime: "Tempo de resposta",
        comingSoon: "Em breve",
      },
      aboutTitle: "Sobre o abrigo",
      aboutDescription:
        "Mantem este perfil atualizado para aumentar a confianca dos adotantes e melhorar a taxa de resposta.",
      tagsTitle: "Especialidades e comodidades",
      editProfile: "Editar perfil",
      managePets: "Gerir animais",
      quickActionsTitle: "Acoes rapidas",
      postNewPet: "Publicar novo pet",
      viewMessages: "Ver mensagens",
      exportReport: "Exportar relatorio",
      profileProgressTitle: "Progresso do perfil",
      profileProgressDescription:
        "Perfil base concluído. Completa telefone e localização para maior destaque.",
      openProfileCta: "Abrir perfil do abrigo",
    },
  },
  en: {
    nav: {
      home: "Home",
      pets: "Pet Catalog",
      shelters: "Shelters",
      stories: "Stories",
      notifications: "Notifications",
      login: "Login",
      register: "Register",
      userDashboard: "Adopter Dashboard",
      userRequests: "My Requests",
      userMessages: "Messages",
      userSettings: "Settings",
      userFavorites: "Favorites",
      canilDashboard: "Shelter Dashboard",
      canilSettings: "Shelter Settings",
      admin: "Admin",
      logout: "Sign out",
    },
    home: {
      hero: {
        eyebrow: "Small encounters. Big stories.",
        titleLine1: "Your best friend",
        titleLine2: "is waiting here.",
        subtitle:
          "A new story is waiting for you. Meet animals looking for a home and the shelters caring for them along the way.",
        searchLabel: "Find an animal",
        searchPlaceholder: "Who would you like to meet?",
        searchAriaLabel: "Search",
        quickMeetLabel: "I'd love to meet",
        species: {
          dog: "Dogs",
          cat: "Cats",
          other: "Other friends",
        },
        heroImageAlt: "Illustrative portrait of a dog outdoors",
        illustrativeBadge: "Illustrative image",
        cardTitle: "A home changes everything.",
        cardSubtitle: "The next story could be yours.",
      },
      trustBar: [
        "Responsible adoption",
        "Direct contact with shelters",
        "Support at every step",
      ],
      featured: {
        eyebrow: "Looking for a family",
        title: "A connection that lasts.",
        viewAll: "Meet them all",
        emptyDescription:
          "Every adoption starts by getting to know an animal. Explore the catalog to find your next companion.",
        exploreCatalog: "Explore catalog",
      },
      journey: {
        eyebrow: "Closer to home",
        title: "The start of a good story.",
        helpChoose: "Help me choose",
        steps: [
          {
            title: "Find a connection",
            text: "Discover animals, their stories and their individual needs.",
          },
          {
            title: "Start a conversation",
            text: "Introduce yourself to the shelter, ask questions and arrange a visit.",
          },
          {
            title: "Open your door",
            text: "Prepare for their arrival with the shelter and follow every step.",
          },
        ],
      },
    },
    footer: {
      tagline:
        "Helping animals and people write their next story. Together.",
      findConnection: "Find a connection",
      links: {
        pets: "Animals for adoption",
        shelters: "Meet the shelters",
        stories: "New beginnings",
        about: "About us",
      },
      joinTitle: "Be part of it",
      joinDescription:
        "Represent a shelter? Introduce the animals waiting for a family.",
      registerShelter: "Register my shelter",
      closingLine: "More connections. More happy endings.",
    },
    aboutFamily: {
      imageAlt:
        "Illustrated portrait of the FYA family: the couple and their son by the river",
      quote: "One family. One shared passion.",
      eyebrow: "About us",
      title: "Our love for animals starts at home.",
      paragraph1:
        "We are a family — a couple and our son — brought together by a love of animals. FYA grows out of that bond and our wish to turn it into help for those who need it most.",
      paragraph2:
        "We want to give animals in shelters more visibility and help abandoned animals find a family. We connect the people caring for them with those ready to welcome them home with time, kindness and responsibility.",
      closingQuote: "Because everyone deserves a place to belong.",
      cta: "Meet those waiting for a family",
    },
    auth: {
      loginTitle: "Login",
      loginSubtitle: "Sign in with your email and password.",
      loginSubmit: "Sign in",
      registerTitle: "Create account",
      registerSubtitle: "Choose your profile: Adopter or Shelter.",
      fullName: "Full name",
      email: "Email",
      password: "Password",
      accountType: "Account type",
      adopter: "Adopter",
      canil: "Shelter",
      submit: "Create account",
      invalidData: "Invalid data",
      invalidCredentials: "Invalid credentials",
      accountCreated: "Account created. Please check your email",
      noAccount: "Don't have an account yet?",
      hasAccount: "Already have an account?",
      goToRegister: "Create account",
      goToLogin: "Sign in",
      shelterRegistrationTitle: "Shelter Registration - Become a Partner",
      shelterRegistrationSubtitle:
        "Become an FYA partner by completing your shelter profile and verification information.",
      shelterIdentitySection: "Shelter Identity",
      shelterName: "Shelter Name",
      shelterLocation: "Location (City/Region)",
      shelterMission: "Mission Statement",
      contactPersonSection: "Contact Person",
      contactRole: "Role / Position",
      contactPhone: "Phone",
      verificationSection: "Verification",
      registrationCertificateLabel:
        "Upload Organization Registration Certificate",
      registrationCertificateHint: "PDF, JPG, or PNG (Max 5MB)",
      shelterDeclaration:
        "I confirm that the provided information is accurate and that I am authorized to represent this shelter on FYA (Found Your Animal).",
      saveDraft: "Save Draft",
      finalizeRegistration: "Complete Registration",
      shelterRegistrationLink: "Register shelter with full form",
    },
    petCatalog: {
      title: "Available pets for adoption",
      subtitle:
        "Explore animals from trusted shelters and find your next best friend.",
      resultCount: "Showing 1,240 pets currently looking for a family.",
      gridView: "Grid",
      listView: "List",
      filtersTitle: "Filter results",
      filtersSubtitle: "Find your perfect match",
      clearFilters: "Clear filters",
      sections: {
        species: "Species",
        ageRange: "Age range",
        size: "Size",
        gender: "Gender",
        compatibility: "Compatibility",
      },
      speciesOptions: {
        dog: "Dog",
        cat: "Cat",
        other: "Other",
      },
      searchPlaceholder: "Search by breed or name...",
      pagination: {
        previous: "Previous page",
        next: "Next page",
      },
      tags: {
        newArrival: "New arrival",
        urgent: "Urgent",
      },
    },
    petDetails: {
      backToCatalog: "Back to catalog",
      healthStatus: "Health status",
      personality: "Personality",
      storyTitle: "Story",
      medicalSummaryTitle: "Medical summary",
      contactCardTitle: "Shelter contact",
      contactCardSubtitle:
        "We usually reply within 24 hours with the next adoption steps.",
      applyCta: "Apply to adopt",
      saveCta: "Save pet",
      adoptionHintTitle: "Adoption tip",
      adoptionHintDescription:
        "Share your routine and pet experience to speed up the review.",
      similarPetsTitle: "Meet more friends",
    },
    admin: {
      title: "Admin panel",
      subtitle: "Configure global platform data.",
      filterConfigTitle: "Pet catalog filter configuration",
      filterConfigDescription:
        "Define which options appear in the pet catalog filters.",
      species: "Species",
      ageRanges: "Age ranges",
      sizes: "Sizes",
      genders: "Genders",
      compatibilities: "Compatibilities",
      hint: "Separate options with commas (e.g. Dog, Cat, Other).",
      save: "Save configuration",
      success: "Configuration updated successfully.",
      unauthorized: "Not authorized for this operation.",
      genericError: "Could not save. Please try again.",
    },
    canilProfile: {
      title: "Shelter Profile",
      subtitle:
        "Manage your shelter public identity on FYA (Found Your Animal).",
      shelterRole: "Shelter",
      verifiedLabel: "Verification",
      verifiedValue: "Verified",
      unverifiedValue: "Pending",
      emailLabel: "Email",
      phoneLabel: "Phone",
      locationLabel: "Location",
      joinedLabel: "Member since",
      notProvided: "Not provided",
      stats: {
        activePets: "Active pets",
        completedAdoptions: "Completed adoptions",
        pendingRequests: "Pending requests",
        responseTime: "Response time",
        comingSoon: "Coming soon",
      },
      aboutTitle: "About the shelter",
      aboutDescription:
        "Keep this profile updated to increase adopter trust and improve your response rate.",
      tagsTitle: "Specializations and amenities",
      editProfile: "Edit profile",
      managePets: "Manage pets",
      quickActionsTitle: "Quick actions",
      postNewPet: "Post new pet",
      viewMessages: "View messages",
      exportReport: "Export report",
      profileProgressTitle: "Profile progress",
      profileProgressDescription:
        "Base profile is complete. Add phone and location for better visibility.",
      openProfileCta: "Open shelter profile",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
