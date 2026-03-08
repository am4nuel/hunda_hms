'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RecipeIngredients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      menuItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'MenuItems', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      inventoryItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'InventoryItems', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantityRequired: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('RecipeIngredients', ['menuItemId', 'inventoryItemId'], {
      unique: true,
      name: 'recipe_ingredients_menu_item_inventory_item_unique'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RecipeIngredients');
  }
};
