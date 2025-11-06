import { Router } from 'express';
import {
  getAllCategories,
  getCategoriesFlat,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoriesController.js';

const router = Router();

router.get('/tree', getAllCategories);
router.get('/flat', getCategoriesFlat);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;

