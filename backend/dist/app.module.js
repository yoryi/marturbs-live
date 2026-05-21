"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const models_module_1 = require("./models/models.module");
const credits_module_1 = require("./credits/credits.module");
const sessions_module_1 = require("./sessions/sessions.module");
const livekit_module_1 = require("./livekit/livekit.module");
const admin_module_1 = require("./admin/admin.module");
const gateway_module_1 = require("./gateway/gateway.module");
const user_entity_1 = require("./entities/user.entity");
const model_profile_entity_1 = require("./entities/model-profile.entity");
const session_entity_1 = require("./entities/session.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5433),
                    username: config.get('DB_USERNAME', 'marturbs'),
                    password: config.get('DB_PASSWORD', 'marturbs_secret'),
                    database: config.get('DB_DATABASE', 'marturbs_live'),
                    entities: [user_entity_1.User, model_profile_entity_1.ModelProfile, session_entity_1.CallSession, transaction_entity_1.Transaction],
                    synchronize: true,
                    logging: config.get('NODE_ENV') === 'development',
                }),
            }),
            auth_module_1.AuthModule,
            models_module_1.ModelsModule,
            credits_module_1.CreditsModule,
            sessions_module_1.SessionsModule,
            livekit_module_1.LivekitModule,
            admin_module_1.AdminModule,
            gateway_module_1.GatewayModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map