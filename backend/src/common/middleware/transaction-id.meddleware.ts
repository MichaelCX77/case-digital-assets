import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionIdMiddleware implements NestMiddleware {
  use(req: Request & { transactionId?: string }, res: Response, next: NextFunction) {
    // Gera um novo UUID v4 para cada request
    const transactionId = uuidv4();

    // Anexa no request e, opcionalmente, no response header também
    req.transactionId = transactionId;
    res.setHeader('transaction-id', transactionId);

    next();
  }
}