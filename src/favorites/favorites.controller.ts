import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  CurrentAccessToken,
  CurrentUser,
} from 'src/auth/decorators/current-user.decorator';

@Controller('api/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @UseGuards(AuthGuard)
  async listFavorites(
    @CurrentUser('id') userId: string,
    @CurrentAccessToken() accessToken: string,
  ) {
    return this.favoritesService.getUserFavorites(userId, accessToken);
  }

  @Post(':productId')
  @UseGuards(AuthGuard)
  async addFavorite(
    @CurrentUser('id') userId: string,
    @CurrentAccessToken() accessToken: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    await this.favoritesService.addFavorite(userId, accessToken, productId);
    return { success: true };
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  async removeFavorite(
    @CurrentUser('id') userId: string,
    @CurrentAccessToken() accessToken: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    await this.favoritesService.removeFavorite(userId, accessToken, productId);
    return { success: true };
  }
}
