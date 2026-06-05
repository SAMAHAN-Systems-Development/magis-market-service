import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);

  private url!: string;
  private anonKey!: string;
  private client!: SupabaseClient;
  private adminClient!: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.url = this.configService.getOrThrow<string>('SUPABASE_URL');
    this.anonKey = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.client = createClient(this.url, this.anonKey);

    this.adminClient = createClient(this.url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    this.logger.log('Supabase clients initialized');
  }

  /** Public client — respects RLS using the anon key. */
  getClient(): SupabaseClient {
    return this.client;
  }

  /** User client — respects RLS as the authenticated request user. */
  getUserClient(accessToken: string): SupabaseClient {
    return createClient(this.url, this.anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  /** Admin client — bypasses RLS using the service role key. */
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}
