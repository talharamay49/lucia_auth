import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { ValidateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await ValidateRequest()

  if (!user) {
    return redirect("/signIn")
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="pt:mt-0 mx-auto flex flex-col items-center justify-center px-6 pt-8 dark:bg-gray-900 md:h-screen">
        <a
          href="#"
          className="mb-8 flex items-center justify-center text-2xl font-semibold dark:text-white lg:mb-10"
        >
          <img src="/vercel.svg" className="mr-4 h-11" />
        </a>
        <p>Protected Route</p>
        <p>{JSON.stringify(user)}</p>
        <form action={signOut}>
          <Button type="submit">
            Sign Out
          </Button>
        </form>
      </div>
    </main>
  );
}
