/**
 * GatewayGuard
 * 
 * API Gateway authorization guard for role-based and public route access.
 * - Loads dynamic route config from a YAML file at runtime, parsing services, roles, methods, and wildcards.
 * - Matches requests to routes supporting wildcards and params.
 * - Enforces authentication and authorization per route config.
 * - Attaches user info to request for downstream access.
 * 
 * Features:
 * - Reads and reloads route definitions from 'src/config/routes.yml' on file change.
 * - Supports public routes, authentication checks, and role validation.
 * - Handles 404, 401, and 403 errors with clear exception messages.
 * 
 * Usage:
 * - Import and set as guard in your modules/controllers.
 * - Ensure roles mapping and routes.yml are properly maintained.
 * 
 * Example route config (YAML):
 *   routes:
 *     user:
 *       - path: /users/:id
 *         method: GET
 *         roles: [admin, manager]
 *       - path: /users/*
 *         method: POST
 *         roles: [admin]
 *         public: false
 */
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
  private publicRoutes = ['/auth/token', '/health', '/'];

  constructor(private userService: UserService) {}

  /**
   * Loads or reloads routes from the YAML config if updated.
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
   * Matches the request path and method against configured routes.
   * Supports wildcards (/*), params (/users/:id), and exact routes.
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
   * Main guard logic: Loads config, matches route, and enforces authentication and role authorization.
   * Attaches authenticated user info to req.user.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.loadYaml();

    const req: Request = context.switchToHttp().getRequest();

    // Local public routes
    if (this.publicRoutes.includes(req.path)) {
      return true;
    }

    // Config public routes and role handling
    const route = this.matchRoute(req.path, req.method);
    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (route.public) {
      return true;
    }

    // Require JWT token
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    // Validate JWT and load user
    let payload: any;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.sub;
    const userRoles = await this.userService.getRoleNamesById(userId);

    if (!userRoles || userRoles.length === 0) {
      throw new ForbiddenException('User not found or has no permission');
    }

    // Role-based access
    const hasRole = userRoles.some(role => route.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Access denied');
    }

    // Attach user info to request object for downstream access
    req.user = {
      userId,     
      roles: userRoles,
    };

    return true;
  }
}