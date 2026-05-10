import { Injectable } from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async validateToken(token: string): Promise<User | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }
}
