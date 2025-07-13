import type { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const notFoundHandler: (req: Request, res: Response) => void;
