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
    roleAdmin: string;
    roleCanil: string;
    roleAdopter: string;
    accountFallback: string;
    openAccountMenu: string;
    myDashboard: string;
    menuSettings: string;
    menuLogout: string;
    openMenu: string;
    closeMenu: string;
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
    trusted: string;
    heroTitleAccent: string;
    heroImageAlt: string;
    browseCatalog: string;
    learnMore: string;
    todayFound: (count: number) => string;
    nearYou: string;
    urgentTitle: string;
    urgentSubtitle: string;
    seeAll: string;
    meetPet: (name: string) => string;
    howSubtitle: string;
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
    registerPageTitle: string;
    registerPageDescription: string;
    registerJoined: string;
    registerJoinedSubtitle: string;
    registerTerms: string;
    smilingDogAlt: string;
    kittenAlt: string;
    footerNote: string;
    loginSideTitle: string;
    loginSideText: string;
    loginForgotPassword: string;
    loginRememberDevice: string;
    loginPasswordUpdated: string;
    loginDogAlt: string;
    loginEmailPlaceholder: string;
    shelterRegEyebrow: string;
    shelterRegTitle: string;
    shelterRegSubtitlePrefix: string;
    shelterRegSubtitleSuffix: string;
    shelterBenefitsTitle: string;
    shelterBenefit1Title: string;
    shelterBenefit1Text: string;
    shelterBenefit2Title: string;
    shelterBenefit2Text: string;
    shelterBenefit3Title: string;
    shelterBenefit3Text: string;
    shelterImageQuote: string;
    shelterBrowseFile: string;
    shelterDogsAlt: string;
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
    resultsFound: (count: number) => string;
    noResultsCount: string;
    filters: string;
    apply: string;
    activeFilters: string;
    emptySearch: string;
    emptyDb: string;
    findMyMatch: string;
  };
  petDetails: {
    backToCatalog: string;
    applyCta: string;
    saveCta: string;
    similarPetsTitle: string;
    metaNotFound: string;
    metaDescription: (name: string, species: string, location: string) => string;
    popularChoice: string;
    vaccinationsUpToDate: string;
    subtitle: (shelterName: string) => string;
    weightSmall: string;
    weightMedium: string;
    weightLarge: string;
    adoptionFee: string;
    adoptionFeeHint: string;
    adoptionFeedback: {
      request_created: string;
      only_users_can_apply: string;
      pet_not_found: string;
      request_failed: string;
      conversation_failed: string;
      invalid_pet: string;
    };
    storyHeading: (name: string) => string;
    noDescription: string;
    healthCareTitle: string;
    vaccinationLabel: string;
    groomingLabel: string;
    groomingValue: string;
    currentStatusLabel: string;
    medicalConditionsLabel: string;
    medicalConditionsValue: string;
    keyStatsTitle: string;
    breedLabel: string;
    ageLabel: string;
    genderLabel: string;
    weightLabel: string;
    locationLabel: string;
    aboutHomeLegend: string;
    housingTypeLabel: string;
    selectPlaceholder: string;
    housingApartment: string;
    housingHouse: string;
    housingShared: string;
    housingOther: string;
    householdSizeLabel: string;
    gardenLabel: string;
    childrenLabel: string;
    otherPetsLabel: string;
    otherPetsDetailLabel: string;
    otherPetsDetailPlaceholder: string;
    experienceLegend: string;
    experienceLabel: string;
    experienceNone: string;
    experienceSome: string;
    experienceExperienced: string;
    hoursAloneLabel: string;
    reasonLabel: string;
    reasonPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    removeFavorite: string;
    certifiedShelter: string;
    visitHours: string;
    viewShelterProfile: string;
    viewAllPets: string;
    moreFriends: (shelterName: string) => string;
    badgeYoung: string;
    badgeAdult: string;
    initialGreeting: string;
    loginToApplyTitle: string;
    loginToApplyText: string;
    loginToApplyCta: string;
    notAdopterTitle: string;
    notAdopterText: string;
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
    shelterInteriorAlt: string;
    shelterLogoAlt: string;
    contactVisitLabel: string;
    contactCallLabel: string;
    contactWebsiteLabel: string;
    contactHours: string;
    defaultMission: string;
    publicProfileTitle: string;
    publicProfileText: string;
    viewPublicProfile: string;
    statsTitle: string;
    residentsTitle: string;
    residentsSubtitle: string;
    allSpecies: string;
    dogs: string;
    cats: string;
    meetPet: (name: string) => string;
    viewAllResidents: string;
    availableKeyword: string;
    reservedKeyword: string;
  };
  errors: {
    title: string;
    description: string;
    retry: string;
    backHome: string;
    notFoundTitle: string;
    notFoundDescription: string;
  };
  match: {
    eyebrow: string;
    title: string;
    subtitle: string;
    q1: string;
    q1Options: { any: string; dog: string; cat: string };
    q2: string;
    q2Options: { apartment: string; house: string; bigHouse: string };
    q3: string;
    q3Options: { little: string; medium: string; plenty: string };
    submit: string;
    hint: string;
    resultsTitle: string;
    resultsSubtitle: string;
    resultsEmptyTitle: string;
    resultsEmptyText: string;
    retake: string;
    viewProfile: string;
    compatibility: string;
    topMatch: string;
    reasons: {
      speciesMatch: string;
      sizeMatch: string;
      energyMatch: string;
      calmMatch: string;
    };
  };
  animalForm: {
    name: string;
    species: string;
    breed: string;
    sex: string;
    age: string;
    size: string;
    status: string;
    description: string;
    select: string;
    speciesDog: string;
    speciesCat: string;
    speciesOther: string;
    sexMale: string;
    sexFemale: string;
    sizeSmall: string;
    sizeMedium: string;
    sizeLarge: string;
    statusAvailable: string;
    statusReserved: string;
    statusInTreatment: string;
    statusAdopted: string;
  };
  visitPanel: {
    title: string;
    none: string;
    propose: string;
    submit: string;
    confirm: string;
    cancel: string;
    markDone: string;
  };
  shelterPublic: {
    metaNotFound: string;
    metaDescription: (name: string, location: string) => string;
    back: string;
    verified: string;
    aboutTitle: string;
    noDescription: string;
    contactTitle: string;
    phoneLabel: string;
    emailLabel: string;
    locationLabel: string;
    joinedLabel: string;
    residentsTitle: string;
    noResidents: string;
    statsTotal: string;
    statsAvailable: string;
    statsAdopted: string;
    notProvided: string;
    reviewsTitle: string;
    noReviews: string;
    ratingSummary: (avg: number, count: number) => string;
    writeReview: string;
    editReview: string;
    ratingLabel: string;
    commentLabel: string;
    commentPlaceholder: string;
    submitReview: string;
    moderationNote: string;
    pendingNote: string;
    rejectedNote: string;
    loginToReview: string;
    reviewMessages: {
      review_pending: string;
      invalid_review: string;
      review_failed: string;
      only_adopters_can_review: string;
    };
    notAdopterReview: string;
    donateTitle: string;
    donateText: string;
    donateLoginCta: string;
    donateNoInfo: string;
    donateIban: string;
    donateMbway: string;
    donateExternalLink: string;
  };
  userSettings: {
    title: string;
    subtitle: string;
    name: string;
    accountType: string;
    adopter: string;
  };
  canilMessages: {
    title: string;
    searchPlaceholder: string;
    noConversations: string;
    inputPlaceholder: string;
    send: string;
    adopterInfo: string;
    reminder: string;
    reminderText: string;
    chatWith: string;
    success: string;
    errorMessages: {
      invalid_message: string;
      send_failed: string;
    };
  };
  canilPets: {
    title: string;
    subtitle: string;
    statusLabel: string;
    species: string;
    age: string;
    actions: string;
    noAnimals: string;
    save: string;
    newPet: string;
    photos: string;
    statusOptions: {
      disponivel: string;
      reservado: string;
      em_tratamento: string;
      adotado: string;
    };
    successMessages: {
      updated: string;
      animal_deleted: string;
    };
    errorMessages: {
      invalid_status: string;
      save_failed: string;
      no_shelter: string;
      invalid_data: string;
      not_authorized: string;
      delete_failed: string;
    };
  };
  footer: {
    tagline: string;
    discover: string;
    support: string;
    crafted: string;
    petCatalog: string;
    shelters: string;
    successStories: string;
    findMatch: string;
    helpCenter: string;
    contact: string;
    privacy: string;
    terms: string;
  };
  favoriteButton: {
    save: string;
    remove: string;
  };
  chatThread: {
    today: string;
    yesterday: string;
  };
  sidebar: {
    userSubtitle: string;
    canilSubtitle: string;
    adminSubtitle: string;
    dashboard: string;
    catalog: string;
    favorites: string;
    requests: string;
    messages: string;
    settings: string;
    shelterPage: string;
    pets: string;
    adoptionRequests: string;
    reviews: string;
    overview: string;
    shelters: string;
    users: string;
    myPets: string;
    receivedRequests: string;
  };
  adoptionAnswers: {
    noAnswers: string;
  };
  shelterDirectory: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    empty: string;
    totalPets: (count: number) => string;
    openCanil: string;
    submit: string;
    verified: string;
  };
  userRequestsPage: {
    title: string;
    subtitle: string;
    columnPet: string;
    columnStatus: string;
    columnDate: string;
    columnNotes: string;
    empty: string;
    visitsLabel: string;
    noShelterNotes: string;
    successMessages: Record<string, string>;
    errorMessages: Record<string, string>;
  };
  canilRequestsPage: {
    title: string;
    subtitle: string;
    columnApplicant: string;
    columnDate: string;
    columnStatus: string;
    columnActions: string;
    empty: string;
    statuses: {
      pendente: string;
      entrevista: string;
      aprovado: string;
      rejeitado: string;
      concluido: string;
    };
    hint: string;
    notePlaceholder: string;
    save: string;
    questionnaireVisits: string;
    successMessages: Record<string, string>;
    errorMessages: Record<string, string>;
  };
  notifications: {
    title: string;
    subtitle: string;
    markAll: string;
    empty: string;
    open: string;
  };
  successStories: {
    eyebrow: string;
    title: string;
    subtitle: string;
    stat: (count: number) => string;
    empty: string;
    browse: string;
    foundHome: string;
    via: string;
  };
  resetPassword: {
    title: string;
    subtitle: string;
    passwordLabel: string;
    confirmLabel: string;
    submit: string;
    errorMessages: Record<string, string>;
  };
  forgotPassword: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    backToLogin: string;
    sent: string;
    invalid_email: string;
  };
  userDashboard: {
    title: string;
    subtitle: string;
    cardTotal: string;
    cardPending: string;
    cardApproved: string;
    cardChats: string;
    cardFavorites: string;
    browsePets: string;
    viewRequests: string;
    openMessages: string;
    viewFavorites: string;
  };
  userMessages: {
    title: string;
    searchPlaceholder: string;
    noConversations: string;
    inputPlaceholder: string;
    send: string;
    withShelter: string;
    backToList: string;
    success: string;
    errorMessages: Record<string, string>;
  };
  userFavorites: {
    title: string;
    subtitle: string;
    empty: string;
    browse: string;
    remove: string;
  };
  canilDashboard: {
    title: string;
    subtitle: string;
    welcomePrefix: string;
    cardTotalPets: string;
    cardAvailable: string;
    cardPending: string;
    cardAdopted: string;
    sectionActivity: string;
    sectionTasks: string;
    viewAllPets: string;
    openRequests: string;
    messages: string;
    emptyActivity: string;
    tasks: string[];
  };
  canilSettingsPage: {
    title: string;
    subtitle: string;
    labelNome: string;
    labelLocalizacao: string;
    labelTelefone: string;
    labelEmail: string;
    labelMissao: string;
    placeholderNome: string;
    placeholderLocalizacao: string;
    placeholderTelefone: string;
    placeholderEmail: string;
    placeholderMissao: string;
    donationsTitle: string;
    donationsHint: string;
    labelIban: string;
    placeholderIban: string;
    labelMbway: string;
    placeholderMbway: string;
    labelDonationLink: string;
    placeholderDonationLink: string;
    labelDonationMessage: string;
    placeholderDonationMessage: string;
    save: string;
    success: string;
    errorMessages: Record<string, string>;
  };
  canilReviewsPage: {
    title: string;
    subtitle: string;
    noShelter: string;
    pendingTitle: string;
    historyTitle: string;
    emptyPending: string;
    emptyHistory: string;
    approve: string;
    reject: string;
    estadoPending: string;
    estadoApproved: string;
    estadoRejected: string;
    messages: Record<string, string>;
  };
  canilNewAnimal: {
    back: string;
    title: string;
    subtitle: string;
    submit: string;
    errorMessages: Record<string, string>;
  };
  canilEditAnimal: {
    back: string;
    subtitle: string;
    detailsTitle: string;
    saveDetails: string;
    dangerTitle: string;
    dangerHint: string;
    deleteAnimal: string;
    uploadTitle: string;
    uploadHint: string;
    upload: string;
    noPhotos: string;
    primary: string;
    setPrimary: string;
    remove: string;
    messages: Record<string, string>;
  };
  adminUsers: {
    title: string;
    subtitle: string;
    colName: string;
    colEmail: string;
    colRole: string;
    colJoined: string;
    empty: string;
    roleAdmin: string;
    roleCanil: string;
    roleAdopter: string;
  };
  adminDashboard: {
    title: string;
    subtitle: string;
    cardAdoptions: string;
    cardPending: string;
    cardRequests: string;
    cardSheltersPending: string;
    cardShelters: string;
    cardUsers: string;
    cardNewUsers: string;
    cardAnimals: string;
    cardAvailable: string;
    attentionTitle: string;
    attentionVerify: (count: number) => string;
    attentionRequests: (count: number) => string;
    allClear: string;
    quickTitle: string;
    quickShelters: string;
    quickUsers: string;
    quickSettings: string;
  };
  adminSettings: {
    title: string;
    subtitle: string;
    platformTitle: string;
    platformName: string;
    contactEmail: string;
    supportEmail: string;
    adoptionFee: string;
    adoptionFeeHint: string;
    requireVerification: string;
    requireVerificationHint: string;
    save: string;
    messages: Record<string, string>;
  };
  adminShelters: {
    title: string;
    subtitle: string;
    verified: string;
    pending: string;
    verify: string;
    unverify: string;
    colName: string;
    colJoined: string;
    colStatus: string;
    colActions: string;
    empty: string;
    messages: Record<string, string>;
  };
  userPets: {
    title: string;
    subtitle: string;
    noAnimals: string;
    sidebarLabel: string;
    publishHint: string;
  };
  userNewAnimal: {
    title: string;
    subtitle: string;
  };
  userEditAnimal: {
    subtitle: string;
  };
  userReceivedRequests: {
    title: string;
    subtitle: string;
    empty: string;
    sidebarLabel: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  pt: {
    nav: {
      home: "Home",
      pets: "Catalogo de Pets",
      shelters: "Canis",
      stories: "Historias",
      notifications: "Notificacoes",
      login: "Entrar",
      register: "Registar",
      userDashboard: "Dashboard Adotante",
      userRequests: "Meus Pedidos",
      userMessages: "Mensagens",
      userSettings: "Configuracoes",
      userFavorites: "Favoritos",
      canilDashboard: "Dashboard Canil",
      canilSettings: "Configuracoes do Canil",
      admin: "Admin",
      logout: "Sair",
      roleAdmin: "Administrador",
      roleCanil: "Canil",
      roleAdopter: "Adotante",
      accountFallback: "Conta",
      openAccountMenu: "Abrir menu da conta",
      myDashboard: "Meu painel",
      menuSettings: "Configuracoes",
      menuLogout: "Terminar sessao",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
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
      trusted: "Confiado por 5.000+ familias",
      heroTitleAccent: "para toda a familia",
      heroImageAlt: "Cao e gato juntos",
      browseCatalog: "Explorar catalogo",
      learnMore: "Saber mais",
      todayFound: (count) => `${count} pets encontrados`,
      nearYou: "Na tua area hoje",
      urgentTitle: "Pets urgentes",
      urgentSubtitle: "Estes amigos estao ha mais tempo a espera de um lar.",
      seeAll: "Ver todos",
      meetPet: (name) => `Conhecer ${name}`,
      howSubtitle:
        "Tres passos simples para encontrares o teu novo membro da familia com seguranca e acompanhamento.",
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
      registerPageTitle: "Cada pata merece um lar feliz.",
      registerPageDescription:
        "Junta-te a uma comunidade de adotantes e canis. O teu registo e o primeiro passo para criar novas historias.",
      registerJoined: "Mais de 12.000 membros",
      registerJoinedSubtitle: "Ativos em dezenas de canis parceiros",
      registerTerms:
        "Concordo com os Termos de Servico e Politica de Privacidade e autorizo o tratamento dos meus dados para criacao de conta.",
      smilingDogAlt: "Cao sorridente",
      kittenAlt: "Gatinho",
      footerNote: "Construido com carinho para cada pata.",
      loginSideTitle: "Bem-vindo de volta a matilha.",
      loginSideText: "Reconecta-te com canis e encontra o companheiro ideal para a tua familia.",
      loginForgotPassword: "Esqueceste a password?",
      loginRememberDevice: "Lembrar este dispositivo",
      loginPasswordUpdated: "Password atualizada. Inicia sessao com a nova password.",
      loginDogAlt: "Cao feliz",
      loginEmailPlaceholder: "tu@email.com",
      shelterRegEyebrow: "Junte-se a nossa missao",
      shelterRegTitle: "Registo de Canis",
      shelterRegSubtitlePrefix: "Torne o seu abrigo parte da rede",
      shelterRegSubtitleSuffix:
        "Juntos, criamos ligacoes duradouras entre animais e familias amorosas.",
      shelterBenefitsTitle: "Porque a FYA?",
      shelterBenefit1Title: "Visibilidade total",
      shelterBenefit1Text: "Alcance milhares de potenciais adotantes todos os dias.",
      shelterBenefit2Title: "Gestao facilitada",
      shelterBenefit2Text: "Ferramentas intuitivas para gerir perfis de animais e candidaturas.",
      shelterBenefit3Title: "Rede de apoio",
      shelterBenefit3Text: "Acesso a recursos exclusivos e parcerias com veterinarios.",
      shelterImageQuote: '"Mudar vidas, um patudo de cada vez."',
      shelterBrowseFile: "Procurar ficheiro",
      shelterDogsAlt: "Caes felizes num abrigo",
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
      resultsFound: (count) => `${count} ${count === 1 ? "animal encontrado" : "animais encontrados"}`,
      noResultsCount: "Sem animais a corresponder.",
      filters: "Filtros",
      apply: "Aplicar",
      activeFilters: "Filtros ativos:",
      emptySearch: "Nao encontramos resultados para esses filtros.",
      emptyDb: "Sem animais disponiveis de momento.",
      findMyMatch: "Encontrar o meu match",
    },
    petDetails: {
      backToCatalog: "Voltar ao catalogo",
      applyCta: "Candidatar para adotar",
      saveCta: "Guardar pet",
      similarPetsTitle: "Conhece mais amigos",
      metaNotFound: "Animal nao encontrado | FYA",
      metaDescription: (name, species, location) =>
        `Conhece ${name}, ${species} para adocao em ${location}.`,
      popularChoice: "Escolha popular",
      vaccinationsUpToDate: "Vacinacao em dia",
      subtitle: (shelterName) => `A alma especial do ${shelterName}`,
      weightSmall: "8-12 kg",
      weightMedium: "14-22 kg",
      weightLarge: "24-32 kg",
      adoptionFee: "Taxa de adocao: 180€",
      adoptionFeeHint: "Inclui microchip, vacinas iniciais e acompanhamento inicial do abrigo.",
      adoptionFeedback: {
        request_created: "Candidatura enviada com sucesso.",
        only_users_can_apply: "Apenas adotantes podem candidatar-se.",
        pet_not_found: "Nao encontramos este animal.",
        request_failed: "Nao foi possivel enviar a candidatura.",
        conversation_failed: "A candidatura foi criada, mas nao foi possivel iniciar conversa.",
        invalid_pet: "Animal invalido.",
      },
      storyHeading: (name) => `${name} e a sua historia`,
      noDescription: "Sem descricao disponivel para este animal.",
      healthCareTitle: "Saude e cuidados",
      vaccinationLabel: "Vacinacao",
      groomingLabel: "Cuidados de pelo",
      groomingValue: "Escovagem regular recomendada.",
      currentStatusLabel: "Estado atual",
      medicalConditionsLabel: "Condicoes medicas",
      medicalConditionsValue: "Sem condicoes criticas registadas.",
      keyStatsTitle: "Estatisticas principais",
      breedLabel: "Raca",
      ageLabel: "Idade",
      genderLabel: "Genero",
      weightLabel: "Peso",
      locationLabel: "Localizacao",
      aboutHomeLegend: "Sobre a tua casa",
      housingTypeLabel: "Tipo de habitacao",
      selectPlaceholder: "Seleciona...",
      housingApartment: "Apartamento",
      housingHouse: "Casa",
      housingShared: "Casa partilhada",
      housingOther: "Outro",
      householdSizeLabel: "Numero de pessoas em casa",
      gardenLabel: "Quintal/Jardim",
      childrenLabel: "Criancas",
      otherPetsLabel: "Outros animais",
      otherPetsDetailLabel: "Detalhes sobre outros animais (opcional)",
      otherPetsDetailPlaceholder: "Ex: 1 gato esterilizado",
      experienceLegend: "Experiencia e rotina",
      experienceLabel: "Experiencia com animais",
      experienceNone: "Sem experiencia",
      experienceSome: "Alguma experiencia",
      experienceExperienced: "Muita experiencia",
      hoursAloneLabel: "Horas sozinho/dia",
      reasonLabel: "Motivo para adotar",
      reasonPlaceholder: "Em poucas palavras...",
      messageLabel: "Mensagem ao canil",
      messagePlaceholder: "Escreve uma mensagem inicial...",
      removeFavorite: "Remover dos favoritos",
      certifiedShelter: "Abrigo certificado",
      visitHours: "Visitas: Seg-Sab, 10h - 16h",
      viewShelterProfile: "Ver perfil do abrigo",
      viewAllPets: "Ver todos os pets",
      moreFriends: (shelterName) => `Mais amigos do ${shelterName}`,
      badgeYoung: "Jovem",
      badgeAdult: "Adulto",
      initialGreeting: "Ola! Tenho interesse neste animal.",
      loginToApplyTitle: "Inicia sessao para te candidatares",
      loginToApplyText: "Cria uma conta de adotante ou entra para enviar a tua candidatura ao canil.",
      loginToApplyCta: "Entrar para candidatar",
      notAdopterTitle: "So adotantes podem candidatar-se",
      notAdopterText:
        "A tua conta nao e do tipo adotante. Usa uma conta de adotante para enviares pedidos de adocao.",
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
      shelterInteriorAlt: "Interior de abrigo moderno",
      shelterLogoAlt: "Logo do abrigo",
      contactVisitLabel: "VISITE-NOS",
      contactCallLabel: "LIGUE",
      contactWebsiteLabel: "WEBSITE",
      contactHours: "Mon-Sat: 9h - 18h",
      defaultMission:
        "A nossa equipa trabalha diariamente para garantir cuidado, seguranca e socializacao de cada animal. Priorizamos adocoes responsaveis com acompanhamento apos a entrega.",
      publicProfileTitle: "O teu perfil publico",
      publicProfileText:
        "E assim que os adotantes veem o teu canil na FYA. Partilha o link para receberes mais candidaturas.",
      viewPublicProfile: "Ver perfil publico",
      statsTitle: "Estatisticas do abrigo",
      residentsTitle: "Residentes a procura de lar",
      residentsSubtitle:
        "Conhece os animais atualmente no abrigo. Todos os residentes estao vacinados e prontos para conhecer novas familias.",
      allSpecies: "Todas as especies",
      dogs: "Caes",
      cats: "Gatos",
      meetPet: (name) => `Conhecer ${name}`,
      viewAllResidents: "Ver todos os residentes",
      availableKeyword: "disponivel",
      reservedKeyword: "reserv",
    },
    errors: {
      title: "Algo correu mal",
      description:
        "Ocorreu um erro inesperado ao carregar esta pagina. Podes tentar novamente ou voltar ao inicio.",
      retry: "Tentar novamente",
      backHome: "Voltar ao inicio",
      notFoundTitle: "Pagina nao encontrada",
      notFoundDescription:
        "A pagina que procuras nao existe ou foi movida. Verifica o endereco ou volta ao inicio.",
    },
    match: {
      eyebrow: "Encontra o teu match",
      title: "Qual e o animal certo para ti?",
      subtitle:
        "Responde a 3 perguntas rapidas e mostramos-te os animais que melhor encaixam no teu estilo de vida.",
      q1: "Que tipo de companheiro procuras?",
      q1Options: { any: "Indiferente", dog: "Um cao", cat: "Um gato" },
      q2: "Onde vives?",
      q2Options: {
        apartment: "Apartamento",
        house: "Casa",
        bigHouse: "Casa com quintal grande",
      },
      q3: "Quanto tempo livre tens por dia?",
      q3Options: {
        little: "Pouco (trabalho/estudo a tempo inteiro)",
        medium: "Algum tempo todos os dias",
        plenty: "Bastante tempo para passeios e brincadeira",
      },
      submit: "Ver os meus matches",
      hint: "Vamos analisar os animais disponiveis e ordenar pelos que melhor encaixam contigo.",
      resultsTitle: "Os teus melhores matches",
      resultsSubtitle: "Animais disponiveis ordenados pela compatibilidade com as tuas respostas.",
      resultsEmptyTitle: "Ainda nao ha matches",
      resultsEmptyText: "Nao ha animais disponiveis de momento. Volta em breve ou explora o catalogo.",
      retake: "Refazer questionario",
      viewProfile: "Ver perfil",
      compatibility: "compatibilidade",
      topMatch: "Melhor match",
      reasons: {
        speciesMatch: "E a especie que procuravas",
        sizeMatch: "Porte ideal para a tua casa",
        energyMatch: "Energia a condizer com o teu tempo livre",
        calmMatch: "Temperamento calmo para rotinas ocupadas",
      },
    },
    animalForm: {
      name: "Nome",
      species: "Especie",
      breed: "Raca",
      sex: "Genero",
      age: "Idade (anos)",
      size: "Porte",
      status: "Estado",
      description: "Descricao",
      select: "Seleciona...",
      speciesDog: "Cao",
      speciesCat: "Gato",
      speciesOther: "Outro",
      sexMale: "Macho",
      sexFemale: "Femea",
      sizeSmall: "Pequeno",
      sizeMedium: "Medio",
      sizeLarge: "Grande",
      statusAvailable: "Disponivel",
      statusReserved: "Reservado",
      statusInTreatment: "Em tratamento",
      statusAdopted: "Adotado",
    },
    visitPanel: {
      title: "Visitas",
      none: "Sem visitas agendadas.",
      propose: "Propor visita",
      submit: "Propor",
      confirm: "Confirmar",
      cancel: "Cancelar",
      markDone: "Marcar realizada",
    },
    shelterPublic: {
      metaNotFound: "Canil nao encontrado | FYA",
      metaDescription: (name, location) =>
        `Conhece o canil ${name} em ${location} e os animais para adocao.`,
      back: "Voltar aos canis",
      verified: "Verificado",
      aboutTitle: "Sobre o canil",
      noDescription: "Sem descricao publicada.",
      contactTitle: "Contactos",
      phoneLabel: "Telefone",
      emailLabel: "Email",
      locationLabel: "Localizacao",
      joinedLabel: "Na FYA desde",
      residentsTitle: "Animais a procura de lar",
      noResidents: "Este canil ainda nao tem animais publicados.",
      statsTotal: "Total de animais",
      statsAvailable: "Disponiveis",
      statsAdopted: "Adotados",
      notProvided: "Nao definido",
      reviewsTitle: "Avaliacoes",
      noReviews: "Este canil ainda nao tem avaliacoes.",
      ratingSummary: (avg, count) =>
        `${avg.toFixed(1)} de 5 · ${count} ${count === 1 ? "avaliacao" : "avaliacoes"}`,
      writeReview: "Deixar avaliacao",
      editReview: "Atualizar a tua avaliacao",
      ratingLabel: "Classificacao",
      commentLabel: "Comentario (opcional)",
      commentPlaceholder: "Como foi a tua experiencia com este canil?",
      submitReview: "Enviar avaliacao",
      moderationNote: "A tua avaliacao so fica visivel depois de o canil a aprovar.",
      pendingNote: "A tua avaliacao foi enviada e aguarda aprovacao do canil.",
      rejectedNote: "A tua avaliacao anterior nao foi aprovada. Podes editar e reenviar.",
      loginToReview: "Inicia sessao para avaliar este canil.",
      reviewMessages: {
        review_pending: "Avaliacao enviada. Vai ser revista pelo canil antes de aparecer.",
        invalid_review: "Escolhe uma classificacao valida.",
        review_failed: "Nao foi possivel guardar a avaliacao.",
        only_adopters_can_review: "So adotantes podem avaliar canis.",
      },
      notAdopterReview: "So contas de adotante podem deixar avaliacoes.",
      donateTitle: "Apoiar este canil",
      donateText:
        "Contribui para os cuidados diarios dos animais. As doacoes vao diretamente para o canil.",
      donateLoginCta: "Entrar para apoiar",
      donateNoInfo: "Este canil ainda nao partilhou dados para receber doacoes.",
      donateIban: "IBAN",
      donateMbway: "MBWay",
      donateExternalLink: "Doar online",
    },
    userSettings: {
      title: "Configuracoes da Conta",
      subtitle:
        "Area basica para dados de conta. Podes expandir esta pagina com preferencias e notificacoes.",
      name: "Nome",
      accountType: "Tipo de conta",
      adopter: "Adotante",
    },
    canilMessages: {
      title: "Mensagens",
      searchPlaceholder: "Procurar conversas...",
      noConversations: "Sem conversas no momento.",
      inputPlaceholder: "Escreve a tua mensagem...",
      send: "Enviar",
      adopterInfo: "Sobre o adotante",
      reminder: "Lembrete",
      reminderText: "Confirmar compatibilidade com outros animais durante a visita presencial.",
      chatWith: "Conversa com",
      success: "Mensagem enviada.",
      errorMessages: {
        invalid_message: "Mensagem invalida.",
        send_failed: "Nao foi possivel enviar a mensagem.",
      },
    },
    canilPets: {
      title: "Gestao de Animais",
      subtitle: "Atualiza estados dos pets e acompanha o inventario do teu canil.",
      statusLabel: "Estado",
      species: "Especie / Raca",
      age: "Idade",
      actions: "Acoes",
      noAnimals: "Ainda nao tens animais registados para este canil.",
      save: "Guardar",
      newPet: "Novo animal",
      photos: "Fotos",
      statusOptions: {
        disponivel: "Disponivel",
        reservado: "Reservado",
        em_tratamento: "Em tratamento",
        adotado: "Adotado",
      },
      successMessages: {
        updated: "Estado do animal atualizado com sucesso.",
        animal_deleted: "Animal removido.",
      },
      errorMessages: {
        invalid_status: "Estado invalido.",
        save_failed: "Nao foi possivel guardar as alteracoes.",
        no_shelter: "Nao foi encontrado um canil para a tua conta.",
        invalid_data: "Dados invalidos.",
        not_authorized: "Sem permissao para este animal.",
        delete_failed: "Nao foi possivel remover o animal.",
      },
    },
    footer: {
      tagline: "Ajudamos cada animal a encontrar uma familia para sempre.",
      discover: "Descobrir",
      support: "Suporte",
      crafted: "© 2026 FYA (Found Your Animal). Feito com carinho.",
      petCatalog: "Catalogo de pets",
      shelters: "Canis",
      successStories: "Historias de sucesso",
      findMatch: "Encontrar o meu match",
      helpCenter: "Centro de ajuda",
      contact: "Contacto",
      privacy: "Privacidade",
      terms: "Termos de servico",
    },
    favoriteButton: {
      save: "Guardar pet",
      remove: "Remover dos favoritos",
    },
    chatThread: {
      today: "Hoje",
      yesterday: "Ontem",
    },
    sidebar: {
      userSubtitle: "Area do Adotante",
      canilSubtitle: "Admin do Canil",
      adminSubtitle: "Administracao",
      dashboard: "Dashboard",
      catalog: "Catalogo de Pets",
      favorites: "Favoritos",
      requests: "Meus Pedidos",
      messages: "Mensagens",
      settings: "Configuracoes",
      shelterPage: "Pagina do Canil",
      pets: "Meus Pets",
      adoptionRequests: "Pedidos de Adocao",
      reviews: "Avaliacoes",
      overview: "Visao geral",
      shelters: "Canis",
      users: "Utilizadores",
      myPets: "Meus animais",
      receivedRequests: "Pedidos recebidos",
    },
    adoptionAnswers: {
      noAnswers: "Sem questionario estruturado para este pedido.",
    },
    shelterDirectory: {
      title: "Canis e abrigos parceiros",
      subtitle: "Conhece as organizacoes que dao casa aos animais na FYA.",
      searchPlaceholder: "Procurar por nome, cidade ou missao...",
      empty: "Sem canis encontrados para essa pesquisa.",
      totalPets: (count) => `${count} ${count === 1 ? "animal" : "animais"}`,
      openCanil: "Ver canil",
      submit: "Procurar",
      verified: "Verificado",
    },
    userRequestsPage: {
      title: "Meus Pedidos de Adocao",
      subtitle: "Acompanha o estado das tuas candidaturas.",
      columnPet: "Pet e Canil",
      columnStatus: "Estado",
      columnDate: "Data",
      columnNotes: "Notas do Canil",
      empty: "Ainda nao tens pedidos. Visita o catalogo e candidata-te a um pet.",
      visitsLabel: "Visitas",
      noShelterNotes: "Sem notas do canil.",
      successMessages: {
        request_created: "Candidatura enviada com sucesso.",
        visit_proposed: "Visita proposta. Aguarda confirmacao do canil.",
        visit_updated: "Visita atualizada.",
      },
      errorMessages: {
        request_failed: "Nao foi possivel submeter candidatura.",
        invalid_visit: "Dados de visita invalidos.",
        visit_in_past: "Escolhe uma data no futuro.",
        visit_not_allowed: "Nao e possivel agendar visita para este pedido.",
        visit_failed: "Nao foi possivel agendar a visita.",
      },
    },
    canilRequestsPage: {
      title: "Pedidos de Adocao",
      subtitle: "Fila de candidaturas recebidas para os teus animais.",
      columnApplicant: "Candidato e Pet",
      columnDate: "Submissao",
      columnStatus: "Estado",
      columnActions: "Acoes",
      empty: "Sem pedidos no momento. Quando chegarem novos pedidos, eles vao aparecer aqui.",
      statuses: {
        pendente: "Pendente",
        entrevista: "Entrevista",
        aprovado: "Aprovado",
        rejeitado: "Rejeitado",
        concluido: "Adocao concluida",
      },
      hint: "Atualiza o estado e adiciona notas para manter o adotante informado.",
      notePlaceholder: "Observacoes para o adotante (opcional)",
      save: "Guardar",
      questionnaireVisits: "Questionario e visitas",
      successMessages: {
        updated: "Pedido atualizado com sucesso.",
        visit_updated: "Visita atualizada.",
      },
      errorMessages: {
        invalid_request: "Pedido invalido.",
        save_failed: "Nao foi possivel guardar alteracoes.",
        unauthorized: "Nao autorizado.",
        no_shelter: "Nao foi encontrado canil associado.",
        invalid_visit: "Dados de visita invalidos.",
        visit_failed: "Nao foi possivel atualizar a visita.",
      },
    },
    notifications: {
      title: "Notificacoes",
      subtitle: "Atualizacoes dos teus pedidos e conversas.",
      markAll: "Marcar todas como lidas",
      empty: "Sem notificacoes por agora.",
      open: "Abrir",
    },
    successStories: {
      eyebrow: "Historias de sucesso",
      title: "Cada adopcao e um final feliz",
      subtitle: "Animais que ja encontraram a sua familia atraves da FYA.",
      stat: (count) =>
        `${count} ${count === 1 ? "amigo encontrou lar" : "amigos encontraram lar"}`,
      empty: "Ainda nao ha adocoes concluidas registadas. Em breve, as primeiras historias aparecem aqui.",
      browse: "Explorar animais para adocao",
      foundHome: "encontrou um lar",
      via: "atraves de",
    },
    resetPassword: {
      title: "Definir nova password",
      subtitle: "Escolhe uma nova password para a tua conta.",
      passwordLabel: "Nova password",
      confirmLabel: "Confirmar password",
      submit: "Guardar password",
      errorMessages: {
        weak_password: "A password tem de ter pelo menos 6 caracteres.",
        mismatch: "As passwords nao coincidem.",
        expired: "O link expirou. Pede um novo link de recuperacao.",
        update_failed: "Nao foi possivel atualizar a password.",
      },
    },
    forgotPassword: {
      title: "Recuperar password",
      subtitle: "Indica o teu email e enviamos um link para definires uma nova password.",
      emailLabel: "Email",
      emailPlaceholder: "tu@email.com",
      submit: "Enviar link de recuperacao",
      backToLogin: "Voltar ao login",
      sent: "Se existir uma conta com esse email, enviamos um link de recuperacao.",
      invalid_email: "Indica um email valido.",
    },
    userDashboard: {
      title: "Dashboard do Adotante",
      subtitle: "Acompanha pedidos e conversas com os canis.",
      cardTotal: "Pedidos enviados",
      cardPending: "Em analise",
      cardApproved: "Aprovados",
      cardChats: "Conversas ativas",
      cardFavorites: "Favoritos",
      browsePets: "Explorar pets",
      viewRequests: "Ver pedidos",
      openMessages: "Abrir mensagens",
      viewFavorites: "Ver favoritos",
    },
    userMessages: {
      title: "Mensagens com Canis",
      searchPlaceholder: "Pesquisar conversa...",
      noConversations: "Sem conversas ainda.",
      inputPlaceholder: "Escreve a tua mensagem...",
      send: "Enviar",
      withShelter: "Conversa com",
      backToList: "Conversas",
      success: "Mensagem enviada.",
      errorMessages: {
        invalid_message: "Mensagem invalida.",
        send_failed: "Nao foi possivel enviar a mensagem.",
      },
    },
    userFavorites: {
      title: "Os meus favoritos",
      subtitle: "Animais que guardaste para reveres mais tarde.",
      empty: "Ainda nao tens favoritos. Explora o catalogo e guarda os animais que mais gostares.",
      browse: "Explorar catalogo",
      remove: "Remover",
    },
    canilDashboard: {
      title: "Dashboard do Canil",
      subtitle: "Visao geral operacional do teu canil na FYA (Found Your Animal).",
      welcomePrefix: "Bem-vindo de volta,",
      cardTotalPets: "Total de pets",
      cardAvailable: "Disponiveis",
      cardPending: "Pendentes",
      cardAdopted: "Adotados",
      sectionActivity: "Atividade Recente",
      sectionTasks: "Tarefas Prioritarias",
      viewAllPets: "Ver todos os pets",
      openRequests: "Abrir pedidos de adocao",
      messages: "Ir para mensagens",
      emptyActivity: "Ainda nao ha atividade registada para este canil.",
      tasks: [
        "Responder aos novos pedidos pendentes",
        "Atualizar fotos dos animais com mais visualizacoes",
        "Validar disponibilidade para visitas desta semana",
      ],
    },
    canilSettingsPage: {
      title: "Configuracoes do Canil",
      subtitle: "Atualiza os dados publicos usados na pagina do canil.",
      labelNome: "Nome do canil",
      labelLocalizacao: "Localizacao",
      labelTelefone: "Telefone",
      labelEmail: "Email de contacto",
      labelMissao: "Missao",
      placeholderNome: "Canil Esperanca",
      placeholderLocalizacao: "Lisboa",
      placeholderTelefone: "+351 900 000 000",
      placeholderEmail: "contato@canil.pt",
      placeholderMissao: "Descreve brevemente a missao do canil.",
      donationsTitle: "Doacoes",
      donationsHint:
        "Estes dados aparecem na pagina publica do canil apenas para utilizadores autenticados. Preenche pelo menos um dos campos para permitir doacoes.",
      labelIban: "IBAN",
      placeholderIban: "PT50 0000 0000 0000 0000 0000 0",
      labelMbway: "MBWay",
      placeholderMbway: "+351 9XX XXX XXX",
      labelDonationLink: "Link de doacao online",
      placeholderDonationLink: "https://...",
      labelDonationMessage: "Mensagem para adotantes",
      placeholderDonationMessage: "Como serao usadas as doacoes?",
      save: "Guardar configuracoes",
      success: "Configuracoes guardadas com sucesso.",
      errorMessages: {
        invalid_data: "Preenche pelo menos nome e localizacao.",
        save_failed: "Nao foi possivel guardar. Tenta novamente.",
        no_shelter: "Nao foi encontrado um canil associado a esta conta.",
      },
    },
    canilReviewsPage: {
      title: "Avaliacoes do canil",
      subtitle: "Aprova ou rejeita as avaliacoes que os adotantes deixaram. So as aprovadas ficam visiveis.",
      noShelter: "Nao foi encontrado um canil associado a esta conta.",
      pendingTitle: "A aguardar moderacao",
      historyTitle: "Avaliacoes moderadas",
      emptyPending: "Sem avaliacoes pendentes.",
      emptyHistory: "Ainda nao moderaste nenhuma avaliacao.",
      approve: "Aprovar",
      reject: "Rejeitar",
      estadoPending: "Pendente",
      estadoApproved: "Aprovada",
      estadoRejected: "Rejeitada",
      messages: {
        review_approved: "Avaliacao aprovada.",
        review_rejected: "Avaliacao rejeitada.",
        invalid_review: "Avaliacao invalida.",
        moderation_failed: "Nao foi possivel moderar a avaliacao.",
      },
    },
    canilNewAnimal: {
      back: "Voltar aos animais",
      title: "Novo animal",
      subtitle: "Adiciona um animal ao inventario do teu canil.",
      submit: "Criar animal",
      errorMessages: {
        invalid_data: "Preenche pelo menos nome, especie e estado.",
        save_failed: "Nao foi possivel criar o animal.",
        needs_verification: "O teu canil precisa de ser verificado pelo admin antes de publicar animais.",
      },
    },
    canilEditAnimal: {
      back: "Voltar aos animais",
      subtitle: "Gere fotos e dados do animal.",
      detailsTitle: "Dados do animal",
      saveDetails: "Guardar dados",
      dangerTitle: "Zona de perigo",
      dangerHint: "Apagar o animal remove tambem fotos e pedidos associados.",
      deleteAnimal: "Apagar animal",
      uploadTitle: "Adicionar foto",
      uploadHint: "JPG, PNG ou WebP ate 5MB.",
      upload: "Carregar foto",
      noPhotos: "Sem fotos ainda. Carrega a primeira imagem.",
      primary: "Principal",
      setPrimary: "Definir como principal",
      remove: "Apagar",
      messages: {
        created: "Animal criado. Adiciona fotos abaixo.",
        updated: "Dados atualizados.",
        uploaded: "Foto adicionada.",
        primary_set: "Foto definida como principal.",
        deleted: "Foto apagada.",
        upload_failed: "Nao foi possivel carregar a foto.",
        photo_too_large: "Ficheiro acima de 5MB.",
        invalid_data: "Dados invalidos.",
        not_authorized: "Sem permissao.",
        delete_failed: "Nao foi possivel apagar.",
        update_failed: "Nao foi possivel atualizar.",
        save_failed: "Nao foi possivel guardar.",
        photo_not_found: "Foto nao encontrada.",
      },
    },
    adminUsers: {
      title: "Utilizadores",
      subtitle: "Todos os perfis registados na plataforma.",
      colName: "Nome",
      colEmail: "Email",
      colRole: "Perfil",
      colJoined: "Registo",
      empty: "Sem utilizadores.",
      roleAdmin: "Admin",
      roleCanil: "Canil",
      roleAdopter: "Adotante",
    },
    adminDashboard: {
      title: "Visao geral da plataforma",
      subtitle: "Indicadores principais da FYA num so lugar.",
      cardAdoptions: "Adocoes concluidas",
      cardPending: "Pedidos pendentes",
      cardRequests: "Total de pedidos",
      cardSheltersPending: "Canis por verificar",
      cardShelters: "Canis registados",
      cardUsers: "Utilizadores",
      cardNewUsers: "Novos esta semana",
      cardAnimals: "Animais na plataforma",
      cardAvailable: "Animais disponiveis",
      attentionTitle: "Precisa de atencao",
      attentionVerify: (count) =>
        count === 1 ? "1 canil aguarda verificacao." : `${count} canis aguardam verificacao.`,
      attentionRequests: (count) =>
        count === 1 ? "1 pedido de adocao pendente na plataforma." : `${count} pedidos de adocao pendentes na plataforma.`,
      allClear: "Tudo em dia. Sem itens pendentes.",
      quickTitle: "Acessos rapidos",
      quickShelters: "Gerir canis",
      quickUsers: "Ver utilizadores",
      quickSettings: "Configuracoes da plataforma",
    },
    adminSettings: {
      title: "Configuracoes da plataforma",
      subtitle: "Define os dados globais e o comportamento da FYA.",
      platformTitle: "Identidade e contactos",
      platformName: "Nome da plataforma",
      contactEmail: "Email de contacto",
      supportEmail: "Email de apoio",
      adoptionFee: "Taxa de adocao sugerida",
      adoptionFeeHint: "Texto livre mostrado no detalhe do animal (ex: 150 EUR). Deixa vazio para nao mostrar.",
      requireVerification: "Exigir canil verificado para publicar animais",
      requireVerificationHint:
        "Se ativo, um canil so consegue criar novos animais depois de ser verificado pelo admin.",
      save: "Guardar configuracoes",
      messages: {
        platform_saved: "Configuracoes da plataforma guardadas.",
        invalid_platform: "Indica pelo menos o nome da plataforma.",
        platform_failed: "Nao foi possivel guardar as configuracoes.",
      },
    },
    adminShelters: {
      title: "Canis registados",
      subtitle: "Verifica os canis parceiros para aumentar a confianca dos adotantes.",
      verified: "Verificado",
      pending: "Pendente",
      verify: "Verificar",
      unverify: "Remover verificacao",
      colName: "Canil",
      colJoined: "Registado",
      colStatus: "Estado",
      colActions: "Acoes",
      empty: "Sem canis registados.",
      messages: {
        shelter_verified: "Canil verificado.",
        shelter_unverified: "Verificacao removida.",
        unauthorized: "Nao autorizado.",
        invalid_shelter: "Canil invalido.",
        verification_failed: "Nao foi possivel atualizar a verificacao.",
      },
    },
    userPets: {
      title: "Os meus animais",
      subtitle: "Animais que estas a publicar para adocao como particular.",
      noAnimals: "Ainda nao publicaste nenhum animal. Cria a primeira ficha em alguns minutos.",
      sidebarLabel: "Meus animais",
      publishHint: "Animais particulares aparecem no catalogo publico como anuncios privados.",
    },
    userNewAnimal: {
      title: "Publicar novo animal",
      subtitle: "Adiciona um animal teu ao catalogo de adopcao da FYA.",
    },
    userEditAnimal: {
      subtitle: "Gere fotos e dados do teu animal.",
    },
    userReceivedRequests: {
      title: "Pedidos recebidos",
      subtitle: "Candidaturas para os animais que publicaste.",
      empty: "Ainda nao recebeste pedidos. Quando chegarem, vao aparecer aqui.",
      sidebarLabel: "Pedidos recebidos",
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
      roleAdmin: "Administrator",
      roleCanil: "Shelter",
      roleAdopter: "Adopter",
      accountFallback: "Account",
      openAccountMenu: "Open account menu",
      myDashboard: "My dashboard",
      menuSettings: "Settings",
      menuLogout: "Sign out",
      openMenu: "Open menu",
      closeMenu: "Close menu",
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
      trusted: "Trusted by 5,000+ families",
      heroTitleAccent: "for every family",
      heroImageAlt: "Dog and cat together",
      browseCatalog: "Browse catalog",
      learnMore: "Learn more",
      todayFound: (count) => `${count} pets found`,
      nearYou: "In your area today",
      urgentTitle: "Urgent pets",
      urgentSubtitle: "These friends have been waiting the longest for a home.",
      seeAll: "See all",
      meetPet: (name) => `Meet ${name}`,
      howSubtitle:
        "Three simple steps to bring your new family member home with confidence and guidance.",
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
      registerPageTitle: "Every paw deserves a joyful home.",
      registerPageDescription:
        "Join our community of adopters and shelters. Registration is your first step toward more success stories.",
      registerJoined: "Joined by 12,000+ members",
      registerJoinedSubtitle: "Active across partner shelters",
      registerTerms:
        "I agree to the Terms of Service and Privacy Policy and authorize data processing for account creation.",
      smilingDogAlt: "Smiling dog",
      kittenAlt: "Kitten",
      footerNote: "Built with care for every paw.",
      loginSideTitle: "Welcome back to the pack.",
      loginSideText: "Reconnect with local shelters and find the companion that completes your family.",
      loginForgotPassword: "Forgot password?",
      loginRememberDevice: "Remember this device",
      loginPasswordUpdated: "Password updated. Sign in with your new password.",
      loginDogAlt: "Happy golden retriever",
      loginEmailPlaceholder: "hello@example.com",
      shelterRegEyebrow: "Join our mission",
      shelterRegTitle: "Shelter Registration",
      shelterRegSubtitlePrefix: "Bring your shelter into the",
      shelterRegSubtitleSuffix:
        "network and create lasting matches between pets and loving families.",
      shelterBenefitsTitle: "Why FYA?",
      shelterBenefit1Title: "Total visibility",
      shelterBenefit1Text: "Reach thousands of potential adopters every day.",
      shelterBenefit2Title: "Easy management",
      shelterBenefit2Text: "Intuitive tools to manage pets and adoption requests.",
      shelterBenefit3Title: "Support network",
      shelterBenefit3Text: "Access exclusive resources and partner vet initiatives.",
      shelterImageQuote: '"Changing lives, one paw at a time."',
      shelterBrowseFile: "Browse file",
      shelterDogsAlt: "Happy shelter dogs",
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
      resultsFound: (count) => `${count} ${count === 1 ? "pet found" : "pets found"}`,
      noResultsCount: "No pets match your filters.",
      filters: "Filters",
      apply: "Apply",
      activeFilters: "Active filters:",
      emptySearch: "We could not find results for these filters.",
      emptyDb: "No pets available right now.",
      findMyMatch: "Find my match",
    },
    petDetails: {
      backToCatalog: "Back to catalog",
      applyCta: "Apply to adopt",
      saveCta: "Save pet",
      similarPetsTitle: "Meet more friends",
      metaNotFound: "Pet not found | FYA",
      metaDescription: (name, species, location) =>
        `Meet ${name}, a ${species} available for adoption in ${location}.`,
      popularChoice: "Popular choice",
      vaccinationsUpToDate: "Vaccinations up to date",
      subtitle: (shelterName) => `The golden soul of ${shelterName}`,
      weightSmall: "18-26 lbs",
      weightMedium: "30-48 lbs",
      weightLarge: "53-70 lbs",
      adoptionFee: "Adoption fee: $250",
      adoptionFeeHint: "Includes microchip, initial vaccines, and early shelter follow-up.",
      adoptionFeedback: {
        request_created: "Application submitted successfully.",
        only_users_can_apply: "Only adopters can submit applications.",
        pet_not_found: "Pet not found.",
        request_failed: "Could not submit the application.",
        conversation_failed: "Application created, but conversation could not be started.",
        invalid_pet: "Invalid pet.",
      },
      storyHeading: (name) => `${name}'s story`,
      noDescription: "No description available for this pet.",
      healthCareTitle: "Health & grooming",
      vaccinationLabel: "Vaccinations",
      groomingLabel: "Grooming needs",
      groomingValue: "Regular brushing recommended.",
      currentStatusLabel: "Current status",
      medicalConditionsLabel: "Medical conditions",
      medicalConditionsValue: "No critical conditions registered.",
      keyStatsTitle: "Key statistics",
      breedLabel: "Breed",
      ageLabel: "Age",
      genderLabel: "Gender",
      weightLabel: "Weight",
      locationLabel: "Location",
      aboutHomeLegend: "About your home",
      housingTypeLabel: "Housing type",
      selectPlaceholder: "Select...",
      housingApartment: "Apartment",
      housingHouse: "House",
      housingShared: "Shared home",
      housingOther: "Other",
      householdSizeLabel: "Household size",
      gardenLabel: "Garden",
      childrenLabel: "Children",
      otherPetsLabel: "Other pets",
      otherPetsDetailLabel: "Other pets details (optional)",
      otherPetsDetailPlaceholder: "e.g. 1 neutered cat",
      experienceLegend: "Experience and routine",
      experienceLabel: "Pet experience",
      experienceNone: "None",
      experienceSome: "Some",
      experienceExperienced: "Experienced",
      hoursAloneLabel: "Hours alone per day",
      reasonLabel: "Reason to adopt",
      reasonPlaceholder: "In a few words...",
      messageLabel: "Message to shelter",
      messagePlaceholder: "Write an initial message...",
      removeFavorite: "Remove from favorites",
      certifiedShelter: "Certified shelter",
      visitHours: "Visits: Mon-Sat, 10am - 4pm",
      viewShelterProfile: "View shelter profile",
      viewAllPets: "View all pets",
      moreFriends: (shelterName) => `More friends from ${shelterName}`,
      badgeYoung: "Young",
      badgeAdult: "Adult",
      initialGreeting: "Hi! I am interested in this pet.",
      loginToApplyTitle: "Sign in to apply",
      loginToApplyText: "Create an adopter account or sign in to send your application to the shelter.",
      loginToApplyCta: "Sign in to apply",
      notAdopterTitle: "Only adopters can apply",
      notAdopterText:
        "Your account is not an adopter account. Use an adopter account to send adoption requests.",
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
      shelterInteriorAlt: "Modern shelter interior",
      shelterLogoAlt: "Shelter logo",
      contactVisitLabel: "VISIT US",
      contactCallLabel: "CALL US",
      contactWebsiteLabel: "WEBSITE",
      contactHours: "Mon-Sat: 9am - 6pm",
      defaultMission:
        "Our team works daily to ensure care, safety, and socialization for every resident. We prioritize responsible adoptions with post-adoption follow-up.",
      publicProfileTitle: "Your public profile",
      publicProfileText:
        "This is how adopters see your shelter on FYA. Share the link to receive more applications.",
      viewPublicProfile: "View public profile",
      statsTitle: "Shelter statistics",
      residentsTitle: "Residents seeking homes",
      residentsSubtitle:
        "Meet residents currently staying at the shelter. All pets are vaccinated and ready to meet new families.",
      allSpecies: "All species",
      dogs: "Dogs",
      cats: "Cats",
      meetPet: (name) => `Meet ${name}`,
      viewAllResidents: "View all residents",
      availableKeyword: "available",
      reservedKeyword: "reserved",
    },
    errors: {
      title: "Something went wrong",
      description:
        "An unexpected error occurred while loading this page. You can try again or go back home.",
      retry: "Try again",
      backHome: "Back to home",
      notFoundTitle: "Page not found",
      notFoundDescription:
        "The page you are looking for does not exist or has been moved. Check the address or go back home.",
    },
    match: {
      eyebrow: "Find your match",
      title: "Which pet is right for you?",
      subtitle:
        "Answer 3 quick questions and we'll show the pets that best fit your lifestyle.",
      q1: "What kind of companion are you looking for?",
      q1Options: { any: "No preference", dog: "A dog", cat: "A cat" },
      q2: "Where do you live?",
      q2Options: {
        apartment: "Apartment",
        house: "House",
        bigHouse: "House with a large yard",
      },
      q3: "How much free time do you have per day?",
      q3Options: {
        little: "Little (full-time work/study)",
        medium: "Some time every day",
        plenty: "Plenty of time for walks and play",
      },
      submit: "See my matches",
      hint: "We'll analyze the available pets and rank the ones that fit you best.",
      resultsTitle: "Your top matches",
      resultsSubtitle: "Available pets ranked by how well they fit your answers.",
      resultsEmptyTitle: "No matches yet",
      resultsEmptyText: "There are no pets available right now. Check back soon or browse the catalog.",
      retake: "Retake the quiz",
      viewProfile: "View profile",
      compatibility: "match",
      topMatch: "Top match",
      reasons: {
        speciesMatch: "It's the species you wanted",
        sizeMatch: "Ideal size for your home",
        energyMatch: "Energy that matches your free time",
        calmMatch: "Calm temperament for busy routines",
      },
    },
    animalForm: {
      name: "Name",
      species: "Species",
      breed: "Breed",
      sex: "Gender",
      age: "Age (years)",
      size: "Size",
      status: "Status",
      description: "Description",
      select: "Select...",
      speciesDog: "Dog",
      speciesCat: "Cat",
      speciesOther: "Other",
      sexMale: "Male",
      sexFemale: "Female",
      sizeSmall: "Small",
      sizeMedium: "Medium",
      sizeLarge: "Large",
      statusAvailable: "Available",
      statusReserved: "Reserved",
      statusInTreatment: "In treatment",
      statusAdopted: "Adopted",
    },
    visitPanel: {
      title: "Visits",
      none: "No visits scheduled.",
      propose: "Propose a visit",
      submit: "Propose",
      confirm: "Confirm",
      cancel: "Cancel",
      markDone: "Mark completed",
    },
    shelterPublic: {
      metaNotFound: "Shelter not found | FYA",
      metaDescription: (name, location) =>
        `Discover ${name} shelter in ${location} and its pets available for adoption.`,
      back: "Back to shelters",
      verified: "Verified",
      aboutTitle: "About the shelter",
      noDescription: "No public description yet.",
      contactTitle: "Contact",
      phoneLabel: "Phone",
      emailLabel: "Email",
      locationLabel: "Location",
      joinedLabel: "On FYA since",
      residentsTitle: "Pets looking for a home",
      noResidents: "This shelter has not published pets yet.",
      statsTotal: "Total pets",
      statsAvailable: "Available",
      statsAdopted: "Adopted",
      notProvided: "Not provided",
      reviewsTitle: "Reviews",
      noReviews: "This shelter has no reviews yet.",
      ratingSummary: (avg, count) =>
        `${avg.toFixed(1)} of 5 · ${count} ${count === 1 ? "review" : "reviews"}`,
      writeReview: "Leave a review",
      editReview: "Update your review",
      ratingLabel: "Rating",
      commentLabel: "Comment (optional)",
      commentPlaceholder: "How was your experience with this shelter?",
      submitReview: "Send review",
      moderationNote: "Your review is only visible after the shelter approves it.",
      pendingNote: "Your review was sent and is awaiting the shelter's approval.",
      rejectedNote: "Your previous review was not approved. You can edit and resend it.",
      loginToReview: "Sign in to review this shelter.",
      reviewMessages: {
        review_pending: "Review sent. The shelter will review it before it appears.",
        invalid_review: "Pick a valid rating.",
        review_failed: "Could not save the review.",
        only_adopters_can_review: "Only adopters can review shelters.",
      },
      notAdopterReview: "Only adopter accounts can leave reviews.",
      donateTitle: "Support this shelter",
      donateText: "Help fund the daily care of these animals. Donations go directly to the shelter.",
      donateLoginCta: "Sign in to support",
      donateNoInfo: "This shelter has not shared donation details yet.",
      donateIban: "IBAN",
      donateMbway: "MBWay",
      donateExternalLink: "Donate online",
    },
    userSettings: {
      title: "Account Settings",
      subtitle:
        "Basic account area. You can later extend this page with preferences and notifications.",
      name: "Name",
      accountType: "Account type",
      adopter: "Adopter",
    },
    canilMessages: {
      title: "Messages",
      searchPlaceholder: "Search conversations...",
      noConversations: "No conversations yet.",
      inputPlaceholder: "Write your message...",
      send: "Send",
      adopterInfo: "About the adopter",
      reminder: "Reminder",
      reminderText: "Confirm compatibility with other pets during the in-person visit.",
      chatWith: "Chat with",
      success: "Message sent.",
      errorMessages: {
        invalid_message: "Invalid message.",
        send_failed: "Could not send message.",
      },
    },
    canilPets: {
      title: "Pet Inventory",
      subtitle: "Update pet statuses and keep your shelter inventory in sync.",
      statusLabel: "Status",
      species: "Species / Breed",
      age: "Age",
      actions: "Actions",
      noAnimals: "No pets were found for this shelter yet.",
      save: "Save",
      newPet: "New pet",
      photos: "Photos",
      statusOptions: {
        disponivel: "Available",
        reservado: "Reserved",
        em_tratamento: "In treatment",
        adotado: "Adopted",
      },
      successMessages: {
        updated: "Pet status was updated successfully.",
        animal_deleted: "Pet removed.",
      },
      errorMessages: {
        invalid_status: "Invalid status.",
        save_failed: "Could not save the changes.",
        no_shelter: "No shelter was found for your account.",
        invalid_data: "Invalid data.",
        not_authorized: "Not allowed for this pet.",
        delete_failed: "Could not remove the pet.",
      },
    },
    footer: {
      tagline: "We help every animal find a family forever.",
      discover: "Discover",
      support: "Support",
      crafted: "© 2026 FYA (Found Your Animal). Made with care.",
      petCatalog: "Pet catalog",
      shelters: "Shelters",
      successStories: "Success stories",
      findMatch: "Find my match",
      helpCenter: "Help center",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms of service",
    },
    favoriteButton: {
      save: "Save pet",
      remove: "Remove from favorites",
    },
    chatThread: {
      today: "Today",
      yesterday: "Yesterday",
    },
    sidebar: {
      userSubtitle: "Adopter Area",
      canilSubtitle: "Shelter Admin",
      adminSubtitle: "Administration",
      dashboard: "Dashboard",
      catalog: "Pet Catalog",
      favorites: "Favorites",
      requests: "My Requests",
      messages: "Messages",
      settings: "Settings",
      shelterPage: "Shelter Page",
      pets: "My Pets",
      adoptionRequests: "Adoption Requests",
      reviews: "Reviews",
      overview: "Overview",
      shelters: "Shelters",
      users: "Users",
      myPets: "My pets",
      receivedRequests: "Received requests",
    },
    adoptionAnswers: {
      noAnswers: "No structured questionnaire for this request.",
    },
    shelterDirectory: {
      title: "Partner shelters",
      subtitle: "Meet the organizations that give pets a home through FYA.",
      searchPlaceholder: "Search by name, city or mission...",
      empty: "No shelters match this search.",
      totalPets: (count) => `${count} ${count === 1 ? "pet" : "pets"}`,
      openCanil: "Open shelter",
      submit: "Search",
      verified: "Verified",
    },
    userRequestsPage: {
      title: "My Adoption Requests",
      subtitle: "Track the status of your submitted applications.",
      columnPet: "Pet and Shelter",
      columnStatus: "Status",
      columnDate: "Date",
      columnNotes: "Shelter notes",
      empty: "You have not submitted requests yet. Visit the pet catalog to apply.",
      visitsLabel: "Visits",
      noShelterNotes: "No notes from shelter.",
      successMessages: {
        request_created: "Application submitted successfully.",
        visit_proposed: "Visit proposed. Waiting for the shelter to confirm.",
        visit_updated: "Visit updated.",
      },
      errorMessages: {
        request_failed: "Could not submit request.",
        invalid_visit: "Invalid visit data.",
        visit_in_past: "Pick a date in the future.",
        visit_not_allowed: "You cannot schedule a visit for this request.",
        visit_failed: "Could not schedule the visit.",
      },
    },
    canilRequestsPage: {
      title: "Adoption Requests",
      subtitle: "Queue of applications received for your pets.",
      columnApplicant: "Applicant & Pet",
      columnDate: "Submission",
      columnStatus: "Status",
      columnActions: "Actions",
      empty: "No requests right now. New requests will show up here.",
      statuses: {
        pendente: "Pending",
        entrevista: "Interview",
        aprovado: "Approved",
        rejeitado: "Rejected",
        concluido: "Adoption completed",
      },
      hint: "Update statuses and notes to keep adopters informed.",
      notePlaceholder: "Notes for adopter (optional)",
      save: "Save",
      questionnaireVisits: "Questionnaire and visits",
      successMessages: {
        updated: "Request updated successfully.",
        visit_updated: "Visit updated.",
      },
      errorMessages: {
        invalid_request: "Invalid request.",
        save_failed: "Could not save changes.",
        unauthorized: "Not authorized.",
        no_shelter: "No linked shelter found.",
        invalid_visit: "Invalid visit data.",
        visit_failed: "Could not update the visit.",
      },
    },
    notifications: {
      title: "Notifications",
      subtitle: "Updates from your requests and conversations.",
      markAll: "Mark all as read",
      empty: "No notifications yet.",
      open: "Open",
    },
    successStories: {
      eyebrow: "Success stories",
      title: "Every adoption is a happy ending",
      subtitle: "Pets that have already found their family through FYA.",
      stat: (count) =>
        `${count} ${count === 1 ? "friend found a home" : "friends found a home"}`,
      empty: "No completed adoptions yet. Soon the first stories will show up here.",
      browse: "Browse pets for adoption",
      foundHome: "found a home",
      via: "via",
    },
    resetPassword: {
      title: "Set new password",
      subtitle: "Choose a new password for your account.",
      passwordLabel: "New password",
      confirmLabel: "Confirm password",
      submit: "Save password",
      errorMessages: {
        weak_password: "Password must be at least 6 characters.",
        mismatch: "Passwords do not match.",
        expired: "The link expired. Request a new recovery link.",
        update_failed: "Could not update the password.",
      },
    },
    forgotPassword: {
      title: "Reset password",
      subtitle: "Enter your email and we will send a link to set a new password.",
      emailLabel: "Email",
      emailPlaceholder: "you@email.com",
      submit: "Send recovery link",
      backToLogin: "Back to login",
      sent: "If an account exists for that email, we sent a recovery link.",
      invalid_email: "Enter a valid email.",
    },
    userDashboard: {
      title: "Adopter Dashboard",
      subtitle: "Track your requests and conversations with shelters.",
      cardTotal: "Requests sent",
      cardPending: "In review",
      cardApproved: "Approved",
      cardChats: "Active chats",
      cardFavorites: "Favorites",
      browsePets: "Browse pets",
      viewRequests: "View requests",
      openMessages: "Open messages",
      viewFavorites: "View favorites",
    },
    userMessages: {
      title: "Messages with Shelters",
      searchPlaceholder: "Search conversation...",
      noConversations: "No conversations yet.",
      inputPlaceholder: "Write your message...",
      send: "Send",
      withShelter: "Chat with",
      backToList: "Conversations",
      success: "Message sent.",
      errorMessages: {
        invalid_message: "Invalid message.",
        send_failed: "Could not send message.",
      },
    },
    userFavorites: {
      title: "My favorites",
      subtitle: "Pets you have saved to revisit later.",
      empty: "No favorites yet. Browse the catalog and save the pets you like.",
      browse: "Browse catalog",
      remove: "Remove",
    },
    canilDashboard: {
      title: "Shelter Dashboard",
      subtitle: "Operational overview of your shelter inside FYA (Found Your Animal).",
      welcomePrefix: "Welcome back,",
      cardTotalPets: "Total pets",
      cardAvailable: "Available",
      cardPending: "Pending",
      cardAdopted: "Adopted",
      sectionActivity: "Recent Activity",
      sectionTasks: "Priority Tasks",
      viewAllPets: "View all pets",
      openRequests: "Open adoption requests",
      messages: "Go to messages",
      emptyActivity: "There is no recorded activity for this shelter yet.",
      tasks: [
        "Reply to new pending requests",
        "Refresh photos for the most viewed pets",
        "Confirm this week's in-person visit availability",
      ],
    },
    canilSettingsPage: {
      title: "Shelter Settings",
      subtitle: "Update public information used on your shelter page.",
      labelNome: "Shelter name",
      labelLocalizacao: "Location",
      labelTelefone: "Phone",
      labelEmail: "Contact email",
      labelMissao: "Mission",
      placeholderNome: "Joyful Sanctuary",
      placeholderLocalizacao: "Lisbon",
      placeholderTelefone: "+351 900 000 000",
      placeholderEmail: "contact@shelter.org",
      placeholderMissao: "Describe your shelter mission and adoption process.",
      donationsTitle: "Donations",
      donationsHint:
        "These details appear on the shelter's public page for signed-in users only. Fill in at least one field to accept donations.",
      labelIban: "IBAN",
      placeholderIban: "PT50 0000 0000 0000 0000 0000 0",
      labelMbway: "MBWay",
      placeholderMbway: "+351 9XX XXX XXX",
      labelDonationLink: "Online donation link",
      placeholderDonationLink: "https://...",
      labelDonationMessage: "Message to adopters",
      placeholderDonationMessage: "How will donations be used?",
      save: "Save settings",
      success: "Settings saved successfully.",
      errorMessages: {
        invalid_data: "Please provide at least name and location.",
        save_failed: "Could not save changes. Try again.",
        no_shelter: "No shelter is linked to this account.",
      },
    },
    canilReviewsPage: {
      title: "Shelter reviews",
      subtitle: "Approve or reject reviews left by adopters. Only approved ones become visible.",
      noShelter: "No shelter is linked to this account.",
      pendingTitle: "Awaiting moderation",
      historyTitle: "Moderated reviews",
      emptyPending: "No pending reviews.",
      emptyHistory: "You have not moderated any review yet.",
      approve: "Approve",
      reject: "Reject",
      estadoPending: "Pending",
      estadoApproved: "Approved",
      estadoRejected: "Rejected",
      messages: {
        review_approved: "Review approved.",
        review_rejected: "Review rejected.",
        invalid_review: "Invalid review.",
        moderation_failed: "Could not moderate the review.",
      },
    },
    canilNewAnimal: {
      back: "Back to pets",
      title: "New pet",
      subtitle: "Add a pet to your shelter inventory.",
      submit: "Create pet",
      errorMessages: {
        invalid_data: "Provide at least name, species and status.",
        save_failed: "Could not create the pet.",
        needs_verification: "Your shelter must be verified by an admin before publishing animals.",
      },
    },
    canilEditAnimal: {
      back: "Back to pets",
      subtitle: "Manage photos and pet details.",
      detailsTitle: "Pet details",
      saveDetails: "Save details",
      dangerTitle: "Danger zone",
      dangerHint: "Deleting the pet also removes its photos and related requests.",
      deleteAnimal: "Delete pet",
      uploadTitle: "Add photo",
      uploadHint: "JPG, PNG or WebP up to 5MB.",
      upload: "Upload photo",
      noPhotos: "No photos yet. Upload the first one.",
      primary: "Primary",
      setPrimary: "Set as primary",
      remove: "Delete",
      messages: {
        created: "Pet created. Add photos below.",
        updated: "Details updated.",
        uploaded: "Photo added.",
        primary_set: "Photo set as primary.",
        deleted: "Photo removed.",
        upload_failed: "Could not upload photo.",
        photo_too_large: "File exceeds 5MB.",
        invalid_data: "Invalid data.",
        not_authorized: "Not allowed.",
        delete_failed: "Could not delete.",
        update_failed: "Could not update.",
        save_failed: "Could not save.",
        photo_not_found: "Photo not found.",
      },
    },
    adminUsers: {
      title: "Users",
      subtitle: "All profiles registered on the platform.",
      colName: "Name",
      colEmail: "Email",
      colRole: "Role",
      colJoined: "Joined",
      empty: "No users.",
      roleAdmin: "Admin",
      roleCanil: "Shelter",
      roleAdopter: "Adopter",
    },
    adminDashboard: {
      title: "Platform overview",
      subtitle: "FYA's key indicators in one place.",
      cardAdoptions: "Completed adoptions",
      cardPending: "Pending requests",
      cardRequests: "Total requests",
      cardSheltersPending: "Shelters to verify",
      cardShelters: "Registered shelters",
      cardUsers: "Users",
      cardNewUsers: "New this week",
      cardAnimals: "Animals on platform",
      cardAvailable: "Available animals",
      attentionTitle: "Needs attention",
      attentionVerify: (count) =>
        count === 1 ? "1 shelter is awaiting verification." : `${count} shelters are awaiting verification.`,
      attentionRequests: (count) =>
        count === 1 ? "1 adoption request pending platform-wide." : `${count} adoption requests pending platform-wide.`,
      allClear: "All caught up. No pending items.",
      quickTitle: "Quick links",
      quickShelters: "Manage shelters",
      quickUsers: "View users",
      quickSettings: "Platform settings",
    },
    adminSettings: {
      title: "Platform settings",
      subtitle: "Define FYA's global data and behaviour.",
      platformTitle: "Identity and contacts",
      platformName: "Platform name",
      contactEmail: "Contact email",
      supportEmail: "Support email",
      adoptionFee: "Suggested adoption fee",
      adoptionFeeHint: "Free text shown on the pet detail page (e.g. 150 EUR). Leave empty to hide.",
      requireVerification: "Require verified shelter to publish animals",
      requireVerificationHint:
        "When enabled, a shelter can only create new animals after being verified by an admin.",
      save: "Save settings",
      messages: {
        platform_saved: "Platform settings saved.",
        invalid_platform: "Provide at least the platform name.",
        platform_failed: "Could not save the settings.",
      },
    },
    adminShelters: {
      title: "Registered shelters",
      subtitle: "Verify partner shelters to build adopter trust.",
      verified: "Verified",
      pending: "Pending",
      verify: "Verify",
      unverify: "Remove verification",
      colName: "Shelter",
      colJoined: "Joined",
      colStatus: "Status",
      colActions: "Actions",
      empty: "No shelters registered.",
      messages: {
        shelter_verified: "Shelter verified.",
        shelter_unverified: "Verification removed.",
        unauthorized: "Not authorized.",
        invalid_shelter: "Invalid shelter.",
        verification_failed: "Could not update verification.",
      },
    },
    userPets: {
      title: "My pets",
      subtitle: "Pets you are listing for adoption as a private owner.",
      noAnimals: "You haven't listed any pets yet. Create your first listing in a few minutes.",
      sidebarLabel: "My pets",
      publishHint: "Private listings appear on the public catalog as private adverts.",
    },
    userNewAnimal: {
      title: "List a new pet",
      subtitle: "Add your pet to the FYA adoption catalog.",
    },
    userEditAnimal: {
      subtitle: "Manage photos and details for your pet.",
    },
    userReceivedRequests: {
      title: "Received requests",
      subtitle: "Applications for the pets you have listed.",
      empty: "You haven't received requests yet. New ones will appear here.",
      sidebarLabel: "Received requests",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
