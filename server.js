const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/signup', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());

const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  verified: Boolean,
});

app.get('/verify-email', async (req, res) => {
  const token = req.query.token;
  try {
    const decoded = jwt.verify(token, 'f1df3b340b5980e401d9d7be4901cc3a1e15c0c85eb036c3856cb360c8e20a70a');
    // Update the user's verification status in the database
    await User.updateOne({ email: decoded.email }, { verified: true });

    res.status(200).json({ message: 'Email verification successful' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid token' });
  }
});

app.post('/signup', async (req, res) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
  } = req.body;

  try {
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const newUser = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      verified: false,
    });

    await newUser.save();

    // Generate a token for email verification
    const token = jwt.sign({ email: newUser.email }, 'g1df3b340b5980e401d9d7be4901cc3a1e15c0c85eb036c3856cb360c8e20a70a', {
      expiresIn: '1d',
    });

    // Construct the email verification link
    const emailLink = `http://yourwebsite.com/verify-email?token=${token}`;

    // Send the verification email to the user who just signed up
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'bshobia75@gmail.com',
        pass: 'resb cdgf hhqz uoxk',
      },
    });

    const mailOptions = {
      from: 'bshobia75@gmail.com',
      to: newUser.email,
      subject: 'Email Verification',
      html: `Please click <a href="${emailLink}">here</a> to verify your email.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        // Handle the error here.
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(201).json({ message: 'Registration successful! Check your email for verification.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/coachlog', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.verified) {
      return res.status(401).json({ message: 'Email not verified' });
    }

    if (password !== User.password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
    //   expiresIn: '1h',
    // });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
