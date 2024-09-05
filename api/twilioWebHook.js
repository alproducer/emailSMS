import  nodemailer  from 'nodemailer';
import twilio from 'twilio';

//Twilio Credentials
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

//Nodemailer Transporter Configuation
const transporter = nodemailer.createTransport({
    service: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default async function handler(req, res) {
    if (req.method === 'POST'){
        const twilioSignature = req.headers['x-twilio-signature'];
        const url = `https://${req.headers.host}/api/twilioWebHook`;
        const params = req.body;
    }

    const isValidRequest = twilio.validRequest(twilioAuthToken, twilioSignature, url, params);
    
    if (!isValidRequest) {
        return res.status(403).send('Invalid request signature');
    }

    const { From:from, Body:body} = req.body; 

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: 'hello@atpeacearts.com',
        subject: `New text from ${from}`,
        text: `You have a new SMS from ${from}: \n\n ${body}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({message: 'Email sent succesfully.'});
    }catch (error) {
        console.error('Error sending email', error);
        res.status(500).json({message: 'Failed to send email'});
    }
}



