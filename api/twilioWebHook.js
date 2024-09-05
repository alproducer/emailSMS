const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Twilio Credentials
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Correct SMTP host for Gmail
    port: 587,  // Port for TLS
    secure: false,  // Use TLS
    auth: {
        user: process.env.EMAIL_USER,  // Ensure this matches your environment variable
        pass: process.env.EMAIL_PASS,  // Ensure this matches your environment variable
    },
});

export default async function handler(req, res) {
    

    // Ensure body parsing is handled correctly (Vercel requires manual parsing)
    let rawBody = '';
    req.on('data', chunk => {
        rawBody += chunk.toString();  // Convert buffer to string
    });

    req.on('end', async () => {
        const twilioSignature = req.headers['x-twilio-signature'];
        const url = `https://emailsms-tawny.vercel.app/api/twilioWebHook`;
        const params = new URLSearchParams(rawBody);  // Parse raw body as URL-encoded form data

        // Validate the request to ensure it is from Twilio

        const from = params.get('From');  // Extract 'From' from form data
        const body = params.get('Body');  // Extract 'Body' from form data

        const emailHtmlContent = `
  <p>You have a new SMS from <a href="tel:${from}">${from}</a>:</p>
  <p>${body}</p>`;

        const mailOptions = {
            from: process.env.EMAIL_USER,  // Use the email set in environment variables
            to: 'hello@atpeacearts.com',
            subject: `New text from ${from}`,
            html: emailHtmlContent,
        };

        try {
            // Send email using Nodemailer
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Email sent successfully.' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Failed to send email' });
        }
    });
}
