import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ImageSettings from "@/components/settings/ImageSettings";
import VideoSettings from "@/components/settings/VideoSettings";
import settingService, { UserSettings } from "@/services/setting.service";
import Helpers from "@/config/helpers";

const PreferencesPage = () => {
  const [settings, setSettings] = useState<UserSettings>({
    category: 'default',
    imageSetting: {
      aspectRatio: '1:1',
      width: 1024,
      height: 1024,
    },
    videoSetting: {
      aspectRatio: '16:9',
      width: 1024,
      height: 576,
      duration: 5,
    },
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const data = await settingService.getUserSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      Helpers.showToast('Failed to load settings', 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { settings: updatedSettings } = await settingService.updateUserSettings(settings);
      setSettings(updatedSettings);
      Helpers.showToast('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      Helpers.showToast('Failed to update settings', 'error');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">Media Preferences</h1>
      
      <div className="space-y-6">
        <ImageSettings
          aspectRatio={settings.imageSetting.aspectRatio}
          width={settings.imageSetting.width}
          height={settings.imageSetting.height}
          onSettingsChange={(imageSettings) =>
            setSettings({
              ...settings,
              imageSetting: imageSettings,
            })
          }
        />

        <VideoSettings
          aspectRatio={settings.videoSetting.aspectRatio}
          duration={settings.videoSetting.duration}
          onSettingsChange={(videoSettings) =>
            setSettings({
              ...settings,
              videoSetting: videoSettings,
            })
          }
        />

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
