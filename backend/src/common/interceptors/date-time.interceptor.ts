import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getIsoDate } from '../utils/date.utils';

/**
 * Recursively traverses any data structure and converts all Date instances 
 * into ISO strings with Brasil timezone (UTC-3) using getIsoDate().
 * If a value is already a string in "-03:00" format, preserves it.
 */
function convertDatesToBrazilTZ(obj: any): any {
  if (obj instanceof Date) {
    return getIsoDate();
  }
  if (
    typeof obj === 'string' && 
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*-03:00$/.test(obj)
  ) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToBrazilTZ);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertDatesToBrazilTZ(value)])
    );
  }
  return obj;
}

@Injectable()
export class BrazilDateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => convertDatesToBrazilTZ(data)));
  }
}