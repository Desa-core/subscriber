// src/subscriber/subscriber.controller.ts

import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Body,
  Headers,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SubscriberService } from './subscriber.service';

@Controller('callback')
export class SubscriberController {
  private readonly logger = new Logger(SubscriberController.name);

  constructor(private readonly subscriberService: SubscriberService) {}

  // Validación del hub (GET con hub.challenge)
  @Get()
  async handleVerification(
    @Query('hub.mode') mode: string,
    @Query('hub.topic') topic: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.lease_seconds') lease: string,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Verifying intent: mode=${mode}, topic=${topic}, lease=${lease}`,
    );
    res.status(200).send(challenge); // MUST echo back the challenge
  }

  // Recepción de contenido (POST)
  @Post()
  async receiveContent(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-hub-signature') signature: string,
    @Body() body: any,
  ) {
    const rawBody = JSON.stringify(body);
    this.logger.log('Received content update.');

    if (signature) {
      const valid = this.subscriberService.verifySignature(rawBody, signature);
      if (!valid) {
        this.logger.warn('Invalid signature. Ignoring message.');
        return res.status(200).send(); // Still 2xx to prevent retries
      }
    }

    this.logger.log(`Content:\n${rawBody}`);
    res.status(204).send(); // Acknowledge content received
  }
}
