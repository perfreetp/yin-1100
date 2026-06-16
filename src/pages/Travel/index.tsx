import { useState, useMemo } from 'react';
import { 
  Plus, Car, Plane, Train, Hotel, MapPin, Calendar, 
  Edit2, Trash2, Bell, AlertCircle, CheckCircle, Clock,
  DollarSign, Wand2
} from 'lucide-react';
import { useTravelStore } from '@/store/useTravelStore';
import { useLeaveStore } from '@/store/useLeaveStore';
import { formatMoney, formatDisplayDate, getDaysDiff, getDaysFromNow, isPast } from '@/utils/date';
import type { TravelType, AccommodationType } from '@/types/travel';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Timeline from '@/components/ui/Timeline';
import EmptyState from '@/components/ui/EmptyState';

const TRAVEL_ICONS: Record<TravelType, React.ReactNode> = {
  '飞机': <Plane className="w-4 h-4" />,
  '火车': <Train className="w-4 h-4" />,
  '汽车': <Car className="w-4 h-4" />,
  '地铁': <Train className="w-4 h-4" />,
  '打车': <Car className="w-4 h-4" />,
  '其他': <Car className="w-4 h-4" />,
};

const HOTEL_ICONS: Record<AccommodationType, React.ReactNode> = {
  '酒店': <Hotel className="w-4 h-4" />,
  '民宿': <Hotel className="w-4 h-4" />,
  '公寓': <Hotel className="w-4 h-4" />,
  '亲友家': <Hotel className="w-4 h-4" />,
  '其他': <Hotel className="w-4 h-4" />,
};

const TRAVEL_STATUS = {
  '已预订': 'success',
  '待预订': 'warning',
  '已完成': 'default',
  '已取消': 'danger',
} as const;

const HOTEL_STATUS = {
  '已预订': 'success',
  '待预订': 'warning',
  '已入住': 'accent',
  '已退房': 'default',
  '已取消': 'danger',
} as const;

