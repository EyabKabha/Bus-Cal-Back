const nodemailer = require('nodemailer');

sendEmail = (to, body, subject) => {
    let transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: 'amal_eyab_buscal@hotmail.com', // generated ethereal user
            pass: 'buscal123'  // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let support = `<h5 dir="rtl">במקרה ונתקלת בבעיה כלשהי ניתן לפנות אלינו דרך:<br> טלפון:0504382660, מייל: eyab.kabha@gmail.com<br>אל תשיב להודעה זו.</h5>`
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"BusCal" <amal_eyab_buscal@hotmail.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: 'System message', // plain text body
        html: `${body} <br/> <img src="cid:BusCalLogo"/><br>` + support, // html body
        attachments: [{
            filename: 'Logo.jpeg',
            path: 'public/images/Logo.jpeg',
            cid: 'BusCalLogo' //same cid value as in the html img src
        }]

    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email has been sent');
        }
    });
}

module.exports = { sendEmail };