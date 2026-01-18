import  express  from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.get('/',( req, res) => {
    res.status(200).json({'message': 'Hello, World!'});
})

function startServer() {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();