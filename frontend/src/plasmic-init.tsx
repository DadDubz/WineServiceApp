// src/plasmic-init.tsx
import { initPlasmicLoader } from "@plasmicapp/loader-react";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "Wineserviceapp",        // from Plasmic
      token: "yq3HNapl0e5kuDBuVD301ZpMkbsj8s2MbErxBjDcv6551dEUM8POn5H8K0j9KoyGUCKikxT2kkbbGvF08J4KQ" // from Plasmic
    }
  ],

  // Optional: use cache to speed things up in dev
  preview: true,
});
