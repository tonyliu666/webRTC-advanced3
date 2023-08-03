export const trackLatency = (func) => {
    const startTime = performance.now();
    try {
      func();
    } finally {
        const endTime = performance.now();
        const executionTimeMs = endTime-startTime;
        return executionTimeMs;
    }
};