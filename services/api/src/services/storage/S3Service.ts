import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { config } from '../../config';
import logger from '../../utils/logger';

const s3Config = {
  region: process.env.S3_REGION || 'me-central-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
};

const BUCKET = process.env.S3_BUCKET || 'mufasal-uploads';
const CDN_URL = process.env.S3_CDN_URL || '';

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client(s3Config);
  }
  return client;
}

export class S3Service {
  static async upload(buffer: Buffer, folder: string = 'general'): Promise<string> {
    const key = `${folder}/${Date.now()}-${nanoid(16)}`;
    try {
      const s3 = getClient();
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
        },
      });
      await upload.done();
      return CDN_URL ? `${CDN_URL}/${key}` : key;
    } catch (error) {
      logger.error('S3 upload failed', error);
      throw error;
    }
  }

  static async uploadImage(buffer: Buffer, folder: string = 'images'): Promise<string> {
    const resized = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
    return S3Service.upload(resized, folder);
  }

  static async uploadThumbnail(buffer: Buffer, folder: string = 'thumbnails'): Promise<string> {
    const thumbnail = await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 60 })
      .toBuffer();
    return S3Service.upload(thumbnail, folder);
  }

  static async delete(key: string): Promise<void> {
    try {
      const s3 = getClient();
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch (error) {
      logger.error('S3 delete failed', error);
    }
  }

  static async list(prefix: string): Promise<string[]> {
    try {
      const s3 = getClient();
      const result = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }));
      return (result.Contents || []).map(obj => obj.Key || '');
    } catch (error) {
      logger.error('S3 list failed', error);
      return [];
    }
  }
}

export const s3Service = new S3Service();
