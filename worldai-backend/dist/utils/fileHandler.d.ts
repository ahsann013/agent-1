export declare const downloadAndSaveFile: (url: any, type: any) => Promise<unknown>;
export declare const deleteFile: (filepath: any) => boolean;
export declare const getFileInfo: (filepath: any) => {
    size: number;
    created: Date;
    modified: Date;
    exists: boolean;
} | {
    exists: boolean;
    size?: undefined;
    created?: undefined;
    modified?: undefined;
};
