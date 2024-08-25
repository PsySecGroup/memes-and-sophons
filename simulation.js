const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

const nodes = [];
const edges = [];
const nodeCount = 100;
const initialMemes = 5;

let spreadRate = 0.05; // Initial spread rate
let sophonSuppressRate = 0.2; // Initial sophon suppression rate
let sophonCount = 20; // Initial number of sophons

let simulationInterval;
let memeCount = 0; // Total meme count
let suppressedMemes = 0;

// Metrics data for Chart.js
let memeData = [];
let suppressionData = [];

function Node(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'meme', 'sophon', or 'neutral'
    this.connections = [];
}

function initializeNetwork() {
    nodes.length = 0;
    edges.length = 0;

    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node(Math.random() * canvas.width, Math.random() * canvas.height, 'neutral'));
    }

    // Connect nodes
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            if (Math.random() < 0.1) { // 10% chance to connect nodes
                edges.push([nodes[i], nodes[j]]);
                nodes[i].connections.push(nodes[j]);
                nodes[j].connections.push(nodes[i]);
            }
        }
    }

    // Initialize memes
    for (let i = 0; i < initialMemes; i++) {
        let node = nodes[Math.floor(Math.random() * nodeCount)];
        node.type = 'meme';
        memeCount++;
    }

    // Initialize sophons
    for (let i = 0; i < sophonCount; i++) {
        let node = nodes[Math.floor(Math.random() * nodeCount)];
        node.type = 'sophon';
    }

    // Reset suppression counter and metrics data
    suppressedMemes = 0;
    memeData = [];
    suppressionData = [];
    updateCharts();
}

function drawNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = '#88888810';
    ctx.lineWidth = 1;
    for (const [node1, node2] of edges) {
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.stroke();
    }

    // Draw nodes
    for (const node of nodes) {
        if (node.type === 'meme') {
            ctx.fillStyle = '#DFDF00';
        } else if (node.type === 'sophon') {
            ctx.fillStyle = '#BB0000';
        } else {
            ctx.fillStyle = 'gray'; // Neutral nodes are blue
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateNetwork() {
    let newNodes = [];
    
    for (const node of nodes) {
        if (node.type === 'meme') {
            for (const neighbor of node.connections) {
                if (neighbor.type === 'neutral' && Math.random() < spreadRate) {
                    newNodes.push(neighbor);
                }
            }
        } else if (node.type === 'sophon') {
            for (const neighbor of node.connections) {
                if (neighbor.type === 'meme' && Math.random() < sophonSuppressRate) {
                    neighbor.type = 'neutral'; // Sophon suppresses the meme
                    memeCount--; // Decrease the total meme count
                    suppressedMemes++; // Increment the suppression counter
                }
            }
        }
    }

    for (const newNode of newNodes) {
        if (newNode.type === 'neutral') {
            newNode.type = 'meme';
            memeCount++; // Increase the total meme count
        }
    }
    
    updateMetrics();
}

function updateMetrics() {
    memeData.push(memeCount);
    suppressionData.push(suppressedMemes);

    updateCharts();
}

function updateCharts() {
    metricsChart.data.labels.push('');
    metricsChart.data.datasets[0].data.push(memeData[memeData.length - 1]);
    metricsChart.data.datasets[1].data.push(suppressionData[suppressionData.length - 1]);

    metricsChart.update();
}

function startSimulation() {
    initializeNetwork();
    simulationInterval = setInterval(() => {
        updateNetwork();
        drawNetwork();
    }, 500); // Update every 500ms
}

function stopSimulation() {
    clearInterval(simulationInterval);
}

// Initialize sliders
const spreadRateSlider = document.getElementById('spreadRateSlider');
const spreadRateValue = document.getElementById('spreadRateValue');
const sophonSuppressRateSlider = document.getElementById('sophonSuppressRateSlider');
const sophonSuppressRateValue = document.getElementById('sophonSuppressRateValue');
const sophonCountSlider = document.getElementById('sophonCountSlider');
const sophonCountValue = document.getElementById('sophonCountValue');

spreadRateSlider.addEventListener('input', () => {
    spreadRate = parseFloat(spreadRateSlider.value);
    spreadRateValue.textContent = (spreadRate * 100).toFixed(0) + '%';
});

sophonSuppressRateSlider.addEventListener('input', () => {
    sophonSuppressRate = parseFloat(sophonSuppressRateSlider.value);
    sophonSuppressRateValue.textContent = (sophonSuppressRate * 100).toFixed(0) + '%';
});

sophonCountSlider.addEventListener('input', () => {
    sophonCount = parseInt(sophonCountSlider.value, 10);
    sophonCountValue.textContent = sophonCount;
    initializeNetwork(); // Reinitialize the network with the new number of sophons
});

// Chart.js configurations
const ctxMetrics = document.getElementById('metricsChart').getContext('2d');
const metricsChart = new Chart(ctxMetrics, {
    type: 'line',
    data: {
        labels: [], // Initially empty
        datasets: [
            {
                label: 'Infected',
                borderColor: 'green',
                backgroundColor: 'rgba(0, 128, 0, 0.2)',
                data: memeData,
            },
            {
                label: 'Suppressions',
                borderColor: 'black',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                data: suppressionData,
            }
        ]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Count'
                }
            }
        }
    }
});

startSimulation()