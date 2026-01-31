import { useLogin, useUser } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
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
import { restaurant } from "@/config/restaurant";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { mutate: login, isPending, error } = useLogin();
  const { data: user, isLoading: userLoading } = useUser();
  const [, setLocation] = useLocation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/admin/dashboard");
    }
  }, [user, setLocation]);

  const onSubmit = (values: LoginValues) => {
    login(values, {
      onSuccess: () => {
        // Force redirect immediately on success
        setLocation("/admin/dashboard");
      },
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="bg-primary/5 p-8 text-center border-b border-border">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {restaurant.name}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Internal Management Access
          </p>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter admin username"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error.message || "Invalid credentials. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Secure Login
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="px-8 py-4 bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Protected by Enterprise SSL
          </p>
        </div>
      </div>
    </div>
  );
}
