export type TravelType = '飞机' | '火车' | '汽车' | '地铁' | '打车' | '其他';
export type TravelStatus = '待预订' | '已预订' | '已完成' | '已取消';
export type AccommodationType = '酒店' | '民宿' | '公寓' | '亲友家' | '其他';
export type AccommodationStatus = '待预订' | '已预订' | '已入住' | '已退房' | '已取消';

export interface Travel {
  id: string;
  type: TravelType;
  departure: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber?: string;
  cost: number;
  status: TravelStatus;
  notes?: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: AccommodationType;
  address: string;
  checkInDate: string;
  checkOutDate: string;
  nightlyRate: number;
  totalCost: number;
  confirmationNumber?: string;
  status: AccommodationStatus;
  notes?: string;
}

export interface TravelStats {
  totalTravelCost: number;
  totalAccommodationCost: number;
  totalCost: number;
  totalNights: number;
}

export interface Reminder {
  id: string;
  type: 'travel' | 'accommodation' | 'treatment';
  title: string;
  date: string;
  daysLeft: number;
  description: string;
}
