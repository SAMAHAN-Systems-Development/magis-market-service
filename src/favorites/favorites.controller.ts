import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('api/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  private getUserIdFromHeaders(headers: Record<string, string | string[] | undefined>): string {
    const raw = headers['x-user-id'] ?? headers['X-User-Id'];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) {
      throw new UnauthorizedException('Missing x-user-id header');
    }
    return value;
  }

  @Get()
  async listFavorites(@Headers() headers: Record<string, string | string[] | undefined>) {
    const userId = this.getUserIdFromHeaders(headers);
    return this.favoritesService.getUserFavorites(userId);
  }

  @Post(':productId')
  async addFavorite(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    const userId = this.getUserIdFromHeaders(headers);
    await this.favoritesService.addFavorite(userId, productId);
    return { success: true };
  }

  @Delete(':productId')
  async removeFavorite(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    const userId = this.getUserIdFromHeaders(headers);
    await this.favoritesService.removeFavorite(userId, productId);
    return { success: true };
  }
}

