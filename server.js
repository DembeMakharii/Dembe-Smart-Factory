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