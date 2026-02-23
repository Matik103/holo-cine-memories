import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { adMobService } from "@/services/adMobService";

interface AdMobBannerProps {
  position?: "top" | "bottom";
  autoShow?: boolean;
  adUnitId?: string;
}

let globalAdMobInitialized = false;

export const AdMobBanner = ({
  position = "bottom",
  autoShow = true,
  adUnitId,
}: AdMobBannerProps) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios")
      return;

    const run = async () => {
      if (!globalAdMobInitialized) {
        globalAdMobInitialized = true;
        await adMobService.initialize();
        await adMobService.requestConsentInfo();
      }
      if (autoShow) {
        setTimeout(
          () => adMobService.showBanner(position, adUnitId).catch(() => {}),
          500
        );
      }
    };
    run();
  }, [position, autoShow, adUnitId]);

  return null;
};
