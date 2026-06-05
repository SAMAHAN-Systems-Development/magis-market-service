import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // private readonly testUserId = 'b98bd7c3-c331-34ad2-8882-ee31457fe61f';

  @Get()
  @UseGuards(AuthGuard)
  async getCart(@CurrentUser('id') userId: string) {
    return await this.cartService.getCart(userId);
  }

  @Post('items')
  @UseGuards(AuthGuard)
  async addItem(@Body() dto: CreateCartItemDto, @CurrentUser('id') userId: string) {
    return await this.cartService.addItem(userId, dto);
  }

  @Patch('items/:listingId')
  @UseGuards(AuthGuard)
  async updateItemQuantity(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @Body() dto: UpdateCartDto,
    @CurrentUser('id') userId: string
  ) {
    return await this.cartService.updateItemQuant(userId, listingId, dto);
  }

  
  @Delete('items/:listingId')
  @UseGuards(AuthGuard)
  async removeItem(@Param('listingId', ParseUUIDPipe) listingId: string, @CurrentUser('id') userId: string) {
    return await this.cartService.removeItem(userId, listingId);
  }
}
