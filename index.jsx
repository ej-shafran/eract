// Hot Module Reloading
new EventSource('/esbuild').addEventListener('change', () => location.reload());

console.log("Hello, world!");
