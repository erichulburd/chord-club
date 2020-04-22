type Log = (...args: any[]) => void;

interface Logger {
  log: Log;
  info?: Log;
  debug?: Log;
  warn?: Log;
  error: Log;
}

class LogManager {
  private loggers: Logger[] = [console];

  public appendLogger(l: Logger) {
    this.loggers.push(l);
  }

  public log(...args: any[]) {
    this.loggers.forEach((l) => l.log(...args))
  }
  public error(...args: any[]) {
    this.loggers.forEach((l) => l.error(...args))
  }
  public info(...args: any[]) {
    this.loggers.forEach((l) => (l.info || l.log)(...args))
  }
  public debug(...args: any[]) {
    this.loggers.forEach((l) => (l.debug || l.log)(...args))
  }
  public warn(...args: any[]) {
    this.loggers.forEach((l) => (l.warn || l.log)(...args))
  }
}

const logger = new LogManager();

export default logger;
