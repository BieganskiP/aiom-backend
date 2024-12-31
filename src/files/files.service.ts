import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, FileType } from './entities/file.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  private async ensureUploadDir(type: FileType) {
    const uploadDir = path.join(process.cwd(), 'uploads', type);
    await fs.mkdir(uploadDir, { recursive: true });
    return uploadDir;
  }

  async saveFile(
    file: Express.Multer.File,
    userId: string,
    type: FileType,
  ): Promise<File> {
    const uploadDir = await this.ensureUploadDir(type);

    let finalPath: string;
    let fileSize: number;

    if (type === FileType.IMAGE) {
      // Process image with sharp
      const processedFileName = `processed_${Date.now()}_${file.originalname}`;
      finalPath = path.join(uploadDir, processedFileName);

      await sharp(file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(finalPath);

      const stats = await fs.stat(finalPath);
      fileSize = stats.size;
    } else {
      // Handle PDFs and other files
      const fileName = `${Date.now()}_${file.originalname}`;
      finalPath = path.join(uploadDir, fileName);
      await fs.writeFile(finalPath, file.buffer);
      fileSize = file.size;
    }

    const fileEntity = this.filesRepository.create({
      originalName: file.originalname,
      filename: path.basename(finalPath),
      path: finalPath,
      mimeType: file.mimetype,
      size: fileSize,
      type,
      uploadedBy: userId,
    });

    return this.filesRepository.save(fileEntity);
  }

  async findAll(): Promise<File[]> {
    return this.filesRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<File> {
    const file = await this.filesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async remove(id: string, userId: string): Promise<void> {
    const file = await this.findOne(id);

    try {
      await fs.unlink(file.path);
    } catch (error) {
      // Log error but don't fail if file doesn't exist
      console.error('Error deleting file:', error);
    }

    await this.filesRepository.remove(file);
  }

  async getFileStream(id: string): Promise<{ file: File; stream: Buffer }> {
    const file = await this.findOne(id);

    try {
      const buffer = await fs.readFile(file.path);
      return { file, stream: buffer };
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }
}
