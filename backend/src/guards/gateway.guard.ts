import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { verifyToken } from '../auth/jwt.util';
import { UserService } from '../user/user.service';

@Injectable()
export class GatewayGuard implements CanActivate {
  private routes: any[] = [];
  private lastLoaded = 0;

  private localRoutes = ['/auth/token', '/health'];

  constructor(private userService: UserService) {}

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

  /**
   * Improved route matcher supporting :params and /* wildcards
   */
  private matchRoute(reqPath: string, reqMethod: string) {
    const cleanReqPath = reqPath.replace(/\/+$/, '');

    return this.routes.find(r => {
      const routePath = r.path.replace(/\/+$/, '');

      // 1. Wildcard match, e.g., /accounts/*
      if (routePath.endsWith('/*')) {
        const base = routePath.slice(0, -2);
        if (
          (cleanReqPath === base ||
            cleanReqPath.startsWith(base + '/')) &&
          (r.method === 'ALL' || r.method === reqMethod)
        ) {
          return true;
        }
      }

      // 2. Param match, e.g., /users/:id => /users/abcd
      const routeRegex = '^' + routePath
        // Escape slashes
        .replace(/\//g, '\\/')
        // Params like :id => [^/]+
        .replace(/:[^\\/]+/g, '[^\\/]+') + '$';

      if (
        new RegExp(routeRegex).test(cleanReqPath) &&
        (r.method === 'ALL' || r.method === reqMethod)
      ) {
        return true;
      }

      // 3. Exact match
      if (
        cleanReqPath === routePath &&
        (r.method === 'ALL' || r.method === reqMethod)
      ) {
        return true;
      }

      return false;
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.loadYaml();

    const req: Request = context.switchToHttp().getRequest();

    if (this.localRoutes.includes(req.path)) {
      return true;
    }

    const route = this.matchRoute(req.path, req.method);
    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (route.public) {
      return true;
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    let payload: any;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }

    const userRoles = await this.userService.getRoleNames(payload.email);

    if (!userRoles || userRoles.length === 0) {
      throw new ForbiddenException('User not found or has no permission');
    }

    const hasRole = userRoles.some(role => route.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}