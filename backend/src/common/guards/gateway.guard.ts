import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { verifyToken } from '../../modules/auth/jwt.util';
import { UserService } from '../../modules/user/user.service';

/**
 * Guard for API Gateway authorization, handling role-based and public route access.
 * - Loads route configuration from a YAML file.
 * - Matches routes with params and wildcards.
 * - Enforces authentication and role permissions.
 */
@Injectable()
export class GatewayGuard implements CanActivate {
  private routes: any[] = [];
  private lastLoaded = 0;

  /**
   * List of local routes that do not require authentication.
   */
  private localRoutes = ['/auth/token', '/health', '/', '/health'];

  constructor(private userService: UserService) {}

  /**
   * Loads and parses routes from YAML file when the file is modified.
   * Updates internal routes cache.
   */
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
   * Matches an incoming request path and HTTP method to a configured route.
   * Supports :param segments and /* wildcards.
   * @param reqPath Incoming request path.
   * @param reqMethod Incoming HTTP method.
   * @returns Matched route object or undefined.
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
        .replace(/\//g, '\\/')
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

  /**
   * Main canActivate method used by NestJS to authorize each request.
   * Checks route match, authentication, and user role permissions as needed.
   * Throws standard HTTP exceptions for errors.
   * @param context Execution context provided by NestJS.
   * @returns True if request is authorized, otherwise throws an exception.
   */
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