// src/subscriber/subscriber.service.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name);

  private readonly callbackUrl = 'http://localhost:5000/callback';
  private readonly topicUrl = 'http://localhost:3000/feed';
  private readonly hubUrl = 'http://localhost:4000/hub';
  private readonly secret = 's3cr3t_subscriber_key'; // Opcional

  async subscribe() {
    const body = new URLSearchParams({
      'hub.callback': this.callbackUrl,
      'hub.mode': 'subscribe',
      'hub.topic': this.topicUrl,
      'hub.secret': this.secret,
      'hub.lease_seconds': '86400',
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const res = await axios.post(this.hubUrl, body, { headers });
      this.logger.log(`Subscription request sent. Status: ${res.status}`);
    } catch (error) {
      this.logger.error(`Error subscribing: ${error.message}`);
    }
  }

  verifySignature(payload: string, signature: string): boolean {
    const [method, hash] = signature.split('=');
    const hmac = crypto.createHmac(method, this.secret);
    hmac.update(payload);
    const expected = hmac.digest('hex');
    return expected === hash;
  }
}
