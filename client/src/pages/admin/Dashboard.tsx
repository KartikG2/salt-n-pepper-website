import { useUser, useLogout } from "@/hooks/use-auth";
import { useAdminOrders, useUpdateOrderStatus, useAdminReservations } from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, CheckCircle, Clock, Volume2, Printer, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isValid } from "date-fns";

export default function Dashboard() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout();
  const [, setLocation] = useLocation();

  // REAL-TIME: Automatically check for new orders every 5 seconds
  const { data: orders, isLoading: ordersLoading } = useAdminOrders({ 
    refetchInterval: 5000 
  });

  const updateStatus = useUpdateOrderStatus();
  const prevOrdersCount = useRef<number>(0);

  // Sound Notification for new incoming orders
  useEffect(() => {
    const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
    if (pendingOrders.length > prevOrdersCount.current) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(() => console.log("Sound interaction required."));
    }
    prevOrdersCount.current = pendingOrders.length;
  }, [orders]);

  // Auth Protection
  useEffect(() => {
    if (!isLoading && !user) setLocation("/admin");
  }, [user, isLoading, setLocation]);

  // FIXED: Robust Date Helper to prevent TypeScript errors
  const formatTime = (dateInput?: string | Date | null) => {
    if (!dateInput) return "N/A";
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return isValid(date) ? format(date, "h:mm a") : "N/A";
  };

  // RECEIPT GENERATOR: Opens a print-friendly window
  const handlePrint = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map((item: any) => 
      `<tr>
        <td style="padding: 5px 0;">${item.name}</td>
        <td style="text-align: center;">x${item.quantity}</td>
        <td style="text-align: right;">₹${item.price * item.quantity}</td>
      </tr>`
    ).join('');

    printWindow.document.write(`
      <html>
        <body style="font-family: 'Courier New', Courier, monospace; width: 280px; margin: auto; padding: 10px; color: #000;">
          <h2 style="text-align: center; margin-bottom: 5px;">SALT N PAPPER</h2>
          <p style="text-align: center; font-size: 12px; margin-top: 0;">Order Receipt</p>
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          <p><strong>Order ID:</strong> #${order.id}</p>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Time:</strong> ${formatTime(order.createdAt)}</p>
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          <h3 style="text-align: right; margin: 5px 0;">TOTAL: ₹${order.totalAmount}</h3>
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          <p style="text-align: center; font-size: 10px;">Thank you for your order!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl">Live Dashboard</h1>
          <div className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse font-bold">
            <Volume2 className="w-3 h-3" /> LIVE UPDATES ACTIVE
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => logout()} className="text-destructive"><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="bg-white border p-1 rounded-lg">
            <TabsTrigger value="queue" className="px-8 flex gap-2"><Clock className="w-4 h-4"/> Active Queue</TabsTrigger>
            <TabsTrigger value="history" className="px-8 flex gap-2"><History className="w-4 h-4"/> Order History</TabsTrigger>
          </TabsList>

          {/* ACTIVE QUEUE */}
          <TabsContent value="queue">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders?.filter(o => ['pending', 'confirmed'].includes(o.status!)).map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <Badge variant={order.status === 'pending' ? 'outline' : 'default'} className={order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-600'}>
                          {order.status?.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">#{order.id}</span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight">{order.customerName}</h3>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePrint(order)} title="Print Receipt">
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-1 mb-4 border-t border-b border-dashed py-3 text-sm">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-bold text-primary">
                      <span>Total Amount</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      disabled={updateStatus.isPending}
                      variant={order.status === 'pending' ? 'default' : 'secondary'}
                      onClick={() => updateStatus.mutate({ 
                        id: order.id, 
                        status: order.status === 'pending' ? 'confirmed' : 'completed' 
                      })}
                    >
                      {updateStatus.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : (order.status === 'pending' ? 'Accept Order' : 'Mark Finished')}
                    </Button>
                  </div>
                </div>
              ))}
              {orders?.filter(o => ['pending', 'confirmed'].includes(o.status!)).length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed text-muted-foreground">
                  Waiting for new orders...
                </div>
              )}
            </div>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <ScrollArea className="h-[65vh]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold">Order ID</th>
                      <th className="text-left p-4 font-semibold">Customer</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Date/Time</th>
                      <th className="text-right p-4 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.filter(o => ['completed', 'cancelled'].includes(o.status!)).map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-mono text-xs">#{order.id}</td>
                        <td className="p-4 font-medium">{order.customerName}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={order.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                            {order.status?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">{formatTime(order.createdAt)}</td>
                        <td className="p-4 text-right font-bold">₹{order.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}