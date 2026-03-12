import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Settings, 
  TrendingUp,
  DollarSign,
  Ticket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OrganizerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for organizer
const mockOrganizerData = {
  synagogueName: 'Synagogue Nazareth',
  totalEvents: 45,
  totalParticipants: 1234,
  revenue: 12500,
  upcomingEvents: [
    {
      id: '1',
      name: 'Chabbat de Pessa\'h',
      date: '2026-04-04',
      type: 'shabbat',
      price: 50,
      capacity: 200,
      sold: 156,
      status: 'active',
    },
    {
      id: '2',
      name: 'Yom Kippour',
      date: '2026-10-12',
      type: 'holiday',
      price: 0,
      capacity: 300,
      sold: 289,
      status: 'active',
    },
    {
      id: '3',
      name: 'Souccot - Soirée',
      date: '2026-09-28',
      type: 'holiday',
      price: 25,
      capacity: 150,
      sold: 45,
      status: 'active',
    },
  ],
  recentSales: [
    { id: '1', user: 'David Cohen', event: 'Chabbat de Pessa\'h', amount: 50, date: '2026-03-12', method: 'card' },
    { id: '2', user: 'Sarah Levy', event: 'Chabbat de Pessa\'h', amount: 100, date: '2026-03-12', method: 'cash' },
    { id: '3', user: 'Moshe Ben', event: 'Souccot - Soirée', amount: 50, date: '2026-03-11', method: 'card' },
  ],
};

export function OrganizerDashboard({ isOpen, onClose }: OrganizerDashboardProps) {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{mockOrganizerData.synagogueName}</h2>
              <p className="text-muted-foreground">
                {i18n.language === 'he' ? 'לוח בקרה למארגן' : i18n.language === 'en' ? 'Organizer Dashboard' : 'Tableau de bord organisateur'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {i18n.language === 'he' ? 'הגדרות' : i18n.language === 'en' ? 'Settings' : 'Paramètres'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {i18n.language === 'he' ? 'סגור' : i18n.language === 'en' ? 'Close' : 'Fermer'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                {i18n.language === 'he' ? 'סקירה' : i18n.language === 'en' ? 'Overview' : 'Vue d\'ensemble'}
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" />
                {i18n.language === 'he' ? 'אירועים' : i18n.language === 'en' ? 'Events' : 'Événements'}
              </TabsTrigger>
              <TabsTrigger value="sales" className="gap-2">
                <CreditCard className="h-4 w-4" />
                {i18n.language === 'he' ? 'מכירות' : i18n.language === 'en' ? 'Sales' : 'Ventes'}
              </TabsTrigger>
              <TabsTrigger value="participants" className="gap-2">
                <Users className="h-4 w-4" />
                {i18n.language === 'he' ? 'משתתפים' : i18n.language === 'en' ? 'Participants' : 'Participants'}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {i18n.language === 'he' ? 'סך הכנסות' : i18n.language === 'en' ? 'Total Revenue' : 'Revenus totaux'}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(mockOrganizerData.revenue)}</div>
                    <p className="text-xs text-muted-foreground">+12% {i18n.language === 'he' ? 'מהחודש שעבר' : i18n.language === 'en' ? 'from last month' : 'depuis le mois dernier'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {i18n.language === 'he' ? 'אירועים' : i18n.language === 'en' ? 'Events' : 'Événements'}
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockOrganizerData.totalEvents}</div>
                    <p className="text-xs text-muted-foreground">{mockOrganizerData.upcomingEvents.length} {i18n.language === 'he' ? 'קרובים' : i18n.language === 'en' ? 'upcoming' : 'à venir'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {i18n.language === 'he' ? 'משתתפים' : i18n.language === 'en' ? 'Participants' : 'Participants'}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockOrganizerData.totalParticipants}</div>
                    <p className="text-xs text-muted-foreground">+89 {i18n.language === 'he' ? 'החודש' : i18n.language === 'en' ? 'this month' : 'ce mois'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {i18n.language === 'he' ? 'מכירות' : i18n.language === 'en' ? 'Sales' : 'Ventes'}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockOrganizerData.recentSales.length}</div>
                    <p className="text-xs text-muted-foreground">{i18n.language === 'he' ? 'היום' : i18n.language === 'en' ? 'today' : 'aujourd\'hui'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {i18n.language === 'he' ? 'אירועים קרובים' : i18n.language === 'en' ? 'Upcoming Events' : 'Événements à venir'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOrganizerData.upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{event.name}</h4>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{event.sold}/{event.capacity}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.price === 0 
                                ? (i18n.language === 'he' ? 'חינם' : i18n.language === 'en' ? 'Free' : 'Gratuit')
                                : formatCurrency(event.price)
                              }
                            </p>
                          </div>
                          <Badge variant={event.sold >= event.capacity ? 'default' : 'secondary'}>
                            {event.sold >= event.capacity 
                              ? (i18n.language === 'he' ? 'מלא' : i18n.language === 'en' ? 'Full' : 'Complet')
                              : `${Math.round((event.sold / event.capacity) * 100)}%`
                            }
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {i18n.language === 'he' ? 'ניהול אירועים' : i18n.language === 'en' ? 'Event Management' : 'Gestion des événements'}
                  </CardTitle>
                  <Button>
                    {i18n.language === 'he' ? 'אירוע חדש' : i18n.language === 'en' ? 'New Event' : 'Nouvel événement'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {i18n.language === 'he' 
                      ? 'כאן תוכל ליצור ולנהל אירועים, להגדיר מחירים ולנהל מכירות כרטיסים.'
                      : i18n.language === 'en'
                      ? 'Here you can create and manage events, set prices and manage ticket sales.'
                      : 'Ici vous pouvez créer et gérer des événements, définir les prix et gérer les ventes de billets.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales Tab */}
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {i18n.language === 'he' ? 'מכירות אחרונות' : i18n.language === 'en' ? 'Recent Sales' : 'Ventes récentes'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOrganizerData.recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{sale.user}</p>
                          <p className="text-sm text-muted-foreground">{sale.event}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(sale.amount)}</p>
                          <Badge variant={sale.method === 'card' ? 'default' : 'secondary'}>
                            {sale.method === 'card' 
                              ? (i18n.language === 'he' ? 'כרטיס' : i18n.language === 'en' ? 'Card' : 'Carte')
                              : (i18n.language === 'he' ? 'מזומן' : i18n.language === 'en' ? 'Cash' : 'Espèces')
                            }
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {i18n.language === 'he' ? 'רשימת משתתפים' : i18n.language === 'en' ? 'Participant List' : 'Liste des participants'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {i18n.language === 'he'
                      ? 'נהל את רשימת המשתתפים שלך, שלח התראות ועוד.'
                      : i18n.language === 'en'
                      ? 'Manage your participant list, send notifications and more.'
                      : 'Gérez votre liste de participants, envoyez des notifications et plus.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
