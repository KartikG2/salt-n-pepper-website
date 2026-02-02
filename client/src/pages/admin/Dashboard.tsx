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
  useUpdateMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Plus,
  Trash2,
  Edit3,
  UtensilsCrossed,
  Leaf,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isYesterday } from "date-fns";
import {
  type OrderItem,
  type InsertMenuItem,
  type MenuItem,
  type ItemPrices,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fixes "Expected 0 arguments, but got 1"
  const { data: orders } = useAdminOrders({ refetchInterval: 5000 });
  const { data: reservations } = useAdminReservations({
    refetchInterval: 5000,
  });
  const { data: categories } = useCategories({ refetchInterval: 5000 });
  const { data: menuItems } = useMenuItems({ refetchInterval: 5000 });

  const updateOrderStatus = useUpdateOrderStatus();
  const updateResStatus = useUpdateReservationStatus();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategoryAdmin();

  const prevOrdersCount = useRef<number>(0);
  const prevResCount = useRef<number>(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [itemPrices, setItemPrices] = useState<ItemPrices>({
    full: 0,
    half: 0,
    quarter: 0,
  });
  const [itemData, setItemData] = useState<Partial<InsertMenuItem>>({
    name: "",
    description: "",
    categoryId: 0,
    isVegetarian: true,
    isAvailable: true,
  });

  useEffect(() => {
    const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
    const pendingRes =
      reservations?.filter((r) => r.status === "pending") || [];

    if (
      pendingOrders.length > prevOrdersCount.current ||
      pendingRes.length > prevResCount.current
    ) {
      new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      )
        .play()
        .catch(() => {});
    }
    prevOrdersCount.current = pendingOrders.length;
    prevResCount.current = pendingRes.length;
  }, [orders, reservations]);

  useEffect(() => {
    if (!isLoading && !user) setLocation("/admin");
  }, [user, isLoading, setLocation]);

  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemData({
        name: item.name,
        description: item.description,
        categoryId: item.categoryId,
        isVegetarian: item.isVegetarian,
        isAvailable: item.isAvailable,
        imageUrl: item.imageUrl,
      });
      setItemPrices(item.prices as ItemPrices);
    } else {
      setEditingItem(null);
      setItemData({
        name: "",
        description: "",
        categoryId: categories?.[0]?.id || 0,
        isVegetarian: true,
        isAvailable: true,
      });
      setItemPrices({ full: 0, half: 0, quarter: 0 });
    }
    setDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemData.name || !itemData.categoryId || !itemPrices.full) {
      toast({
        title: "Error",
        description: "Name, Category, and Full Price are required",
        variant: "destructive",
      });
      return;
    }

    const payload = { ...itemData, prices: itemPrices };

    if (editingItem) {
      updateMenuItem.mutate(
        { id: editingItem.id, ...payload },
        {
          onSuccess: () => {
            toast({ title: "Updated", description: "Menu item updated" });
            setDialogOpen(false);
          },
        },
      );
    } else {
      createMenuItem.mutate(payload as InsertMenuItem, {
        onSuccess: () => {
          toast({ title: "Success", description: "Item added to menu" });
          setDialogOpen(false);
        },
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName) return;
    // Fixes "Argument of type '{ name: string; }' is not assignable"
    createCategory.mutate(
      {
        name: newCategoryName,
        slug: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
        sortOrder: 0,
      },
      {
        onSuccess: () => {
          setNewCategoryOpen(false);
          setNewCategoryName("");
        },
      },
    );
  };

  const groupedHistory = useMemo(() => {
    if (!orders) return {};
    return orders
      .filter((o) => ["completed", "cancelled"].includes(o.status || ""))
      .reduce((groups: any, order) => {
        const date = order.createdAt ? new Date(order.createdAt) : new Date();
        const dateLabel = isToday(date)
          ? "Today"
          : isYesterday(date)
            ? "Yesterday"
            : format(date, "MMMM dd, yyyy");
        if (!groups[dateLabel])
          groups[dateLabel] = { orders: [], totalRevenue: 0 };
        groups[dateLabel].orders.push(order);
        if (order.status === "completed")
          groups[dateLabel].totalRevenue += order.totalAmount;
        return groups;
      }, {});
  }, [orders]);

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
          <TabsList className="bg-white border p-1 rounded-lg flex-wrap">
            <TabsTrigger value="queue">Orders</TabsTrigger>
            <TabsTrigger value="reservations">Table Bookings</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="history">Daily History</TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders
                ?.filter((o) =>
                  ["pending", "confirmed"].includes(o.status || ""),
                )
                .map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <Badge
                        variant="outline"
                        className="uppercase text-[10px]"
                      >
                        {order.type}
                      </Badge>
                      <Badge
                        className={
                          order.status === "confirmed"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }
                      >
                        {order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-bold text-lg">
                        {order.customerName}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                        <Phone className="w-3 h-3" />
                        {order.customerPhone}
                      </p>
                      <div className="space-y-1 border-t border-dashed pt-3 text-sm">
                        {(order.items as any[]).map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name}{" "}
                              {item.portion ? `(${item.portion})` : ""}
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
                        className="w-full mt-4"
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
                          : "Mark Completed"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="reservations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations
                ?.filter((r) =>
                  ["pending", "confirmed"].includes(r.status || ""),
                )
                .map((res) => (
                  <Card
                    key={res.id}
                    className={
                      res.status === "confirmed"
                        ? "border-green-500 border-2"
                        : ""
                    }
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <h3 className="font-bold">{res.customerName}</h3>
                      <Badge>
                        {res.status === "confirmed" ? "In-House" : "Booking"}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-2 rounded mb-3 text-sm font-bold flex gap-2">
                        <CalendarCheck className="w-4 h-4 text-primary" />
                        {res.date} @ {res.time}
                      </div>
                      <div className="flex items-center gap-2 mb-4 text-sm">
                        <Users className="w-4 h-4" />
                        {res.guests} Guests
                      </div>
                      <Button
                        className="w-full"
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
                          : "Complete Visit"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="menu">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary" /> Menu
                  Management
                </h2>
                <div className="flex gap-2">
                  <Dialog
                    open={newCategoryOpen}
                    onOpenChange={setNewCategoryOpen}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setNewCategoryOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Category
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Category</DialogTitle>
                      </DialogHeader>
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category Name"
                      />
                      <Button onClick={handleAddCategory}>Save</Button>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={() => openItemDialog()}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Item" : "Add Item"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={itemData.name || ""}
                        onChange={(e) =>
                          setItemData({ ...itemData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[10px]">Full (₹)</Label>
                        <Input
                          type="number"
                          value={itemPrices.full}
                          onChange={(e) =>
                            setItemPrices({
                              ...itemPrices,
                              full: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Half (₹)</Label>
                        <Input
                          type="number"
                          value={itemPrices.half || 0}
                          onChange={(e) =>
                            setItemPrices({
                              ...itemPrices,
                              half: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Quarter (₹)</Label>
                        <Input
                          type="number"
                          value={itemPrices.quarter || 0}
                          onChange={(e) =>
                            setItemPrices({
                              ...itemPrices,
                              quarter: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={itemData.categoryId?.toString()}
                          onValueChange={(v) =>
                            setItemData({ ...itemData, categoryId: Number(v) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Type</Label>
                        <Button
                          variant={
                            itemData.isVegetarian ? "default" : "outline"
                          }
                          className="w-full"
                          onClick={() =>
                            setItemData({
                              ...itemData,
                              isVegetarian: !itemData.isVegetarian,
                            })
                          }
                        >
                          {itemData.isVegetarian ? "Veg" : "Non-Veg"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Fixes "type boolean | null | undefined is not assignable" */}
                      <input
                        type="checkbox"
                        id="avail"
                        checked={!!itemData.isAvailable}
                        onChange={(e) =>
                          setItemData({
                            ...itemData,
                            isAvailable: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="avail">Available for ordering</Label>
                    </div>
                    <Textarea
                      placeholder="Description"
                      value={itemData.description || ""}
                      onChange={(e) =>
                        setItemData({
                          ...itemData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button className="w-full" onClick={handleSaveItem}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="space-y-6">
                {categories?.map((cat) => (
                  <Card key={cat.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle>{cat.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteCategory.mutate(cat.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {menuItems
                        ?.filter((i) => i.categoryId === cat.id)
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg group ${item.isAvailable ? "bg-muted/30" : "bg-red-50 opacity-70"}`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <Leaf
                                  className={`w-3 h-3 ${item.isVegetarian ? "text-green-600" : "text-red-600"}`}
                                />
                                <span className="font-medium">{item.name}</span>
                                {!item.isAvailable && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[8px] h-4"
                                  >
                                    OUT OF STOCK
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                F: ₹{(item.prices as ItemPrices).full} | H: ₹
                                {(item.prices as ItemPrices).half || 0} | Q: ₹
                                {(item.prices as ItemPrices).quarter || 0}
                              </span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openItemDialog(item)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-8 w-8"
                                onClick={() => deleteMenuItem.mutate(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[70vh]">
              {Object.keys(groupedHistory).map((label) => (
                <div key={label} className="mb-8">
                  <div className="flex justify-between items-center mb-4 bg-muted/90 p-3 rounded-lg border sticky top-0 z-20">
                    <span className="font-bold uppercase text-xs tracking-widest">
                      {label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-green-700 font-bold"
                    >
                      Total Revenue: ₹{groupedHistory[label].totalRevenue}
                    </Badge>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="p-4 text-left">Customer</th>
                            <th className="p-4 text-left">Type</th>
                            <th className="p-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedHistory[label].orders.map((o: any) => (
                            <tr key={o.id} className="border-b last:border-0">
                              <td className="p-4 font-bold">
                                {o.customerName}
                                <br />
                                <span className="text-[10px] font-normal">
                                  {o.customerPhone}
                                </span>
                              </td>
                              <td className="p-4 uppercase text-[10px]">
                                {o.type}
                              </td>
                              <td className="p-4 text-right font-bold">
                                ₹{o.totalAmount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
