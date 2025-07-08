import api from "./api";

export type AspectRatio = '16:9' | '9:16' | '1:1' | '5:4';
export type Duration = 5 | 10;

export interface UserSettings {
  category: string;
  imageSetting: {
    aspectRatio: AspectRatio;
    width: number;
    height: number;
  };
  videoSetting: {
    aspectRatio: AspectRatio;
    width: number;
    height: number;
    duration: number;
  };
}

const settingService = {
  // Get user settings
  getUserSettings: async (): Promise<UserSettings> => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update user settings
  updateUserSettings: async (settings: UserSettings): Promise<{ message: string; settings: UserSettings }> => {
    const response = await api.put('/settings', settings);
    return response.data;
  }
};

export default settingService; 