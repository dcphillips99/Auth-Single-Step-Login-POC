const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const authConfig = require('./auth_config.json');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');

const app = express();
sgMail.setApiKey('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');

if (
  !authConfig.domain ||
  !authConfig.authorizationParams.audience ||
  authConfig.authorizationParams.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}
//authorize endpoint auth0
//redirected to login screen if not logged in (or just logged in)
app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: authConfig.appUri,
  })
);
app.use(express.json());

const checkJwt = auth({
  audience: authConfig.authorizationParams.audience,
  issuerBaseURL: `https://${authConfig.domain}`,
});

app.get('/api/external', checkJwt, (req, res) => {
  res.send({
    msg: 'Your access token was successfully validated!',
  });
});

app.patch('/verify-user', checkJwt, (req, res) => {
  let data = JSON.stringify({
    "email_verified": true,
  });
  
  let config = {
    method: 'patch',
    maxBodyLength: Infinity,
    url: `https://dc-auth-test-poc.us.auth0.com/api/v2/users/${req.body.user_id}`,
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + authConfig.api_token
    },
    data : data
  };
  
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
  
});

//send password change/verification email endpoint
app.post('/password-change', checkJwt, (req, res) => {
  //Start - refactor this such that it intakes an array or individual object, hits ticket endpoint multiple times, and sends multiple emails
  let data = JSON.stringify({
    "email": req.body.email,
    "connection_id": "con_Uc6x4AB43ev6m2IJ",
    "ttl_sec": 0,
    "mark_email_as_verified": false,
    "includeEmailInRedirect": true,
    "result_url": "http://localhost:4200/verify-email",
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://dc-auth-test-poc.us.auth0.com/api/v2/tickets/password-change',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': 'Bearer ' + authConfig.api_token
    },
    data : data
  };
  //END
  axios.request(config)
  .then((response) => {
    const msg = {
      to: req.body.email, // Change to your recipient
      from: 'dylan.phillips@tanduo.io', // Change to your verified sender
      subject: 'Change your password and verify your email!',
      text: 'Click the link below to change your password and verify your email!',
      html: '<a href='+ response.data.ticket + '>' + 'Reset Password' + '</a>',
    }
    //sendgrid email
    sgMail
    .send(msg)
    .then(() => {
      res.send({
        msg: 'Verification email sent!',
      });
    })
    .catch((error) => {
      console.error(error)
    });
  })
  .catch((error) => {
    console.log(error);
    res.send({
      msg: 'Error sending verification email!',
    });
  });
});

const port = process.env.API_SERVER_PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));
