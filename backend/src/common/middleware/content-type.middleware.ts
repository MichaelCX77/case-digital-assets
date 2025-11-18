/**
 * Enforces the use of 'Content-Type: application/json' for requests with a body
 * (i.e. POST, PUT, PATCH methods). Requests missing this header are rejected 
 * with a BadRequestException.
 */
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  /**
   * Verifies that POST, PUT, and PATCH requests have the correct Content-Type header.
   * @param req Incoming Express request
   * @param res Express response object
   * @param next Next middleware function
   * @throws BadRequestException if the Content-Type is missing or not application/json
   */
  use(req: Request, res: Response, next: NextFunction) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new BadRequestException('Content-Type application/json required');
      }
    }
    next();
  }
}