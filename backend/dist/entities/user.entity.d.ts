import { ModelProfile } from './model-profile.entity';
export declare enum UserRole {
    CLIENT = "client",
    MODEL = "model",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    credits: number;
    avatar?: string;
    modelProfile?: ModelProfile;
    createdAt: Date;
    updatedAt: Date;
}
