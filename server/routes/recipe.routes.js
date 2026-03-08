const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/:menuItemId', verifyToken, recipeController.getRecipeIngredients);
router.post('/:menuItemId', verifyToken, recipeController.updateRecipe);
router.get('/:menuItemId/cost', verifyToken, recipeController.getRecipeCost);

module.exports = router;
