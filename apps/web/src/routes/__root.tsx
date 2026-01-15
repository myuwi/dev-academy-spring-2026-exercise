import type { QueryClient } from "@tanstack/react-query";
import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { ThemeButton } from "@/components/ThemeButton";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="enter">
      <nav className="sticky z-50 mx-auto flex h-14 max-w-6xl items-center justify-between bg-background px-2">
        <div>
          <Link className="ui-button" to="/">
            <Zap className="fill-current text-blue-500" /> Electricity
          </Link>
        </div>
        <ThemeButton />
      </nav>
      <main className="mx-auto my-4 max-w-6xl px-4">
        <Outlet />
      </main>
    </div>
  );
}
