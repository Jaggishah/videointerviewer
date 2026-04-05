import 'module-alias/register';
import express, { Request, Response } from 'express';
import cors from 'cors';
import VARIABLES from '@lib/Variable';

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello, World!' });
});



function startServer(): void {
    const PORT = VARIABLES.PORT;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();