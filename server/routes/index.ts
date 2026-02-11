import { Router } from 'express';
import { router as tileRouter } from './tileRoutes';
import { router as interiorRouter } from './interiorRoutes';

export const router = Router();

router.use('/tiles', tileRouter);
router.use('/interior', interiorRouter);
