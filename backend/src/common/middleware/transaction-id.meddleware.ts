/**
 * Middleware that generates a unique transaction-id (UUID v4) for every request,
 * attaches it to the request object, and exposes it via response header.
 * Enables request tracing across microservices or distributed systems.
 */
import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionIdMiddleware implements NestMiddleware {
  /**
   * Generates and attaches a transaction-id to the request, sets the header on the response.
   * @param req Incoming Express request with optional transactionId property
   * @param res Express response object
   * @param next Next middleware function in chain
   */
  use(req: Request & { transactionId?: string }, res: Response, next: NextFunction) {
    const transactionId = uuidv4();
    req.transactionId = transactionId;
    res.setHeader('transaction-id', transactionId);
    next();
  }
}