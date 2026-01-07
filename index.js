import dotenv from "dotenv";
dotenv.config();
import express from 'express';
const app = express();
import cors from 'cors';
import mongoose, { mongo } from 'mongoose';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import authRouter from './src/routers/auth.routers.js';
import pageRouter from './src/routers/pageRouter.js';
import uploadRouter from './src/routers/uploadRouter.js';
import contactRouter from './src/routers/contactRouter.js';
import adminUsersRouter from './src/routers/adminUsersRouter.js';
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://varallocms.vercel.app',
  'https://frontendcmsv1.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman etc.

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);




app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Configuration - for image uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
  },
});

// Make upload available globally
app.locals.upload = upload;

app.use('/api/auth', authRouter);
app.use('/api/pages', pageRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/admin/users', adminUsersRouter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB", err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Global error handler (catch Multer file size errors and others)
app.use((err, req, res, next) => {
  if (!err) return next();
  console.error('Global Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(404).json({ success: false, message: 'File too large' });
  }

  return res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
}); 