import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { SupabaseService } from 'src/supabase';

@Injectable()
export class CartService {
  constructor(private readonly supabase: SupabaseService) {}

  async getCart(userId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('carts')
      .select('*, cart_items(*)')
      .eq('user_id', userId)
      .single();

    if (error) throw new NotFoundException('Cart not found!');

    return data;
  }

  async addItem(userId: string, dto: CreateCartItemDto) {
    const { listingId, quantity } = dto;
    const client = this.supabase.getAdminClient();

    // checks if listing exists
    await this.findListingOrThrow(listingId);

    // checks if a cart for user exists, otherwise creates one
    let { data: cart } = await client
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!cart) {
      const { data: newCart, error: cartError } = await client
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();

      if (cartError) {
        throw new InternalServerErrorException('Failed to create cart.');
      }

      cart = newCart;
    }

    // adds item to cart
    const { data: cartItem, error: itemError } = await client
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        listing_id: listingId,
        quantity: quantity,
      })
      .select()
      .single();

    if (itemError)
      throw new InternalServerErrorException('Failed to add item to cart.');

    return cartItem;
  }

  async updateItemQuant(userId: string, listingId: string, dto: UpdateCartDto) {
    const client = this.supabase.getAdminClient();

    await this.findListingOrThrow(listingId);

    const cart = await this.findCartOrThrow(userId);

    const { data: updatedItem, error: updatedError } = await client
      .from('cart_items')
      .update({ quantity: dto.quantity })
      .eq('cart_id', cart.id)
      .eq('listing_id', listingId)
      .select()
      .single();

    if (updatedError) {
      throw new InternalServerErrorException('Failed to update item quantity.');
    }

    return updatedItem;
  }

  async removeItem(userId: string, listingId: string) {
    const client = this.supabase.getAdminClient();

    // checks if listing exists
    await this.findListingOrThrow(listingId);

    // checks if cart exists
    const cart = await this.findCartOrThrow(userId);

    // removes item from cart
    const { error: deleteError } = await client
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .eq('listing_id', listingId);

    if (deleteError)
      throw new InternalServerErrorException(
        'Failed to remove item from cart!',
      );

    return { message: 'Item successfully removed from cart!' };
  }

  private async findCartOrThrow(userId: string) {
    const { data: cart, error: cartError } = await this.supabase
      .getAdminClient()
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (cartError || !cart) {
      throw new NotFoundException('Cart not found!');
    }

    return cart;
  }

  // private helper for finding Listing
  private async findListingOrThrow(listingId: string) {
    const { data: listing, error: listingError } = await this.supabase
      .getAdminClient()
      .from('listings')
      .select('id')
      .eq('id', listingId);

    if (listingError || !listing || listing.length === 0) {
      throw new NotFoundException('Listing not found!');
    }

    return listing[0];
  }
}
