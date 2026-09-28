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
    };
    featured: {
      eyebrow: string;
      title: string;
      viewAll: string;
      emptyDescription: string;
      exploreCatalog: string;
    };
    journey: {
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
    exploreTitle: string;
    links: {
      pets: string;
      shelters: string;
      stories: string;
      about: string;
    };
    joinTitle: string;
    joinDescription: string;
    registerShelter: string;
  };
  aboutFamily: {
    imageAlt: string;
    caption: string;
    eyebrow: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
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
        eyebrow: "Adoção de animais de canis e associações",
        titleLine1: "Animais para adoção,",
        titleLine2: "direto dos canis.",
        subtitle:
          "As fichas são publicadas pelas equipas que cuidam de cada animal. Fazes a candidatura aqui, trocas mensagens com o canil e combinam a visita antes de decidir.",
        searchLabel: "Procurar um animal",
        searchPlaceholder: "Nome ou raça",
        searchAriaLabel: "Pesquisar",
        quickMeetLabel: "Ver só",
        species: {
          dog: "Cães",
          cat: "Gatos",
          other: "Outros animais",
        },
      },
      featured: {
        eyebrow: "Publicados recentemente",
        title: "Alguns dos animais disponíveis",
        viewAll: "Ver todos os animais",
        emptyDescription:
          "Ainda não há animais publicados. Quando os canis publicarem as primeiras fichas, aparecem aqui.",
        exploreCatalog: "Abrir o catálogo",
      },
      journey: {
        title: "Como funciona a adoção",
        helpChoose: "Não sabes por onde começar? Responde a três perguntas",
        steps: [
          {
            title: "Escolhe um animal",
            text: "Filtra por espécie, idade, porte e compatibilidade, e lê a ficha escrita pelo canil.",
          },
          {
            title: "Envia a candidatura",
            text: "Contas como é a tua casa e a tua rotina. O canil responde e podes tirar dúvidas por mensagem.",
          },
          {
            title: "Conhece-o antes de decidir",
            text: "Marcam uma visita. Se correr bem, preparam juntos a entrega e o acompanhamento.",
          },
        ],
      },
    },
    footer: {
      tagline:
        "Catálogo de animais para adoção publicado por canis e associações, com candidatura, mensagens e visitas no mesmo sítio.",
      exploreTitle: "Explorar",
      links: {
        pets: "Animais para adoção",
        shelters: "Canis e associações",
        stories: "Animais adotados",
        about: "Quem somos",
      },
      joinTitle: "Tens um canil ou associação?",
      joinDescription:
        "Publica os animais, recebe candidaturas e acompanha cada adoção com a tua equipa.",
      registerShelter: "Registar o canil",
    },
    aboutFamily: {
      imageAlt:
        "Retrato ilustrado da família FYA: o casal e o filho junto ao rio",
      caption: "Ilustração da família que criou a FYA.",
      eyebrow: "Quem somos",
      title: "Uma família que gosta de animais",
      paragraph1:
        "A FYA foi criada por uma família, um casal e o nosso filho, que partilha o gosto pelos animais. Quisemos transformar esse gosto em ajuda concreta.",
      paragraph2:
        "Queremos que os animais dos canis e associações sejam mais vistos e que encontrem família mais depressa. Para isso, juntamos num só sítio quem cuida deles e quem está a pensar adotar, com a informação que cada um precisa para decidir com calma.",
      cta: "Ver os animais para adoção",
    },
    auth: {
      loginTitle: "Entrar",
      loginSubtitle: "Acede com o teu email e password.",
      loginSubmit: "Entrar",
      registerTitle: "Criar conta",
      registerSubtitle:
        "Conta de adotante. Os canis e associações têm um registo próprio.",
      fullName: "Nome completo",
      email: "Email",
      password: "Password",
      accountType: "Tipo de conta",
      adopter: "Adotante",
      canil: "Canil",
      submit: "Criar conta",
      invalidData: "Dados inválidos",
      invalidCredentials: "Credenciais inválidas",
      accountCreated: "Conta criada. Confirma o teu email para entrar.",
      noAccount: "Ainda não tens conta?",
      hasAccount: "Já tens conta?",
      goToRegister: "Criar conta",
      goToLogin: "Entrar",
      shelterRegistrationTitle: "Registo de canis e associações",
      shelterRegistrationSubtitle:
        "Preenche os dados da organização e da pessoa de contacto para criar a conta do canil.",
      shelterIdentitySection: "Dados do canil ou associação",
      shelterName: "Nome do canil ou associação",
      shelterLocation: "Localidade e distrito",
      shelterMission: "Apresentação curta",
      contactPersonSection: "Pessoa de contacto",
      contactRole: "Função na organização",
      contactPhone: "Telefone",
      verificationSection: "Verificação",
      registrationCertificateLabel: "Documento de registo da entidade",
      registrationCertificateHint: "PDF, JPG ou PNG, até 5 MB",
      shelterDeclaration:
        "Confirmo que as informações fornecidas são verdadeiras e que tenho autoridade para representar este abrigo na plataforma FYA (Found Your Animal).",
      saveDraft: "Guardar rascunho",
      finalizeRegistration: "Criar conta do canil",
      shelterRegistrationLink: "Registar um canil ou associação",
    },
    petCatalog: {
      title: "Animais disponíveis para adoção",
      subtitle: "Animais publicados por vários canis e associações.",
      resultCount: "Animais à procura de família.",
      gridView: "Grelha",
      listView: "Lista",
      filtersTitle: "Filtrar resultados",
      filtersSubtitle: "Afina a pesquisa",
      clearFilters: "Limpar filtros",
      sections: {
        species: "Espécie",
        ageRange: "Idade",
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
        previous: "Página anterior",
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
        "O canil responde pela plataforma com os próximos passos.",
      applyCta: "Candidatar para adotar",
      saveCta: "Guardar nos favoritos",
      adoptionHintTitle: "Dica para adoção",
      adoptionHintDescription:
        "Descreve a tua rotina e a experiência que tens com animais. Ajuda o canil a avaliar a candidatura.",
      similarPetsTitle: "Outros animais para adoção",
    },
    admin: {
      title: "Painel de administração",
      subtitle: "Configura os dados globais da plataforma.",
      filterConfigTitle: "Configuração dos filtros do catálogo",
      filterConfigDescription:
        "Define que opções aparecem no filtro do catálogo.",
      species: "Espécies",
      ageRanges: "Faixas etárias",
      sizes: "Portes",
      genders: "Géneros",
      compatibilities: "Compatibilidades",
      hint: "Separa as opções com vírgulas (ex.: Cão, Gato, Outro).",
      save: "Guardar configuração",
      success: "Configuração atualizada com sucesso.",
      unauthorized: "Não autorizado para esta operação.",
      genericError: "Não foi possível guardar. Tenta novamente.",
    },
    canilProfile: {
      title: "Perfil do Abrigo",
      subtitle: "Gere a informação pública do teu abrigo na FYA.",
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
        activePets: "Animais publicados",
        completedAdoptions: "Adoções concluídas",
        pendingRequests: "Pedidos pendentes",
        responseTime: "Tempo de resposta",
        comingSoon: "Em breve",
      },
      aboutTitle: "Sobre o abrigo",
      aboutDescription:
        "Mantém este perfil atualizado para os adotantes saberem com quem estão a falar.",
      tagsTitle: "Especialidades e comodidades",
      editProfile: "Editar perfil",
      managePets: "Gerir animais",
      quickActionsTitle: "Ações rápidas",
      postNewPet: "Publicar animal",
      viewMessages: "Ver mensagens",
      exportReport: "Exportar relatório",
      profileProgressTitle: "Progresso do perfil",
      profileProgressDescription:
        "Perfil base concluído. Falta o telefone e a localização.",
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
        eyebrow: "Adopt from shelters and rescue groups",
        titleLine1: "Animals for adoption,",
        titleLine2: "straight from shelters.",
        subtitle:
          "Profiles are published by the teams caring for each animal. You apply here, message the shelter and arrange a visit before you decide.",
        searchLabel: "Find an animal",
        searchPlaceholder: "Name or breed",
        searchAriaLabel: "Search",
        quickMeetLabel: "Show only",
        species: {
          dog: "Dogs",
          cat: "Cats",
          other: "Other animals",
        },
      },
      featured: {
        eyebrow: "Recently published",
        title: "Some of the animals available",
        viewAll: "See all animals",
        emptyDescription:
          "No animals have been published yet. They will appear here as soon as shelters add their first profiles.",
        exploreCatalog: "Open the catalog",
      },
      journey: {
        title: "How adoption works",
        helpChoose: "Not sure where to start? Answer three questions",
        steps: [
          {
            title: "Choose an animal",
            text: "Filter by species, age, size and compatibility, and read the profile written by the shelter.",
          },
          {
            title: "Send an application",
            text: "Tell the shelter about your home and routine. They reply, and you can ask questions by message.",
          },
          {
            title: "Meet before you decide",
            text: "Arrange a visit. If it goes well, you plan the handover and follow-up together.",
          },
        ],
      },
    },
    footer: {
      tagline:
        "A catalog of animals for adoption published by shelters and rescue groups, with applications, messages and visits in one place.",
      exploreTitle: "Explore",
      links: {
        pets: "Animals for adoption",
        shelters: "Shelters and rescue groups",
        stories: "Adopted animals",
        about: "About us",
      },
      joinTitle: "Run a shelter or rescue group?",
      joinDescription:
        "Publish your animals, receive applications and follow each adoption with your team.",
      registerShelter: "Register your shelter",
    },
    aboutFamily: {
      imageAlt:
        "Illustrated portrait of the FYA family: the couple and their son by the river",
      caption: "Illustration of the family behind FYA.",
      eyebrow: "About us",
      title: "A family that loves animals",
      paragraph1:
        "FYA was started by a family, a couple and our son, who share a love of animals. We wanted to turn that into practical help.",
      paragraph2:
        "We want animals in shelters and rescue groups to be seen by more people and find a family sooner. So we bring together the people caring for them and the people thinking about adopting, with the information each side needs to decide calmly.",
      cta: "See animals for adoption",
    },
    auth: {
      loginTitle: "Login",
      loginSubtitle: "Sign in with your email and password.",
      loginSubmit: "Sign in",
      registerTitle: "Create account",
      registerSubtitle:
        "Adopter account. Shelters and rescue groups have their own registration.",
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
      shelterRegistrationTitle: "Shelter and rescue group registration",
      shelterRegistrationSubtitle:
        "Fill in your organisation and contact details to create the shelter account.",
      shelterIdentitySection: "Shelter or rescue group details",
      shelterName: "Shelter or rescue group name",
      shelterLocation: "Town and district",
      shelterMission: "Short introduction",
      contactPersonSection: "Contact person",
      contactRole: "Role in the organisation",
      contactPhone: "Phone",
      verificationSection: "Verification",
      registrationCertificateLabel: "Organisation registration document",
      registrationCertificateHint: "PDF, JPG or PNG, up to 5 MB",
      shelterDeclaration:
        "I confirm that the provided information is accurate and that I am authorized to represent this shelter on FYA (Found Your Animal).",
      saveDraft: "Save draft",
      finalizeRegistration: "Create shelter account",
      shelterRegistrationLink: "Register a shelter or rescue group",
    },
    petCatalog: {
      title: "Available pets for adoption",
      subtitle: "Animals published by shelters and rescue groups.",
      resultCount: "Animals looking for a family.",
      gridView: "Grid",
      listView: "List",
      filtersTitle: "Filter results",
      filtersSubtitle: "Narrow your search",
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
        "The shelter replies on the platform with the next steps.",
      applyCta: "Apply to adopt",
      saveCta: "Save to favourites",
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
