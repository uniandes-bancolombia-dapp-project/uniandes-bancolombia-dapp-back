import express from 'express';
import router from './routes/routing';

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/ping', (_req, res) => {
	console.log('someone pinged here!!');
	res.send('pong');
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

app.use('/api/routing', router);