export default function TravelPage() {
  const { travels, accommodations, addTravel, updateTravel, deleteTravel, addAccommodation, updateAccommodation, deleteAccommodation, getStats } = useTravelStore();
  const { treatmentDates } = useLeaveStore();
  
  const [travelModalOpen, setTravelModalOpen] = useState(false);
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<string | null>(null);
  const [editingHotel, setEditingHotel] = useState<string | null>(null);
  const [selectedTreatmentDate, setSelectedTreatmentDate] = useState<typeof treatmentDates[0] | null>(null);
  
  const [generateForm, setGenerateForm] = useState({
    departure: '北京',
    destination: '天津',
    daysBefore: 1,
    nights: 3,
    travelType: '火车' as TravelType,
    accommodationType: '酒店' as AccommodationType,
  });
  
  const [travelForm, setTravelForm] = useState({
    type: '火车' as TravelType,
    departure: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '08:00',
    arrivalDate: new Date().toISOString().split('T')[0],
    arrivalTime: '12:00',
    flightNumber: '',
    cost: '',
    status: '待预订' as '已预订' | '待预订' | '已完成' | '已取消',
    notes: '',
  });
  
  const [hotelForm, setHotelForm] = useState({
    name: '',
    type: '酒店' as AccommodationType,
    address: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date().toISOString().split('T')[0],
    nightlyRate: '',
    totalCost: '',
    confirmationNumber: '',
    status: '待预订' as '已预订' | '待预订' | '已入住' | '已退房' | '已取消',
    notes: '',
  });

  const stats = useMemo(() => getStats(), [travels, accommodations]);
  
  const upcomingTravels = useMemo(() => 
    travels
      .filter(t => !isPast(t.departureDate) && t.status !== '已取消')
      .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
      .slice(0, 5),
  [travels]);
  
  const upcomingHotels = useMemo(() => 
    accommodations
      .filter(h => !isPast(h.checkInDate) && h.status !== '已取消')
      .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate))
      .slice(0, 5),
  [accommodations]);

  const urgentReminders = useMemo(() => {
    const reminders: Array<{ id: string; type: 'travel' | 'hotel'; message: string; days: number; level: 'danger' | 'warning' | 'info' }> = [];
    
    travels.filter(t => t.status === '待预订' && !isPast(t.departureDate)).forEach(t => {
      const days = getDaysFromNow(t.departureDate);
      if (days <= 7) {
        reminders.push({
          id: t.id,
          type: 'travel',
          message: `${t.type} ${t.departure} → ${t.destination} 还未预订`,
          days,
          level: days <= 3 ? 'danger' : 'warning',
        });
      }
    });
    
    accommodations.filter(h => h.status === '待预订' && !isPast(h.checkInDate)).forEach(h => {
      const days = getDaysFromNow(h.checkInDate);
      if (days <= 7) {
        reminders.push({
          id: h.id,
          type: 'hotel',
          message: `${h.name} 住宿还未预订`,
          days,
          level: days <= 3 ? 'danger' : 'warning',
        });
      }
    });
    
    return reminders.sort((a, b) => a.days - b.days);
  }, [travels, accommodations]);

  const relatedTreatmentDates = useMemo(() => {
    return treatmentDates
      .filter(t => t.isConfirmed && !isPast(t.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [treatmentDates]);

  const timelineItems = useMemo(() => {
    const items = [
      ...travels.map(t => ({
        id: `travel-${t.id}`,
        date: t.departureDate,
        title: `${t.type} ${t.departure} → ${t.destination}`,
        description: `${t.departureTime} 出发`,
        amount: t.cost,
        category: t.type,
        icon: TRAVEL_ICONS[t.type],
        status: t.status,
      })),
      ...accommodations.map(h => ({
        id: `hotel-${h.id}`,
        date: h.checkInDate,
        title: `${h.name} 入住`,
        description: `${getDaysDiff(h.checkInDate, h.checkOutDate)} 晚`,
        amount: h.totalCost,
        category: h.type,
        icon: HOTEL_ICONS[h.type],
        status: h.status,
      })),
    ];
    
    return items.sort((a, b) => a.date.localeCompare(b.date));
  }, [travels, accommodations]);

  const handleOpenTravelModal = (travel?: typeof travels[0]) => {
    if (travel) {
      setEditingTravel(travel.id);
      setTravelForm({
        type: travel.type,
        departure: travel.departure,
        destination: travel.destination,
        departureDate: travel.departureDate,
        departureTime: travel.departureTime,
        arrivalDate: travel.arrivalDate,
        arrivalTime: travel.arrivalTime,
        flightNumber: travel.flightNumber || '',
        cost: travel.cost.toString(),
        status: travel.status,
        notes: travel.notes || '',
      });
    } else {
      setEditingTravel(null);
      setTravelForm({
        type: '火车',
        departure: '',
        destination: '',
        departureDate: new Date().toISOString().split('T')[0],
        departureTime: '08:00',
        arrivalDate: new Date().toISOString().split('T')[0],
        arrivalTime: '12:00',
        flightNumber: '',
        cost: '',
        status: '待预订',
        notes: '',
      });
    }
    setTravelModalOpen(true);
  };

  const handleOpenHotelModal = (hotel?: typeof accommodations[0]) => {
    if (hotel) {
      setEditingHotel(hotel.id);
      setHotelForm({
        name: hotel.name,
        type: hotel.type,
        address: hotel.address,
        checkInDate: hotel.checkInDate,
        checkOutDate: hotel.checkOutDate,
        nightlyRate: hotel.nightlyRate.toString(),
        totalCost: hotel.totalCost.toString(),
        confirmationNumber: hotel.confirmationNumber || '',
        status: hotel.status,
        notes: hotel.notes || '',
      });
    } else {
      setEditingHotel(null);
      setHotelForm({
        name: '',
        type: '酒店',
        address: '',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date().toISOString().split('T')[0],
        nightlyRate: '',
        totalCost: '',
        confirmationNumber: '',
        status: '待预订',
        notes: '',
      });
    }
    setHotelModalOpen(true);
  };

  const handleSubmitTravel = () => {
    const travelData = {
      ...travelForm,
      cost: parseFloat(travelForm.cost) || 0,
    };
    
    if (editingTravel) {
      updateTravel(editingTravel, travelData);
    } else {
      addTravel(travelData);
    }
    
    setTravelModalOpen(false);
  };

  const handleSubmitHotel = () => {
    const hotelData = {
      ...hotelForm,
      nightlyRate: parseFloat(hotelForm.nightlyRate) || 0,
      totalCost: parseFloat(hotelForm.totalCost) || 0,
    };
    
    if (editingHotel) {
      updateAccommodation(editingHotel, hotelData);
    } else {
      addAccommodation(hotelData);
    }
    
    setHotelModalOpen(false);
  };

  const updateHotelForm = (updates: Partial<typeof hotelForm>) => {
    const newForm = { ...hotelForm, ...updates };
    const nights = getDaysDiff(newForm.checkInDate, newForm.checkOutDate);
    const rate = parseFloat(newForm.nightlyRate) || 0;
    if (nights > 0 && rate > 0 && !updates.totalCost) {
      newForm.totalCost = (nights * rate).toString();
    }
    setHotelForm(newForm);
  };

  const handleOpenGenerateModal = (treatmentDate: typeof treatmentDates[0]) => {
    setSelectedTreatmentDate(treatmentDate);
    setGenerateForm({
      departure: '北京',
      destination: '天津',
      daysBefore: 1,
      nights: 3,
      travelType: '火车',
      accommodationType: '酒店',
    });
    setGenerateModalOpen(true);
  };

  const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const handleGeneratePlan = () => {
    if (!selectedTreatmentDate) return;

    const treatmentDate = selectedTreatmentDate.date;
    const checkInDate = addDays(treatmentDate, -generateForm.daysBefore);
    const checkOutDate = addDays(checkInDate, generateForm.nights);

    const departureTravel = {
      type: generateForm.travelType,
      departure: generateForm.departure,
      destination: generateForm.destination,
      departureDate: checkInDate,
      departureTime: '08:00',
      arrivalDate: checkInDate,
      arrivalTime: '11:00',
      flightNumber: '',
      cost: 0,
      status: '待预订' as const,
      notes: `${selectedTreatmentDate.type} - 去程`,
    };

    const returnTravel = {
      type: generateForm.travelType,
      departure: generateForm.destination,
      destination: generateForm.departure,
      departureDate: checkOutDate,
      departureTime: '14:00',
      arrivalDate: checkOutDate,
      arrivalTime: '17:00',
      flightNumber: '',
      cost: 0,
      status: '待预订' as const,
      notes: `${selectedTreatmentDate.type} - 返程`,
    };

    const accommodation = {
      name: `${generateForm.destination}医院附近${generateForm.accommodationType}`,
      type: generateForm.accommodationType,
      address: '',
      checkInDate,
      checkOutDate,
      nightlyRate: 0,
      totalCost: 0,
      confirmationNumber: '',
      status: '待预订' as const,
      notes: `${selectedTreatmentDate.type} - ${generateForm.nights}晚住宿`,
    };

    addTravel(departureTravel);
    addTravel(returnTravel);
    addAccommodation(accommodation);

    setGenerateModalOpen(false);
    setSelectedTreatmentDate(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">交通住宿</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleOpenHotelModal()}>
            <Hotel className="w-4 h-4" />
            添加住宿
          </Button>
          <Button onClick={() => handleOpenTravelModal()}>
            <Plus className="w-4 h-4" />
            添加行程
          </Button>
        </div>
      </div>

      {urgentReminders.length > 0 && (
        <div className="bg-gradient-to-r from-accent-50 to-danger-50 border border-accent-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 text-accent-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-warmGray-800 mb-2">预订提醒</h3>
              <div className="space-y-2">
                {urgentReminders.map(reminder => (
                  <div 
                    key={reminder.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      reminder.level === 'danger' ? 'bg-danger-100/50' : 'bg-accent-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`w-4 h-4 ${
                        reminder.level === 'danger' ? 'text-danger-500' : 'text-accent-500'
                      }`} />
                      <span className="text-sm text-warmGray-700">{reminder.message}</span>
                    </div>
                    <Badge variant={reminder.level === 'danger' ? 'danger' : 'warning'}>
                      {reminder.days === 0 ? '今天' : reminder.days === 1 ? '明天' : `${reminder.days}天后`}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {relatedTreatmentDates.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-warmGray-800 mb-2">近期治疗日期</h3>
              <div className="flex flex-wrap gap-2">
                {relatedTreatmentDates.map(t => (
                  <div key={t.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg group">
                    <span className="font-medium text-primary-700">{formatDisplayDate(t.date)}</span>
                    <span className="text-sm text-warmGray-600">{t.type}</span>
                    <button
                      onClick={() => handleOpenGenerateModal(t)}
                      className="ml-1 p-1.5 rounded-lg bg-primary-100 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-200"
                      title="快速生成行程"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="交通总支出"
          value={stats.totalTravelCost}
          isMoney
          gradient="from-primary-500 to-primary-600"
          icon={<Plane className="w-6 h-6 text-white" />}
          subtitle={`${travels.filter(t => t.status !== '已取消').length} 次行程`}
        />
        <StatCard
          title="住宿总支出"
          value={stats.totalAccommodationCost}
          isMoney
          gradient="from-accent-500 to-accent-600"
          icon={<Hotel className="w-6 h-6 text-white" />}
          subtitle={`${accommodations.filter(h => h.status !== '已取消').length} 次住宿`}
        />
        <StatCard
          title="累计支出"
          value={stats.totalCost}
          isMoney
          gradient="from-purple-500 to-purple-600"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          subtitle={`${stats.totalNights} 晚住宿`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>行程安排</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTravels.length === 0 ? (
              <EmptyState
                title="暂无行程"
                description="点击右上角按钮添加您的行程"
                icon={<Plane className="w-12 h-12 text-warmGray-300" />}
              />
            ) : (
              upcomingTravels.map(travel => (
                <div 
                  key={travel.id}
                  className="p-4 bg-warmGray-50 rounded-xl group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                        {TRAVEL_ICONS[travel.type]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-warmGray-800">
                            {travel.departure} → {travel.destination}
                          </h4>
                          <Badge variant={TRAVEL_STATUS[travel.status]}>
                            {travel.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-warmGray-600">
                          {formatDisplayDate(travel.departureDate)} {travel.departureTime} 出发
                        </p>
                        {travel.flightNumber && (
                          <p className="text-xs text-warmGray-500 mt-1">
                            班次：{travel.flightNumber}
                          </p>
                        )}
                        <p className="text-sm font-mono font-semibold text-primary-600 mt-1">
                          {formatMoney(travel.cost)}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleOpenTravelModal(travel)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTravel(travel.id)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>住宿安排</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingHotels.length === 0 ? (
              <EmptyState
                title="暂无住宿"
                description="点击右上角按钮添加住宿预订"
                icon={<Hotel className="w-12 h-12 text-warmGray-300" />}
              />
            ) : (
              upcomingHotels.map(hotel => (
                <div 
                  key={hotel.id}
                  className="p-4 bg-warmGray-50 rounded-xl group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent-100 text-accent-600 rounded-lg">
                        {HOTEL_ICONS[hotel.type]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-warmGray-800">{hotel.name}</h4>
                          <Badge variant={HOTEL_STATUS[hotel.status]}>
                            {hotel.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-warmGray-600">
                          {formatDisplayDate(hotel.checkInDate)} - {formatDisplayDate(hotel.checkOutDate)}
                          <span className="ml-2">共 {getDaysDiff(hotel.checkInDate, hotel.checkOutDate)} 晚</span>
                        </p>
                        {hotel.address && (
                          <p className="text-xs text-warmGray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 inline" />
                            {hotel.address}
                          </p>
                        )}
                        {hotel.confirmationNumber && (
                          <p className="text-xs text-warmGray-500 mt-1">
                            确认号：{hotel.confirmationNumber}
                          </p>
                        )}
                        <p className="text-sm font-mono font-semibold text-accent-600 mt-1">
                          {formatMoney(hotel.totalCost)}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleOpenHotelModal(hotel)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAccommodation(hotel.id)}
                        className="p-1.5 hover:bg-white rounded-lg text-warmGray-500 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>行程时间线</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline
            items={timelineItems}
            formatDate={formatDisplayDate}
            formatAmount={formatMoney}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={travelModalOpen}
        onClose={() => setTravelModalOpen(false)}
        title={editingTravel ? '编辑行程' : '添加行程'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTravelModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitTravel}>
              {editingTravel ? '保存修改' : '添加行程'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="交通方式"
              value={travelForm.type}
              onChange={(e) => setTravelForm({ ...travelForm, type: e.target.value as TravelType })}
              options={[
                { value: '飞机', label: '飞机' },
                { value: '火车', label: '火车' },
                { value: '汽车', label: '汽车' },
                { value: '地铁', label: '地铁' },
                { value: '打车', label: '打车' },
                { value: '其他', label: '其他' },
              ]}
            />
            <Select
              label="预订状态"
              value={travelForm.status}
              onChange={(e) => setTravelForm({ ...travelForm, status: e.target.value as typeof travelForm.status })}
              options={[
                { value: '待预订', label: '待预订' },
                { value: '已预订', label: '已预订' },
                { value: '已完成', label: '已完成' },
                { value: '已取消', label: '已取消' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="出发地"
              value={travelForm.departure}
              onChange={(e) => setTravelForm({ ...travelForm, departure: e.target.value })}
              placeholder="城市名称"
            />
            <Input
              label="目的地"
              value={travelForm.destination}
              onChange={(e) => setTravelForm({ ...travelForm, destination: e.target.value })}
              placeholder="城市名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="出发日期"
              type="date"
              value={travelForm.departureDate}
              onChange={(e) => setTravelForm({ ...travelForm, departureDate: e.target.value, arrivalDate: e.target.value })}
            />
            <Input
              label="出发时间"
              type="time"
              value={travelForm.departureTime}
              onChange={(e) => setTravelForm({ ...travelForm, departureTime: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="到达日期"
              type="date"
              value={travelForm.arrivalDate}
              onChange={(e) => setTravelForm({ ...travelForm, arrivalDate: e.target.value })}
            />
            <Input
              label="到达时间"
              type="time"
              value={travelForm.arrivalTime}
              onChange={(e) => setTravelForm({ ...travelForm, arrivalTime: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="班次/车次"
              value={travelForm.flightNumber}
              onChange={(e) => setTravelForm({ ...travelForm, flightNumber: e.target.value })}
              placeholder="航班号/车次"
            />
            <Input
              label="费用 (元)"
              type="number"
              value={travelForm.cost}
              onChange={(e) => setTravelForm({ ...travelForm, cost: e.target.value })}
              placeholder="交通费用"
            />
          </div>
          <TextArea
            label="备注"
            value={travelForm.notes}
            onChange={(e) => setTravelForm({ ...travelForm, notes: e.target.value })}
            placeholder="如：航站楼、检票口、行李规定等..."
            rows={2}
          />
        </div>
      </Modal>

      <Modal
        isOpen={hotelModalOpen}
        onClose={() => setHotelModalOpen(false)}
        title={editingHotel ? '编辑住宿' : '添加住宿'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setHotelModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitHotel}>
              {editingHotel ? '保存修改' : '添加住宿'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="住宿类型"
              value={hotelForm.type}
              onChange={(e) => setHotelForm({ ...hotelForm, type: e.target.value as AccommodationType })}
              options={[
                { value: '酒店', label: '酒店' },
                { value: '民宿', label: '民宿' },
                { value: '公寓', label: '公寓' },
                { value: '亲友家', label: '亲友家' },
                { value: '其他', label: '其他' },
              ]}
            />
            <Select
              label="预订状态"
              value={hotelForm.status}
              onChange={(e) => setHotelForm({ ...hotelForm, status: e.target.value as typeof hotelForm.status })}
              options={[
                { value: '待预订', label: '待预订' },
                { value: '已预订', label: '已预订' },
                { value: '已入住', label: '已入住' },
                { value: '已退房', label: '已退房' },
                { value: '已取消', label: '已取消' },
              ]}
            />
          </div>
          <Input
            label="酒店名称"
            value={hotelForm.name}
            onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
            placeholder="请输入酒店/民宿名称"
          />
          <Input
            label="地址"
            value={hotelForm.address}
            onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
            placeholder="详细地址"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="入住日期"
              type="date"
              value={hotelForm.checkInDate}
              onChange={(e) => updateHotelForm({ checkInDate: e.target.value })}
            />
            <Input
              label="退房日期"
              type="date"
              value={hotelForm.checkOutDate}
              onChange={(e) => updateHotelForm({ checkOutDate: e.target.value })}
            />
          </div>
          <div className="p-3 bg-primary-50 rounded-lg text-center">
            <span className="text-primary-700">
              共 <strong>{getDaysDiff(hotelForm.checkInDate, hotelForm.checkOutDate)}</strong> 晚
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="每晚价格 (元)"
              type="number"
              value={hotelForm.nightlyRate}
              onChange={(e) => updateHotelForm({ nightlyRate: e.target.value })}
              placeholder="每晚价格"
            />
            <Input
              label="总费用 (元)"
              type="number"
              value={hotelForm.totalCost}
              onChange={(e) => setHotelForm({ ...hotelForm, totalCost: e.target.value })}
              placeholder="总费用"
            />
          </div>
          <Input
            label="确认号"
            value={hotelForm.confirmationNumber}
            onChange={(e) => setHotelForm({ ...hotelForm, confirmationNumber: e.target.value })}
            placeholder="预订确认号"
          />
          <TextArea
            label="备注"
            value={hotelForm.notes}
            onChange={(e) => setHotelForm({ ...hotelForm, notes: e.target.value })}
            placeholder="如：早餐、停车、延迟退房等..."
            rows={2}
          />
        </div>
      </Modal>

      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title={`生成${selectedTreatmentDate?.type || ''}行程计划`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenerateModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleGeneratePlan}>
              <Wand2 className="w-4 h-4" />
              生成行程草稿
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedTreatmentDate && (
            <div className="p-3 bg-primary-50 rounded-lg mb-4">
              <p className="text-sm text-primary-700">
                <strong>{selectedTreatmentDate.type}</strong> - {formatDisplayDate(selectedTreatmentDate.date)}
              </p>
              {selectedTreatmentDate.description && (
                <p className="text-xs text-primary-600 mt-1">{selectedTreatmentDate.description}</p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="出发城市"
              value={generateForm.departure}
              onChange={(e) => setGenerateForm({ ...generateForm, departure: e.target.value })}
              placeholder="如：北京"
            />
            <Input
              label="目的城市"
              value={generateForm.destination}
              onChange={(e) => setGenerateForm({ ...generateForm, destination: e.target.value })}
              placeholder="如：天津"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="提前几天到达"
              type="number"
              min="0"
              max="7"
              value={generateForm.daysBefore}
              onChange={(e) => setGenerateForm({ ...generateForm, daysBefore: parseInt(e.target.value) || 0 })}
              placeholder="1"
            />
            <Input
              label="住宿晚数"
              type="number"
              min="1"
              max="30"
              value={generateForm.nights}
              onChange={(e) => setGenerateForm({ ...generateForm, nights: parseInt(e.target.value) || 1 })}
              placeholder="3"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="交通方式"
              value={generateForm.travelType}
              onChange={(e) => setGenerateForm({ ...generateForm, travelType: e.target.value as TravelType })}
              options={[
                { value: '飞机', label: '飞机' },
                { value: '火车', label: '火车' },
                { value: '汽车', label: '汽车' },
                { value: '打车', label: '打车' },
                { value: '其他', label: '其他' },
              ]}
            />
            <Select
              label="住宿类型"
              value={generateForm.accommodationType}
              onChange={(e) => setGenerateForm({ ...generateForm, accommodationType: e.target.value as AccommodationType })}
              options={[
                { value: '酒店', label: '酒店' },
                { value: '民宿', label: '民宿' },
                { value: '公寓', label: '公寓' },
                { value: '亲友家', label: '亲友家' },
                { value: '其他', label: '其他' },
              ]}
            />
          </div>
          
          <div className="p-4 bg-warmGray-50 rounded-lg">
            <h4 className="font-medium text-warmGray-700 mb-2">行程预览</h4>
            <div className="space-y-2 text-sm text-warmGray-600">
              <p>🚄 去程：{generateForm.departure} → {generateForm.destination}，{formatDisplayDate(addDays(selectedTreatmentDate?.date || new Date().toISOString().split('T')[0], -generateForm.daysBefore))}</p>
              <p>🏨 住宿：{generateForm.nights}晚，{formatDisplayDate(addDays(selectedTreatmentDate?.date || new Date().toISOString().split('T')[0], -generateForm.daysBefore))} - {formatDisplayDate(addDays(addDays(selectedTreatmentDate?.date || new Date().toISOString().split('T')[0], -generateForm.daysBefore), generateForm.nights))}</p>
              <p>🚄 返程：{generateForm.destination} → {generateForm.departure}，{formatDisplayDate(addDays(addDays(selectedTreatmentDate?.date || new Date().toISOString().split('T')[0], -generateForm.daysBefore), generateForm.nights))}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
