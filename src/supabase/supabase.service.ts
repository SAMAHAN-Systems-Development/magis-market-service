import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);

  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const anonKey = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.client = createClient(url, anonKey);

    this.adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    this.logger.log('Supabase clients initialized');
  }

  /** Public client — respects RLS using the anon key. */
  getClient(): SupabaseClient {
    return this.client;
  }

  /** Admin client — bypasses RLS using the service role key. */
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}
