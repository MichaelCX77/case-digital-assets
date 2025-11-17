import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { verifyToken } from '../auth/jwt.util';
import { UserService } from '../user/user.service'; // INJEÇÃO DO SERVICE

@Injectable()
export class GatewayGuard implements CanActivate {
  private routes: any[] = [];
  private lastLoaded = 0;

  // Rotas internas do Nest passam direto (liberadas, como login e health-check)
  private localRoutes = ['/auth/token', '/health'];

  constructor(private userService: UserService) {}

  /** Carrega o YAML sempre pela raiz do projeto via process.cwd() */
  private loadYaml() {
    const fullPath = path.join(process.cwd(), 'src/config/routes.yml');
    const stats = fs.statSync(fullPath);
    if (stats.mtimeMs > this.lastLoaded) {
      const file = fs.readFileSync(fullPath, 'utf8');
      const doc = yaml.load(file) as any;

      this.routes = [];
      if (doc && doc.routes) {
        for (const serviceName of Object.keys(doc.routes)) {
          const serviceRoutes = doc.routes[serviceName].map((r: any) => ({
            ...r,
            path: r.path,
            method: r.method,
            roles: r.roles,
            public: r.public ?? false,
          }));
          this.routes.push(...serviceRoutes);
        }
      }
      this.lastLoaded = stats.mtimeMs;
    }
  }

  /** Melhora o matching para rotas exatas e wildcards */
  private matchRoute(reqPath: string, reqMethod: string) {
    const cleanReqPath = reqPath.replace(/\/+$/, '');

    return this.routes.find(r => {
      const configPath = r.path.replace(/\/+$/, '');
      if (configPath.endsWith('/*')) {
        const base = configPath.slice(0, -2);
        return (
          (cleanReqPath === base ||
            cleanReqPath.startsWith(base + '/')) &&
          (r.method === 'ALL' || r.method === reqMethod)
        );
      } else {
        return (
          cleanReqPath === configPath &&
          (r.method === 'ALL' || r.method === reqMethod)
        );
      }
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.loadYaml();

    const req: Request = context.switchToHttp().getRequest();

    // Passa direto rotas internas
    if (this.localRoutes.includes(req.path)) {
      return true;
    }

    const route = this.matchRoute(req.path, req.method);
    if (!route) {
      throw new NotFoundException('Rota não encontrada');
    }

    // Se rota for pública, libera sem JWT/RBAC
    if (route.public) {
      return true;
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token ausente');
    }

    let payload: any;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw new UnauthorizedException('Token inválido');
    }

    // Consulta roles do usuário no banco
    const userRoles = await this.userService.getRoleNames(payload.email);

    if (!userRoles || userRoles.length === 0) {
      throw new ForbiddenException('Usuário sem permissão ou não encontrado');
    }

    const hasRole = userRoles.some(role => route.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Acesso negado');
    }

    // Autorizado
    return true;
  }
}