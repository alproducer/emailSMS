const  nodemailer  = require('nodemailer');
const twilio = require('twilio');

//Twilio Credentials
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

//Nodemailer Transporter Configuation
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed. Please use POST.' });
    }
    
        const twilioSignature = req.headers['x-twilio-signature'];
        const url = `https://${req.headers.host}/api/twilioWebHook`;
        const params = req.body;
    

    const isValidRequest = twilio.validateRequest(twilioAuthToken, twilioSignature, url, params);
    
    if (!isValidRequest) {
        return res.status(403).send('Invalid request signature');
    }

    const { From:from, Body:body} = req.body; 

    const mailOptions = {
        from: process.env.EMAIL_USER,
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



