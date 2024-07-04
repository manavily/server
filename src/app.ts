import express from 'express';
import authRouter from './routes/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

app.listen(process.env.PORT , () => console.log(`Server is running on port ${process.env.PORT }`));
