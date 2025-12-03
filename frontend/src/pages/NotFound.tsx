import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-card">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">404</h1>
            <p className="text-lg text-muted-foreground">Oops! Página não encontrada</p>
          </div>
          
          <p className="mb-6 text-sm text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <Button asChild className="gradient-primary">
            <a href="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
