import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  //   host: "smtp.gmail.com",
  // port: 587,
  // secure: false, // true for port 465, false for other ports
  auth: {
    user: `${process.env.EMAIL_USER_NAME}` ,
    pass: `${process.env.EMAIL_PASS}`,
  },
});


  
