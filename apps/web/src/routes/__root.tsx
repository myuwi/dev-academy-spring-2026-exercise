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
    <div className="enter flex min-h-dvh flex-col">
      <nav className="sticky z-50 mx-auto flex h-14 w-full max-w-6xl items-center justify-between bg-background px-2">
        <div>
          <Link className="ui-button text-base" to="/">
            <Zap className="fill-current text-blue-500" /> Electricity
          </Link>
        </div>
        <ThemeButton />
      </nav>
      <Outlet />
    </div>
  );
}
