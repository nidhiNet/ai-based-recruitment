enum ConsoleColors {
    reset = "\x1b[0m",
    info = "\x1b[34m", // Blue
    warn = "\x1b[33m", // Yellow
    error = "\x1b[31m", // Red
    success = "\x1b[32m", // Green
};

class ConsoleOverride {
    private static log = console.log;
    private static warn = console.warn;
    private static error = console.error;

    public static override() {
        console.log = function (...args) {
            const message = `${ConsoleColors.success}[info] ${new Date().toISOString()}${ConsoleColors.reset}`;
            ConsoleOverride.log(message, args);
        };

        console.warn = function (...args) {
            const message = `${ConsoleColors.warn}[warn] ${new Date().toISOString()}${ConsoleColors.reset}`;
            ConsoleOverride.warn(message, args);
        };

        console.error = function (...args) {
            const message = `${ConsoleColors.error}[error] ${new Date().toISOString()}${ConsoleColors.reset}`;
            ConsoleOverride.error(message, args);
        };
    }
};
export default ConsoleOverride;