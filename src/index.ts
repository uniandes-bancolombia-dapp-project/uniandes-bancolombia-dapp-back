import express from 'express';
import auth from './routes/authRouting';
let cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 8080;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

app.use('/api/auth', auth);
