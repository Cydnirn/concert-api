// Mock modules before imports
jest.mock('fs');
jest.mock('path');
jest.mock('typeorm', () => ({
  Entity: () => jest.fn(),
  Column: () => jest.fn(),
  PrimaryGeneratedColumn: () => jest.fn(),
  CreateDateColumn: () => jest.fn(),
  UpdateDateColumn: () => jest.fn(),
  Repository: jest.fn(),
}));
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => jest.fn(),
  TypeOrmModule: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConcertController } from './concert.controller';
import { ConcertService } from './concert.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Concert } from './concert.entity';
import { CreateConcertDto, UpdateConcertDto } from '../dto/concert.dto';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to create mock write stream
function createMockWriteStream() {
  const mockWriteStream: any = {
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn((event: string, handler: () => void) => {
      if (event === 'finish') {
        setTimeout(handler, 0);
      }
      return mockWriteStream;
    }),
    once: jest.fn(),
    emit: jest.fn(),
  };
  return mockWriteStream;
}

describe('ConcertController', () => {
  let controller: ConcertController;
  let service: ConcertService;
  let configService: ConfigService;

  // Mock data
  const mockConcert: Concert = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Summer Music Festival',
    organizer: 'Music Events Inc',
    details: 'Annual outdoor music festival',
    image: 'test-image.jpg',
    price: 1,
    venue: 'Test Venue',
    artist: 'Test artist',
    date: new Date('2024-02-01'),
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
      image: 'jazz-night.jpg',
      price: 1,
      venue: 'Test Venue',
      artist: 'Test artist',
      date: new Date('2024-02-01'),
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockConcertService = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    saveImage: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertController],
      providers: [
        {
          provide: ConcertService,
          useValue: mockConcertService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ConcertController>(ConcertController);
    service = module.get<ConcertService>(ConcertService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConcert', () => {
    it('should return an array of concerts', async () => {
      mockConcertService.find.mockResolvedValue(mockConcerts);

      const result = await controller.getConcert();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(2);
      expect(service.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no concerts exist', async () => {
      mockConcertService.find.mockResolvedValue([]);

      const result = await controller.getConcert();

      expect(result.data).toEqual([]);
      expect(service.find).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when service fails', async () => {
      const errorMessage = 'Database connection failed';
      mockConcertService.find.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getConcert()).rejects.toThrow(HttpException);
      await expect(controller.getConcert()).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            status: HttpStatus.BAD_REQUEST,
            error: errorMessage,
          }),
        }),
      );
    });
  });

  describe('getConcertById', () => {
    it('should return a single concert by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      mockConcertService.findOne.mockResolvedValue(mockConcert);

      const result = await controller.getConcertById(id);

      expect(result).toBeDefined();
      expect(result.data.id).toBe(mockConcert.id);
      expect(result.data.name).toBe(mockConcert.name);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when concert not found', async () => {
      const id = 'non-existent-id';
      const errorMessage = `Concert with ID ${id} not found`;
      mockConcertService.findOne.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getConcertById(id)).rejects.toThrow(
        HttpException,
      );
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('postConcert', () => {
    beforeEach(() => {
      // Mock fs.existsSync and fs.mkdirSync
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      (path.extname as jest.Mock).mockReturnValue('.jpg');
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
      mockConfigService.get.mockReturnValue('uploads');
    });

    it('should create a concert with image upload', async () => {
      const createDto: CreateConcertDto = {
        name: 'New Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockConcertService.create.mockResolvedValue({
        ...mockConcert,
        ...createDto,
        image: 'random-filename.jpg',
      });

      mockConcertService.saveImage.mockResolvedValue('random-filename.jpg');

      // Create mock multipart request
      const mockFileStream = new Readable({
        read() {},
      });
      mockFileStream.push('fake-image-data');
      mockFileStream.push(null);

      (fs.createWriteStream as jest.Mock).mockReturnValue(
        createMockWriteStream(),
      );

      const mockRequest = {
        isMultipart: jest.fn().mockReturnValue(true),
        parts: jest.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield {
              type: 'field',
              fieldname: 'name',
              value: createDto.name,
            };
            yield {
              type: 'field',
              fieldname: 'organizer',
              value: createDto.organizer,
            };
            yield {
              type: 'field',
              fieldname: 'details',
              value: createDto.details,
            };
            yield {
              type: 'file',
              fieldname: 'image',
              filename: 'test.jpg',
              mimetype: 'image/jpeg',
              file: mockFileStream,
            };
          },
        }),
      } as any;

      const result = await controller.postConcert(mockRequest);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalled();
      expect(mockRequest.isMultipart).toHaveBeenCalled();
    });

    it('should create a concert without image upload', async () => {
      const createDto: CreateConcertDto = {
        name: 'New Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockConcertService.create.mockResolvedValue({
        ...mockConcert,
        ...createDto,
        image: undefined,
      });

      mockConcertService.saveImage.mockResolvedValue('');

      (fs.createWriteStream as jest.Mock).mockReturnValue(
        createMockWriteStream(),
      );

      const mockRequest = {
        isMultipart: jest.fn().mockReturnValue(true),
        parts: jest.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield {
              type: 'field',
              fieldname: 'name',
              value: createDto.name,
            };
            yield {
              type: 'field',
              fieldname: 'organizer',
              value: createDto.organizer,
            };
            yield {
              type: 'field',
              fieldname: 'details',
              value: createDto.details,
            };
          },
        }),
      } as any;

      const result = await controller.postConcert(mockRequest);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createDto.name,
          organizer: createDto.organizer,
          details: createDto.details,
        }),
        undefined,
      );
    });

    it('should throw error when request is not multipart', async () => {
      const mockRequest = {
        isMultipart: jest.fn().mockReturnValue(false),
      } as any;

      await expect(controller.postConcert(mockRequest)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.postConcert(mockRequest)).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            error: 'Request must be multipart/form-data',
          }),
        }),
      );
    });

    it('should throw error when file type is not allowed', async () => {
      mockConcertService.saveImage.mockRejectedValue(
        new Error('File is not an image'),
      );

      const mockFileStream = new Readable({
        read() {},
      });
      mockFileStream.push('fake-pdf-data');
      mockFileStream.push(null);

      const mockRequest = {
        isMultipart: jest.fn().mockReturnValue(true),
        parts: jest.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield {
              type: 'field',
              fieldname: 'name',
              value: 'Test Concert',
            };
            yield {
              type: 'field',
              fieldname: 'organizer',
              value: 'Test Organizer',
            };
            yield {
              type: 'field',
              fieldname: 'details',
              value: 'Test details',
            };
            yield {
              type: 'file',
              fieldname: 'image',
              filename: 'test.pdf',
              mimetype: 'application/pdf',
              file: mockFileStream,
            };
          },
        }),
      } as any;

      await expect(controller.postConcert(mockRequest)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.postConcert(mockRequest)).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            error: 'File is not an image',
          }),
        }),
      );
    });

    it('should create uploads directory if it does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      mockConcertService.saveImage.mockResolvedValue('random-filename.jpg');

      const createDto: CreateConcertDto = {
        name: 'New Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockConcertService.create.mockResolvedValue({
        ...mockConcert,
        ...createDto,
      });

      const mockFileStream = new Readable({
        read() {},
      });
      mockFileStream.push('fake-image-data');
      mockFileStream.push(null);

      (fs.createWriteStream as jest.Mock).mockReturnValue(
        createMockWriteStream(),
      );

      const mockRequest = {
        isMultipart: jest.fn().mockReturnValue(true),
        parts: jest.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield {
              type: 'field',
              fieldname: 'name',
              value: createDto.name,
            };
            yield {
              type: 'field',
              fieldname: 'organizer',
              value: createDto.organizer,
            };
            yield {
              type: 'field',
              fieldname: 'details',
              value: createDto.details,
            };
            yield {
              type: 'file',
              fieldname: 'image',
              filename: 'test.jpg',
              mimetype: 'image/jpeg',
              file: mockFileStream,
            };
          },
        }),
      } as any;

      await controller.postConcert(mockRequest);

      // Verify that saveImage was called (service handles directory creation)
      expect(mockConcertService.saveImage).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'test.jpg',
          mimetype: 'image/jpeg',
        }),
      );
    });
  });

  describe('putConcert', () => {
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

      mockConcertService.update.mockResolvedValue(updatedConcert);

      const result = await controller.putConcert(id, updateDto);

      expect(result).toBeDefined();
      expect(result.data.name).toBe(updateDto.name);
      expect(result.data.details).toBe(updateDto.details);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when concert not found', async () => {
      const id = 'non-existent-id';
      const updateDto: UpdateConcertDto = {
        name: 'Updated Name',
      };
      const errorMessage = `Concert with ID ${id} not found`;

      mockConcertService.update.mockRejectedValue(new Error(errorMessage));

      await expect(controller.putConcert(id, updateDto)).rejects.toThrow(
        HttpException,
      );
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('should allow partial updates', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateConcertDto = {
        name: 'Only Name Updated',
      };

      const updatedConcert = {
        ...mockConcert,
        name: updateDto.name,
      };

      mockConcertService.update.mockResolvedValue(updatedConcert);

      const result = await controller.putConcert(id, updateDto);

      expect(result.data.name).toBe(updateDto.name);
      expect(result.data.details).toBe(mockConcert.details);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('deleteConcert', () => {
    it('should delete a concert', async () => {
      const id = '1';
      mockConcertService.delete.mockResolvedValue(undefined);

      await controller.deleteConcert(id);

      expect(service.delete).toHaveBeenCalledWith(id);
      expect(service.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when concert not found', async () => {
      const id = '999';
      const errorMessage = `Concert with ID ${id} not found`;
      mockConcertService.delete.mockRejectedValue(new Error(errorMessage));

      await expect(controller.deleteConcert(id)).rejects.toThrow(HttpException);
      expect(service.delete).toHaveBeenCalledWith(id);
    });

    it('should not return anything on successful deletion', async () => {
      const id = '1';
      mockConcertService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteConcert(id);

      expect(result.data).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should wrap service errors in HttpException with BAD_REQUEST status', async () => {
      const errorMessage = 'Service error';
      mockConcertService.find.mockRejectedValue(new Error(errorMessage));

      try {
        await controller.getConcert();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: errorMessage,
        });
      }
    });
  });

  describe('ConfigService Integration', () => {
    it('should use FILE_DIRECTORY from config service', async () => {
      const customPath = 'custom/upload/path';
      mockConfigService.get.mockReturnValue(customPath);

      mockConcertService.saveImage.mockResolvedValue('random-filename.jpg');

      const createDto: CreateConcertDto = {
        name: 'New Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockConcertService.create.mockResolvedValue({
        ...mockConcert,
        ...createDto,
      });

      const mockFileStream = new Readable({
        read() {},
      });
      mockFileStream.push('fake-image-data');
      mockFileStream.push(null);

      (fs.createWriteStream as jest.Mock).mockReturnValue(
        createMockWriteStream(),
      );

      const mockRequest = {
        isMultipart: jest.fn().mockReturnValue(true),
        parts: jest.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield {
              type: 'field',
              fieldname: 'name',
              value: createDto.name,
            };
            yield {
              type: 'field',
              fieldname: 'organizer',
              value: createDto.organizer,
            };
            yield {
              type: 'field',
              fieldname: 'details',
              value: createDto.details,
            };
            yield {
              type: 'file',
              fieldname: 'image',
              filename: 'test.jpg',
              mimetype: 'image/jpeg',
              file: mockFileStream,
            };
          },
        }),
      } as any;

      await controller.postConcert(mockRequest);

      // Verify that saveImage was called (service handles config)
      expect(mockConcertService.saveImage).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'test.jpg',
          mimetype: 'image/jpeg',
        }),
      );
    });

    it('should use default uploads directory when FILE_DIRECTORY is not set', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      mockConcertService.saveImage.mockResolvedValue('random-filename.jpg');

      const createDto: CreateConcertDto = {
        name: 'New Concert',
        organizer: 'Test Organizer',
        details: 'Test details',
        price: 1,
        venue: 'Test Venue',
        artist: 'Test artist',
        date: new Date('2024-02-01'),
      };

      mockConcertService.create.mockResolvedValue({
        ...mockConcert,
        ...createDto,
      });

      const mockFileStream = new Readable({
        read() {},
      });
      mockFileStream.push('fake-image-data');
      mockFileStream.push(null);

      (fs.createWriteStream as jest.Mock).mockReturnValue(
        createMockWriteStream(),
      );

      const mockRequest = {
        isMultipart: jest.fn().mockReturnValue(true),
        parts: jest.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield {
              type: 'field',
              fieldname: 'name',
              value: createDto.name,
            };
            yield {
              type: 'field',
              fieldname: 'organizer',
              value: createDto.organizer,
            };
            yield {
              type: 'field',
              fieldname: 'details',
              value: createDto.details,
            };
            yield {
              type: 'file',
              fieldname: 'image',
              filename: 'test.jpg',
              mimetype: 'image/jpeg',
              file: mockFileStream,
            };
          },
        }),
      } as any;

      await controller.postConcert(mockRequest);

      // Verify that saveImage was called (service handles default directory)
      expect(mockConcertService.saveImage).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'test.jpg',
          mimetype: 'image/jpeg',
        }),
      );
    });
  });
});
