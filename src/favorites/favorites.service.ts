import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase';
import { ProductsService, ProductDto } from '../products/products.service';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly productsService: ProductsService,
  ) {}

  async getUserFavorites(
    userId: string,
    accessToken: string,
  ): Promise<ProductDto[]> {
    const client = this.supabase.getUserClient(accessToken);

    const { data, error } = await client
      .from('favorites')
      .select(
        `
        listing:listings!favorites_listing_id_fkey (
          id,
          title,
          description,
          price,
          category,
          condition,
          created_at,
          updated_at,
          listing_images (storage_path)
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const rows = data ?? [];
    return rows
      .map((row: any) => row.listing)
      .filter((listing: any) => !!listing)
      .map((listing: any) => this.productsService.toProductDto(listing));
  }

  async addFavorite(
    userId: string,
    accessToken: string,
    productId: string,
  ): Promise<void> {
    // Ensure the product exists first; throw 404 if not.
    const product = await this.productsService.getProductById(productId);
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const client = this.supabase.getUserClient(accessToken);

    const { error } = await client
      .from('favorites')
      .insert({ user_id: userId, listing_id: productId });

    if (error) {
      // Unique constraint -> favorite already exists; we treat as idempotent success.
      if (
        typeof error.message === 'string' &&
        error.message.toLowerCase().includes('duplicate key value')
      ) {
        return;
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  async removeFavorite(
    userId: string,
    accessToken: string,
    productId: string,
  ): Promise<void> {
    const client = this.supabase.getUserClient(accessToken);

    const { data, error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', productId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Favorite not found');
    }
  }
}

