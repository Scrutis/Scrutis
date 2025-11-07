import { SignupForm } from "@/components/auth/signup-form"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@scrutis/ui/components/card"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export  default async function SignupPage() {
  const session = await auth.api.getSession({
        headers: await headers()
    })
    if (session) {
      redirect("/dashboard");
    }
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0">
        {/* <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" /> */}
        {/* <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" /> */}
      </div>
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex flex-col gap-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Sign up with your Github account, or create an account with email
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <SignupForm />
            </CardContent>
          </Card>
          <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
            By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
