export function startAutorestart() {
    // Assuming we're under PM2...
    // the process should restart
    // automatically upon exit

    setTimeout(() => {
        process.exit();
    }, 12 * 60 * 60 * 1000);
}
