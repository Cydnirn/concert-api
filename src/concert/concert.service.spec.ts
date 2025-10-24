import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { Concert } from './concert.entity';
import { CreateConcertDto, UpdateConcertDto } from '../dto/concert.dto';
import { ConfigService } from '@nestjs/config';

describe('ConcertService', () => {
  let service: ConcertService;
  let repository: Repository<Concert>;

  // Mock data
  const mockConcert: Concert = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Summer Music Festival',
    organizer: 'Music Events Inc',
    details: 'Annual outdoor music festival',
    price: 100,
    venue: 'Jakarta International Stadium',
    artist: 'Kessoku Band',
    date: new Date('2024-02-01'),
    image: 'test-image.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockConcerts: Concert[] = [
    mockConcert,
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Winter Jazz Night',
      organizer: 'Jazz Society',
      details: 'Intimate jazz performance',
      price: 100,
      venue: 'Jakarta International Stadium',
      artist: 'Kessoku Band',
      date: new Date('2024-02-01'),
      image: 'jazz-night.jpg',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertService,
        {
          provide: getRepositoryToken(Concert),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ConcertService>(ConcertService);
    repository = module.get<Repository<Concert>>(getRepositoryToken(Concert));
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a concert without image', async () => {
      const createDto: CreateConcertDto = {
        name: 'New Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      const expectedConcert = {
        ...mockConcert,
        ...createDto,
        image: undefined,
      };

      mockRepository.create.mockReturnValue(expectedConcert);
      mockRepository.save.mockResolvedValue(expectedConcert);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        image: undefined,
      });
      expect(repository.save).toHaveBeenCalledWith(expectedConcert);
      expect(result).toEqual(expectedConcert);
    });

    it('should create a concert with image', async () => {
      const createDto: CreateConcertDto = {
        name: 'New Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };
      const imageFilename = 'random-filename.jpg';

      const expectedConcert = {
        ...mockConcert,
        ...createDto,
        image: imageFilename,
      };

      mockRepository.create.mockReturnValue(expectedConcert);
      mockRepository.save.mockResolvedValue(expectedConcert);

      const result = await service.create(createDto, imageFilename);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        image: imageFilename,
      });
      expect(repository.save).toHaveBeenCalledWith(expectedConcert);
      expect(result).toEqual(expectedConcert);
      expect(result.image).toBe(imageFilename);
    });

    it('should handle save errors', async () => {
      const createDto: CreateConcertDto = {
        name: 'New Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockRejectedValue(new Error('Database save failed'));

      await expect(service.create(createDto)).rejects.toThrow(
        'Database save failed',
      );
    });
  });

  describe('find', () => {
    it('should return an array of concerts', async () => {
      mockRepository.find.mockResolvedValue(mockConcerts);

      const result = await service.find();

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockConcerts);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no concerts exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.find();

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle database errors', async () => {
      mockRepository.find.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.find()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findOne', () => {
    it('should return a concert by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      mockRepository.findOneBy.mockResolvedValue(mockConcert);

      const result = await service.findOne(id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockConcert);
    });

    it('should throw NotFoundException when concert is not found', async () => {
      const id = 'non-existent-id';
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `Concert with ID ${id} not found`,
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    });

    it('should handle database errors', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      mockRepository.findOneBy.mockRejectedValue(
        new Error('Database query failed'),
      );

      await expect(service.findOne(id)).rejects.toThrow(
        'Database query failed',
      );
    });
  });

  describe('update', () => {
    it('should update a concert', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateConcertDto = {
        name: 'Updated Concert Name',
        details: 'Updated details',
      };

      const updatedConcert = {
        ...mockConcert,
        ...updateDto,
      };

      mockRepository.preload.mockResolvedValue(updatedConcert);
      mockRepository.save.mockResolvedValue(updatedConcert);

      const result = await service.update(id, updateDto);

      expect(repository.preload).toHaveBeenCalledWith({
        id,
        ...updateDto,
      });
      expect(repository.save).toHaveBeenCalledWith(updatedConcert);
      expect(result).toEqual(updatedConcert);
      expect(result.name).toBe(updateDto.name);
      expect(result.details).toBe(updateDto.details);
    });

    it('should update only specified fields', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateConcertDto = {
        name: 'Only Name Updated',
      };

      const updatedConcert = {
        ...mockConcert,
        name: updateDto.name,
      };

      mockRepository.preload.mockResolvedValue(updatedConcert);
      mockRepository.save.mockResolvedValue(updatedConcert);

      const result = await service.update(id, updateDto);

      expect(repository.preload).toHaveBeenCalledWith({
        id,
        ...updateDto,
      });
      expect(result.name).toBe(updateDto.name);
      expect(result.details).toBe(mockConcert.details);
      expect(result.organizer).toBe(mockConcert.organizer);
    });

    it('should update image field', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateConcertDto = {
        image: 'new-image.jpg',
      };

      const updatedConcert = {
        ...mockConcert,
        image: updateDto.image,
      };

      mockRepository.preload.mockResolvedValue(updatedConcert);
      mockRepository.save.mockResolvedValue(updatedConcert);

      const result = await service.update(id, updateDto);

      expect(result.image).toBe(updateDto.image);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      const id = 'non-existent-id';
      const updateDto: UpdateConcertDto = {
        name: 'Updated Name',
      };

      mockRepository.preload.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(id, updateDto)).rejects.toThrow(
        `Concert with ID ${id} not found`,
      );
      expect(repository.preload).toHaveBeenCalledWith({
        id,
        ...updateDto,
      });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateConcertDto = {
        name: 'Updated Name',
      };

      mockRepository.preload.mockResolvedValue({
        ...mockConcert,
        ...updateDto,
      });
      mockRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(service.update(id, updateDto)).rejects.toThrow(
        'Save failed',
      );
    });
  });

  describe('delete', () => {
    it('should delete a concert', async () => {
      const id = '1';
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.delete(id);

      expect(repository.delete).toHaveBeenCalledWith(id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      const id = '999';
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.delete(id)).rejects.toThrow(NotFoundException);
      await expect(service.delete(id)).rejects.toThrow(
        `Concert with ID ${id} not found`,
      );
      expect(repository.delete).toHaveBeenCalledWith(id);
    });

    it('should handle database errors', async () => {
      const id = '1';
      mockRepository.delete.mockRejectedValue(
        new Error('Delete operation failed'),
      );

      await expect(service.delete(id)).rejects.toThrow(
        'Delete operation failed',
      );
    });

    it('should not throw when affected count is greater than 1', async () => {
      const id = '1';
      // This shouldn't normally happen with proper constraints, but test the case
      mockRepository.delete.mockResolvedValue({ affected: 2, raw: {} });

      await expect(service.delete(id)).resolves.not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('Repository Integration', () => {
    it('should use TypeORM repository methods correctly', async () => {
      const createDto: CreateConcertDto = {
        name: 'Test Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ ...mockConcert, ...createDto });

      await service.create(createDto);

      // Verify repository methods are called
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should pass correct parameters to repository methods', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateConcertDto = {
        name: 'Updated',
        organizer: 'New Organizer',
      };

      mockRepository.preload.mockResolvedValue({
        ...mockConcert,
        ...updateDto,
      });
      mockRepository.save.mockResolvedValue({ ...mockConcert, ...updateDto });

      await service.update(id, updateDto);

      expect(repository.preload).toHaveBeenCalledWith(
        expect.objectContaining({
          id,
          name: updateDto.name,
          organizer: updateDto.organizer,
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty update DTO', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateConcertDto = {};

      mockRepository.preload.mockResolvedValue(mockConcert);
      mockRepository.save.mockResolvedValue(mockConcert);

      await service.update(id, updateDto);
      expect(repository.preload).toHaveBeenCalledWith({ id });
    });

    it('should handle null image filename in create', async () => {
      const createDto: CreateConcertDto = {
        name: 'Test',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockRepository.create.mockReturnValue({ ...createDto, image: null });
      mockRepository.save.mockResolvedValue({ ...mockConcert, image: null });

      const result = await service.create(createDto, null as any);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        image: null,
      });
    });

    it('should handle very long concert names', async () => {
      const longName = 'A'.repeat(1000);
      const createDto: CreateConcertDto = {
        name: longName,
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ ...mockConcert, ...createDto });

      const result = await service.create(createDto);

      expect(result.name).toBe(longName);
    });

    it('should handle special characters in fields', async () => {
      const createDto: CreateConcertDto = {
        name: 'Rock & Roll <> Festival\'s "Best"',
        organizer: 'Test & Co.',
        details: 'Special chars: @#$%^&*()',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ ...mockConcert, ...createDto });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(result.organizer).toBe(createDto.organizer);
      expect(result.details).toBe(createDto.details);
    });
  });
});
