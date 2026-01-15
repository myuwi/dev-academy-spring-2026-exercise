import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { ThemeButton } from "@/components/ThemeButton";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 mx-auto flex h-14 max-w-6xl items-center justify-between bg-background px-2">
        <div>
          <Link className="ui-button" to="/">
            <Zap className="fill-current text-blue-500" /> Electricity
          </Link>
        </div>
        <ThemeButton />
      </nav>
      <main className="mx-auto mt-18 mb-4 max-w-6xl space-y-2 px-4">
        <Outlet />
      </main>
    </>
  );
}
