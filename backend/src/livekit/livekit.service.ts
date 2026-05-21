import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  constructor(private config: ConfigService) {}

  async createToken(roomName: string, identity: string, role: string) {
    const apiKey = this.config.get('LIVEKIT_API_KEY');
    const apiSecret = this.config.get('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      return {
        demo: true,
        roomName,
        identity,
        message: 'Configure LIVEKIT_API_KEY y LIVEKIT_API_SECRET para tokens reales',
      };
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: '2h',
    });
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return {
      token: await token.toJwt(),
      roomName,
      url: this.config.get('LIVEKIT_URL'),
    };
  }
}
