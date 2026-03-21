import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { HttpResponse } from '../config/http-response';
import { asyncErrorHandler } from '../middleware/error';
import { createAccessToken, verifyGoogleCredential } from '../utils/auth';

export const loginWithGoogle = asyncErrorHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const credential = String(req.body?.credential || '').trim();

    if (!credential) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Missing Google credential'
      });
    }

    const user = await verifyGoogleCredential(credential);
    const accessToken = createAccessToken(user);

    return res.status(HTTP_STATUS.OK).json(
      new HttpResponse({
        success: true,
        message: 'Authenticated with Google',
        data: {
          accessToken,
          user
        }
      })
    );
  }
);
