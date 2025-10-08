export const logger = {
  log: (...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, ...args);
  },
  info: (...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}] ℹ️`, ...args);
  },
  warn: (...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️`, ...args);
  },
  error: (...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌`, ...args);
  },
  debug: (...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] 🔍`, ...args);
  },
};
