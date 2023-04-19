import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
	console.log(`${res}`);
});

router.post('/', (_req, res) => {
	console.log(`${res}`);
});

export default router;
