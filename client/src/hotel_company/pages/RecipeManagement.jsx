import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight,
  Calculator,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import * as api from '@/api';
import { toast } from 'sonner';

/*
### Debugging & Precision Improvements
- **Order Status Fix**: Resolved the 400 Bad Request error when accepting orders by adding the missing `Unit` model to the `OrderController`.
- **High-Precision Stock**: Upgraded the inventory stock system from whole numbers to decimals (e.g., handles 1.5 kg or 0.25 L). This ensures that automatic deductions for small recipe amounts are perfectly accurate.
- **Improved Validation**: Enhanced the logic that checks for stock during the "Accept" step to be more robust across different unit categories.

## Verification Checklist

- [x] Order status "In Progress" (Accept) now works without 400 errors.
- [x] Inventory stock columns converted to `DECIMAL` in the database.
- [x] Fractional stock deductions (e.g., Grams from Kilograms) verified in history.
- [x] Automatic deduction logic correctly includes unit conversion factors.
*/

const RecipeManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [costInfo, setCostInfo] = useState(null);

  const hotelId = JSON.parse(localStorage.getItem('profile'))?.user?.hotelId;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, invRes, unitRes] = await Promise.all([
        api.fetchMenuItems(),
        api.fetchInventoryItems(hotelId),
        api.fetchUnits(hotelId)
      ]);
      setMenuItems(menuRes.data);
      setInventoryItems(invRes.data);
      setUnits(unitRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    try {
      const res = await api.fetchRecipeIngredients(item.id);
      setRecipeIngredients(res.data.map(ing => ({
        inventoryItemId: ing.inventoryItemId,
        quantityRequired: ing.quantityRequired,
        unit: ing.unit,
        unitId: ing.unitId,
        name: ing.inventoryItem?.name
      })));
      
      const costRes = await api.fetchRecipeCost(item.id);
      setCostInfo(costRes.data);
    } catch (error) {
      setRecipeIngredients([]);
      setCostInfo(null);
    }
  };

  const addIngredientRow = () => {
    setRecipeIngredients([...recipeIngredients, { inventoryItemId: '', quantityRequired: 1, unit: '', unitId: '', name: '' }]);
  };

  const removeIngredientRow = (index) => {
    const newIngs = [...recipeIngredients];
    newIngs.splice(index, 1);
    setRecipeIngredients(newIngs);
  };

  const handleIngChange = (index, field, value) => {
    const newIngs = [...recipeIngredients];
    if (field === 'inventoryItemId') {
      const invItem = inventoryItems.find(i => i.id === parseInt(value));
      newIngs[index] = { 
        ...newIngs[index], 
        inventoryItemId: value, 
        unitId: invItem?.unitId || '',
        unit: invItem?.Unit?.name || invItem?.unit || '',
        name: invItem?.name || ''
      };
    } else if (field === 'unitId') {
      const selectedUnit = units.find(u => u.id === parseInt(value));
      newIngs[index].unitId = value;
      newIngs[index].unit = selectedUnit?.name || '';
    } else {
      newIngs[index][field] = value;
    }
    setRecipeIngredients(newIngs);
  };

  const handleSaveRecipe = async () => {
    try {
      if (!selectedItem) return;
      await api.updateRecipe(selectedItem.id, { ingredients: recipeIngredients });
      toast.success('Recipe saved successfully');
      handleSelectItem(selectedItem); // Refresh cost
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  };

  const filteredMenuItems = menuItems.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.MenuCategory?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--theme-header-bg)] p-6 rounded-2xl border-none">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Recipe <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">
            Engineered taste & precise cost control
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Items List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-[var(--theme-header-bg)] p-4 rounded-2xl shadow-sm border border-[var(--border)]/10">
          <h2 className="text-xl font-bold uppercase tracking-tighter italic mb-4">Recipes / Menu Items</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search dishes..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-250px)]">
          {filteredMenuItems.map(item => (
            <div 
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${selectedItem?.id === item.id ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--theme-header-bg)] hover:bg-[var(--theme-primary)]/10 text-[var(--theme-text)]'}`}
            >
              <div className="flex items-center gap-3">
                <Utensils className={`h-5 w-5 ${selectedItem?.id === item.id ? 'text-white' : 'text-[var(--theme-primary)]'}`} />
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className={`text-[10px] uppercase tracking-widest opacity-60 ${selectedItem?.id === item.id ? 'text-white' : ''}`}>
                    {item.MenuCategory?.name || 'Uncategorized'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${selectedItem?.id === item.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Editor */}
      <div className="lg:col-span-2">
        {selectedItem ? (
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-header-bg)] h-full">
            <CardHeader className="border-b border-[var(--border)]/10 bg-[var(--theme-bg)]/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold italic uppercase tracking-tighter">{selectedItem.name}</CardTitle>
                  <p className="text-sm opacity-60">Manage ingredients and preparation costs</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl border-[var(--theme-primary)]/20 text-[var(--theme-primary)]" onClick={addIngredientRow}>
                    <Plus className="h-4 w-4 mr-2" /> Add Ingredient
                  </Button>
                  <Button className="bg-[var(--theme-primary)] text-white rounded-xl px-6" onClick={handleSaveRecipe}>
                    <Save className="h-4 w-4 mr-2" /> Save Recipe
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[var(--theme-bg)]/50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Menu Price</p>
                    <p className="text-lg font-bold">ETB {selectedItem.price}</p>
                  </div>
                </div>
                <div className="bg-[var(--theme-bg)]/50 p-4 rounded-2xl flex items-center gap-4 border border-[var(--theme-primary)]/10">
                  <div className="h-10 w-10 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-xl flex items-center justify-center">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Recipe Cost</p>
                    <p className="text-lg font-bold">ETB {costInfo?.totalCost || '0.00'}</p>
                  </div>
                </div>
                <div className="bg-[var(--theme-bg)]/50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Profit Margin</p>
                    <p className="text-lg font-bold text-green-500">
                      {costInfo ? (((selectedItem.price - costInfo.totalCost) / selectedItem.price) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Ingredients Selection</h4>
                {recipeIngredients.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-[var(--border)]/10 rounded-2xl">
                    <p className="text-sm opacity-40 font-semibold uppercase italic">No ingredients defined for this recipe yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recipeIngredients.map((ing, index) => (
                      <div key={index} className="flex gap-4 items-end bg-[var(--theme-bg)]/10 p-4 rounded-2xl group border border-[var(--border)]/5">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold uppercase opacity-40 ml-1 leading-none">Ingredient</label>
                          <select 
                            className="w-full h-11 px-3 bg-[var(--theme-bg)]/20 rounded-xl text-sm outline-none border border-[var(--border)]/10 focus:border-[var(--theme-primary)]"
                            value={ing.inventoryItemId}
                            onChange={(e) => handleIngChange(index, 'inventoryItemId', e.target.value)}
                          >
                            <option value="">Select Asset...</option>
                            {inventoryItems.map(inv => (
                              <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit || inv.Unit?.abbreviation || inv.Unit?.name}) - {inv.currentStock} in stock</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32 space-y-1">
                          <label className="text-[9px] font-bold uppercase opacity-40 ml-1 leading-none">Qty Required</label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            value={ing.quantityRequired} 
                            onChange={(e) => handleIngChange(index, 'quantityRequired', e.target.value)}
                            className="h-11 rounded-xl border-[var(--border)]/10 bg-[var(--theme-bg)]/20"
                          />
                        </div>
                        <div className="w-40 space-y-1">
                          <label className="text-[9px] font-bold uppercase opacity-40 ml-1 leading-none">Unit</label>
                          <select 
                            className="w-full h-11 px-3 bg-[var(--theme-bg)]/20 rounded-xl text-xs outline-none border border-[var(--border)]/10 focus:border-[var(--theme-primary)] uppercase font-semibold"
                            value={ing.unitId}
                            onChange={(e) => handleIngChange(index, 'unitId', e.target.value)}
                          >
                            <option value="">Select Unit...</option>
                            {Object.entries(
                              units.reduce((acc, unit) => {
                                (acc[unit.category] = acc[unit.category] || []).push(unit);
                                return acc;
                              }, {})
                            ).map(([category, catUnits]) => (
                              <optgroup key={category} label={category.toUpperCase()} className="bg-[var(--theme-bg)] text-[var(--theme-text)]">
                                {catUnits.map(u => (
                                  <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-11 w-11 rounded-xl text-red-500 hover:bg-red-50"
                          onClick={() => removeIngredientRow(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40 bg-[var(--theme-header-bg)] rounded-2xl border-2 border-dashed border-[var(--border)]/10 min-h-[500px]">
            <Utensils className="h-16 w-16 mb-4 opacity-10" />
            <p className="text-lg font-bold uppercase italic tracking-widest">Select a menu item to manage its recipe</p>
            <p className="text-xs mt-2 uppercase tracking-tight">Recipes automatically deduct stock when prepared.</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default RecipeManagement;
