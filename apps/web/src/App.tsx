import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Stats } from "@/pages/Stats";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <Stats />
      </QueryClientProvider>
    </NuqsAdapter>
  );
}

export default App;
