import { useUser, useLogout } from "@/hooks/use-auth";
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useAdminReservations,
  useUpdateReservationStatus,
} from "@/hooks/use-orders";
import {
  useCategories,
  useMenuItems,
  useCreateMenuItem,
  useDeleteMenuItem,
  useCreateCategory,
  useDeleteCategoryAdmin,
} from "@/hooks/use-menu";
import { useLocation } from "wouter";
import { useEffect, useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  LogOut,
  Clock,
  Volume2,
  Printer,
  Phone,
  CalendarCheck,
  Users,
  MapPin,
  Plus,
  Trash2,
  UtensilsCrossed,
  IndianRupee,
  Leaf,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isValid, isToday, isYesterday } from "date-fns";
import { OrderItem, type InsertMenuItem, type InsertCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: orders } = useAdminOrders({ refetchInterval: 5000 });
  const { data: reservations } = useAdminReservations({ refetchInterval: 5000 });
  const { data: categories } = useCategories();
  const { data: menuItems } = useMenuItems();

  const updateOrderStatus = useUpdateOrderStatus();
  const updateResStatus = useUpdateReservationStatus();
  const createMenuItem = useCreateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategoryAdmin();

  const prevOrdersCount = useRef<number>(0);
  const prevResCount = useRef<number>(0);

  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InsertMenuItem>>({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
    isVegetarian: true,
    isAvailable: true,
  });
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
    const pendingRes = reservations?.filter((r) => r.status === "pending") || [];

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

  useEffect(() => {
    if (!isLoading && !user) setLocation("/admin");
  }, [user, isLoading, setLocation]);

  const groupedHistory = useMemo(() => {
    if (!orders) return {};
    const history = orders.filter((o) =>
      ["completed", "cancelled"].includes(o.status || ""),
    );

    return history.reduce(
      (
        groups: Record<string, { orders: typeof history; totalRevenue: number }>,
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
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return isValid(date) ? format(date, "h:mm a") : "N/A";
  };

  const handlePrint = (order: typeof orders extends (infer T)[] | null | undefined ? T : never) => {
    if (!order) return;
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
                (item) => `
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

  const handleAddItem = () => {
    if (!newItem.name || !newItem.categoryId || !newItem.price) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createMenuItem.mutate(newItem as InsertMenuItem, {
      onSuccess: () => {
        toast({ title: "Success", description: "Menu item added successfully" });
        setNewItemOpen(false);
        setNewItem({
          name: "",
          description: "",
          price: 0,
          categoryId: 0,
          isVegetarian: true,
          isAvailable: true,
        });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add menu item", variant: "destructive" });
      },
    });
  };

  const handleDeleteItem = (id: number, name: string) => {
    if (!confirm(`Delete "${name}" from menu?`)) return;
    deleteMenuItem.mutate(id, {
      onSuccess: () => toast({ title: "Deleted", description: `${name} removed from menu` }),
      onError: () => toast({ title: "Error", description: "Failed to delete item", variant: "destructive" }),
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }
    createCategory.mutate({ name: newCategoryName } as InsertCategory, {
      onSuccess: () => {
        toast({ title: "Success", description: "Category added successfully" });
        setNewCategoryOpen(false);
        setNewCategoryName("");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add category", variant: "destructive" });
      },
    });
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? All items in this category will also be deleted.`)) return;
    deleteCategory.mutate(id, {
      onSuccess: () => toast({ title: "Deleted", description: `Category ${name} removed` }),
      onError: () => toast({ title: "Error", description: "Failed to delete category", variant: "destructive" }),
    });
  };

  if (isLoading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="bg-white dark:bg-card border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl" data-testid="text-dashboard-title">Salt N Papper Admin</h1>
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
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="bg-white dark:bg-card border p-1 rounded-lg flex-wrap">
            <TabsTrigger value="queue" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="reservations" data-testid="tab-reservations">Table Bookings</TabsTrigger>
            <TabsTrigger value="menu" data-testid="tab-menu">Menu Management</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">Daily History</TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            {!orders || orders.filter((o) => ["pending", "confirmed"].includes(o.status || "")).length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active orders. New orders will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders
                  ?.filter((o) => ["pending", "confirmed"].includes(o.status || ""))
                  .map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-card p-6 rounded-xl border shadow-sm"
                      data-testid={`card-order-${order.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="uppercase text-[10px]">
                          {order.type}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handlePrint(order)}
                          data-testid={`button-print-${order.id}`}
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
                            <MapPin className="w-3 h-3 mt-0.5" /> {order.customerAddress}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 my-4 border-y border-dashed py-3 text-sm">
                        {(order.items as OrderItem[]).map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
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
                            status: order.status === "pending" ? "confirmed" : "completed",
                          })
                        }
                        data-testid={`button-accept-order-${order.id}`}
                      >
                        {order.status === "pending" ? "Accept Order" : "Complete & Bill"}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reservations">
            {!reservations || reservations.filter((r) => ["pending", "confirmed"].includes(r.status || "")).length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active reservations. Bookings will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations
                  ?.filter((r) => ["pending", "confirmed"].includes(r.status || ""))
                  .map((res) => (
                    <div
                      key={res.id}
                      className={`bg-white dark:bg-card p-6 rounded-xl border-2 transition-all ${res.status === "confirmed" ? "border-green-500 shadow-md" : "border-transparent shadow-sm"}`}
                      data-testid={`card-reservation-${res.id}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{res.customerName}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {res.customerPhone}
                          </p>
                        </div>
                        <Badge className={res.status === "confirmed" ? "bg-green-600 text-white" : "bg-yellow-100 text-yellow-800"}>
                          {res.status === "confirmed" ? "IN-HOUSE" : "PENDING"}
                        </Badge>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg mb-4 text-sm font-bold flex gap-2">
                        <CalendarCheck className="h-4 w-4 text-primary" /> {res.date} @ {res.time}
                      </div>
                      <div className="flex items-center gap-2 mb-4 text-sm font-medium">
                        <Users className="w-4 h-4" /> {res.guests} Guests
                      </div>
                      <Button
                        className="w-full"
                        variant={res.status === "pending" ? "default" : "secondary"}
                        onClick={() =>
                          updateResStatus.mutate({
                            id: res.id,
                            status: res.status === "pending" ? "confirmed" : "completed",
                          })
                        }
                        data-testid={`button-confirm-reservation-${res.id}`}
                      >
                        {res.status === "pending" ? "Confirm Arrival" : "Diner Fed (Finish)"}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary" /> Menu Management
                </h2>
                <div className="flex gap-2">
                  <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" data-testid="button-add-category">
                        <Plus className="w-4 h-4 mr-2" /> Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Input
                            id="categoryName"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="e.g., Biryani, Starters"
                            data-testid="input-category-name"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddCategory} disabled={createCategory.isPending} data-testid="button-save-category">
                          {createCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Add Category
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-menu-item">
                        <Plus className="w-4 h-4 mr-2" /> Add Menu Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Menu Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="itemName">Item Name *</Label>
                          <Input
                            id="itemName"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="e.g., Paneer Butter Masala"
                            data-testid="input-item-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="itemDesc">Description</Label>
                          <Textarea
                            id="itemDesc"
                            value={newItem.description || ""}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Brief description of the dish"
                            data-testid="input-item-description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="itemPrice">Price (₹) *</Label>
                            <Input
                              id="itemPrice"
                              type="number"
                              value={newItem.price || ""}
                              onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                              placeholder="250"
                              data-testid="input-item-price"
                            />
                          </div>
                          <div>
                            <Label htmlFor="itemCategory">Category *</Label>
                            <Select
                              value={newItem.categoryId?.toString() || ""}
                              onValueChange={(val) => setNewItem({ ...newItem, categoryId: parseInt(val) })}
                            >
                              <SelectTrigger data-testid="select-item-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories?.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="itemImage">Image URL (optional)</Label>
                          <Input
                            id="itemImage"
                            value={newItem.imageUrl || ""}
                            onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            data-testid="input-item-image"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddItem} disabled={createMenuItem.isPending} data-testid="button-save-item">
                          {createMenuItem.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Add Item
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="space-y-6">
                {categories?.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {menuItems
                          ?.filter((item) => item.categoryId === category.id)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                              data-testid={`menu-item-${item.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Leaf className="w-4 h-4 text-green-600" />
                                  <span className="font-medium">{item.name}</span>
                                </div>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground hidden sm:inline">
                                    - {item.description.slice(0, 40)}...
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-primary flex items-center">
                                  <IndianRupee className="w-3 h-3" />
                                  {item.price}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  data-testid={`button-delete-item-${item.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {menuItems?.filter((item) => item.categoryId === category.id).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No items in this category. Add some items above.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[70vh]">
              {Object.keys(groupedHistory).length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No order history yet.</p>
                </div>
              ) : (
                Object.keys(groupedHistory).map((label) => (
                  <div key={label} className="mb-8">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-muted/90 p-3 rounded-lg border z-20">
                      <span className="font-bold text-primary uppercase text-xs tracking-widest">
                        {label}
                      </span>
                      <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        Revenue: ₹{groupedHistory[label].totalRevenue}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-card rounded-xl border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="p-4 text-left">Customer</th>
                            <th className="p-4 text-left">Order Info</th>
                            <th className="p-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedHistory[label].orders.map((o) => (
                            <tr key={o.id} className="border-b last:border-0 hover:bg-muted/5">
                              <td className="p-4">
                                <p className="font-bold">{o.customerName}</p>
                                <p className="text-[10px] text-muted-foreground">{o.customerPhone}</p>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className="text-[10px] uppercase">
                                  {o.type}
                                </Badge>
                                {o.type === "delivery" && (
                                  <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[150px]">
                                    {o.customerAddress}
                                  </p>
                                )}
                              </td>
                              <td className="p-4 text-right font-bold">₹{o.totalAmount}</td>
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
