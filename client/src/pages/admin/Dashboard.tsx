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
  const { data: orders, isLoading: ordersLoading } = useAdminOrders({
    refetchInterval: 5000,
  });
  const { data: reservations, isLoading: reservationsLoading } =
    useAdminReservations({ refetchInterval: 5000 });

  const updateOrderStatus = useUpdateOrderStatus();
  const updateResStatus = useUpdateReservationStatus();

  const prevOrdersCount = useRef<number>(0);
  const prevResCount = useRef<number>(0);

  // Sound Notification for NEW Orders & Reservations
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

  // Redirect if not logged in
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
        // Only count completed orders toward daily revenue
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
          className="text-destructive hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="bg-white border p-1 rounded-lg">
            <TabsTrigger value="queue" className="flex gap-2">
              <Clock className="w-4 h-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex gap-2">
              <CalendarCheck className="w-4 h-4" /> Reservations
            </TabsTrigger>
            <TabsTrigger value="history" className="flex gap-2">
              <History className="w-4 h-4" /> Daily History
            </TabsTrigger>
          </TabsList>

          {/* ORDERS QUEUE */}
          <TabsContent value="queue">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders
                ?.filter((o) => ["pending", "confirmed"].includes(o.status!))
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-xl border shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Badge
                        className={
                          order.status === "pending"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-blue-600 text-white"
                        }
                      >
                        {order.status?.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(order.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{order.customerName}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                      <Phone className="w-3 h-3" /> {order.customerPhone}
                    </p>

                    <div className="space-y-2 mb-4 border-y border-dashed py-3">
                      {/* FIX: Cast items as OrderItem[] to avoid .map error */}
                      {(order.items as OrderItem[]).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
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
                        : "Complete Order"}
                    </Button>
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* RESERVATIONS TAB */}
          <TabsContent value="reservations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations
                ?.filter((r) => r.status === "pending")
                .map((res) => (
                  <div
                    key={res.id}
                    className="bg-white p-6 rounded-xl border shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">
                          {res.customerName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {res.customerPhone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {res.date}
                        </p>
                        <p className="text-xs font-medium">{res.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4 bg-muted/50 p-2 rounded text-sm">
                      <Users className="w-4 h-4" /> {res.guests} Guests
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600"
                        onClick={() =>
                          updateResStatus.mutate({
                            id: res.id,
                            status: "confirmed",
                          })
                        }
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600"
                        onClick={() =>
                          updateResStatus.mutate({
                            id: res.id,
                            status: "cancelled",
                          })
                        }
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* GROUPED HISTORY WITH REVENUE */}
          <TabsContent value="history">
            <ScrollArea className="h-[70vh] pr-4">
              {Object.keys(groupedHistory).length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  No history available yet.
                </div>
              ) : (
                Object.keys(groupedHistory).map((dateLabel) => (
                  <div key={dateLabel} className="mb-8">
                    <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-primary/20 shadow-sm sticky top-0 z-20">
                      <span className="text-sm font-bold uppercase tracking-wider text-primary">
                        {dateLabel}
                      </span>
                      <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        <IndianRupee className="w-4 h-4" />
                        <span>
                          Total: ₹{groupedHistory[dateLabel].totalRevenue}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="p-4 text-left">Customer</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-right">Earnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedHistory[dateLabel].orders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b last:border-0"
                            >
                              <td className="p-4">
                                <p className="font-bold">
                                  {order.customerName}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatTime(order.createdAt)}
                                </p>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant="outline"
                                  className={
                                    order.status === "completed"
                                      ? "text-green-600 border-green-200 bg-green-50"
                                      : "text-red-600 border-red-200 bg-red-50"
                                  }
                                >
                                  {order.status?.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="p-4 text-right font-bold">
                                ₹{order.totalAmount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
