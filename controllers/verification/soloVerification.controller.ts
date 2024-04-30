import { Request, Response } from "express";
import SingleRegisterModel from "../../models/single.model";
const nodemailer = require("nodemailer");
const mailTemplate = require("../../template/mailTemplate");

const verifyAndSendEmailSolo = async (req: Request, res: Response) => {
  const _id = req.body.userId;

  try {
    const updatedTeam = await SingleRegisterModel.findByIdAndUpdate(
      _id,
      { isVerified: true },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }
    // return res.status(200).json({
    //   message: "Team verified successfully",
    //   data: updatedTeam,
    // });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_SENDER,
      to: req.body.email,
      subject:
        "Congratulations your registration for Avenir 2024 has been successfully verified",
      html: mailTemplate(),
    };

    transporter.sendMail(mailOptions, function (error: any, info: any) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error("Error verifying team:", error);
  }

  return res.status(200).json({
    message: "Email sent successfully",
  });
};

export { verifyAndSendEmailSolo };