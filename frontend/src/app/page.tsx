import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { ModelGrid } from "@/components/models/ModelGrid";
import { ClientOnlyGuard } from "@/components/auth/ClientOnlyGuard";
import { MOCK_MODELS } from "@/data/mock";

export default function HomePage() {
  return (
    <ClientOnlyGuard>
      <HeroSection />
      <ModelGrid models={MOCK_MODELS} showOnlineOnly />
      <TrustBar />
    </ClientOnlyGuard>
  );
}
