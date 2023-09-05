import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import UserServce from "../services/user.service";
import { AuthenticatedRequest } from "../types/auth";

import response from "../utils/response";

class AuthController {
  async echoUser(req: Request, res: Response) {
    const result = await UserServce.echoUser(req.query.email as string);
    res.status(200).send(response("echo user", result));
  }

  async emailVerify(req: AuthenticatedRequest, res: Response) {
    const result = await AuthService.verifyEmail({
      userId: req.user!.id,
      ...req.body,
    });
    res.status(200).send(response("email verified successfully", result));
  }
  async emailVerifyRequest(req: Request, res: Response) {
    const result = await AuthService.requestEmailVerification(
      req.query.email as string
    );
    res
      .status(200)
      .send(response("email instructions sent successfully", result));
  }

  async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    res.status(200).send(response("login", result));
  }

  async me(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const result = await UserServce.getOne(user.id, true);
    res.status(200).send(response("Me", result));
  }

  async refreshAuth(req: Request, res: Response) {
    const result = await AuthService.refreshAccessToken(req.body);
    res.status(200).send(response("Authorization refresh", result));
  }

  async logoutInput(req: Request, res: Response) {
    const result = await AuthService.logout(req.body);
    res.status(200).send(response("Log out", result));
  }

  async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);
    res.status(201).send(response("account created succesfully", result));
  }

  async resetPassword(req: Request, res: Response) {
    const result = await AuthService.resetPassword(req.body);
    res.status(200).send(response("password reset success", result));
  }

  async requestPasswordReset(req: Request, res: Response) {
    const result = await AuthService.requestPasswordReset(
      req.query.email as string
    );
    res
      .status(200)
      .send(response("email instructions sent successfully", result));
  }

  async updatePassword(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const result = await AuthService.updatePassword(user.id, req.body);
    res.status(200).send(response("password update success", result));
  }
  async updateMe(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const result = await UserServce.update({
      ...req.body,
      userId: user.id,
    });
    const userJSON = result.toJSON();
    delete userJSON.password;
    res.status(200).send(response("User Update", { result: userJSON }));
  }
}

export default new AuthController();
