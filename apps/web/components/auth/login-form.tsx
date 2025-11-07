'use client'
import { signIn } from "@/lib/auth-client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@scrutis/ui/components/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@scrutis/ui/components/form"
import { Input } from "@scrutis/ui/components/input"
import { Label } from "@scrutis/ui/components/label"

const signInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [githubSignInPending, setGithubSignInPending] = useState(false);
  const [emailSignInPending, setEmailSignInPending] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    console.log(values);
    await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          setEmailSignInPending(false);
          router.push("/dashboard");
        },
        onRequest: () => {
          setEmailSignInPending(true);
        },
        onError: (error) => {
          setEmailSignInPending(false);
          // toast("Error", {
          //   description: error.error.message,
          // });
        },
      }
    );
  }

  const githubSignIn = async (event: React.FormEvent) => {
    await signIn.social(
      {
        provider: "github",
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          setGithubSignInPending(false);
        },
        onRequest: () => {
          setGithubSignInPending(true);
        },
        onError: (error) => {
          setGithubSignInPending(false);
          // toast("Error", {
          //   description: error.error.message,
          // });
        },
      }
    );
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={githubSignIn}
          disabled={githubSignInPending}
        >
          <svg
            width="1024"
            height="1024"
            viewBox="0 0 1024 1024"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
              transform="scale(64)"
              fill="currentColor"
            />
          </svg>
          {githubSignInPending ? "Login in..." : "Login with Github"}
        </Button>
      </div>
      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-card text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <div className="grid gap-3">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <div className="grid gap-3">
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>
                            <Label htmlFor="password">Password</Label>
                          </FormLabel>
                          <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />
              </div>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </div>
  );
}