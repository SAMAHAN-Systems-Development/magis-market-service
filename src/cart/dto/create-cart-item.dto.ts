import { IsInt, IsUUID, IsPositive } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  listingId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}
