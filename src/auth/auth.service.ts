import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async validateToken(token: string) {
    return await this.supabaseClient.auth.getUser(token);
  }
}
