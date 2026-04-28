import type { Locale } from "@/lib/i18n/config";

type Dictionary = {
  nav: {
    home: string;
    pets: string;
    login: string;
    register: string;
    userDashboard: string;
    canilDashboard: string;
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
};

const dictionaries: Record<Locale, Dictionary> = {
  pt: {
    nav: {
      home: "Home",
      pets: "Catalogo de Pets",
      login: "Entrar",
      register: "Registar",
      userDashboard: "Dashboard Adotante",
      canilDashboard: "Dashboard Canil",
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
  },
  en: {
    nav: {
      home: "Home",
      pets: "Pet Catalog",
      login: "Login",
      register: "Register",
      userDashboard: "Adopter Dashboard",
      canilDashboard: "Shelter Dashboard",
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
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
