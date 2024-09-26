export interface Order {
  id: number;
  name: string;
  amount: number;
  paid: boolean;
  created_at: string;
  receiver: string;
  classroom_id: number;
  items: Item[];
  classroom: Classroom;
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
