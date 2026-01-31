import { useUser, useLogout } from "@/hooks/use-auth";
import { useAdminOrders, useUpdateOrderStatus, useAdminReservations } from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, CheckCircle, Clock, XCircle, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout();
  const [, setLocation] = useLocation();
  
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: reservations, isLoading: reservationsLoading } = useAdminReservations();
  const updateStatus = useUpdateOrderStatus();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Header */}
      <header className="bg-white border-b border-border h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <h1 className="font-bold text-xl">Admin Dashboard</h1>
           <Badge variant="outline" className="ml-2">v1.0</Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Logged in as {user.username}</span>
          <Button variant="ghost" size="sm" onClick={() => logout()} className="text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container-custom py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white border p-1 rounded-lg h-auto">
            <TabsTrigger value="orders" className="px-6 py-2">Live Orders</TabsTrigger>
            <TabsTrigger value="reservations" className="px-6 py-2">Reservations</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? (
              <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Orders Column */}
                <div className="space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" /> Active Orders
                  </h2>
                  <ScrollArea className="h-[70vh]">
                    <div className="space-y-4 pr-4">
                      {orders?.filter(o => o.status === 'pending' || o.status === 'confirmed').map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-xl border border-border shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getStatusColor(order.status!)} variant="outline">
                                  {order.status?.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground">#{order.id}</span>
                              </div>
                              <h3 className="font-bold">{order.customerName}</h3>
                              <p className="text-sm text-muted-foreground">{order.type.toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs text-muted-foreground mb-1">
                                 {order.createdAt ? format(new Date(order.createdAt), 'h:mm a') : ''}
                               </p>
                               <p className="font-bold text-lg text-primary">₹{order.totalAmount}</p>
                            </div>
                          </div>
                          
                          <div className="bg-secondary/5 p-4 rounded-lg mb-4 text-sm space-y-2">
                             {(order.items as any[]).map((item: any, idx: number) => (
                               <div key={idx} className="flex justify-between">
                                 <span>{item.quantity}x {item.name}</span>
                                 <span>₹{item.price * item.quantity}</span>
                               </div>
                             ))}
                          </div>

                          <div className="flex gap-2">
                            {order.status === 'pending' && (
                              <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700" 
                                size="sm"
                                onClick={() => updateStatus.mutate({ id: order.id, status: 'confirmed' })}
                              >
                                Accept Order
                              </Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button 
                                className="w-full bg-green-600 hover:bg-green-700" 
                                size="sm"
                                onClick={() => updateStatus.mutate({ id: order.id, status: 'completed' })}
                              >
                                Mark Completed
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              className="w-full text-red-600 border-red-200 hover:bg-red-50" 
                              size="sm"
                              onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                      {orders?.filter(o => o.status === 'pending' || o.status === 'confirmed').length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">No active orders</div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Completed Orders Column */}
                <div className="space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> Completed Today
                  </h2>
                  <ScrollArea className="h-[70vh]">
                     <div className="space-y-4 pr-4">
                      {orders?.filter(o => o.status === 'completed' || o.status === 'cancelled').map((order) => (
                        <div key={order.id} className="bg-white p-4 rounded-xl border border-border shadow-sm opacity-80">
                           <div className="flex justify-between items-center">
                             <div>
                               <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(order.status!)} variant="outline">
                                  {order.status?.toUpperCase()}
                                </Badge>
                                <span className="font-medium">#{order.id} • {order.customerName}</span>
                               </div>
                               <span className="text-xs text-muted-foreground">
                                 {order.createdAt ? format(new Date(order.createdAt), 'h:mm a') : ''}
                               </span>
                             </div>
                             <span className="font-bold">₹{order.totalAmount}</span>
                           </div>
                        </div>
                      ))}
                     </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reservations">
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-bold text-xl mb-6">Upcoming Reservations</h2>
              {reservationsLoading ? (
                 <Loader2 className="animate-spin" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reservations?.map((res) => (
                    <div key={res.id} className="border border-border p-4 rounded-lg bg-card shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold">{res.customerName}</h3>
                          <p className="text-sm text-muted-foreground">{res.customerPhone}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">{res.guests} Guests</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-4">
                        <Clock className="w-4 h-4 text-primary" />
                        {res.date} at {res.time}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Status: {res.status}
                      </div>
                    </div>
                  ))}
                  {reservations?.length === 0 && <div className="text-muted-foreground">No reservations found.</div>}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
