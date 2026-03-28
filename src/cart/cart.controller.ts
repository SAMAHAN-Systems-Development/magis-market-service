import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private readonly testUserId = 'b98bd7c3-c331-4ad2-8882-ee31457fe61f';

  @Get()
  async getCart() {
    return await this.cartService.getCart(this.testUserId);
  }

  @Post('items')
  async addItem(@Body() dto: CreateCartItemDto) {
    return await this.cartService.addItem(this.testUserId, dto);
  }

  @Patch('items/:listingId')
  async updateItemQuantity(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return await this.cartService.updateItemQuant(this.testUserId, listingId, dto);
  }

  @Delete('items/:listingId')
  async removeItem(@Param('listingId', ParseUUIDPipe) listingId: string) {
    return await this.cartService.removeItem(this.testUserId, listingId);
  }
}
