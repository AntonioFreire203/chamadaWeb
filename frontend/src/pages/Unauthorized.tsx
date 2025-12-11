import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-12 pb-8 px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-destructive/10">
              <ShieldAlert className="h-16 w-16 text-destructive" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Acesso Negado
          </h1>

          <p className="text-muted-foreground mb-2">
            Você não tem permissão para acessar esta página.
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Esta área é restrita apenas para administradores do sistema.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Button
              onClick={handleGoHome}
              className="w-full sm:w-auto gradient-primary"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
