import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, MessageCircle } from "lucide-react";

export function DemoOverlay() {
  const [showModal, setShowModal] = useState(false);
  const [isDemo, setIsDemo] = useState(() => localStorage.getItem('demoMode') === 'true');

  useEffect(() => {
    const handleStorage = () => setIsDemo(localStorage.getItem('demoMode') === 'true');
    window.addEventListener('storage', handleStorage);
    window.addEventListener('demo-mode-changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('demo-mode-changed', handleStorage);
    };
  }, []);

  // Show modal automatically when entering demo mode
  useEffect(() => {
    if (isDemo && !sessionStorage.getItem('demoWelcomeShown')) {
      setShowModal(true);
      sessionStorage.setItem('demoWelcomeShown', 'true');
    }
  }, [isDemo]);

  useEffect(() => {
    if (!isDemo) return;

    const handleInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      
      const isAllowed = target.closest('a[href^="http"], .allow-demo-click, .lucide-menu');
      // Treat navigation links as allowed (wouter links inside the app)
      const isInternalLink = target.closest('a[href^="/"]');
      
      const isInteractive = target.closest('button, input, select, textarea, [role="button"], [role="checkbox"], [role="switch"], [role="menuitem"], [role="dialog"], tr');
      
      if (isInteractive && !isAllowed && !isInternalLink) {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleInteraction(e);
      } else {
        // Prevent typing in inputs
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }
      }
    };

    document.addEventListener('click', handleInteraction as any, true);
    document.addEventListener('keydown', handleKeydown, true);
    
    return () => {
      document.removeEventListener('click', handleInteraction as any, true);
      document.removeEventListener('keydown', handleKeydown, true);
    };
  }, [isDemo]);

  if (!isDemo) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-3 text-center z-50 flex flex-wrap items-center justify-center gap-2 md:gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <span className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
          <Lock className="w-4 h-4" /> Modo Demostración
        </span>
        <span className="hidden md:inline text-sm opacity-90">| Funciones interactivas limitadas.</span>
        <a 
          href="https://wa.me/34610056859?text=Estaria%20interesado%20en%20esta%20App%2C%20me%20pueden%20informar%2C%20Gracias" 
          target="_blank" 
          rel="noopener noreferrer"
          className="allow-demo-click bg-white text-primary px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1 shadow-sm ml-2"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Obtener App Completa
        </a>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md z-[100] allow-demo-click">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Versión de Demostración</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-black rounded-full flex items-center justify-center p-2 overflow-hidden border-2 border-primary/20 shadow-md">
              <img src="/src/assets/redcrea-logo.png" alt="RedCrea24 Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left space-y-3 bg-secondary/20 p-4 rounded-lg text-sm text-muted-foreground mb-4">
              <p className="font-bold text-primary text-base text-center mb-2">¡Bienvenido a la versión DEMO!</p>
              <p>Esta es una versión de prueba interactiva para que conozcas la herramienta. Para explorarla, sigue estos pasos:</p>
              <ul className="list-decimal pl-5 space-y-1">
                <li>Usa el <strong>menú lateral</strong> para moverte por las diferentes secciones (Dashboard, Fichajes, Empleados, etc.).</li>
                <li>Explora cómo se visualizan los datos, el panel de control y las tablas.</li>
                <li>La versión completa te permitirá crear usuarios, fichar, descargar informes y gestionar tu empresa.</li>
              </ul>
              <p className="font-medium text-destructive mt-3 text-center border-t pt-2 border-destructive/10">
                ⚠️ Las funciones de guardar, editar o eliminar están bloqueadas en esta DEMO.
              </p>
            </div>
            <p className="font-medium">
              ¿Te gusta lo que ves? Obtén la aplicación funcional sin límites.
            </p>
            <div className="pt-4">
              <a 
                href="https://wa.me/34610056859?text=Estaria%20interesado%20en%20esta%20App%2C%20me%20pueden%20informar%2C%20Gracias" 
                target="_blank" 
                rel="noopener noreferrer"
                className="allow-demo-click w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-md font-bold text-lg hover:bg-[#1EBE5D] transition-colors"
                onClick={() => setShowModal(false)}
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
