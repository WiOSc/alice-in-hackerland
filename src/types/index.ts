export interface TeamData {
  uid: string;
  role: 'team';
  teamId: string;
  teamName: string;
  email: string;
  password: string;
  points: number;
  qualified: boolean;
  createdAt: Date;
}

export interface ApiEntry {
  id: string;
  api: string;
  apiName: string;
  problemStatement: string;
  createdAt: Date;
}

export interface TicketMessage {
  sender: 'user' | 'admin';
  text: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  teamId: string;
  teamName: string;
  subject: string;
  messages: TicketMessage[];
  status: 'open' | 'closed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}