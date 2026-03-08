import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Utensils, 
  Coffee, 
  Beer, 
  Pizza,
  CheckCircle2, 
  XCircle, 
  X,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Layers,
  Tag
} from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as api from '@/api';
import { toast } from 'sonner';

const MenuManagement = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    availability: true,
    image: '',
    inventoryItemId: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const hostProfile = JSON.parse(localStorage.getItem('profile') || '{}');
      const hotelId = hostProfile.user?.hotelId;

      const [categoriesRes, itemsRes, invRes] = await Promise.all([
        api.fetchMenuCategories(),
        api.fetchMenuItems(),
        hotelId ? api.fetchInventoryItems(hotelId) : Promise.resolve({ data: [] })
      ]);
      setCategories(categoriesRes.data);
      setMenuItems(itemsRes.data);
      setInventoryItems(invRes.data);
    } catch (error) {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateMenuCategory(editingCategory.id, categoryFormData);
        toast.success('Category updated');
      } else {
        await api.createMenuCategory(categoryFormData);
        toast.success('Category created');
      }
      setIsCategoryModalOpen(false);
      loadAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, itemFormData);
        toast.success('Menu item updated');
      } else {
        await api.createMenuItem(itemFormData);
        toast.success('Menu item added');
      }
      setIsItemModalOpen(false);
      loadAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('images', file);
    try {
      toast.loading('Uploading image...');
      const { data } = await api.uploadImages(formData);
      setItemFormData(prev => ({ ...prev, image: data.urls[0] }));
      toast.dismiss();
      toast.success('Image uploaded');
    } catch (error) {
      toast.dismiss();
      toast.error('Upload failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete category? Items in this category will become uncategorized.')) {
      try {
        await api.deleteMenuCategory(id);
        toast.success('Category deleted');
        loadAllData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Delete this menu item?')) {
      try {
        await api.deleteMenuItem(id);
        toast.success('Item removed');
        loadAllData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredItems = menuItems.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.MenuCategory?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Menu <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Configure dishes, categories & pricing</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search dishes or categories..." 
              className="pl-10 h-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              if (activeTab === 'categories') {
                setEditingCategory(null);
                setCategoryFormData({ name: '', description: '' });
                setIsCategoryModalOpen(true);
              } else {
                setEditingItem(null);
                setItemFormData({ name: '', description: '', price: '', categoryId: '', availability: true, image: '', inventoryItemId: '' });
                setIsItemModalOpen(true);
              }
            }}
            className="bg-[var(--theme-primary)] hover:opacity-90 flex items-center gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" /> {activeTab === 'categories' ? 'New Category' : 'Add Item'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="items" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-[var(--theme-header-bg)] p-1 rounded-xl shadow-sm border-none flex w-fit mb-6">
          <TabsTrigger value="items" className="rounded-xl px-8 py-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all font-normal uppercase tracking-widest text-[10px]">
            Live Menu
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-8 py-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all font-normal uppercase tracking-widest text-[10px]">
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all border-none shadow-sm rounded-xl overflow-hidden bg-[var(--theme-header-bg)] text-[var(--theme-text)]">
                  <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                    {item.image ? (
                      <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                        <ImageIcon className="h-10 w-10 opacity-20" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-20">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg shadow-lg" onClick={() => {
                        setEditingItem(item);
                        setItemFormData({ ...item });
                        setIsItemModalOpen(true);
                      }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg shadow-lg" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    {!item.availability && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-semibold px-4 py-1.5 rounded-full shadow-xl uppercase tracking-widest">Currently Unavailable</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-normal italic truncate flex-1">{item.name}</h3>
                      <span className="text-md font-semibold text-[var(--theme-primary)] ml-4">ETB {item.price}</span>
                    </div>
                    <p className="text-xs opacity-60 line-clamp-2 mb-4 h-8">{item.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-normal py-1 bg-[var(--theme-bg)]">
                        <Tag className="h-3 w-3 mr-1 opacity-40" /> {item.MenuCategory?.name || 'Uncategorized'}
                      </Badge>
                      {item.availability && (
                        <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] font-semibold uppercase tracking-tighter">Available</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredItems.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-40 flex flex-col items-center gap-4">
                  <Utensils className="h-12 w-12" />
                  <p className="text-xs font-semibold uppercase tracking-widest">No menu items found</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCategories.map((cat) => (
              <Card key={cat.id} className="group hover:shadow-md transition-all border-none shadow-sm rounded-xl bg-[var(--theme-header-bg)] text-[var(--theme-text)]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[var(--theme-primary)]/10 rounded-xl"><Layers className="h-5 w-5 text-[var(--theme-primary)]" /></div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setEditingCategory(cat);
                        setCategoryFormData({ name: cat.name, description: cat.description || '' });
                        setIsCategoryModalOpen(true);
                      }}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <h3 className="font-normal text-sm truncate">{cat.name}</h3>
                  <p className="text-[10px] opacity-60 mt-1 line-clamp-1">{cat.description || 'No description'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- Modals --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-[var(--border)]/10 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-semibold text-gray-900 italic uppercase">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-8 space-y-4 text-black">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase text-gray-400">Category Name</label>
                <Input required value={categoryFormData.name} onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase text-gray-400">Description</label>
                <Input value={categoryFormData.description} onChange={e => setCategoryFormData({...categoryFormData, description: e.target.value})} />
              </div>
              <Button type="submit" className="w-full h-12 bg-black text-white font-semibold uppercase tracking-widest mt-4 rounded-xl">
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-[var(--border)]/10 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-gray-900 italic uppercase text-black">{editingItem ? 'Edit Dish' : 'New Dish Entry'}</h2>
              <button onClick={() => setIsItemModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleItemSubmit} className="p-8 space-y-5 overflow-y-auto text-black">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Dish Name</label>
                  <Input required value={itemFormData.name} onChange={e => setItemFormData({...itemFormData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Base Price (ETB)</label>
                  <Input type="number" step="0.01" required value={itemFormData.price} onChange={e => setItemFormData({...itemFormData, price: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Category</label>
                  <select 
                    className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none border" 
                    value={itemFormData.categoryId} 
                    onChange={e => setItemFormData({...itemFormData, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Visibility Status</label>
                  <select 
                    className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none border" 
                    value={itemFormData.availability} 
                    onChange={e => setItemFormData({...itemFormData, availability: e.target.value === 'true'})}
                  >
                    <option value="true">Available</option>
                    <option value="false">Sold Out / Hidden</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Description</label>
                  <Input value={itemFormData.description || ''} onChange={e => setItemFormData({...itemFormData, description: e.target.value})} placeholder="Ingredients..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400 font-bold decoration-[var(--theme-primary)]">Link to Inventory (Automatic Stock)</label>
                  <select 
                    className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none border border-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)]" 
                    value={itemFormData.inventoryItemId || ''} 
                    onChange={e => setItemFormData({...itemFormData, inventoryItemId: e.target.value})}
                  >
                    <option value="">No Inventory Link</option>
                    {inventoryItems.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.name} ({inv.currentStock} {inv.unit} left)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-semibold uppercase text-gray-400">Food Photography</label>
                {!itemFormData.image ? (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-100/50 rounded-xl bg-gray-50/50 group cursor-pointer hover:bg-gray-100/50 transition-colors">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <ImageIcon className="h-10 w-10 text-gray-200 group-hover:scale-110 transition-transform" />
                    <span className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-gray-300">Click to upload photo</span>
                  </label>
                ) : (
                  <div className="relative h-48 rounded-xl overflow-hidden group border-4 border-white shadow-xl">
                    <img src={`http://localhost:5000${itemFormData.image}`} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-black text-[10px] font-semibold px-6 py-2 rounded-full uppercase tracking-tighter shadow-xl hover:scale-105 active:scale-95 transition-transform">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        Change Photo
                      </label>
                    </div>
                    <button type="button" onClick={() => setItemFormData({...itemFormData, image: ''})} className="absolute top-4 right-4 h-8 w-8 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-black/80"><X className="h-4 w-4" /></button>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-14 bg-black text-white font-semibold uppercase tracking-widest mt-4 rounded-2xl shadow-xl active:scale-95 transition-transform">
                {editingItem ? 'Update Dish' : 'Save Dish to Menu'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
