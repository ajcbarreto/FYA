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
          archived_at: string | null;
          published: boolean;
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
          archived_at?: string | null;
          published?: boolean;
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
          archived_at?: string | null;
          published?: boolean;
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
      animal_documents: {
        Row: {
          id: string;
          animal_id: string;
          title: string;
          category: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          shareable: boolean;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          title: string;
          category: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          shareable?: boolean;
          created_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          title?: string;
          category?: string;
          storage_path?: string;
          mime_type?: string;
          size_bytes?: number;
          shareable?: boolean;
          created_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "animal_documents_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "animal_documents_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
      animal_handover: {
        Row: {
          animal_id: string;
          checked_items: string[];
          confirmed_by: string;
          confirmed_at: string;
        };
        Insert: {
          animal_id: string;
          checked_items?: string[];
          confirmed_by?: string;
          confirmed_at?: string;
        };
        Update: {
          animal_id?: string;
          checked_items?: string[];
          confirmed_by?: string;
          confirmed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "animal_handover_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "animal_handover_confirmed_by_fkey";
            columns: ["confirmed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      animal_records: {
        Row: {
          animal_id: string;
          internal_ref: string;
          microchip: string;
          intake_date: string | null;
          origin: string;
          location: string;
          birth_date: string | null;
          health_notes: string;
          behaviour_notes: string;
          internal_notes: string;
          handover_notes: string;
          updated_at: string;
        };
        Insert: {
          animal_id: string;
          internal_ref?: string;
          microchip?: string;
          intake_date?: string | null;
          origin?: string;
          location?: string;
          birth_date?: string | null;
          health_notes?: string;
          behaviour_notes?: string;
          internal_notes?: string;
          handover_notes?: string;
          updated_at?: string;
        };
        Update: {
          animal_id?: string;
          internal_ref?: string;
          microchip?: string;
          intake_date?: string | null;
          origin?: string;
          location?: string;
          birth_date?: string | null;
          health_notes?: string;
          behaviour_notes?: string;
          internal_notes?: string;
          handover_notes?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "animal_records_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
        ];
      };
      animal_timeline: {
        Row: {
          id: string;
          animal_id: string;
          kind: string;
          details: Json;
          occurred_at: string;
          actor_id: string | null;
        };
        Insert: {
          id?: string;
          animal_id: string;
          kind: string;
          details?: Json;
          occurred_at?: string;
          actor_id?: string | null;
        };
        Update: {
          id?: string;
          animal_id?: string;
          kind?: string;
          details?: Json;
          occurred_at?: string;
          actor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "animal_timeline_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "animal_timeline_actor_id_fkey";
            columns: ["actor_id"];
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
            foreignKeyName: "canil_likes_user_profile_id_fkey";
            columns: ["user_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "canil_likes_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
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
      document_shares: {
        Row: {
          id: string;
          animal_id: string;
          request_id: string;
          recipient_id: string;
          document_ids: string[];
          handover_notes: string;
          expires_at: string;
          revoked_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id: string;
          animal_id: string;
          request_id: string;
          recipient_id: string;
          document_ids: string[];
          handover_notes?: string;
          expires_at: string;
          revoked_at?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          request_id?: string;
          recipient_id?: string;
          document_ids?: string[];
          handover_notes?: string;
          expires_at?: string;
          revoked_at?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_shares_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_shares_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "pedidos_adocao";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_shares_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
          share_id: string | null;
          last_error: string | null;
          task_id: string | null;
          visit_id: string | null;
          cancelled_at: string | null;
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
          share_id?: string | null;
          last_error?: string | null;
          task_id?: string | null;
          visit_id?: string | null;
          cancelled_at?: string | null;
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
          share_id?: string | null;
          last_error?: string | null;
          task_id?: string | null;
          visit_id?: string | null;
          cancelled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "email_outbox_share_id_fkey";
            columns: ["share_id"];
            isOneToOne: false;
            referencedRelation: "document_shares";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_outbox_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "shelter_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_outbox_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "visitas";
            referencedColumns: ["id"];
          },
        ];
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
          first_response_at: string | null;
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
          first_response_at?: string | null;
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
          first_response_at?: string | null;
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
      pilot_requests: {
        Row: {
          id: string;
          organization: string;
          contact_name: string;
          email: string;
          location: string;
          message: string;
          status: string;
          internal_notes: string;
          consent_version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization: string;
          contact_name: string;
          email: string;
          location: string;
          message?: string;
          status?: string;
          internal_notes?: string;
          consent_version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization?: string;
          contact_name?: string;
          email?: string;
          location?: string;
          message?: string;
          status?: string;
          internal_notes?: string;
          consent_version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      privacy_requests: {
        Row: {
          id: string;
          profile_id: string;
          kind: string;
          message: string;
          status: string;
          response: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string;
          kind: string;
          message?: string;
          status?: string;
          response?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          kind?: string;
          message?: string;
          status?: string;
          response?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "privacy_requests_profile_id_fkey";
            columns: ["profile_id"];
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
      request_internal_notes: {
        Row: {
          request_id: string;
          notes: string;
          assignee_id: string | null;
          updated_at: string;
        };
        Insert: {
          request_id: string;
          notes?: string;
          assignee_id?: string | null;
          updated_at?: string;
        };
        Update: {
          request_id?: string;
          notes?: string;
          assignee_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "request_internal_notes_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "pedidos_adocao";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "request_internal_notes_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shelter_handover_settings: {
        Row: {
          canil_id: string;
          items: string[];
          required: boolean;
        };
        Insert: {
          canil_id: string;
          items?: string[];
          required?: boolean;
        };
        Update: {
          canil_id?: string;
          items?: string[];
          required?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "shelter_handover_settings_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
        ];
      };
      shelter_invitations: {
        Row: {
          id: string;
          canil_id: string;
          email: string;
          role: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          canil_id: string;
          email: string;
          role: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          canil_id?: string;
          email?: string;
          role?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shelter_invitations_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
        ];
      };
      shelter_memberships: {
        Row: {
          canil_id: string;
          profile_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          canil_id: string;
          profile_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          canil_id?: string;
          profile_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shelter_memberships_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shelter_memberships_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shelter_preferences: {
        Row: {
          profile_id: string;
          canil_id: string;
        };
        Insert: {
          profile_id: string;
          canil_id: string;
        };
        Update: {
          profile_id?: string;
          canil_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shelter_preferences_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shelter_preferences_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
        ];
      };
      shelter_reply_templates: {
        Row: {
          id: string;
          canil_id: string;
          title: string;
          body: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          canil_id: string;
          title: string;
          body: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          canil_id?: string;
          title?: string;
          body?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shelter_reply_templates_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
        ];
      };
      shelter_tasks: {
        Row: {
          id: string;
          canil_id: string;
          animal_id: string | null;
          request_id: string | null;
          title: string;
          due_at: string;
          assignee_id: string | null;
          completed_at: string | null;
          outcome: string;
          created_at: string;
          followup_day: number | null;
        };
        Insert: {
          id?: string;
          canil_id: string;
          animal_id?: string | null;
          request_id?: string | null;
          title: string;
          due_at: string;
          assignee_id?: string | null;
          completed_at?: string | null;
          outcome?: string;
          created_at?: string;
          followup_day?: number | null;
        };
        Update: {
          id?: string;
          canil_id?: string;
          animal_id?: string | null;
          request_id?: string | null;
          title?: string;
          due_at?: string;
          assignee_id?: string | null;
          completed_at?: string | null;
          outcome?: string;
          created_at?: string;
          followup_day?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shelter_tasks_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "pedidos_adocao";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shelter_tasks_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shelter_tasks_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shelter_tasks_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
        ];
      };
      support_pledges: {
        Row: {
          id: string;
          project_id: string;
          profile_id: string;
          quantity: number;
          contact_name: string;
          contact_email: string;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          profile_id: string;
          quantity: number;
          contact_name: string;
          contact_email: string;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          profile_id?: string;
          quantity?: number;
          contact_name?: string;
          contact_email?: string;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "support_pledges_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "support_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "support_pledges_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      support_projects: {
        Row: {
          id: string;
          canil_id: string;
          animal_id: string | null;
          kind: string;
          title: string;
          description: string;
          goal: number;
          unit: string;
          donation_url: string | null;
          deadline: string | null;
          published: boolean;
          status: string;
          received: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          canil_id: string;
          animal_id?: string | null;
          kind: string;
          title: string;
          description: string;
          goal: number;
          unit: string;
          donation_url?: string | null;
          deadline?: string | null;
          published?: boolean;
          status?: string;
          received?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          canil_id?: string;
          animal_id?: string | null;
          kind?: string;
          title?: string;
          description?: string;
          goal?: number;
          unit?: string;
          donation_url?: string | null;
          deadline?: string | null;
          published?: boolean;
          status?: string;
          received?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "support_projects_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "support_projects_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animais";
            referencedColumns: ["id"];
          },
        ];
      };
      support_receipts: {
        Row: {
          id: string;
          project_id: string;
          pledge_id: string | null;
          quantity: number;
          note: string;
          created_by: string;
          created_at: string;
          voided_at: string | null;
          void_reason: string | null;
        };
        Insert: {
          id: string;
          project_id: string;
          pledge_id?: string | null;
          quantity: number;
          note?: string;
          created_by: string;
          created_at?: string;
          voided_at?: string | null;
          void_reason?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          pledge_id?: string | null;
          quantity?: number;
          note?: string;
          created_by?: string;
          created_at?: string;
          voided_at?: string | null;
          void_reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "support_receipts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "support_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "support_receipts_pledge_id_fkey";
            columns: ["pledge_id"];
            isOneToOne: false;
            referencedRelation: "support_pledges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "support_receipts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      support_updates: {
        Row: {
          id: string;
          project_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "support_updates_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "support_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      terms_acceptances: {
        Row: {
          profile_id: string;
          version: string;
          accepted_at: string;
        };
        Insert: {
          profile_id: string;
          version: string;
          accepted_at?: string;
        };
        Update: {
          profile_id?: string;
          version?: string;
          accepted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "terms_acceptances_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trello_events: {
        Row: {
          event_id: string;
          card_id: string;
          received_at: string;
        };
        Insert: {
          event_id: string;
          card_id: string;
          received_at?: string;
        };
        Update: {
          event_id?: string;
          card_id?: string;
          received_at?: string;
        };
        Relationships: [];
      };
      trello_jobs: {
        Row: {
          card_id: string;
          state: string;
          branch: string | null;
          run_id: string | null;
          owner: string | null;
          claimed_at: string | null;
          attempts: number;
          next_attempt_at: string;
          checkpoint: Json;
          delivery_pending: boolean;
          updated_at: string;
        };
        Insert: {
          card_id: string;
          state?: string;
          branch?: string | null;
          run_id?: string | null;
          owner?: string | null;
          claimed_at?: string | null;
          attempts?: number;
          next_attempt_at?: string;
          checkpoint?: Json;
          delivery_pending?: boolean;
          updated_at?: string;
        };
        Update: {
          card_id?: string;
          state?: string;
          branch?: string | null;
          run_id?: string | null;
          owner?: string | null;
          claimed_at?: string | null;
          attempts?: number;
          next_attempt_at?: string;
          checkpoint?: Json;
          delivery_pending?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      visit_slots: {
        Row: {
          id: string;
          canil_id: string;
          starts_at: string;
          capacity: number;
        };
        Insert: {
          id?: string;
          canil_id: string;
          starts_at: string;
          capacity: number;
        };
        Update: {
          id?: string;
          canil_id?: string;
          starts_at?: string;
          capacity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "visit_slots_canil_id_fkey";
            columns: ["canil_id"];
            isOneToOne: false;
            referencedRelation: "canis";
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
      accept_shelter_invitation: { Args: { p_id: string }; Returns: undefined };
      trello_enqueue: {
        Args: { p_event: string; p_card: string };
        Returns: boolean;
      };
      submit_adoption: {
        Args: { p_animal: string; p_answers: Json; p_message: string };
        Returns: string;
      };
      trello_claim: {
        Args: { p_run: string; p_owner: string };
        Returns: Database["public"]["Tables"]["trello_jobs"]["Row"][];
      };
      trello_save: {
        Args: {
          p_card: string;
          p_run: string;
          p_state: string;
          p_branch: string;
          p_checkpoint: Json;
          p_delivery: boolean;
          p_delay: number;
        };
        Returns: boolean;
      };
      transition_adoption: {
        Args: { p_request: string; p_status: string; p_notes: string };
        Returns: undefined;
      };
      claim_email_jobs: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["email_outbox"]["Row"][];
      };
      retry_document_email: { Args: { p_id: string }; Returns: undefined };
      share_animal_documents: {
        Args: {
          p_id: string;
          p_request: string;
          p_documents: string[];
          p_days: number;
        };
        Returns: string;
      };
      revoke_document_share: { Args: { p_id: string }; Returns: undefined };
      my_shelters: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["canis"]["Row"][];
      };
      submit_pilot_request: {
        Args: {
          p_organization: string;
          p_contact: string;
          p_email: string;
          p_location: string;
          p_message: string;
          p_consent: boolean;
        };
        Returns: undefined;
      };
      manage_animal: {
        Args: { p_animal: string; p_operation: string };
        Returns: undefined;
      };
      withdraw_adoption: { Args: { p_request: string }; Returns: undefined };
      save_animal_details: {
        Args: { p_animal: string; p_data: Json };
        Returns: undefined;
      };
      shelter_delivery_status: { Args: { p_shelter: string }; Returns: Json };
      import_animals: {
        Args: { p_shelter: string; p_rows: Json };
        Returns: number;
      };
      reschedule_visit: {
        Args: { p_visit: string; p_date: string };
        Returns: string;
      };
      shelter_metrics: { Args: { p_shelter: string }; Returns: Json };
      search_shelter_requests: {
        Args: {
          p_shelter: string;
          p_query?: string;
          p_status?: string;
          p_assignee?: string;
          p_min_days?: number;
          p_unanswered?: boolean;
          p_order?: string;
          p_page?: number;
        };
        Returns: Json;
      };
      reply_to_application: {
        Args: { p_request: string; p_message_id: string; p_body: string };
        Returns: undefined;
      };
      pledge_support: {
        Args: {
          p_id: string;
          p_project: string;
          p_quantity: number;
          p_message: string;
        };
        Returns: undefined;
      };
      record_support_receipt: {
        Args: {
          p_id: string;
          p_project: string;
          p_quantity: number;
          p_note: string;
          p_pledge?: string;
        };
        Returns: undefined;
      };
      cancel_support_pledge: { Args: { p_id: string }; Returns: undefined };
      void_support_receipt: {
        Args: { p_id: string; p_reason: string };
        Returns: undefined;
      };
    };
    Enums: { app_role: "admin" | "user" | "canil" };
    CompositeTypes: Record<string, never>;
  };
};
