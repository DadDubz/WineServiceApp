// src/pages/PlasmicHostPage.tsx
import { PlasmicComponent, PlasmicRootProvider } from "@plasmicapp/loader-react";
import { PLASMIC } from "@/plasmic-init";

interface Props {
  pageName: string;
}

export default function PlasmicHostPage({ pageName }: Props) {
  return (
    <PlasmicRootProvider loader={PLASMIC}>
      <PlasmicComponent component={pageName} />
    </PlasmicRootProvider>
  );
}
