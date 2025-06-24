const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartfactory', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const EquipmentSchema = new mongoose.Schema({
    id: String,
    status: String,
    efficiency: Number,
    lastMaintenance: Date,
    nextMaintenance: Date,
    riskLevel: String,
    parameters: Object
});

const ProductionSchema = new mongoose.Schema({
    timestamp: Date,
    line: String,
    unitsProduced: Number,
    efficiency: Number,
    defects: Number
});

const MaintenanceSchema = new mongoose.Schema({
    equipmentId: String,
    type: String,
    date: Date,
    technician: String,
    duration: Number,
    notes: String
});

// Create models
const Equipment = mongoose.model('Equipment', EquipmentSchema);
const Production = mongoose.model('Production', ProductionSchema);
const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);

// API Routes

// Equipment endpoints
app.get('/api/equipment', async (req, res) => {
    try {
        const equipment = await Equipment.find();
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/equipment/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findOne({ id: req.params.id });
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Production endpoints
app.get('/api/production', async (req, res) => {
    try {
        const { start, end, line } = req.query;
        let query = {};
        
        if (start && end) {
            query.timestamp = { $gte: new Date(start), $lte: new Date(end) };
        }
        
        if (line) {
            query.line = line;
        }
        
        const production = await Production.find(query).sort({ timestamp: -1 }).limit(100);
        res.json(production);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Maintenance endpoints
app.get('/api/maintenance', async (req, res) => {
    try {
        const maintenance = await Maintenance.find().sort({ date: -1 }).limit(50);
        res.json(maintenance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// AI Prediction endpoint
app.post('/api/predict', async (req, res) => {
    try {
        // In a real app, this would call your Python AI service
        const { equipmentId, parameters } = req.body;
        
        // Mock prediction
        const prediction = {
            failureProbability: Math.random().toFixed(2),
            recommendedMaintenance: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000),
            efficiencyImpact: (Math.random() * 10 + 5).toFixed(1)
        };
        
        res.json(prediction);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});