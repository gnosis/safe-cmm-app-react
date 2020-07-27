const loggers = {};

class Logger {
  constructor(namespace) {
    this.namespace = namespace;
  }

  log(...args) {
    console.log(`[${this.namespace}]`, ...args);
  }

  warn(...args) {
    console.warn(`[${this.namespace}]`, ...args);
  }

  error(...args) {
    console.error(`[${this.namespace}]`, ...args);
  }
}

const getLoggerOrCreate = (name = "default") => {
  if (loggers[name]) {
    return loggers[name];
  }

  loggers[name] = new Logger(name);

  return loggers[name];
};

export default getLoggerOrCreate;
