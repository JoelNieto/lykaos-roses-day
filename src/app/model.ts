export interface Order {
  id: number;
  name: string;
  amount: number;
  paid: boolean;
  created_at: string;
  receiver: string;
  classroom_id: number;
  items: OrderItem[];
  classroom: Classroom;
  message: string;
  delivered: boolean;
  receipt_url: string;
}

export interface OrderItem {
  item: Item;
  item_id: number;
  order_id: number;
  quantity: number;
  created_at: string;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  bundle: boolean;
  created_at: string;
  description: string;
}

export interface Classroom {
  id: number;
  name: string;
  created_at: string;
}
