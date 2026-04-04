import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { applyWorkspaceSeed, type WorkspaceSeed } from "@/lib/store";

type ActivationSession = {
  email: string;
  planName: string;
  activationToken: string;
  status: "pending_activation" | "active" | "canceled";
  companyName?: string;
  adminName?: string;
  workspaceSeed?: WorkspaceSeed;
};

export default function ActivateAccount() {
  const [, navigate] = useLocation();
  const [sessionData, setSessionData] = useState<ActivationSession | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    adminName: "",
    password: "",
  });

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (!sessionId) {
      setError("No se ha recibido el identificador de la compra.");
      setIsLoading(false);
      return;
    }

    async function loadSession() {
      try {
        const response = await fetch(
          `/api/onboarding/session?session_id=${encodeURIComponent(sessionId ?? "")}`,
          { credentials: "include" },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudo validar la compra.");
        }

        setSessionData(data);
        setForm((current) => ({
          companyName: data.companyName || current.companyName,
          adminName: data.adminName || current.adminName,
          password: current.password,
        }));

        if (data.status === "active" && data.workspaceSeed) {
          applyWorkspaceSeed(data.workspaceSeed);
          navigate("/");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al validar la compra.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          activationToken: sessionData?.activationToken,
          companyName: form.companyName,
          adminName: form.adminName,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo activar la cuenta.");
      }

      applyWorkspaceSeed(data.workspaceSeed);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Activa tu cuenta</CardTitle>
          <CardDescription>
            Completa estos datos para empezar a usar la aplicacion con tu plan ya contratado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Activacion no disponible</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <p className="text-muted-foreground">Validando la compra en Stripe...</p>
          ) : (
            <>
              <div className="rounded-lg border bg-secondary/20 p-4 text-sm">
                <p><strong>Correo:</strong> {sessionData?.email || "-"}</p>
                <p><strong>Plan:</strong> {sessionData?.planName || "-"}</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la empresa</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        companyName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">Nombre del administrador</Label>
                  <Input
                    id="adminName"
                    value={form.adminName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        adminName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena de acceso</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    minLength={8}
                    required
                  />
                </div>

                <Button className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Activando cuenta..." : "Entrar en mi aplicacion"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
