import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Ensure you have a "public" folder

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Admission Ally!');
});

// Example API route to handle applications
app.post('/api/applications', (req, res) => {
    const { collegeName, status } = req.body;

    if (!collegeName || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    res.json({ message: 'Application received!', collegeName, status });
});

// 404 Route (Handles unknown routes)
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
