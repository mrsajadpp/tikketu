const nodemailer = require("nodemailer");


const send_mail = async (mailOptions: { from: String, to: String, subject: String, text: String, html: String }) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'noreply.tikketu@gmail.com',
            pass: process.env.MAIL_PASS
        }
    });


    return await transporter.sendMail(mailOptions);
}

export default send_mail;