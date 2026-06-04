import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase';
@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async validateToken(token: string) {
    const supabase = this.supabaseService.getClient();
    return await supabase.auth.getUser(token);
  }
}
