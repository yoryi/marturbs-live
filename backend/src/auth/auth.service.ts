import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ModelProfile } from '../entities/model-profile.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(ModelProfile)
    private modelRepo: Repository<ModelProfile>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedDemoUsers();
  }

  private async seedDemoUsers() {
    const demos = [
      {
        email: 'demo@marturbs.live',
        password: 'demo1234',
        name: 'Alex Premium',
        role: UserRole.CLIENT,
        credits: 450,
      },
      {
        email: 'model@marturbs.live',
        password: 'demo1234',
        name: 'Valentina Noir',
        role: UserRole.MODEL,
        credits: 0,
        username: 'valentina_noir',
      },
      {
        email: 'admin@marturbs.live',
        password: 'admin1234',
        name: 'Admin',
        role: UserRole.ADMIN,
        credits: 0,
      },
    ];

    for (const d of demos) {
      const exists = await this.usersRepo.findOne({ where: { email: d.email } });
      if (!exists) {
        const user = await this.createUser(d);
        if (d.role === UserRole.MODEL && 'username' in d) {
          await this.modelRepo.save({
            user,
            userId: user.id,
            username: d.username as string,
            isOnline: true,
            pricePerMinute: 12,
            rating: 4.9,
            reviewCount: 284,
            bio: 'Experiencia exclusiva.',
            tags: ['VIP', 'Español'],
          });
        }
      }
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email ya registrado');

    const user = await this.createUser({
      email: dto.email.toLowerCase(),
      password: dto.password,
      name: dto.name,
      role: dto.role,
      credits: dto.role === UserRole.CLIENT ? 50 : 0,
    });

    if (dto.role === UserRole.MODEL) {
      await this.modelRepo.save({
        user,
        userId: user.id,
        username: dto.username || dto.name.toLowerCase().replace(/\s/g, '_'),
        isOnline: false,
        pricePerMinute: 10,
        rating: 5,
        reviewCount: 0,
      });
    }

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    return this.buildAuthResponse(user);
  }

  private async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    credits?: number;
  }) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.usersRepo.save({
      email: data.email,
      password: hash,
      name: data.name,
      role: data.role,
      credits: data.credits ?? 0,
    });
  }

  private buildAuthResponse(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
        avatar: user.avatar,
      },
    };
  }

  async validateUser(userId: string) {
    return this.usersRepo.findOne({ where: { id: userId } });
  }
}
