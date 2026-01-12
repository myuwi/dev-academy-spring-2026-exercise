import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stats } from "@/pages/Stats";
import { NuqsAdapter } from "nuqs/adapters/react";

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
