import { useUser, useLogout } from "@/hooks/use-auth";
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useAdminReservations,
  useUpdateReservationStatus,
} from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, CheckCircle, Clock, Volume2, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isValid } from "date-fns";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export default function Dashboard() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: reservations, isLoading: reservationsLoading } = useAdminReservations();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateReservationStatus = useUpdateReservationStatus();

  const prevPendingCount = useRef<number>(0);

  useEffect(() => {
    const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
    if (pendingOrders.length > prevPendingCount.current) {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio
        .play()
        .catch(() =>
          console.log("Sound blocked by browser until user clicks."),
        );
    }
    prevPendingCount.current = pendingOrders.length;
  }, [orders]);

  useEffect(() => {
    if (!isLoading && !user) setLocation("/admin");
  }, [user, isLoading, setLocation]);

  const formatTime = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) return "N/A";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return isValid(date) ? format(date, "h:mm a") : "N/A";
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  if (isLoading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  const getStatusColor = (status: string | null | undefined) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status || ""] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="bg-white dark:bg-card border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl" data-testid="text-dashboard-title">Admin Dashboard</h1>
          <div className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">
            <Volume2 className="w-3 h-3" /> SOUND ACTIVE
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Logged in as{" "}
            <strong className="text-foreground">{user.username}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="text-destructive hover:bg-destructive/10"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl p-4 md:p-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white dark:bg-card border p-1 rounded-lg">
            <TabsTrigger value="orders" className="px-6" data-testid="tab-orders">
              Live Orders
            </TabsTrigger>
            <TabsTrigger value="reservations" className="px-6" data-testid="tab-reservations">
              Reservations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders yet. Orders will appear here when customers place them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" /> Active Orders
                  </h2>
                  <ScrollArea className="h-[70vh]">
                    <div className="space-y-4 pr-4">
                      {orders
                        ?.filter((o) =>
                          ["pending", "confirmed"].includes(o.status || ""),
                        )
                        .map((order) => (
                          <div
                            key={order.id}
                            className="bg-white dark:bg-card p-6 rounded-xl border border-border shadow-sm"
                            data-testid={`card-order-${order.id}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <Badge
                                  className={`${getStatusColor(order.status)} mb-2`}
                                  variant="outline"
                                >
                                  {order.status?.toUpperCase()}
                                </Badge>
                                <h3 className="font-bold text-lg">
                                  {order.customerName}
                                </h3>
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                  {order.type}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {formatTime(order.createdAt)}
                                </p>
                                <p className="font-bold text-xl text-primary">
                                  ₹{order.totalAmount}
                                </p>
                              </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg mb-4 text-sm space-y-2">
                              {(order.items as OrderItem[]).map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span>₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                className={`flex-1 ${order.status === "pending" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                                size="sm"
                                disabled={updateOrderStatus.isPending}
                                onClick={() =>
                                  updateOrderStatus.mutate({
                                    id: order.id,
                                    status:
                                      order.status === "pending"
                                        ? "confirmed"
                                        : "completed",
                                  })
                                }
                                data-testid={`button-accept-order-${order.id}`}
                              >
                                {order.status === "pending"
                                  ? "Accept"
                                  : "Complete"}
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200"
                                size="sm"
                                disabled={updateOrderStatus.isPending}
                                onClick={() =>
                                  updateOrderStatus.mutate({
                                    id: order.id,
                                    status: "cancelled",
                                  })
                                }
                                data-testid={`button-cancel-order-${order.id}`}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </section>

                <section className="space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> History
                  </h2>
                  <ScrollArea className="h-[70vh]">
                    <div className="space-y-3 pr-4">
                      {orders
                        ?.filter((o) =>
                          ["completed", "cancelled"].includes(o.status || ""),
                        )
                        .map((order) => (
                          <div
                            key={order.id}
                            className="bg-white/60 dark:bg-card/60 p-4 rounded-xl border flex justify-between items-center"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                className={getStatusColor(order.status)}
                                variant="outline"
                              >
                                {order.status?.toUpperCase()}
                              </Badge>
                              <span className="font-bold text-sm">
                                {order.customerName}
                              </span>
                            </div>
                            <span className="font-bold">
                              ₹{order.totalAmount}
                            </span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </section>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            {reservationsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : !reservations || reservations.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reservations yet. Reservations will appear here when customers book tables.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" /> Pending Reservations
                  </h2>
                  <ScrollArea className="h-[70vh]">
                    <div className="space-y-4 pr-4">
                      {reservations
                        ?.filter((r) => r.status === "pending")
                        .map((reservation) => (
                          <div
                            key={reservation.id}
                            className="bg-white dark:bg-card p-6 rounded-xl border border-border shadow-sm"
                            data-testid={`card-reservation-${reservation.id}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <Badge
                                  className={`${getStatusColor(reservation.status)} mb-2`}
                                  variant="outline"
                                >
                                  {reservation.status?.toUpperCase()}
                                </Badge>
                                <h3 className="font-bold text-lg">
                                  {reservation.customerName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {reservation.customerPhone}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">
                                  {formatDate(reservation.date)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {reservation.time}
                                </p>
                              </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg mb-4 flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{reservation.guests} guests</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                size="sm"
                                disabled={updateReservationStatus.isPending}
                                onClick={() =>
                                  updateReservationStatus.mutate({
                                    id: reservation.id,
                                    status: "confirmed",
                                  })
                                }
                                data-testid={`button-confirm-reservation-${reservation.id}`}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200"
                                size="sm"
                                disabled={updateReservationStatus.isPending}
                                onClick={() =>
                                  updateReservationStatus.mutate({
                                    id: reservation.id,
                                    status: "cancelled",
                                  })
                                }
                                data-testid={`button-cancel-reservation-${reservation.id}`}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </section>

                <section className="space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> Confirmed / History
                  </h2>
                  <ScrollArea className="h-[70vh]">
                    <div className="space-y-3 pr-4">
                      {reservations
                        ?.filter((r) => r.status !== "pending")
                        .map((reservation) => (
                          <div
                            key={reservation.id}
                            className="bg-white/60 dark:bg-card/60 p-4 rounded-xl border flex justify-between items-center"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                className={getStatusColor(reservation.status)}
                                variant="outline"
                              >
                                {reservation.status?.toUpperCase()}
                              </Badge>
                              <div>
                                <span className="font-bold text-sm block">
                                  {reservation.customerName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(reservation.date)} at {reservation.time}
                                </span>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {reservation.guests} guests
                            </span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </section>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
