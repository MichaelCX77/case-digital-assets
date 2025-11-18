import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that enforces the 'Content-Type: application/json' header
 * for requests with body (POST, PUT, PATCH).
 * Throws BadRequestException when the header is missing or invalid.
 */
@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  /**
   * Checks for 'Content-Type: application/json' on relevant HTTP methods.
   * @param req Express request object.
   * @param res Express response object.
   * @param next Express next middleware function.
   * @throws BadRequestException if the required header is absent.
   */
  use(req: Request, res: Response, next: NextFunction) {
    // Allow only methods that accept body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new BadRequestException('Content-Type application/json required');
      }
    }
    next();
  }
}