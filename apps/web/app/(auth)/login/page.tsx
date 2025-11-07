import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@scrutis/ui/components/card";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export default async function LoginPage() {
  const session = await auth.api.getSession({
        headers: await headers()
    })
    if(session) {
        redirect("/dashboard")
    }
  return (
    <div className="relative min-h-screen">
      <div className=" fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-primary/10 blur-[100px]" />
      </div>
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Login with your Github or Google account
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <LoginForm />
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
