import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../auth/jwt.util';

@Injectable()
export class GatewayGuard implements CanActivate {
  private prisma = new PrismaClient();
  private routes: any[] = [];
  private lastLoaded = 0;

  // Rotas internas que não passam pelo proxy
  private localRoutes = ['/auth/token', '/health'];

  private loadYaml() {
    const fullPath = path.join(__dirname, '../../config/routes.yml');
    const stats = fs.statSync(fullPath);
    if (stats.mtimeMs > this.lastLoaded) {
      const file = fs.readFileSync(fullPath, 'utf8');
      const doc = yaml.load(file) as any;

      this.routes = [];

      if (doc && doc.routes) {
        for (const serviceName of Object.keys(doc.routes)) {
          const serviceRoutes = doc.routes[serviceName].map((r: any) => ({
            ...r,
            service: doc.services[serviceName],
          }));
          this.routes.push(...serviceRoutes);
        }
      }

      this.lastLoaded = stats.mtimeMs;
      console.log('routes.yml recarregado');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.loadYaml();

    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    // Rotas internas do Nest passam direto
    if (this.localRoutes.includes(req.path)) {
      return true;
    }

    // Normaliza path para regex (remove trailing slashes)
    const cleanPath = req.path.replace(/\/+$/, '');

    // Encontra rota no YAML
    const route = this.routes.find(r =>
      new RegExp(`^${r.path.replace('*', '.*')}$`).test(cleanPath) &&
      (r.method === 'ALL' || r.method === req.method)
    );

    if (!route) {
      res.status(404).json({ message: 'Rota não encontrada' });
      return false;
    }

    // Valida JWT
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Token ausente' });
      return false;
    }

    let payload: any;
    try {
      payload = verifyToken(token);
    } catch (err) {
      res.status(401).json({ message: 'Token inválido' });
      return false;
    }

    // Verifica RBAC
    const hasRole = payload.roles.some((r: string) => route.roles.includes(r));
    if (!hasRole) {
      res.status(403).json({ message: 'Acesso negado' });
      return false;
    }

    // Proxy para serviço downstream
    try {
      const axiosConfig: any = {
        method: req.method,
        url: route.service + req.path,
        headers: { ...req.headers },
      };

      // Passa query params para GET
      if (req.method === 'GET') {
        axiosConfig.params = req.query;
      } else {
        axiosConfig.data = req.body;
      }

      const response = await axios(axiosConfig);
      res.status(response.status).json(response.data);
    } catch (err: any) {
      res
        .status(err.response?.status || 500)
        .json(err.response?.data || { message: 'Erro no serviço' });
    }

    return false;
  }
}
