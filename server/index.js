import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import dotenv  from 'dotenv';

import { connectDB }    from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes      from './routes/authRoutes.js';
import issueRoutes     from './routes/issueRoutes.js';
import repoRoutes      from './routes/repoRoutes.js';
import savedItemsRoutes from './routes/savedItemsRoutes.js';
import profileRoutes   from './routes/profileRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/auth',          authRoutes);
app.use('/api/issues',    issueRoutes);
app.use('/api/repos',     repoRoutes);
app.use('/api/saved-items', savedItemsRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (_req, res) => res.json({ message: 'Upstream Backend API is running 🚀' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
