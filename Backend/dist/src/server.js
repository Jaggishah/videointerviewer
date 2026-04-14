import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import { serve } from 'inngest/express';
import VARIABLES from '@/lib/Variable';
import connectDB from '@/lib/Db';
import { inngest, functions } from '@/lib/Inngest';
import path from 'path';
const __dirname = path.resolve();
const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use('/api/inngest', serve({ client: inngest, functions }));
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello, World!' });
});
if (VARIABLES.PRODUCTION === 'TRUE') {
    app.use(express.static(path.join(__dirname, '../Frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../Frontend/dist', 'index.html'));
    });
}
function startServer() {
    try {
        const PORT = VARIABLES.PORT;
        connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Error starting the server:', error);
    }
}
startServer();
