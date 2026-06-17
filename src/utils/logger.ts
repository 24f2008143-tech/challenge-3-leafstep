const isProduction = typeof window !== 'undefined'
  ? ((import.meta as any).env?.PROD ?? false)
  : (process.env.NODE_ENV === 'production');

export const logger = {
  info: (message: string, ...optionalParams: any[]) => {
    if (!isProduction) {
      console.log(`[INFO] ${message}`, ...optionalParams);
    }
  },
  warn: (message: string, ...optionalParams: any[]) => {
    console.warn(`[WARN] ${message}`, ...optionalParams);
  },
  error: (message: string, ...optionalParams: any[]) => {
    console.error(`[ERROR] ${message}`, ...optionalParams);
  },
  debug: (message: string, ...optionalParams: any[]) => {
    if (!isProduction) {
      console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
  }
};
