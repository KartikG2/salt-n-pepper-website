import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCreateReservation } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarDays, Users, Clock } from "lucide-react";

const reservationSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  guests: z.coerce
    .number()
    .min(1, "At least 1 guest")
    .max(20, "For large groups call us directly"),
});

export default function Reservations() {
  const { toast } = useToast();
  const createReservation = useCreateReservation();

  const form = useForm<z.infer<typeof reservationSchema>>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      date: "",
      time: "",
      guests: 2,
    },
  });

  async function onSubmit(values: z.infer<typeof reservationSchema>) {
    try {
      await createReservation.mutateAsync(values);
      toast({
        title: "Table Reserved!",
        description:
          "Your table has been booked successfully. We look forward to serving you.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Could not book table. Please try again or call us.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Side - Image */}
        <div className="hidden md:block w-1/2 relative bg-black">
          {/* Restaurant interior placeholder */}
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80"
            alt="Restaurant Ambience"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-12 flex flex-col justify-center text-white">
            <h2 className="text-5xl font-display font-bold mb-6 text-white-700">
              Book Your Table
            </h2>
            <p className="text-xl max-w-md leading-relaxed opacity-90">
              Enjoy a memorable dining experience with your loved ones. Reserve
              a spot to avoid waiting.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 bg-background p-8 md:p-16 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="md:hidden text-center mb-8">
              <h1 className="text-3xl font-display font-bold">Book A Table</h1>
              <p className="text-muted-foreground mt-2">
                Reserve your spot today
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="h-12"
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mobile Number"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              {...field}
                              className="h-12 pl-10"
                              min={new Date().toISOString().split("T")[0]}
                            />
                            <CalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="time"
                              {...field}
                              className="h-12 pl-10"
                            />
                            <Clock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guests</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            {...field}
                            className="h-12 pl-10"
                          />
                          <Users className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg mt-4 shadow-lg shadow-primary/20"
                  disabled={createReservation.isPending}
                >
                  {createReservation.isPending
                    ? "Confirming..."
                    : "Confirm Reservation"}
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-4">
                  For groups larger than 20, please call us directly.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
