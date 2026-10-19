import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const anonKey = this.config.get<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && anonKey) {
      try {
        this.client = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false },
        });
        this.logger.log(`Supabase client initialized for project: ${supabaseUrl}`);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Supabase client: ${err?.message}`);
      }
    } else {
      this.logger.log(
        'SUPABASE_URL / SUPABASE_ANON_KEY not set in .env. Supabase client is idle (using direct PostgreSQL connection).',
      );
    }

    if (supabaseUrl && serviceRoleKey) {
      try {
        this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        this.logger.log('Supabase Admin client (Service Role) initialized.');
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Supabase admin client: ${err?.message}`);
      }
    }
  }

  /**
   * Returns whether Supabase client SDK is configured.
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Returns public Supabase client (Anon Key).
   */
  getClient(): SupabaseClient | null {
    return this.client;
  }

  /**
   * Returns privileged Supabase client (Service Role Key).
   */
  getAdminClient(): SupabaseClient | null {
    return this.adminClient;
  }
}
