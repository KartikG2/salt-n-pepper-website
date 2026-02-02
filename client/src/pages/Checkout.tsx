import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Trash2, ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Form Schema remains the same
const checkoutSchema = z
  .object({
    customerName: z.string().min(2, "Name is required"),
    customerPhone: z.string().min(10, "Valid phone number required"),
    customerAddress: z.string().optional(),
    type: z.enum(["dine-in", "takeaway", "delivery"]),
  })
  .refine(
    (data) => {
      if (data.type === "delivery" && !data.customerAddress) return false;
      return true;
    },
    {
      message: "Address is required for delivery",
      path: ["customerAddress"],
    },
  );

export default function Checkout() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      type: "takeaway",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    },
  });

  const orderType = form.watch("type");

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (items.length === 0) return;

    try {
      await createOrder.mutateAsync({
        ...values,
        // UPDATED: Now mapping portion information into the order items
        items: items.map((i) => ({
          menuItemId: i.id,
          name: i.name,
          price: i.selectedPrice, // Uses the specific price for that portion
          quantity: i.quantity,
          portion: i.portion, // Sends 'full', 'half', or 'quarter'
        })),
        totalAmount: total,
      });

      toast({
        title: "Order Placed Successfully!",
        description: "We have received your order. We'll contact you shortly.",
        duration: 5000,
      });

      clearCart();
      setLocation("/");
    } catch (error) {
      toast({
        title: "Order Failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-6 text-secondary">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some delicious items from our menu to get started.
          </p>
          <Button onClick={() => setLocation("/menu")} size="lg">
            Browse Menu
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 py-12 bg-secondary/5">
        <div className="container-custom">
          <Button
            variant="ghost"
            className="mb-8 pl-0 hover:bg-transparent hover:text-primary transition-colors"
            onClick={() => setLocation("/menu")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-display">Order Summary</h2>
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 space-y-6">
                  {items.map((item) => (
                    // Updated Key to include portion to handle multiple portions of the same item
                    <div
                      key={`${item.id}-${item.portion}`}
                      className="flex items-center justify-between gap-4 animate-in fade-in duration-300"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover bg-secondary/10 border border-border/50"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-sm md:text-base">
                            {item.name}
                          </h4>
                          {/* UPDATED: Clear labeling of the portion size */}
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase font-bold px-1.5 h-4"
                            >
                              {item.portion}
                            </Badge>
                            <p className="text-primary font-bold text-sm">
                              ₹{item.selectedPrice}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-secondary/10 rounded-lg h-9 border border-secondary/10">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.portion,
                              )
                            }
                            className="w-8 h-full flex items-center justify-center hover:bg-secondary/20 rounded-l-lg transition-colors font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.portion,
                              )
                            }
                            className="w-8 h-full flex items-center justify-center hover:bg-secondary/20 rounded-r-lg transition-colors font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.portion)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-secondary/5 p-6 border-t border-border">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary text-2xl font-display">
                      ₹{total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-display">
                Checkout Details
              </h2>
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="font-bold">
                            How will you receive your food?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 gap-2"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-xl hover:bg-secondary/5 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                <FormControl>
                                  <RadioGroupItem value="takeaway" />
                                </FormControl>
                                <FormLabel className="font-semibold cursor-pointer flex-1">
                                  Takeaway / Pickup
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-xl hover:bg-secondary/5 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                <FormControl>
                                  <RadioGroupItem value="delivery" />
                                </FormControl>
                                <FormLabel className="font-semibold cursor-pointer flex-1">
                                  Home Delivery
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-xl hover:bg-secondary/5 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                <FormControl>
                                  <RadioGroupItem value="dine-in" />
                                </FormControl>
                                <FormLabel className="font-semibold cursor-pointer flex-1">
                                  Dine In (Pre-order)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your name"
                                {...field}
                                className="h-12 bg-muted/30 border-border/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="10-digit mobile number"
                                {...field}
                                className="h-12 bg-muted/30 border-border/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {orderType === "delivery" && (
                      <FormField
                        control={form.control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem className="animate-in slide-in-from-top-2 duration-300">
                            <FormLabel className="font-bold">
                              Delivery Address
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Complete address with landmarks in Gadag"
                                {...field}
                                className="min-h-[100px] bg-muted/30 border-border/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg mt-4 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Processing Order...
                        </>
                      ) : (
                        <>
                          Confirm Order{" "}
                          <CheckCircle2 className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
