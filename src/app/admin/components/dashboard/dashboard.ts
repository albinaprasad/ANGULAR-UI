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

  productsTable: TableDescription | null = null;
  productsData: any[] = [];

  ordersTable: TableDescription | null = null;
  ordersData: any[] = [];

  ngOnInit(): void {
    this.initializeUsersTable();
    this.initializeProductsTable();
    this.initializeOrdersTable();
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
      }
    ];
  }
}
