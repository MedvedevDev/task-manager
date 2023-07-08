const sgMail = require('@sendgrid/mail')
require('dotenv').config({path: __dirname + '/.env'})

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: email,
        subject: 'Welcome to кохана.',
        text: `Welcome to the app, ${name}`
    })
}

const sendRemoveEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: email,
        subject: `Goodbye, ${name}`,
        text: `Sorry to see you go!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendRemoveEmail
}