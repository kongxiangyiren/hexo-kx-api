import { Test, TestingModule } from '@nestjs/testing';
import { DjtController } from './djt.controller';

describe('DjtController', () => {
  let controller: DjtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DjtController]
    }).compile();

    controller = module.get<DjtController>(DjtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
