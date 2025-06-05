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

  /// Verificación de la suscripción (GET)
  /// Esta operación es peticionada por el hub para verificar la suscripción.
  /// Debe devolver el valor del parámetro "challenge" que recibe por query param.
  /// El hub lo usará para verificar que el endpoint es correcto.
  @Get()
  @ApiQuery({
    name: 'topic',
    type: String,
    example: 'order.created',
    required: true,
    description: 'El tópico de la suscripción',
  })
  @ApiQuery({
    name: 'challenge',
    type: String,
    example: '123456789',
    required: true,
    description: 'El desafío que debe ser devuelto',
  })
  async handleVerification(
    @Query('topic') topic: string,
    @Query('challenge') challenge: string,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Verificando intención de subscripción: topic=${topic}, challenge=${challenge}.`,
    );
    res.status(200).send(challenge); // MUST echo back the challenge
  }

  /// Recepción de contenido (POST)
  /// Esta operación es peticionada por el hub para recibir contenido.
  /// Debe procesar el contenido y devolver un código 204 (No Content) para indicar que lo recibió correctamente.
  /// Si no se puede procesar el contenido, debe devolver un código 200 (OK) para evitar reintentos.
  /// El contenido se recibe en el cuerpo de la petición.
  /// El hub enviará el contenido en formato JSON.
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
    this.logger.log('Contenido recibido.');

    if (signature) {
      const valid = this.subscriberService.verifySignature(rawBody, signature);
      if (!valid) {
        this.logger.warn('Firma inválida. Ignorando mensaje.');
        return res.status(200).send(); // Still 2xx to prevent retries
      }
    }

    this.logger.log(`Contenido:\n${rawBody}`);
    res.status(204).send(); // Acknowledge content received
  }
}
