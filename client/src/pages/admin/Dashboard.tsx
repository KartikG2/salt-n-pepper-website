import { useUser, useLogout } from "@/hooks/use-auth";
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useAdminReservations,
  useUpdateReservationStatus,
} from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  LogOut,
  Clock,
  Volume2,
  Printer,
  History,
  Phone,
  CalendarCheck,
  Users,
  MapPin,
  ShoppingBag,
  Utensils,
  IndianRupee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isValid, isToday, isYesterday } from "date-fns";
import { OrderItem } from "@shared/schema";

export default function Dashboard() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout();
  const [, setLocation] = useLocation();

  // REAL-TIME: Polling both every 5s
  const { data: orders } = useAdminOrders({ refetchInterval: 5000 });
  const { data: reservations } = useAdminReservations({
    refetchInterval: 5000,
  });

  const updateOrderStatus = useUpdateOrderStatus();
  const updateResStatus = useUpdateReservationStatus();

  const prevOrdersCount = useRef<number>(0);
  const prevResCount = useRef<number>(0);

  // Sound Notification for NEW entries
  useEffect(() => {
    const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
    const pendingRes =
      reservations?.filter((r) => r.status === "pending") || [];

    if (
      pendingOrders.length > prevOrdersCount.current ||
      pendingRes.length > prevResCount.current
    ) {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio.play().catch(() => console.log("Sound interaction required."));
    }
    prevOrdersCount.current = pendingOrders.length;
    prevResCount.current = pendingRes.length;
  }, [orders, reservations]);

  // Auth Protection
  useEffect(() => {
    if (!isLoading && !user) setLocation("/admin");
  }, [user, isLoading, setLocation]);

  // DAILY GROUPING & REVENUE CALCULATION
  const groupedHistory = useMemo(() => {
    if (!orders) return {};
    const history = orders.filter((o) =>
      ["completed", "cancelled"].includes(o.status!),
    );

    return history.reduce(
      (
        groups: Record<string, { orders: any[]; totalRevenue: number }>,
        order,
      ) => {
        const date = order.createdAt ? new Date(order.createdAt) : new Date();
        let dateLabel = format(date, "MMMM dd, yyyy");
        if (isToday(date)) dateLabel = "Today";
        else if (isYesterday(date)) dateLabel = "Yesterday";

        if (!groups[dateLabel]) {
          groups[dateLabel] = { orders: [], totalRevenue: 0 };
        }

        groups[dateLabel].orders.push(order);
        if (order.status === "completed") {
          groups[dateLabel].totalRevenue += order.totalAmount;
        }
        return groups;
      },
      {},
    );
  }, [orders]);

  const formatTime = (dateInput?: string | Date | null) => {
    if (!dateInput) return "N/A";
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return isValid(date) ? format(date, "h:mm a") : "N/A";
  };

  // E-RECEIPT GENERATOR
  const handlePrint = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <body style="font-family: 'Courier New', monospace; width: 280px; margin: auto; padding: 10px;">
          <h2 style="text-align: center; margin-bottom: 5px;">SALT N PAPPER</h2>
          <hr style="border-top: 1px dashed #000;"/>
          <p><strong>Order ID:</strong> #${order.id} [${order.type?.toUpperCase()}]</p>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          ${order.type === "delivery" ? `<p><strong>Loc:</strong> ${order.customerAddress}</p>` : ""}
          <hr style="border-top: 1px dashed #000;"/>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${(order.items as OrderItem[])
              .map(
                (item: any) => `
              <tr><td>${item.name}</td><td>x${item.quantity}</td><td style="text-align:right">₹${item.price * item.quantity}</td></tr>`,
              )
              .join("")}
          </table>
          <hr style="border-top: 1px dashed #000;"/>
          <h3 style="text-align: right;">TOTAL: ₹${order.totalAmount}</h3>
          <p style="text-align: center; font-size: 10px; margin-top: 20px;">Thank you for dining with us!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (isLoading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl">Salt N Papper Admin</h1>
          <Badge
            variant="outline"
            className="animate-pulse bg-green-50 text-green-700 border-green-200"
          >
            <Volume2 className="w-3 h-3 mr-1" /> LIVE
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="bg-white border p-1 rounded-lg">
            <TabsTrigger value="queue">Orders</TabsTrigger>
            <TabsTrigger value="reservations">Table Bookings</TabsTrigger>
            <TabsTrigger value="history">Daily History</TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders
                ?.filter((o) => ["pending", "confirmed"].includes(o.status!))
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-xl border shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant="outline"
                        className="uppercase text-[10px]"
                      >
                        {order.type}
                      </Badge>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handlePrint(order)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-bold text-lg">{order.customerName}</h3>
                    <div className="flex flex-col gap-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.customerPhone}
                      </span>
                      {order.type === "delivery" && (
                        <span className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5" />{" "}
                          {order.customerAddress}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 my-4 border-y border-dashed py-3 text-sm">
                      {(order.items as OrderItem[]).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-between font-bold text-primary">
                        <span>Total</span>
                        <span>₹{order.totalAmount}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() =>
                        updateOrderStatus.mutate({
                          id: order.id,
                          status:
                            order.status === "pending"
                              ? "confirmed"
                              : "completed",
                        })
                      }
                    >
                      {order.status === "pending"
                        ? "Accept Order"
                        : "Complete & Bill"}
                    </Button>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="reservations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations
                ?.filter((r) => ["pending", "confirmed"].includes(r.status!))
                .map((res) => (
                  <div
                    key={res.id}
                    className={`bg-white p-6 rounded-xl border-2 transition-all ${res.status === "confirmed" ? "border-green-500 shadow-md" : "border-transparent shadow-sm"}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">
                          {res.customerName}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {res.customerPhone}
                        </p>
                      </div>
                      <Badge
                        className={
                          res.status === "confirmed"
                            ? "bg-green-600 text-white"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {res.status === "confirmed" ? "IN-HOUSE" : "PENDING"}
                      </Badge>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg mb-4 text-sm font-bold flex gap-2">
                      <CalendarCheck className="h-4 w-4 text-primary" />{" "}
                      {res.date} @ {res.time}
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium">
                      <Users className="w-4 h-4" /> {res.guests} Guests
                    </div>
                    <Button
                      className="w-full"
                      variant={
                        res.status === "pending" ? "default" : "secondary"
                      }
                      onClick={() =>
                        updateResStatus.mutate({
                          id: res.id,
                          status:
                            res.status === "pending"
                              ? "confirmed"
                              : "completed",
                        })
                      }
                    >
                      {res.status === "pending"
                        ? "Confirm Arrival"
                        : "Diner Fed (Finish)"}
                    </Button>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[70vh]">
              {Object.keys(groupedHistory).map((label) => (
                <div key={label} className="mb-8">
                  <div className="flex justify-between items-center mb-4 sticky top-0 bg-muted/90 p-3 rounded-lg border z-20">
                    <span className="font-bold text-primary uppercase text-xs tracking-widest">
                      {label}
                    </span>
                    <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      Revenue: ₹{groupedHistory[label].totalRevenue}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="p-4 text-left">Customer</th>
                          <th className="p-4 text-left">Order Info</th>
                          <th className="p-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedHistory[label].orders.map((o: any) => (
                          <tr
                            key={o.id}
                            className="border-b last:border-0 hover:bg-muted/5"
                          >
                            <td className="p-4">
                              <p className="font-bold">{o.customerName}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {o.customerPhone}
                              </p>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase"
                              >
                                {o.type}
                              </Badge>
                              {o.type === "delivery" && (
                                <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[150px]">
                                  {o.customerAddress}
                                </p>
                              )}
                            </td>
                            <td className="p-4 text-right font-bold">
                              ₹{o.totalAmount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
