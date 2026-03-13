import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase';

export type ProductDto = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  createdAt: string;
  updatedAt: string;
  imagePaths: string[];
};

@Injectable()
export class ProductsService {
  constructor(private readonly supabase: SupabaseService) {}

  toProductDto(row: any): ProductDto {
    const images = Array.isArray(row?.listing_images) ? row.listing_images : [];
    return {
      id: row.id,
      name: row.title,
      price: Number(row.price),
      description: row.description ?? '',
      category: row.category,
      condition: row.condition,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      imagePaths: images
        .map((img: any) => img?.storage_path)
        .filter((p: unknown): p is string => typeof p === 'string'),
    };
  }

  async listProducts(): Promise<ProductDto[]> {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('listings')
      .select(
        `
        id,
        title,
        description,
        price,
        category,
        condition,
        created_at,
        updated_at,
        listing_images (storage_path)
      `,
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((row) => this.toProductDto(row));
  }

  async getProductById(productId: string): Promise<ProductDto | null> {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('listings')
      .select(
        `
        id,
        title,
        description,
        price,
        category,
        condition,
        created_at,
        updated_at,
        listing_images (storage_path)
      `,
      )
      .eq('id', productId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data ? this.toProductDto(data) : null;
  }
}

