const express = require("express");
const cors = require("cors");
const si = require("systeminformation");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));
app.use(express.static("public"));

let logs = [];
let metrics = [];

/* ---------- FUNCTION TO ADD LOG ---------- */
function addLog(level, message) {
    logs.unshift({
        level,
        message,
        timestamp: new Date()
    });

    if (logs.length > 50) logs.pop();
}

/* ---------- AUTO MONITOR ---------- */
setInterval(async () => {
    try {
        const cpu = await si.currentLoad();
        const mem = await si.mem();
        const disk = await si.fsSize();

        const cpuUsage = Number(cpu.currentLoad.toFixed(1));
        const ramUsage = Number(((mem.used / mem.total) * 100).toFixed(1));
        const diskUsage = Number(disk[0].use.toFixed(1));

        metrics.unshift({
            cpu: cpuUsage,
            ram: ramUsage,
            time: new Date().toLocaleTimeString()
        });
        if (metrics.length > 20) metrics.pop();

        // CPU logs
        if (cpuUsage > 80)
            addLog("ERROR", `High CPU Usage: ${cpuUsage}%`);
        else if (cpuUsage > 50)
            addLog("WARNING", `Moderate CPU Usage: ${cpuUsage}%`);
        else
            addLog("INFO", `CPU Normal: ${cpuUsage}%`);

        // RAM logs
        if (ramUsage > 80)
            addLog("ERROR", `High RAM Usage: ${ramUsage}%`);
        else if (ramUsage > 50)
            addLog("WARNING", `Moderate RAM Usage: ${ramUsage}%`);
        else
            addLog("INFO", `RAM Normal: ${ramUsage}%`);

        // Disk logs
        if (diskUsage > 85)
            addLog("ERROR", `Disk Almost Full: ${diskUsage}%`);
        else if (diskUsage > 60)
            addLog("WARNING", `Disk Filling: ${diskUsage}%`);
        else
            addLog("INFO", `Disk Healthy: ${diskUsage}%`);

    } catch {
        addLog("ERROR", "Monitoring failed");
    }
}, 5000);

/* ---------- ROUTES ---------- */

app.get("/logs", (req, res) => res.json(logs));
app.get("/metrics", (req, res) => res.json(metrics));

/* ---------- SERVER ---------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));