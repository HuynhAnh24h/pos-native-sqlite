// src/database/seedMenu.js
import { MenuModel } from '../models/MenuModel';

export async function seedMenuData() {
  try {
    const existingItems = MenuModel.findAll();
    if (existingItems.length > 0) {
      console.log('ℹ️  Menu data already exists');
      return;
    }

    console.log('🌱 Seeding menu data...');

    const sampleMenu = [
      // Đồ ăn
      {
        name: 'Khoai tây chiên',
        description: 'Khoai tây chiên giòn, ăn kèm sốt',
        price: 35000,
        category: 'do-an',
        imageUrl: 'https://via.placeholder.com/400x300/FFB84D/ffffff?text=Khoai+Tay+Chien',
        isAvailable: 1
      },
      {
        name: 'Gà rán',
        description: 'Gà rán giòn tan, thơm ngon',
        price: 45000,
        category: 'do-an',
        imageUrl: 'https://via.placeholder.com/400x300/FF6B6B/ffffff?text=Ga+Ran',
        isAvailable: 1
      },
      {
        name: 'Mì xào hải sản',
        description: 'Mì xào hải sản tươi ngon',
        price: 55000,
        category: 'do-an',
        imageUrl: 'https://via.placeholder.com/400x300/4ECDC4/ffffff?text=Mi+Xao',
        isAvailable: 1
      },
      {
        name: 'Cơm chiên dương châu',
        description: 'Cơm chiên thập cẩm đầy đủ topping',
        price: 50000,
        category: 'do-an',
        imageUrl: 'https://via.placeholder.com/400x300/95E1D3/ffffff?text=Com+Chien',
        isAvailable: 1
      },

      // Đồ uống
      {
        name: 'Coca Cola',
        description: 'Coca Cola lon 330ml',
        price: 15000,
        category: 'do-uong',
        imageUrl: 'https://via.placeholder.com/400x300/E53935/ffffff?text=Coca+Cola',
        isAvailable: 1
      },
      {
        name: 'Pepsi',
        description: 'Pepsi lon 330ml',
        price: 15000,
        category: 'do-uong',
        imageUrl: 'https://via.placeholder.com/400x300/1565C0/ffffff?text=Pepsi',
        isAvailable: 1
      },
      {
        name: 'Nước cam ép',
        description: 'Nước cam tươi ép 100%',
        price: 25000,
        category: 'do-uong',
        imageUrl: 'https://via.placeholder.com/400x300/FF9800/ffffff?text=Nuoc+Cam',
        isAvailable: 1
      },
      {
        name: 'Trà đào',
        description: 'Trà đào cam sả',
        price: 30000,
        category: 'do-uong',
        imageUrl: 'https://via.placeholder.com/400x300/FFA726/ffffff?text=Tra+Dao',
        isAvailable: 1
      },

      // Trái cây
      {
        name: 'Dĩa trái cây',
        description: 'Dĩa trái cây tươi tổng hợp',
        price: 60000,
        category: 'trai-cay',
        imageUrl: 'https://via.placeholder.com/400x300/66BB6A/ffffff?text=Trai+Cay',
        isAvailable: 1
      },
      {
        name: 'Dưa hấu',
        description: 'Dưa hấu đỏ ngọt mát',
        price: 40000,
        category: 'trai-cay',
        imageUrl: 'https://via.placeholder.com/400x300/EF5350/ffffff?text=Dua+Hau',
        isAvailable: 1
      },

      // Bia rượu
      {
        name: 'Heineken',
        description: 'Bia Heineken chai 330ml',
        price: 25000,
        category: 'bia-ruou',
        imageUrl: 'https://via.placeholder.com/400x300/00796B/ffffff?text=Heineken',
        isAvailable: 1
      },
      {
        name: 'Tiger',
        description: 'Bia Tiger lon 330ml',
        price: 22000,
        category: 'bia-ruou',
        imageUrl: 'https://via.placeholder.com/400x300/FF6F00/ffffff?text=Tiger',
        isAvailable: 1
      },
      {
        name: 'Rượu Vodka',
        description: 'Vodka Nga 500ml',
        price: 350000,
        category: 'bia-ruou',
        imageUrl: 'https://via.placeholder.com/400x300/37474F/ffffff?text=Vodka',
        isAvailable: 1
      },

      // Snack
      {
        name: 'Snack O\'Star',
        description: 'Snack khoai tây vị phô mai',
        price: 15000,
        category: 'snack',
        imageUrl: 'https://via.placeholder.com/400x300/FDD835/ffffff?text=Snack',
        isAvailable: 1
      },
      {
        name: 'Hạt điều rang muối',
        description: 'Hạt điều rang muối thơm ngon',
        price: 25000,
        category: 'snack',
        imageUrl: 'https://via.placeholder.com/400x300/A1887F/ffffff?text=Hat+Dieu',
        isAvailable: 1
      }
    ];

    for (const item of sampleMenu) {
      MenuModel.create(item);
    }

    console.log(`✅ Seeded ${sampleMenu.length} menu items`);
  } catch (error) {
    console.error('❌ Failed to seed menu data:', error);
  }
}