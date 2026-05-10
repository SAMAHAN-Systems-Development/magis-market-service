import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { SupabaseService } from 'src/supabase';
import { AuthGuard } from 'src/auth/guards/auth.guard';

describe('CartController', () => {
  let controller: CartController;
  const supabaseService = {
    getClient: jest.fn(),
    getAdminClient: jest.fn(),
  };
  const authGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        CartService,
        {
          provide: SupabaseService,
          useValue: supabaseService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuard)
      .compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
