import { Types } from "mongoose";
import User, { IUserDocument } from "../models/user.model";
import CustomError from "../utils/custom-error";
import { IPublicUser } from "../models/user.model";
import { UserUpdateInput } from "../types/user";
import MailService, { MailTemplate } from "./mail.service";
import AuthService from "./auth.service";

class UserService {
  async getOne(
    userId: string | Types.ObjectId,
    isPublic = false
  ): Promise<IPublicUser> {
    const user = await User.findById(userId);
    if (!user) throw new CustomError("User not found");
    if (isPublic) {
      const userJSON = user.toJSON();
      delete userJSON.password;
      return { ...userJSON } as IPublicUser;
    }
    return user;
  }

  async update(data: UserUpdateInput) {
    let user: IUserDocument | null = (await this.getOne(
      data.userId
    )) as IUserDocument;

    const update = {
      name: data.name && data.name.length > 3 ? data.name : undefined,
    };

    await user.save();

    user = (await User.findOneAndUpdate(
      { _id: data.userId },
      { $set: update },
      { new: true }
    )) as IUserDocument;

    if (data.email) {
      const formerEmail = user.email;
      // Check if email is the same as current one
      if (data.email === user.email)
        throw new CustomError("Mail is the same", 400);

      // check if email is already in use
      user = await this.getOneByEmail(data.email);
      if (user) throw new CustomError("This email is already in use", 400);

      user = (await User.findOneAndUpdate(
        { _id: data.userId },
        { $set: { email: data.email, isVerified: false } },
        { new: true }
      )) as IUserDocument;
      await MailService.sendTemplate<{ email: string }>(
        MailTemplate.emailUpdated,
        "Email Updated",
        { name: user.name, email: formerEmail },
        { email: user.email }
      );
      await AuthService.requestEmailVerification(data.email);
    }
    return user;
  }

  async getOneByEmail(email: string) {
    const user = await User.findOne({ email });
    return user;
  }

  async echoUser(email: string) {
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
