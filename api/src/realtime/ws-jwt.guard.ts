import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface WsUser {
  sub: string;
  email: string;
}

interface AuthenticatedSocketData {
  user?: WsUser;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    await this.authenticateClient(client);
    return true;
  }

  async authenticateClient(client: Socket): Promise<WsUser> {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        type: string;
      }>(token);

      if (payload.type !== 'access') {
        throw new WsException('Unauthorized');
      }

      const user: WsUser = { sub: payload.sub, email: payload.email };
      (client.data as AuthenticatedSocketData).user = user;
      return user;
    } catch {
      throw new WsException('Unauthorized');
    }
  }
}
