// src/subscriber/subscriber.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name);
  private readonly secret: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get<string>('SUBSCRIBER_SECRET') || '';
  }

  verifySignature(payload: string, signature: string): boolean {
    if (this.secret === '') return true;

    try {
      const [method, hash] = signature.split('=');
      const hmac = crypto.createHmac(method, this.secret);
      hmac.update(payload || '');
      const expected = hmac.digest('hex');
      return expected === hash;
    } catch (error) {
      this.logger.error(`Error al verificar la firma: ${error.message}.`);
      return false;
    }
  }
}
