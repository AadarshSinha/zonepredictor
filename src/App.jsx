import { useCallback, useState } from "react";

import { AuthProvider } from "./auth/AuthProvider";
import { useBackendStatus } from "./hooks/useBackendStatus";
import { AuthDialog } from "./components/AuthDialog";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Navbar } from "./components/Navbar";
import { OfflineBanner } from "./components/OfflineBanner";
import { Performance } from "./components/Performance";
import { Predictor } from "./components/Predictor";
import { Roadmap } from "./components/Roadmap";
import { SupportedMaps } from "./components/SupportedMaps";

function Page() {
  const { status: backendStatus, info, recheck } = useBackendStatus();
  const [authOpen, setAuthOpen] = useState(false);

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar backendStatus={backendStatus} onSignIn={openAuth} />
      <OfflineBanner status={backendStatus} onRetry={recheck} />

      <main>
        <Hero backendStatus={backendStatus} />
        <Predictor backendStatus={backendStatus} />
        <HowItWorks />
        <SupportedMaps backendMaps={info?.supportedMaps} />
        <Performance />
        <Roadmap />
        <Contact />
      </main>

      <Footer backendInfo={info} />

      <AuthDialog open={authOpen} onClose={closeAuth} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Page />
    </AuthProvider>
  );
}
