const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
/*
new Email(user, url).sendWelcome();
new Email(user, url).sendPassword();
*/

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        // host: process.env.SEND_HOST,
        // port: process.env.SEND_PORT,
        auth: {
          user: process.env.SEND_USERNAME,
          pass: process.env.SEND_PASSWORD,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }
  async send(template, subject) {
    //render html based on pug
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    //define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    //send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendPassReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min'
    );
  }
};
