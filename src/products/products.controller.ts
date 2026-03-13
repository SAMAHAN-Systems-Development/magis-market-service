import { Controller, Get, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async listProducts() {
    return this.productsService.listProducts();
  }

  @Get(':productId')
  async getProductById(@Param('productId', new ParseUUIDPipe()) productId: string) {
    const product = await this.productsService.getProductById(productId);
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    return product;
  }
}

