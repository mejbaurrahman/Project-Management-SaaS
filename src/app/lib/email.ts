import nodemailer from "nodemailer";

import config from "../config/index.js";

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: config.smtp_port,
  secure: false,

  auth: {
    user: config.smtp_user,
    pass: config.smtp_password,
  },
});

const sendOtpEmail = async (
  email: string,
  otp: string,
  purpose: "REGISTER" | "LOGIN",
) => {
  const purposeText = purpose === "REGISTER" ? "registration" : "login";

  await transporter.sendMail({
    from: `"PMS" <${config.email_sender}>`,

    to: email,

    subject: `PMS ${purposeText} OTP`,

    text: `Your PMS OTP is ${otp}. This code will expire in 5 minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>PMS</h2>

        <p>
          Your ${purposeText} verification code is:
        </p>

        <h1 style="letter-spacing: 6px;">
          ${otp}
        </h1>

        <p>
          This OTP will expire in 5 minutes.
        </p>

        <p>
          If you did not request this OTP,
          please ignore this email.
        </p>
      </div>
    `,
  });
};

export const EmailUtils = {
  sendOtpEmail,
};
