import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartDto {
  @IsInt()
  @IsPositive()
  quantity: number;
}
