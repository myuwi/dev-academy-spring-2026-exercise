import { ThemeButton } from "@/components/ThemeButton";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="absolute top-2 right-2">
        <ThemeButton />
      </div>
      <Outlet />
    </>
  );
}
