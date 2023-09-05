import AuthService from "../services/auth.service.js";
import UserServce from "../services/user.service.js";

import response from "../utils/response.js";

class AuthController {
  async echoUser(req, res) {
    const result = await UserServce.echoUser(req.query.email);
    res.status(200).send(response("echo user", result));
  }

  async emailVerify(req, res) {
    const result = await AuthService.verifyEmail({
      userId: req.user.id,
      ...req.body,
    });
    res.status(200).send(response("email verified successfully", result));
  }
  async emailVerifyRequest(req, res) {
    const result = await AuthService.requestEmailVerification(req.query.email);
    res
      .status(200)
      .send(response("email instructions sent successfully", result));
  }

  async login(req, res) {
    const result = await AuthService.login(req.body);
    res.status(200).send(response("login", result));
  }

  async me(req, res) {
    const user = req.user;
    const result = await UserServce.getOne(user.id, true);
    res.status(200).send(response("Me", result));
  }

  async refreshAuth(req, res) {
    const result = await AuthService.refreshAccessToken(req.body);
    res.status(200).send(response("Authorization refresh", result));
  }

  async logoutInput(req, res) {
    const result = await AuthService.logout(req.body);
    res.status(200).send(response("Log out", result));
  }

  async register(req, res) {
    const result = await AuthService.register(req.body);
    res.status(201).send(response("account created succesfully", result));
  }

  async resetPassword(req, res) {
    const result = await AuthService.resetPassword(req.body);
    res.status(200).send(response("password reset success", result));
  }

  async requestPasswordReset(req, res) {
    const result = await AuthService.requestPasswordReset(req.query.email);
    res
      .status(200)
      .send(response("email instructions sent successfully", result));
  }

  async updatePassword(req, res) {
    const user = req.user;
    const result = await AuthService.updatePassword(user.id, req.body);
    res.status(200).send(response("password update success", result));
  }
  async updateMe(req, res) {
    const user = req.user;
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
