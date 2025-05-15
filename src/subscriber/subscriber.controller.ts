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
import { ApiHeader, ApiQuery } from '@nestjs/swagger';

@Controller('callback')
export class SubscriberController {
  private readonly logger = new Logger(SubscriberController.name);

  constructor(private readonly subscriberService: SubscriberService) {}

  // Validación del hub (GET con hub.challenge)
  @Get()
  @ApiQuery({
    name: 'hub.mode',
    type: String,
    example: 'subscribe',
    required: false,
    description: 'The mode of the subscription',
  })
  @ApiQuery({
    name: 'hub.topic',
    type: String,
    example: 'order.created',
    required: false,
    description: 'The topic of the subscription',
  })
  @ApiQuery({
    name: 'hub.challenge',
    type: String,
    example: '123456789',
    required: true,
    description: 'The challenge to be echoed back',
  })
  @ApiQuery({
    name: 'hub.lease_days',
    type: String,
    example: '365',
    required: false,
    description: 'The lease duration in days',
  })
  async handleVerification(
    @Query('hub.mode') mode: string,
    @Query('hub.topic') topic: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.lease_days') lease: string,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Verifying intent: mode=${mode}, topic=${topic}, lease=${lease}`,
    );
    res.status(200).send(challenge); // MUST echo back the challenge
  }

  // Recepción de contenido (POST)
  @Post()
  @ApiHeader({
    name: 'x-hub-signature',
    required: false,
    description:
      'HMAC signature for verifying the request. Use: https://emn178.github.io/online-tools/sha256.html Example: sha256=3c81cc9496e1c25250f6ccb85f697c1bb623e3480d6538ad8cb6a6648142777d',
    example:
      'sha256=3c81cc9496e1c25250f6ccb85f697c1bb623e3480d6538ad8cb6a6648142777d',
  })
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
