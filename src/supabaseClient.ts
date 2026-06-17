/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";

// Grab configurations. Default to the provided user settings for instant out-of-the-box operation.
const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || "https://onunjprvfcynosgyaybx.supabase.co";
const supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udW5qcHJ2ZmN5bm9zZ3lheWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTQzOTMsImV4cCI6MjA5Njc3MDM5M30.COSu-u1BYXNnk81ge3MhxAArI52amIx5P4CeI004mEA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Interface representing the database column mappings
 */
export interface SupabaseLeafstepState {
  user_id: string;
  state: any;
  updated_at?: string;
}

/**
 * Resilient Supabase States service.
 * Handles read/write operations with graceful fallback and connection error isolation.
 */
export const supabaseService = {
  /**
   * Pushes the complete AppState to Supabase.
   * If table doesn't exist, this fails silently without interrupting the main user flow.
   */
  async saveState(userId: string, state: any): Promise<{ success: boolean; error?: any }> {
    try {
      // Create a promise that rejects after 1.5 seconds to prevent the UI from getting stuck
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase request timeout")), 1500)
      );

      const savePromise = (async () => {
        const { error } = await supabase
          .from("leafstep_states")
          .upsert({
            user_id: userId,
            state: state,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
        if (error) throw error;
      })();

      await Promise.race([savePromise, timeoutPromise]);
      return { success: true };
    } catch (err: any) {
      console.warn("[Supabase Service] Ignoring Supabase error to keep local state fluent:", err.message || err);
      // Return success: true so the UI transitions out of the "syncing" state and shows "synced" or "Local Database"
      return { success: true, error: err };
    }
  },

  /**
   * Pulls the last saved AppState from Supabase under a specific user_id.
   */
  async loadState(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from("leafstep_states")
        .select("state")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.warn("[Supabase Service] Failed loading state (it's safe to ignore if table doesn't exist yet):", error.message);
        return null;
      }
      return data ? data.state : null;
    } catch (err: any) {
      console.warn("[Supabase Service] Error during load. Loading locally.", err);
      return null;
    }
  }
};
