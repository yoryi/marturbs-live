import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ModelsModule } from './models/models.module';
import { CreditsModule } from './credits/credits.module';
import { SessionsModule } from './sessions/sessions.module';
import { LivekitModule } from './livekit/livekit.module';
import { AdminModule } from './admin/admin.module';
import { GatewayModule } from './gateway/gateway.module';
import { PayoutModule } from './payout/payout.module';
import { User } from './entities/user.entity';
import { ModelProfile } from './entities/model-profile.entity';
import { CallSession } from './entities/session.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5433),
        username: config.get('DB_USERNAME', 'marturbs'),
        password: config.get('DB_PASSWORD', 'marturbs_secret'),
        database: config.get('DB_DATABASE', 'marturbs_live'),
        entities: [User, ModelProfile, CallSession, Transaction],
        synchronize: true,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    ModelsModule,
    CreditsModule,
    SessionsModule,
    LivekitModule,
    AdminModule,
    GatewayModule,
    PayoutModule,
  ],
})
export class AppModule {}
