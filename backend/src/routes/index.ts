import { Router } from 'express';

const router = Router();

// Rota de teste
router.get('/', (req, res) => {
  res.json({ message: 'ChamadaWeb API v1' });
});

export { router };