import type { Locale } from "@/lib/i18n/config";

type Dictionary = {
  nav: {
    home: string;
    pets: string;
    login: string;
    register: string;
    userDashboard: string;
    userRequests: string;
    userMessages: string;
    canilDashboard: string;
    canilSettings: string;
    admin: string;
    logout: string;
  };
  home: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    featureTitle: string;
    features: {
      adopterTitle: string;
      adopterDescription: string;
      shelterTitle: string;
      shelterDescription: string;
      secureTitle: string;
      secureDescription: string;
    };
    howItWorksTitle: string;
    steps: {
      searchTitle: string;
      searchDescription: string;
      connectTitle: string;
      connectDescription: string;
      adoptTitle: string;
      adoptDescription: string;
    };
    finalCtaTitle: string;
    finalCtaDescription: string;
    finalCtaButton: string;
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
      home: "Home",
      pets: "Catalogo de Pets",
      login: "Entrar",
      register: "Registar",
      userDashboard: "Dashboard Adotante",
      userRequests: "Meus Pedidos",
      userMessages: "Mensagens",
      canilDashboard: "Dashboard Canil",
      canilSettings: "Configuracoes do Canil",
      admin: "Admin",
      logout: "Sair",
    },
    home: {
      eyebrow: "FYA (Found Your Animal)",
      title: "FYA (Found Your Animal)",
      subtitle:
        "Ligamos animais a familias com uma experiencia simples, segura e preparada para adocao responsavel.",
      primaryCta: "Registar canil",
      secondaryCta: "Explorar dashboards",
      featureTitle: "Porque escolher a FYA",
      features: {
        adopterTitle: "Para Adotantes",
        adopterDescription: "Descoberta inteligente, perfis claros e comunicacao segura com canis.",
        shelterTitle: "Para Canis",
        shelterDescription: "Gestao eficiente de animais e candidaturas com foco em processos transparentes.",
        secureTitle: "Segura e Confiavel",
        secureDescription: "Perfis verificados e acesso por perfis para proteger cada interacao.",
      },
      howItWorksTitle: "Como funciona",
      steps: {
        searchTitle: "1. Pesquisar",
        searchDescription: "Procura animais e oportunidades alinhadas com o teu perfil.",
        connectTitle: "2. Conectar",
        connectDescription: "Fala com canis e acompanha todo o processo num so lugar.",
        adoptTitle: "3. Adotar",
        adoptDescription: "Conclui a adocao com mais confianca e acompanhamento.",
      },
      finalCtaTitle: "Pronto para encontrar o teu animal?",
      finalCtaDescription: "Junta-te a adotantes e canis que ja usam a FYA para criar matches reais.",
      finalCtaButton: "Comecar agora",
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
      noAccount: "Ainda nao tens conta?",
      hasAccount: "Ja tens conta?",
      goToRegister: "Criar conta",
      goToLogin: "Entrar",
      shelterRegistrationTitle: "Registo de Canis - Joyful Sanctuary",
      shelterRegistrationSubtitle:
        "Torne-se um parceiro da FYA completando o registo do abrigo e os dados de verificacao.",
      shelterIdentitySection: "Identidade do Abrigo",
      shelterName: "Nome do Abrigo / Canil",
      shelterLocation: "Localizacao (Cidade/Distrito)",
      shelterMission: "Declaracao de Missao",
      contactPersonSection: "Pessoa de Contacto",
      contactRole: "Cargo / Funcao",
      contactPhone: "Telefone",
      verificationSection: "Verificacao",
      registrationCertificateLabel: "Carregue o Certificado de Registro da Entidade",
      registrationCertificateHint: "PDF, JPG ou PNG (Max 5MB)",
      shelterDeclaration:
        "Confirmo que as informacoes fornecidas sao verdadeiras e que tenho autoridade para representar este abrigo na plataforma FYA (Found Your Animal).",
      saveDraft: "Guardar Rascunho",
      finalizeRegistration: "Finalizar Registo",
      shelterRegistrationLink: "Registar canil com formulario completo",
    },
    petCatalog: {
      title: "Pets disponiveis para adocao",
      subtitle: "Explora animais de varios canis e encontra o teu proximo melhor amigo.",
      resultCount: "A mostrar 1.240 animais em procura de uma familia.",
      gridView: "Grelha",
      listView: "Lista",
      filtersTitle: "Filtrar resultados",
      filtersSubtitle: "Encontra o match ideal",
      clearFilters: "Limpar filtros",
      sections: {
        species: "Especie",
        ageRange: "Faixa etaria",
        size: "Porte",
        gender: "Genero",
        compatibility: "Compatibilidade",
      },
      speciesOptions: {
        dog: "Cao",
        cat: "Gato",
        other: "Outro",
      },
      searchPlaceholder: "Pesquisa por raca ou nome...",
      pagination: {
        previous: "Pagina anterior",
        next: "Proxima pagina",
      },
      tags: {
        newArrival: "Novo",
        urgent: "Urgente",
      },
    },
    petDetails: {
      backToCatalog: "Voltar ao catalogo",
      healthStatus: "Estado de saude",
      personality: "Personalidade",
      storyTitle: "Historia",
      medicalSummaryTitle: "Resumo medico",
      contactCardTitle: "Contacto do canil",
      contactCardSubtitle: "Responderemos em ate 24 horas com os proximos passos da adocao.",
      applyCta: "Candidatar para adotar",
      saveCta: "Guardar pet",
      adoptionHintTitle: "Dica para adocao",
      adoptionHintDescription: "Partilha a tua rotina e experiencia com animais para acelerar a avaliacao.",
      similarPetsTitle: "Conhece mais amigos",
    },
    admin: {
      title: "Painel de administracao",
      subtitle: "Configura os dados globais da plataforma.",
      filterConfigTitle: "Configuracao dos filtros do catalogo",
      filterConfigDescription: "Define quais opcoes aparecem no filtro da pagina de pets.",
      species: "Especies",
      ageRanges: "Faixas etarias",
      sizes: "Portes",
      genders: "Generos",
      compatibilities: "Compatibilidades",
      hint: "Separar opcoes com virgulas (ex: Cao, Gato, Outro).",
      save: "Guardar configuracao",
      success: "Configuracao atualizada com sucesso.",
      unauthorized: "Nao autorizado para esta operacao.",
      genericError: "Nao foi possivel guardar. Tenta novamente.",
    },
    canilProfile: {
      title: "Perfil do Abrigo",
      subtitle: "Gere a identidade publica do teu abrigo na FYA (Found Your Animal).",
      shelterRole: "Abrigo",
      verifiedLabel: "Verificacao",
      verifiedValue: "Verificado",
      unverifiedValue: "Pendente",
      emailLabel: "Email",
      phoneLabel: "Telefone",
      locationLabel: "Localizacao",
      joinedLabel: "Membro desde",
      notProvided: "Nao definido",
      stats: {
        activePets: "Pets ativos",
        completedAdoptions: "Adocoes concluidas",
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
      profileProgressDescription: "Perfil base concluido. Completa telefone e localizacao para maior destaque.",
      openProfileCta: "Abrir perfil do abrigo",
    },
  },
  en: {
    nav: {
      home: "Home",
      pets: "Pet Catalog",
      login: "Login",
      register: "Register",
      userDashboard: "Adopter Dashboard",
      userRequests: "My Requests",
      userMessages: "Messages",
      canilDashboard: "Shelter Dashboard",
      canilSettings: "Shelter Settings",
      admin: "Admin",
      logout: "Sign out",
    },
    home: {
      eyebrow: "FYA (Found Your Animal)",
      title: "FYA (Found Your Animal)",
      subtitle:
        "We connect pets and families through a simple, secure, and adoption-focused experience.",
      primaryCta: "Register shelter",
      secondaryCta: "Browse dashboards",
      featureTitle: "Why choose FYA",
      features: {
        adopterTitle: "For Adopters",
        adopterDescription: "Smart discovery, clear profiles, and secure communication with shelters.",
        shelterTitle: "For Shelters",
        shelterDescription: "Efficient management for pets and applications with transparent workflows.",
        secureTitle: "Secure and Trusted",
        secureDescription: "Verified profiles and role-based access to protect every interaction.",
      },
      howItWorksTitle: "How it works",
      steps: {
        searchTitle: "1. Search",
        searchDescription: "Find pets and opportunities that match your profile.",
        connectTitle: "2. Connect",
        connectDescription: "Talk to shelters and track every step in one place.",
        adoptTitle: "3. Adopt",
        adoptDescription: "Complete the adoption journey with confidence and guidance.",
      },
      finalCtaTitle: "Ready to find your animal?",
      finalCtaDescription: "Join adopters and shelters already using FYA to create real matches.",
      finalCtaButton: "Get started today",
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
      registrationCertificateLabel: "Upload Organization Registration Certificate",
      registrationCertificateHint: "PDF, JPG, or PNG (Max 5MB)",
      shelterDeclaration:
        "I confirm that the provided information is accurate and that I am authorized to represent this shelter on FYA (Found Your Animal).",
      saveDraft: "Save Draft",
      finalizeRegistration: "Complete Registration",
      shelterRegistrationLink: "Register shelter with full form",
    },
    petCatalog: {
      title: "Available pets for adoption",
      subtitle: "Explore animals from trusted shelters and find your next best friend.",
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
      contactCardSubtitle: "We usually reply within 24 hours with the next adoption steps.",
      applyCta: "Apply to adopt",
      saveCta: "Save pet",
      adoptionHintTitle: "Adoption tip",
      adoptionHintDescription: "Share your routine and pet experience to speed up the review.",
      similarPetsTitle: "Meet more friends",
    },
    admin: {
      title: "Admin panel",
      subtitle: "Configure global platform data.",
      filterConfigTitle: "Pet catalog filter configuration",
      filterConfigDescription: "Define which options appear in the pet catalog filters.",
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
      subtitle: "Manage your shelter public identity on FYA (Found Your Animal).",
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
      profileProgressDescription: "Base profile is complete. Add phone and location for better visibility.",
      openProfileCta: "Open shelter profile",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
