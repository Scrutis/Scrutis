import { authClient } from "@/lib/auth-client"; //import the auth client
 
await authClient.signIn.social({
  /**
   * The social provider id
   * @example "github", "google", "apple"
   */
  provider: "github",
  /**
   * a url to redirect after the user authenticates with the provider
   * @default "/"
   */
  callbackURL: "/dashboard",
  /**
   * a url to redirect if an error occurs during the sign in process
   */
  errorCallbackURL: "/error",
  /**
   * a url to redirect if the user is newly registered
   */
  newUserCallbackURL: "/welcome",
  /**
   * disable the automatic redirect to the provider.
   * @default false
   */
  disableRedirect: true,
});