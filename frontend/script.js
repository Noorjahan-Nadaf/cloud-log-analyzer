const API = "https://cloud-log-analyzer.onrender.com";

let chart;

/* ---------- LOAD LOGS ---------- */
async function loadLogs() {
    try {
        const res = await fetch(API + "/logs");
        let data = await res.json();

        const search = document.getElementById("search").value.toLowerCase();
        const filter = document.getElementById("filter").value;

        data = data.filter(log =>
            (filter === "ALL" || log.level === filter) &&
            log.message.toLowerCase().includes(search)
        );

        const table = document.querySelector("#logTable tbody");
        table.innerHTML = "";

        data.forEach(log=>{
            table.innerHTML += `
            <tr>
                <td class="${log.level}">${log.level}</td>
                <td>${log.message}</td>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
            </tr>`;
        });

        document.getElementById("status").innerText="Connected";

    } catch {
        document.getElementById("status").innerText="Server Offline";
    }
}

/* ---------- LOAD CHART ---------- */
async function loadChart(){
    const res = await fetch(API + "/metrics");
    const data = await res.json();

    const labels = data.map(d=>d.time).reverse();
    const cpu = data.map(d=>d.cpu).reverse();
    const ram = data.map(d=>d.ram).reverse();

    if(chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"),{
        type:"line",
        data:{
            labels,
            datasets:[
                {label:"CPU %", data:cpu},
                {label:"RAM %", data:ram}
            ]
        },
        options:{responsive:true}
    });
}

/* ---------- AUTO REFRESH ---------- */
setInterval(()=>{
    loadLogs();
    loadChart();
},5000);

loadLogs();
loadChart();