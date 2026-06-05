import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { SupabaseService } from 'src/supabase';

describe('CartService', () => {
  let service: CartService;
  const supabaseService = {
    getClient: jest.fn(),
    getAdminClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: SupabaseService,
          useValue: supabaseService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
