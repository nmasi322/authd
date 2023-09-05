import User from "../models/user.model.js";
import CustomError from "../utils/custom-error.js";
import MailService, { MailTemplate } from "./mail.service.js";
import AuthService from "./auth.service.js";

class UserService {
  async getOne(userId, isPublic = false) {
    const user = await User.findById(userId);
    if (!user) throw new CustomError("User not found");
    if (isPublic) {
      const userJSON = user.toJSON();
      delete userJSON.password;
      return { ...userJSON };
    }
    return user;
  }

  async update(data) {
    let user = await this.getOne(data.userId);

    const update = {
      name: data.name && data.name.length > 3 ? data.name : undefined,
    };

    await user.save();

    user = await User.findOneAndUpdate(
      { _id: data.userId },
      { $set: update },
      { new: true }
    );

    if (data.email) {
      const formerEmail = user.email;
      // Check if email is the same as current one
      if (data.email === user.email)
        throw new CustomError("Mail is the same", 400);

      // check if email is already in use
      user = await this.getOneByEmail(data.email);
      if (user) throw new CustomError("This email is already in use", 400);

      user = await User.findOneAndUpdate(
        { _id: data.userId },
        { $set: { email: data.email, isVerified: false } },
        { new: true }
      );
      MailService.sendTemplate(
        MailTemplate.emailUpdated,
        "Email Updated",
        { name: user.name, email: formerEmail },
        { email: user.email }
      );
      await AuthService.requestEmailVerification(data.email);
    }
    return user;
  }

  async getOneByEmail(email) {
    const user = await User.findOne({ email });
    return user;
  }

  async echoUser(email) {
    if (!email) throw new CustomError("Email is required", 400);
    const user = await this.getOneByEmail(email);
    if (!user) throw new CustomError("User not found", 404);

    return {
      name: user.name,
      email: user.email,
    };
  }
}

export default new UserService();
