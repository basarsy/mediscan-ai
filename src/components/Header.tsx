import { Activity } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary rounded-lg">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MediScan AI</h1>
            <p className="text-xs text-muted-foreground">Cancer Cell Detection System</p>
          </div>
        </div>
      </div>
    </header>
  );
};
