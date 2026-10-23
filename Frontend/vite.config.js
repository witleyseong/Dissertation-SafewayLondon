import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// in development every /api call is sent to the Express server,
// so the browser sees one origin and there are no CORS problems
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:3000",
        },
    },
});
