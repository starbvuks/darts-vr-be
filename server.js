const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize express
const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoUri = 'mongodb+srv://starbvuks:zbzij5p0oU4i4ABw@playground.xrmczcu.mongodb.net/DARTS?retryWrites=true&w=majority&appName=playground';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const steamAuth = require('./routes/auth/steamRoutes');
app.use('/api/auth', steamAuth);


const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});