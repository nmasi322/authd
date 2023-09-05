import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "node:url";

import { PLUNK_EMAIL } from "../config/config.js";

export const MailTemplate = {
  emailUpdated: "Email Updated",
  welcome: "Welcome!",
  emailVerify: "Email Verify Requested",
  passwordResetRequested: "Password Reset Requested",
};

const templates = {
  [MailTemplate.emailUpdated]: "email-update.html",
  [MailTemplate.welcome]: "welcome.html",
  [MailTemplate.emailVerify]: "email-verify.html",
  [MailTemplate.passwordResetRequested]: "password-reset-request.html",
};

class MailService {
  async sendTemplate(template, subject, user, args) {
    let argsData = args ? args : {};

    const directory = path.resolve(
      fileURLToPath(import.meta.url),
      "../../",
      `templates/${templates[template]}`
    );

    // Retrieve Markup
    let templateMarkup = fs.readFileSync(path.join(directory), "utf8");

    // Replace markup keys
    Object.entries({
      ...user,
      ...argsData,
    }).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      templateMarkup = templateMarkup.replace(regex, value);
    });

    const mailOptions = {
      to: user.email,
      subject,
      body: templateMarkup,
    };

    try {
      await axios.post(PLUNK_EMAIL.API_URL, JSON.stringify(mailOptions), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PLUNK_EMAIL.API_KEY}`, // Put your API key here
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}

const service = new MailService();

export default service;
