import nodemailer from "nodemailer"
export default async function (email, code) {
    return new Promise(async (resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                service: "gmail",
                port: 587,
                secure: true,
                auth: {
                    user: 'ddonierov96@gmail.com',
                    pass: 'gmyfqlbdpddpsagp'
                }
            });

            const mailOptions = {
                from: 'ddonierov96@gmail.com',
                to: email,
                subject: 'Verification Code',
                text: `Your verification code is: ${code}`
            };

            await transporter.sendMail(mailOptions);
            resolve({ message: 'Verification email sent successfully', code: code })
        } catch (error) {
            reject(error)
        }
    })
}