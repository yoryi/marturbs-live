import { ConfigService } from '@nestjs/config';
export declare class LivekitService {
    private config;
    constructor(config: ConfigService);
    createToken(roomName: string, identity: string, role: string): Promise<{
        demo: boolean;
        roomName: string;
        identity: string;
        message: string;
        token?: undefined;
        url?: undefined;
    } | {
        token: string;
        roomName: string;
        url: any;
        demo?: undefined;
        identity?: undefined;
        message?: undefined;
    }>;
}
