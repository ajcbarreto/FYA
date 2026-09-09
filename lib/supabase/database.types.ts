// Generated from versioned migrations by npm run db:types. Do not edit manually.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Database = {
  public: {
    Tables: {
      animais: {
        Row: {
          id: string;
          canil_id: string;
          nome: string;
          especie: string;
          raca: string | null;
          sexo: string | null;
          idade_anos: number | null;
          porte: string | null;
          status: string;
          descricao: string | null;
          created_at: string;
          compatibilidades: string[];
        };
        Insert: {
          id?: string;
          canil_id: string;
          nome: string;
          especie: string;
          raca?: string | null;
          sexo?: string | null;
          idade_anos?: number | null;
          porte?: string | null;
          status?: string;
          descricao?: string | null;
          created_at?: string;
          compatibilidades?: string[];
        };
        Update: {
          id?: string;
          canil_id?: string;
          nome?: string;
          especie?: string;
          raca?: string | null;
          sexo?: string | null;
          idade_anos?: number | null;
          porte?: string | null;
          status?: string;
          descricao?: string | null;
          created_at?: string;
          compatibilidades?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "animais_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
        ];
      };
      animal_fotos: {
        Row: {
          id: string;
          animal_id: string;
          storage_path: string;
          public_url: string | null;
          is_primary: boolean;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          storage_path: string;
          public_url?: string | null;
          is_primary?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          storage_path?: string;
          public_url?: string | null;
          is_primary?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "animal_fotos_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "animal_fotos_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_events: {
        Row: {
          id: number;
          actor_id: string | null;
          entity: string;
          entity_id: string;
          operation: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          entity: string;
          entity_id: string;
          operation: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          actor_id?: string | null;
          entity?: string;
          entity_id?: string;
          operation?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      avaliacoes_canil: {
        Row: {
          id: string;
          canil_id: string;
          author_profile_id: string;
          rating: number;
          comentario: string | null;
          created_at: string;
          estado: string;
          author_name: string | null;
        };
        Insert: {
          id?: string;
          canil_id: string;
          author_profile_id: string;
          rating: number;
          comentario?: string | null;
          created_at?: string;
          estado?: string;
          author_name?: string | null;
        };
        Update: {
          id?: string;
          canil_id?: string;
          author_profile_id?: string;
          rating?: number;
          comentario?: string | null;
          created_at?: string;
          estado?: string;
          author_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "avaliacoes_canil_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avaliacoes_canil_author_profile_id_fkey";
            columns: ["author_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      canil_likes: {
        Row: {
          canil_id: string;
          user_profile_id: string;
        };
        Insert: {
          canil_id: string;
          user_profile_id: string;
        };
        Update: {
          canil_id?: string;
          user_profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "canil_likes_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "canil_likes_user_profile_id_fkey";
            columns: ["user_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      canis: {
        Row: {
          id: string;
          owner_profile_id: string | null;
          nome: string;
          localizacao: string;
          missao: string | null;
          telefone: string | null;
          email_contacto: string | null;
          created_at: string;
          verificado: boolean;
          donation_url: string | null;
          donation_message: string | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          owner_profile_id?: string | null;
          nome: string;
          localizacao: string;
          missao?: string | null;
          telefone?: string | null;
          email_contacto?: string | null;
          created_at?: string;
          verificado?: boolean;
          donation_url?: string | null;
          donation_message?: string | null;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          owner_profile_id?: string | null;
          nome?: string;
          localizacao?: string;
          missao?: string | null;
          telefone?: string | null;
          email_contacto?: string | null;
          created_at?: string;
          verificado?: boolean;
          donation_url?: string | null;
          donation_message?: string | null;
          image_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "canis_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversas_adocao: {
        Row: {
          id: string;
          canil_id: string;
          applicant_profile_id: string;
          animal_id: string | null;
          pedido_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          canil_id: string;
          applicant_profile_id: string;
          animal_id?: string | null;
          pedido_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          canil_id?: string;
          applicant_profile_id?: string;
          animal_id?: string | null;
          pedido_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversas_adocao_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversas_adocao_applicant_profile_id_fkey";
            columns: ["applicant_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversas_adocao_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversas_adocao_pedido_id_fkey";
            columns: ["pedido_id"];
            isOneToOne: false;
            referencedRelation: "pedidos_adocao";
            referencedColumns: ["id"];
          },
        ];
      };
      email_outbox: {
        Row: {
          id: string;
          recipient: string;
          animal_name: string;
          status: string | null;
          attempts: number;
          available_at: string;
          locked_at: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient: string;
          animal_name: string;
          status?: string | null;
          attempts?: number;
          available_at?: string;
          locked_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient?: string;
          animal_name?: string;
          status?: string | null;
          attempts?: number;
          available_at?: string;
          locked_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      favoritos: {
        Row: {
          user_profile_id: string;
          animal_id: string;
          created_at: string;
        };
        Insert: {
          user_profile_id: string;
          animal_id: string;
          created_at?: string;
        };
        Update: {
          user_profile_id?: string;
          animal_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favoritos_user_profile_id_fkey";
            columns: ["user_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favoritos_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
        ];
      };
      mensagens_adocao: {
        Row: {
          id: string;
          conversa_id: string;
          sender_profile_id: string;
          conteudo: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversa_id: string;
          sender_profile_id: string;
          conteudo: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversa_id?: string;
          sender_profile_id?: string;
          conteudo?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mensagens_adocao_sender_profile_id_fkey";
            columns: ["sender_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mensagens_adocao_conversa_id_fkey";
            columns: ["conversa_id"];
            isOneToOne: false;
            referencedRelation: "conversas_adocao";
            referencedColumns: ["id"];
          },
        ];
      };
      notificacoes: {
        Row: {
          id: string;
          user_profile_id: string;
          tipo: string;
          referencia: string | null;
          link: string | null;
          lida: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_profile_id: string;
          tipo: string;
          referencia?: string | null;
          link?: string | null;
          lida?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_profile_id?: string;
          tipo?: string;
          referencia?: string | null;
          link?: string | null;
          lida?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notificacoes_user_profile_id_fkey";
            columns: ["user_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      pedidos_adocao: {
        Row: {
          id: string;
          animal_id: string;
          canil_id: string;
          applicant_profile_id: string;
          status: string;
          mensagem_inicial: string | null;
          observacoes_canil: string | null;
          created_at: string;
          updated_at: string;
          reviewed_at: string | null;
          respostas: Json;
        };
        Insert: {
          id?: string;
          animal_id: string;
          canil_id: string;
          applicant_profile_id: string;
          status?: string;
          mensagem_inicial?: string | null;
          observacoes_canil?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
          respostas?: Json;
        };
        Update: {
          id?: string;
          animal_id?: string;
          canil_id?: string;
          applicant_profile_id?: string;
          status?: string;
          mensagem_inicial?: string | null;
          observacoes_canil?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
          respostas?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "pedidos_adocao_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_adocao_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_adocao_applicant_profile_id_fkey";
            columns: ["applicant_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      visitas: {
        Row: {
          id: string;
          pedido_id: string;
          canil_id: string;
          applicant_profile_id: string;
          animal_id: string | null;
          scheduled_at: string;
          status: string;
          notas: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          canil_id: string;
          applicant_profile_id: string;
          animal_id?: string | null;
          scheduled_at: string;
          status?: string;
          notas?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          canil_id?: string;
          applicant_profile_id?: string;
          animal_id?: string | null;
          scheduled_at?: string;
          status?: string;
          notas?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visitas_pedido_id_fkey";
            columns: ["pedido_id"];
            isOneToOne: false;
            referencedRelation: "pedidos_adocao";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitas_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitas_applicant_profile_id_fkey";
            columns: ["applicant_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitas_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      submit_adoption: {
        Args: { p_animal: string; p_answers: Json; p_message: string };
        Returns: string;
      };
      transition_adoption: {
        Args: { p_request: string; p_status: string; p_notes: string };
        Returns: undefined;
      };
      claim_email_jobs: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["email_outbox"]["Row"][];
      };
    };
    Enums: { app_role: "admin" | "user" | "canil" };
    CompositeTypes: Record<string, never>;
  };
};
