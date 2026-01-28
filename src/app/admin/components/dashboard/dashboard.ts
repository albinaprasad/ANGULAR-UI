import { Component, OnInit } from '@angular/core';
import { TableDescription } from '../../../shared/components/dynamic-table/dynamic-table';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  usersTable: TableDescription | null = null;
  usersData: any[] = [];
  usersLoading: boolean = false;
  usersPage: number = 1;

  productsTable: TableDescription | null = null;
  productsData: any[] = [];
  productsLoading: boolean = false;
  productsPage: number = 1;

  ordersTable: TableDescription | null = null;
  ordersData: any[] = [];
  ordersLoading: boolean = false;
  ordersPage: number = 1;

  selectedTable: string = 'users';

  ngOnInit(): void {
    this.initializeUsersTable();
    this.initializeProductsTable();
    this.initializeOrdersTable();
  }

  selectTable(tableName: string): void {
    this.selectedTable = tableName;
  }

  getSelectedTableDescription(): TableDescription | null {
    switch (this.selectedTable) {
      case 'users':
        return this.usersTable;
      case 'products':
        return this.productsTable;
      case 'orders':
        return this.ordersTable;
      default:
        return this.usersTable;
    }
  }

  getSelectedTableData(): any[] {
    switch (this.selectedTable) {
      case 'users':
        return this.usersData;
      case 'products':
        return this.productsData;
      case 'orders':
        return this.ordersData;
      default:
        return this.usersData;
    }
  }

  getSelectedTableLoading(): boolean {
    switch (this.selectedTable) {
      case 'users':
        return this.usersLoading;
      case 'products':
        return this.productsLoading;
      case 'orders':
        return this.ordersLoading;
      default:
        return false;
    }
  }

  onLoadMoreData(): void {
    switch (this.selectedTable) {
      case 'users':
        this.loadMoreUsers();
        break;
      case 'products':
        this.loadMoreProducts();
        break;
      case 'orders':
        this.loadMoreOrders();
        break;
    }
  }

  private async loadMoreUsers(): Promise<void> {
    if (this.usersLoading) return;

    this.usersLoading = true;
    this.usersPage++;

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUsers = this.generateMoreUsers();
    this.usersData = [...this.usersData, ...newUsers];
    this.usersLoading = false;
  }

  private async loadMoreProducts(): Promise<void> {
    if (this.productsLoading) return;

    this.productsLoading = true;
    this.productsPage++;

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newProducts = this.generateMoreProducts();
    this.productsData = [...this.productsData, ...newProducts];
    this.productsLoading = false;
  }

  private async loadMoreOrders(): Promise<void> {
    if (this.ordersLoading) return;

    this.ordersLoading = true;
    this.ordersPage++;

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newOrders = this.generateMoreOrders();
    this.ordersData = [...this.ordersData, ...newOrders];
    this.ordersLoading = false;
  }

  private initializeUsersTable(): void {
    this.usersTable = {
      table: 'users',
      columns: [
        { name: 'id', null: false, type: 20 },
        { name: 'email', null: false, type: 1043 },
        { name: 'name', null: false, type: 1043 },
        { name: 'created_at', null: false, type: 1184 },
        { name: 'is_active', null: false, type: 16 }
      ]
    };

    this.usersData = [
      {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        created_at: '2025-01-15 10:30:00',
        is_active: true
      },
      {
        id: 2,
        email: 'jane@example.com',
        name: 'Jane Smith',
        created_at: '2025-01-20 14:15:00',
        is_active: true
      },
      {
        id: 3,
        email: 'bob@example.com',
        name: 'Bob Johnson',
        created_at: '2025-01-22 09:45:00',
        is_active: false
      },
      {
        id: 4,
        email: 'alice@example.com',
        name: 'Alice Brown',
        created_at: '2025-01-24 16:20:00',
        is_active: true
      },
      {
        id: 5,
        email: 'charlie@example.com',
        name: 'Charlie Wilson',
        created_at: '2025-01-25 11:00:00',
        is_active: true
      },
      {
        id: 6,
        email: 'diana@example.com',
        name: 'Diana Davis',
        created_at: '2025-01-26 09:30:00',
        is_active: false
      },
      {
        id: 7,
        email: 'edward@example.com',
        name: 'Edward Miller',
        created_at: '2025-01-27 14:45:00',
        is_active: true
      },
      {
        id: 8,
        email: 'fiona@example.com',
        name: 'Fiona Garcia',
        created_at: '2025-01-28 10:15:00',
        is_active: true
      },
      {
        id: 9,
        email: 'george@example.com',
        name: 'George Harris',
        created_at: '2025-01-29 16:30:00',
        is_active: false
      },
      {
        id: 10,
        email: 'helen@example.com',
        name: 'Helen Clark',
        created_at: '2025-01-30 12:00:00',
        is_active: true
      },
      {
        id: 11,
        email: 'ian@example.com',
        name: 'Ian Lewis',
        created_at: '2025-01-31 08:45:00',
        is_active: true
      },
      {
        id: 12,
        email: 'julia@example.com',
        name: 'Julia Walker',
        created_at: '2025-02-01 13:20:00',
        is_active: false
      },
      {
        id: 13,
        email: 'kevin@example.com',
        name: 'Kevin Hall',
        created_at: '2025-02-02 15:10:00',
        is_active: true
      },
      {
        id: 14,
        email: 'lisa@example.com',
        name: 'Lisa Allen',
        created_at: '2025-02-03 11:25:00',
        is_active: true
      },
      {
        id: 16,
        email: 'nancy@example.com',
        name: 'Nancy King',
        created_at: '2025-02-05 10:30:00',
        is_active: true
      },
      {
        id: 17,
        email: 'oliver@example.com',
        name: 'Oliver Wright',
        created_at: '2025-02-06 14:15:00',
        is_active: false
      },
      {
        id: 18,
        email: 'patricia@example.com',
        name: 'Patricia Lopez',
        created_at: '2025-02-07 09:45:00',
        is_active: true
      },
      {
        id: 19,
        email: 'quentin@example.com',
        name: 'Quentin Hill',
        created_at: '2025-02-08 16:20:00',
        is_active: true
      },
      {
        id: 20,
        email: 'rachel@example.com',
        name: 'Rachel Green',
        created_at: '2025-02-09 11:00:00',
        is_active: true
      },
      {
        id: 21,
        email: 'steven@example.com',
        name: 'Steven Adams',
        created_at: '2025-02-10 13:30:00',
        is_active: false
      },
      {
        id: 22,
        email: 'tina@example.com',
        name: 'Tina Baker',
        created_at: '2025-02-11 08:45:00',
        is_active: true
      },
      {
        id: 23,
        email: 'ursula@example.com',
        name: 'Ursula Carter',
        created_at: '2025-02-12 15:20:00',
        is_active: true
      },
      {
        id: 24,
        email: 'victor@example.com',
        name: 'Victor Davis',
        created_at: '2025-02-13 10:10:00',
        is_active: true
      },
      {
        id: 25,
        email: 'wendy@example.com',
        name: 'Wendy Evans',
        created_at: '2025-02-14 12:25:00',
        is_active: false
      }
    ];
  }

  private initializeProductsTable(): void {
    this.productsTable = {
      table: 'products',
      columns: [
        { name: 'id', null: false, type: 20 },
        { name: 'name', null: false, type: 1043 },
        { name: 'price', null: false, type: 1700 },
        { name: 'stock', null: false, type: 20 },
        { name: 'description', null: true, type: 1043 }
      ]
    };

    this.productsData = [
      {
        id: 101,
        name: 'Laptop Pro',
        price: '1299.99',
        stock: 45,
        description: 'High-performance laptop for professionals'
      },
      {
        id: 102,
        name: 'Wireless Mouse',
        price: '29.99',
        stock: 250,
        description: 'Ergonomic wireless mouse with long battery life'
      },
      {
        id: 103,
        name: 'USB-C Cable',
        price: '12.99',
        stock: 500,
        description: null
      },
      {
        id: 104,
        name: 'Mechanical Keyboard',
        price: '149.99',
        stock: 120,
        description: 'RGB backlit mechanical keyboard for gaming'
      },
      {
        id: 105,
        name: '4K Monitor',
        price: '599.99',
        stock: 30,
        description: 'Ultra-high definition 4K display monitor'
      },
      {
        id: 106,
        name: 'Bluetooth Headphones',
        price: '89.99',
        stock: 180,
        description: 'Noise-cancelling wireless headphones'
      },
      {
        id: 107,
        name: 'External SSD',
        price: '199.99',
        stock: 85,
        description: '1TB portable solid state drive'
      },
      {
        id: 108,
        name: 'Webcam HD',
        price: '79.99',
        stock: 95,
        description: '1080p webcam with auto-focus'
      },
      {
        id: 109,
        name: 'Gaming Chair',
        price: '349.99',
        stock: 25,
        description: 'Ergonomic gaming chair with lumbar support'
      },
      {
        id: 110,
        name: 'Router WiFi 6',
        price: '249.99',
        stock: 40,
        description: 'Next-generation wireless router'
      },
      {
        id: 111,
        name: 'Smartphone Case',
        price: '24.99',
        stock: 300,
        description: 'Protective case with screen protector'
      },
      {
        id: 113,
        name: 'Wireless Router',
        price: '179.99',
        stock: 75,
        description: 'Dual-band wireless router with 4 antennas'
      },
      {
        id: 114,
        name: 'USB Flash Drive',
        price: '19.99',
        stock: 400,
        description: '32GB USB 3.0 flash drive'
      },
      {
        id: 115,
        name: 'Bluetooth Keyboard',
        price: '69.99',
        stock: 120,
        description: 'Slim wireless keyboard with backlit keys'
      },
      {
        id: 116,
        name: 'Power Strip',
        price: '34.99',
        stock: 200,
        description: '8-outlet surge protector power strip'
      },
      {
        id: 117,
        name: 'HDMI Cable',
        price: '14.99',
        stock: 350,
        description: '6ft 4K HDMI cable with gold connectors'
      },
      {
        id: 118,
        name: 'Laptop Stand',
        price: '49.99',
        stock: 90,
        description: 'Adjustable aluminum laptop stand'
      },
      {
        id: 119,
        name: 'Webcam Cover',
        price: '7.99',
        stock: 500,
        description: 'Privacy slider for laptop webcam'
      },
      {
        id: 120,
        name: 'Screen Cleaner Kit',
        price: '12.99',
        stock: 250,
        description: 'LCD screen cleaning kit with microfiber cloth'
      }
    ];
  }

  private initializeOrdersTable(): void {
    this.ordersTable = {
      table: 'orders',
      columns: [
        { name: 'order_id', null: false, type: 20 },
        { name: 'user_id', null: false, type: 20 },
        { name: 'total_amount', null: false, type: 1700 },
        { name: 'status', null: false, type: 1043 },
        { name: 'order_date', null: false, type: 1184 }
      ]
    };

    this.ordersData = [
      {
        order_id: 5001,
        user_id: 1,
        total_amount: '1329.98',
        status: 'completed',
        order_date: '2025-01-25 11:30:00'
      },
      {
        order_id: 5002,
        user_id: 2,
        total_amount: '159.97',
        status: 'pending',
        order_date: '2025-01-26 14:20:00'
      },
      {
        order_id: 5003,
        user_id: 4,
        total_amount: '749.98',
        status: 'shipped',
        order_date: '2025-01-24 09:15:00'
      },
      {
        order_id: 5004,
        user_id: 1,
        total_amount: '42.98',
        status: 'completed',
        order_date: '2025-01-23 15:45:00'
      },
      {
        order_id: 5005,
        user_id: 3,
        total_amount: '299.99',
        status: 'processing',
        order_date: '2025-01-27 10:00:00'
      },
      {
        order_id: 5006,
        user_id: 5,
        total_amount: '89.97',
        status: 'completed',
        order_date: '2025-01-28 16:30:00'
      },
      {
        order_id: 5007,
        user_id: 2,
        total_amount: '1249.98',
        status: 'shipped',
        order_date: '2025-01-29 12:15:00'
      },
      {
        order_id: 5008,
        user_id: 6,
        total_amount: '49.99',
        status: 'pending',
        order_date: '2025-01-30 09:45:00'
      },
      {
        order_id: 5009,
        user_id: 4,
        total_amount: '679.97',
        status: 'completed',
        order_date: '2025-01-31 14:20:00'
      },
      {
        order_id: 5010,
        user_id: 7,
        total_amount: '199.99',
        status: 'processing',
        order_date: '2025-02-01 11:10:00'
      },
      {
        order_id: 5011,
        user_id: 8,
        total_amount: '349.98',
        status: 'shipped',
        order_date: '2025-02-02 13:25:00'
      },
      {
        order_id: 5013,
        user_id: 9,
        total_amount: '129.98',
        status: 'pending',
        order_date: '2025-02-04 10:55:00'
      },
      {
        order_id: 5014,
        user_id: 10,
        total_amount: '459.97',
        status: 'completed',
        order_date: '2025-02-05 14:30:00'
      },
      {
        order_id: 5015,
        user_id: 6,
        total_amount: '89.99',
        status: 'shipped',
        order_date: '2025-02-06 11:45:00'
      },
      {
        order_id: 5016,
        user_id: 11,
        total_amount: '234.98',
        status: 'processing',
        order_date: '2025-02-07 16:15:00'
      },
      {
        order_id: 5017,
        user_id: 12,
        total_amount: '1499.99',
        status: 'completed',
        order_date: '2025-02-08 09:20:00'
      },
      {
        order_id: 5018,
        user_id: 8,
        total_amount: '67.98',
        status: 'pending',
        order_date: '2025-02-09 13:40:00'
      },
      {
        order_id: 5019,
        user_id: 13,
        total_amount: '789.97',
        status: 'shipped',
        order_date: '2025-02-10 15:25:00'
      },
      {
        order_id: 5020,
        user_id: 14,
        total_amount: '299.99',
        status: 'completed',
        order_date: '2025-02-11 12:10:00'
      }
    ];
  }

  private generateMoreUsers(): any[] {
    const names = ['Alice Johnson', 'Bob Wilson', 'Charlie Davis', 'Diana Evans', 'Edward Frank', 'Fiona Garcia', 'George Harris', 'Helen Ingram'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];

    const newUsers = [];
    const startId = this.usersData.length + 1;

    for (let i = 0; i < 10; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const email = `${name.toLowerCase().replace(' ', '.')}@${domain}`;
      const created_at = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

      newUsers.push({
        id: startId + i,
        email: email,
        name: name,
        created_at: created_at,
        is_active: Math.random() > 0.3
      });
    }

    return newUsers;
  }

  private generateMoreProducts(): any[] {
    const productNames = [
      'Gaming Headset', 'Bluetooth Speaker', 'Smart Watch', 'Tablet Case', 'Power Bank',
      'Webcam', 'Microphone', 'Graphics Card', 'SSD Drive', 'Router'
    ];
    const descriptions = [
      'High-quality audio equipment', 'Wireless connectivity device', 'Wearable technology', 'Protective accessory',
      'Portable power solution', 'Video capture device', 'Audio recording equipment', 'Performance hardware',
      'Storage solution', 'Network device'
    ];

    const newProducts = [];
    const startId = 100 + this.productsData.length + 1;

    for (let i = 0; i < 10; i++) {
      const name = productNames[Math.floor(Math.random() * productNames.length)];
      const price = (Math.random() * 500 + 10).toFixed(2);
      const stock = Math.floor(Math.random() * 200) + 10;
      const description = Math.random() > 0.3 ? descriptions[Math.floor(Math.random() * descriptions.length)] : null;

      newProducts.push({
        id: startId + i,
        name: name,
        price: price,
        stock: stock,
        description: description
      });
    }

    return newProducts;
  }

  private generateMoreOrders(): any[] {
    const statuses = ['pending', 'completed', 'shipped', 'cancelled'];

    const newOrders = [];
    const startOrderId = 5000 + this.ordersData.length + 1;

    for (let i = 0; i < 10; i++) {
      const user_id = Math.floor(Math.random() * 10) + 1;
      const total_amount = (Math.random() * 1000 + 50).toFixed(2);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const order_date = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

      newOrders.push({
        order_id: startOrderId + i,
        user_id: user_id,
        total_amount: total_amount,
        status: status,
        order_date: order_date
      });
    }

    return newOrders;
  }
}
