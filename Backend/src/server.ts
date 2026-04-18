
import cors from 'cors';
import path from 'path';
import connectDB from './lib/Db.js';
import VARIABLES from './lib/Variable.js';

import { serve } from 'inngest/express';
import express, { Request, Response } from 'express';
import { inngest, functions } from './lib/Inngest.js';
import { clerkMiddleware } from '@clerk/express';
import chatRoutes from './Routes/chatRoutes.js';


const __dirname = path.resolve();
const app = express();

app.use(cors({origin: "*" , credentials: true}));

app.use(express.json());
app.use(clerkMiddleware());


app.use('/api/inngest', serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);


if (VARIABLES.isPRODUCTION) {
    app.use(express.static(path.join(__dirname, '../Frontend/dist')));

    app.get('/{*path}', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../Frontend/dist', 'index.html'));
    });
}

function startServer(): void {
    try{
    const PORT = VARIABLES.PORT;
    connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    } catch (error) {
        console.error('Error starting the server:', error);
        
    }
}
startServer();