const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { isCloudinaryConfigured } = require('./config/cloudinary');

console.log('Cloudinary env check:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
});
console.log('JWT_SECRET from env:', process.env.JWT_SECRET);

// Connect to Firestore (via Mongoose-compatible adapter)
connectDB();

const app = express();

app.use((req, res, next) => {
  console.log(`[Backend Request] ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'https://welly-lake.vercel.app',
  'https://welly-35tbpapvp-anjalisugandhapai-3182s-projects.vercel.app'

];

app.use(cors({
  origin: function (origin, callback) {
  
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const albumRoutes = require('./routes/albumRoutes');
const photoRoutes = require('./routes/photoRoutes');
const habitRoutes = require('./routes/habitRoutes');
const gratitudeRoutes = require('./routes/gratitudeRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const chatRoutes = require('./routes/chatRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/gratitude', gratitudeRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SageWillow Backend is running',
    cloudinaryConfigured: isCloudinaryConfigured()
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
