const nodemailer = require('nodemailer');

class Mailer
{
    constructor()
    {
        this.config = {
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        };
        this.initTransport();
    }

    initTransport() {
        this.transport = nodemailer.createTransport(this.config);
    }

    setEmailOptions(options) {
        this.mailOptions = options;
    }

    send() {
        this.transport.sendMail(this.mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        });
    }
}

module.exports = Mailer;
