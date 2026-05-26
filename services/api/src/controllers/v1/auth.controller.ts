import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/AuthService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      sendCreated(res, result, 'Registration successful');
    } catch (error) { next(error); }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier = req.body.email || req.body.phone || req.body.identifier;
      const result = await AuthService.login(identifier, req.body.password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) { next(error); }
  }

  static async verifyPhone(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.verifyPhone(req.user!.id, req.body.code);
      sendSuccess(res, result, 'Phone verified');
    } catch (error) { next(error); }
  }

  static async sendVerificationCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.user!.id);
      const result = await AuthService.sendVerificationCode(req.user!.id, user.phone || '');
      sendSuccess(res, result, 'Verification code sent');
    } catch (error) { next(error); }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.forgotPassword(req.body.email || req.body.phone);
      sendSuccess(res, result, 'Reset code sent');
    } catch (error) { next(error); }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier = req.body.email || req.body.phone;
      const result = await AuthService.resetPassword(identifier, req.body.code, req.body.password);
      sendSuccess(res, result, 'Password reset successfully');
    } catch (error) { next(error); }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refreshToken(req.body.refreshToken || req.body.refresh_token);
      sendSuccess(res, result, 'Token refreshed');
    } catch (error) { next(error); }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.user!.id);
      sendSuccess(res, user);
    } catch (error) { next(error); }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (error) { next(error); }
  }
}
