import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accessibility, Eye, Volume2, MousePointer, Type } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export const AccessibilitySettings = () => {
  const { settings, updateSetting, resetToDefaults } = useAccessibility();

  return (
    <div className="space-y-6">
      {/* Text Size */}
      <Card className="neural-card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Type className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Text Size</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Adjust text size for better readability</Label>
            <div className="mt-2">
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={settings.textSize}
                onChange={(e) => updateSetting('textSize', parseFloat(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                aria-label="Text size slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Smaller</span>
                <span>Larger</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p 
              className="text-sm" 
              style={{ fontSize: `calc(1rem * ${settings.textSize})` }}
            >
              This is how your text will appear with the current size setting.
            </p>
          </div>
        </div>
      </Card>

      {/* Visual Settings */}
      <Card className="neural-card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Visual Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">High Contrast</Label>
              <p className="text-xs text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Large Touch Targets</Label>
              <p className="text-xs text-muted-foreground">
                Make buttons and interactive elements larger
              </p>
            </div>
            <Switch
              checked={settings.largeTouchTargets}
              onCheckedChange={(checked) => updateSetting('largeTouchTargets', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Motion Settings */}
      <Card className="neural-card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <MousePointer className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Motion Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Reduce Motion</Label>
              <p className="text-xs text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Audio Settings */}
      <Card className="neural-card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Volume2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Audio Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Screen Reader Support</Label>
              <p className="text-xs text-muted-foreground">
                Enable enhanced screen reader compatibility
              </p>
            </div>
            <Switch
              checked={settings.screenReader}
              onCheckedChange={(checked) => updateSetting('screenReader', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Voice Over</Label>
              <p className="text-xs text-muted-foreground">
                Optimize for iOS Voice Over
              </p>
            </div>
            <Switch
              checked={settings.voiceOver}
              onCheckedChange={(checked) => updateSetting('voiceOver', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <Accessibility className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
