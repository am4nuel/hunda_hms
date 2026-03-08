const { RecipeIngredient, InventoryItem, MenuItem, Unit } = require('../models');

// @desc    Get ingredients for a menu item
// @route   GET /api/recipes/:menuItemId
exports.getRecipeIngredients = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const ingredients = await RecipeIngredient.findAll({
      where: { menuItemId },
      include: [
        { 
          model: InventoryItem, 
          as: 'inventoryItem', 
          attributes: ['name', 'unit', 'currentStock', 'unitId'],
          include: [{ model: Unit, as: 'Unit', attributes: ['name', 'abbreviation'] }]
        },
        {
          model: Unit,
          as: 'Unit',
          attributes: ['name', 'abbreviation']
        }
      ]
    });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or update ingredients for a menu item
// @route   POST /api/recipes/:menuItemId
exports.updateRecipe = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { ingredients } = req.body; // Array of { inventoryItemId, quantityRequired, unit }

    // Start a transaction if needed, but for now simple delete and recreate
    await RecipeIngredient.destroy({ where: { menuItemId } });

    if (ingredients && ingredients.length > 0) {
      const recipeData = ingredients
        .filter(ing => ing.inventoryItemId)
        .map(ing => ({
          menuItemId,
          inventoryItemId: ing.inventoryItemId,
          quantityRequired: ing.quantityRequired,
          unit: ing.unit || '',
          unitId: ing.unitId || null
        }));
      if (recipeData.length > 0) {
        await RecipeIngredient.bulkCreate(recipeData);
      }
    }

    res.json({ message: 'Recipe updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Calculate cost of a recipe
// @route   GET /api/recipes/:menuItemId/cost
exports.getRecipeCost = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const ingredients = await RecipeIngredient.findAll({
      where: { menuItemId },
      include: [{ model: InventoryItem, as: 'inventoryItem', attributes: ['costPrice'] }]
    });

    let totalCost = 0;
    ingredients.forEach(ing => {
      if (ing.inventoryItem) {
        totalCost += parseFloat(ing.quantityRequired) * parseFloat(ing.inventoryItem.costPrice);
      }
    });

    res.json({ menuItemId, totalCost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
