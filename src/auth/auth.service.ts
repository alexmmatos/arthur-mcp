import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

export interface AuthUser {
  _id: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<AuthUser | null> {
    const user = await this.users.findByUsername(username);
    if (!user) return null;
    const valid = await this.users.validatePassword(password, user.password);
    if (!valid) return null;
    return { _id: String(user._id), username: user.username, role: user.role };
  }

  login(user: AuthUser): { access_token: string } {
    const payload: JwtPayload = { sub: user._id, username: user.username, role: user.role };
    return { access_token: this.jwt.sign(payload) };
  }

  async register(username: string, password: string, email: string): Promise<{ access_token: string }> {
    const [byUsername, byEmail] = await Promise.all([
      this.users.findByUsername(username),
      this.users.findByEmail(email),
    ]);
    if (byUsername || byEmail) throw new ConflictException('Usuário ou e-mail já cadastrado');
    const user = await this.users.create(username, password, email);
    return this.login({ _id: String(user._id), username: user.username, role: user.role });
  }
}
