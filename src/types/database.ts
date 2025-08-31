export interface Database {
  public: {
    Tables: {
      sms_settings: {
        Row: {
          id: string;
          api_key: string;
          sender_name: string;
          is_active: boolean;
          last_balance_check: string | null;
          last_balance_amount: number | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          api_key: string;
          sender_name: string;
          is_active?: boolean;
          last_balance_check?: string | null;
          last_balance_amount?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          api_key?: string;
          sender_name?: string;
          is_active?: boolean;
          last_balance_check?: string | null;
          last_balance_amount?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      message_templates: {
        Row: {
          id: string;
          name: string;
          content: string;
          category: string;
          variables: string[];
          is_active: boolean;
          usage_count: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          content: string;
          category?: string;
          variables?: string[];
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          content?: string;
          category?: string;
          variables?: string[];
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
    };
    Functions: {
      increment_template_usage: {
        Args: {
          template_id: string;
        };
        Returns: void;
      };
    };
  };
}