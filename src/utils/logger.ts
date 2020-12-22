const loggers = {};

class Logger {
  namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  log(...args: any[]): void {
    console.log(`[${this.namespace}]`, ...args);
  }

  warn(...args: any[]): void {
    console.warn(`[${this.namespace}]`, ...args);
  }

  error(...args: any[]): void {
    console.error(`[${this.namespace}]`, ...args);
  }
}

const getLoggerOrCreate = (name = "default"): Logger => {
  if (loggers[name]) {
    return loggers[name];
  }

  loggers[name] = new Logger(name);

  return loggers[name];
};

export default getLoggerOrCreate;
