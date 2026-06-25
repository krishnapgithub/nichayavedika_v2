
import axios from "axios";

export const sendOtpEmail = async (toEmail, otp) => {
    const response = await axios.post(
        "https://api.zeptomail.com/v1.1/email",
        {
            from: {
                address: process.env.EMAIL_FROM,
                name: process.env.EMAIL_FROM_NAME || "NichayaVedika",
            },
            to: [
                {
                    email_address: {
                        address: toEmail,
                        name: "NichayaVedika User",
                    },
                },
            ],
            subject: "NichayaVedika Email Verification OTP",
            htmlbody: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color:#800020;">నిశ్చయ వేదిక</h2>
                    <p>Your verification OTP is:</p>
                    <h1 style="letter-spacing:4px;color:#800020;">${otp}</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                    <p>Please do not share this code with anyone.</p>
                    <br/>
                    <p>Regards,<br/>NichayaVedika Team</p>
                </div>
            `,
            track_clicks: false,
            track_opens: false,
        },
        {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Zoho-enczapikey ${process.env.ZEPTO_API_KEY}`,
            },
        }
    );

    return response.data;
};