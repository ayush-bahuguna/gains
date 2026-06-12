export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          nickname: string | null
          weight_kg: number | null
          height_cm: number | null
          unit_pref: string
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          nickname?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          unit_pref?: string
          created_at?: string
        }
        Update: {
          display_name?: string | null
          nickname?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          unit_pref?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          muscle: string | null
          equipment: string | null
          category: string | null
          is_default: boolean
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          muscle?: string | null
          equipment?: string | null
          category?: string | null
          is_default?: boolean
          created_by?: string | null
        }
        Update: {
          name?: string
          muscle?: string | null
          equipment?: string | null
          category?: string | null
          is_default?: boolean
          created_by?: string | null
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ended_at: string | null
          duration_secs: number | null
          notes: string | null
          energy_level: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          started_at?: string
          ended_at?: string | null
          duration_secs?: number | null
          notes?: string | null
          energy_level?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          ended_at?: string | null
          duration_secs?: number | null
          notes?: string | null
          energy_level?: number | null
          is_active?: boolean
        }
      }
      session_exercises: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          order_index: number
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          order_index: number
        }
        Update: {
          order_index?: number
        }
      }
      sets: {
        Row: {
          id: string
          session_exercise_id: string
          set_number: number
          set_type: string
          weight_kg: number | null
          reps: number | null
          completed: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          session_exercise_id: string
          set_number: number
          set_type?: string
          weight_kg?: number | null
          reps?: number | null
          completed?: boolean
          completed_at?: string | null
        }
        Update: {
          set_type?: string
          weight_kg?: number | null
          reps?: number | null
          completed?: boolean
          completed_at?: string | null
        }
      }
      favorite_exercises: {
        Row: {
          user_id: string
          exercise_id: string
        }
        Insert: {
          user_id: string
          exercise_id: string
        }
        Update: Record<string, never>
      }
    }
  }
}
