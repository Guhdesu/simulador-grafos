let graphData = { nodes: [], edges: [] };
let sequences = {};
let currentMode = 'bfs';
let currentDiff = 'easy';
let currentIndex = 0;
let allowNegative = false;
let currentPreset = '';

const nodesContainer = document.getElementById('nodes-container');
const edgesSvg = document.getElementById('edges-svg');
const instructionText = document.getElementById('instruction-text');
const feedbackMessage = document.getElementById('feedback-message');
const queueDisplay = document.getElementById('queue-display');
const visitedDisplay = document.getElementById('visited-display');
const consoleOutput = document.getElementById('console-output');

function generateRandomGraph() {
    graphData.nodes = [];
    graphData.edges = [];
    
    if (currentPreset === 'bfs1') {
        graphData.nodes = [ {id:0, x:50, y:50}, {id:1, x:20, y:20}, {id:2, x:80, y:20}, {id:3, x:50, y:85} ];
        graphData.edges = [ {source:0, target:1, weight:1}, {source:0, target:2, weight:1}, {source:0, target:3, weight:1} ];
        return;
    }
    if (currentPreset === 'bfs2') {
        graphData.nodes = [ {id:0, x:50, y:20}, {id:1, x:25, y:50}, {id:2, x:75, y:50}, {id:3, x:50, y:80} ];
        graphData.edges = [ {source:0, target:1, weight:1}, {source:0, target:2, weight:1}, {source:1, target:3, weight:1}, {source:2, target:3, weight:1} ];
        return;
    }
    if (currentPreset === 'bfs3') {
        graphData.nodes = [ {id:0, x:10, y:50}, {id:1, x:35, y:20}, {id:2, x:50, y:50}, {id:3, x:75, y:20}, {id:4, x:90, y:50} ];
        graphData.edges = [ {source:0, target:1, weight:1}, {source:1, target:2, weight:1}, {source:2, target:3, weight:1}, {source:3, target:4, weight:1} ];
        return;
    }
    if (currentPreset === 'dijkstra1') {
        graphData.nodes = [ {id:0, x:50, y:20}, {id:1, x:30, y:70}, {id:2, x:70, y:70} ];
        graphData.edges = [ {source:0, target:1, weight:10}, {source:0, target:2, weight:3}, {source:2, target:1, weight:2} ];
        return;
    }
    if (currentPreset === 'dijkstra2') {
        graphData.nodes = [ {id:0, x:20, y:50}, {id:1, x:40, y:30}, {id:2, x:60, y:70}, {id:3, x:80, y:50} ];
        graphData.edges = [ {source:0, target:1, weight:2}, {source:1, target:2, weight:3}, {source:2, target:3, weight:4} ];
        return;
    }
    if (currentPreset === 'dijkstra3') {
        graphData.nodes = [ {id:0, x:50, y:20}, {id:1, x:30, y:50}, {id:2, x:70, y:50}, {id:3, x:50, y:80} ];
        graphData.edges = [ {source:0, target:1, weight:10}, {source:0, target:2, weight:5}, {source:2, target:3, weight:2}, {source:1, target:3, weight:-5} ];
        return;
    }

    let topologies = [];
    if (currentDiff === 'easy') {
        topologies = [
            { pos: [{x:50, y:20}, {x:30, y:60}, {x:70, y:60}, {x:50, y:90}], edges: [[0,1], [0,2], [1,3], [2,3], [1,2]] },
            { pos: [{x:20, y:50}, {x:50, y:20}, {x:50, y:80}, {x:80, y:50}], edges: [[0,1], [0,2], [1,3], [2,3]] }
        ];
    } else if (currentDiff === 'medium') {
        topologies = [
            { pos: [{x:50, y:20}, {x:25, y:50}, {x:75, y:50}, {x:40, y:85}, {x:60, y:85}], edges: [[0,1], [0,2], [1,3], [2,4], [1,2], [3,4]] },
            { pos: [{x:20, y:30}, {x:50, y:30}, {x:80, y:30}, {x:35, y:70}, {x:65, y:70}], edges: [[0,1], [1,2], [0,3], [1,3], [1,4], [2,4], [3,4]] }
        ];
    } else {
        topologies = [
            { pos: [{x:50, y:15}, {x:25, y:50}, {x:75, y:50}, {x:50, y:50}, {x:50, y:85}, {x:20, y:85}], edges: [[0,1], [0,2], [0,3], [1,3], [2,3], [1,4], [2,4], [3,4], [1,5]] },
            { pos: [{x:20, y:20}, {x:50, y:20}, {x:80, y:40}, {x:50, y:60}, {x:20, y:80}, {x:80, y:80}], edges: [[0,1], [1,2], [1,3], [2,5], [3,4], [4,5], [0,3]] },
            { pos: [{x:50, y:20}, {x:30, y:45}, {x:70, y:45}, {x:30, y:80}, {x:70, y:80}], edges: [[0,1], [0,2], [1,2], [1,3], [2,4], [3,4]] }
        ];
    }

    const topo = topologies[Math.floor(Math.random() * topologies.length)];
    const numNodes = topo.pos.length;
    
    let ids = Array.from({length: numNodes}, (_, i) => i);
    ids.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numNodes; i++) {
        graphData.nodes.push({ id: ids[i], x: topo.pos[i].x, y: topo.pos[i].y });
    }

    topo.edges.forEach(e => {
        let u = ids[e[0]];
        let v = ids[e[1]];
        let weight;
        
        if (allowNegative && Math.random() < 0.35) {
            weight = Math.floor(Math.random() * 9) - 9; // -1 to -9
        } else {
            weight = Math.floor(Math.random() * 15) + 1; // 1 to 15
        }
        
        graphData.edges.push({ source: u, target: v, weight });
    });
}

function getNeighbors(u) {
    let neighbors = [];
    graphData.edges.forEach(e => {
        if (e.source === u) neighbors.push({ node: e.target, weight: e.weight });
        if (e.target === u) neighbors.push({ node: e.source, weight: e.weight });
    });
    return neighbors.sort((a, b) => a.node - b.node); // Always prioritize smaller ID
}

function runBFS() {
    let order = [];
    let edgesUsed = [];
    let steps = [];
    let visited = new Array(graphData.nodes.length).fill(false);
    let queue = [];
    
    visited[0] = true;
    queue.push(0);
    order.push(0);
    edgesUsed.push(null);
    
    steps.push({ 
        q: JSON.stringify(queue), 
        v: "[]", 
        msg: "Objetivo: Encontre a Origem (Vértice 0) para iniciar a Busca.",
        cLines: [
            "<span class='comment'>// Inicializando BFS</span>",
            "visitado[0] = 1;",
            "enfileira(0);"
        ]
    });

    while (queue.length > 0) {
        let u = queue.shift();
        let neighbors = getNeighbors(u);
        let currentCLines = [
            `atual = desenfileira(); <span class='comment'>// Processando nó ${u}</span>`,
            `for (int i = 0; i < n; i++) {`,
            `&nbsp;&nbsp;if (grafo[atual][i] == 1 && visitado[i] == 0) {`,
            `&nbsp;&nbsp;&nbsp;&nbsp;visitado[i] = 1;`,
            `&nbsp;&nbsp;&nbsp;&nbsp;enfileira(i);`,
            `&nbsp;&nbsp;}`,
            `}`
        ];
        
        neighbors.forEach(n => {
            if (!visited[n.node]) {
                visited[n.node] = true;
                queue.push(n.node);
                order.push(n.node);
                edgesUsed.push([u, n.node]);
            }
        });
        
        let visitedSoFar = order.slice(0, order.indexOf(u) + 1);
        if (queue.length > 0) {
            steps.push({ 
                q: JSON.stringify(queue), 
                v: JSON.stringify(visitedSoFar), 
                msg: "Regra BFS: Remova o primeiro elemento da Fila e clique nele no mapa.",
                cLines: currentCLines
            });
        } else {
            steps.push({ 
                q: "[]", 
                v: JSON.stringify(order), 
                msg: "Parabéns! Você concluiu a Busca em Largura!",
                cLines: currentCLines.concat(["<span class='comment'>// Fila vazia, fim da busca</span>"])
            });
        }
    }
    
    sequences.bfs = { order, steps, edgesUsed, type: 'nodes' };
}

function runDFS() {
    let order = [];
    let edgesUsed = [];
    let steps = [];
    let visited = new Array(graphData.nodes.length).fill(false);
    
    steps.push({ 
        q: "[]", v: "[]", 
        msg: "Objetivo: Encontre a Origem (Vértice 0) para iniciar a Busca em Profundidade.",
        cLines: [
            "<span class='comment'>// Inicializando DFS</span>",
            "dfs(0);"
        ]
    });

    function dfsHelper(u, parent) {
        visited[u] = true;
        order.push(u);
        
        if (parent !== null) {
            edgesUsed.push([parent, u]);
        } else {
            edgesUsed.push(null);
        }
        
        let currentCLines = [
            `dfs(${u}); <span class='comment'>// Entrou na recursão do nó ${u}</span>`,
            `visitado[${u}] = 1;`,
            `for (int i = 0; i < n; i++) {`,
            `&nbsp;&nbsp;if (grafo[${u}][i] == 1 && visitado[i] == 0) {`,
            `&nbsp;&nbsp;&nbsp;&nbsp;dfs(i);`,
            `&nbsp;&nbsp;}`,
            `}`
        ];
        
        let visitedSoFar = [...order];
        
        // We push the step for the NEXT node to be clicked (or finish)
        steps.push({ 
            q: "[]", 
            v: JSON.stringify(visitedSoFar), 
            msg: "Regra DFS: Mergulhe no vizinho NÃO visitado com menor ID. Se não houver, volte (backtrack).",
            cLines: currentCLines
        });

        let neighbors = getNeighbors(u);
        neighbors.forEach(n => {
            if (!visited[n.node]) {
                dfsHelper(n.node, u);
            }
        });
    }

    dfsHelper(0, null);
    
    // The last pushed step needs a completion message
    steps[steps.length - 1].msg = "Sensacional! Você concluiu a Busca em Profundidade!";
    steps[steps.length - 1].cLines.push("<span class='comment'>// Recursão finalizada. Fim!</span>");
    
    sequences.dfs = { order, steps, edgesUsed, type: 'nodes' };
}

function runDijkstra() {
    let order = [];
    let edgesUsed = [];
    let steps = [];
    let n = graphData.nodes.length;
    let dist = new Array(n).fill(Infinity);
    let visited = new Array(n).fill(false);
    let parent = new Array(n).fill(null);
    
    dist[0] = 0;
    let distsObj = {};
    for(let i=0; i<n; i++) distsObj[i] = dist[i] === Infinity ? '∞' : dist[i];
    
    steps.push({ 
        dists: {...distsObj}, 
        msg: "Objetivo: Inicie o algoritmo selecionando a Origem (Vértice 0).",
        cLines: [
            "<span class='comment'>// Iniciando Dijkstra</span>",
            "for (i = 0; i < n; i++) dist[i] = INFINITO;",
            "dist[0] = 0;"
        ]
    });

    for (let count = 0; count < n; count++) {
        let u = -1;
        let min = Infinity;
        for (let i = 0; i < n; i++) {
            if (!visited[i] && dist[i] < min) {
                min = dist[i];
                u = i;
            }
        }
        if (u === -1) break;
        
        let currentCLines = [
            `u = menorDistancia(); <span class='comment'>// Processando nó ${u}</span>`,
            `visitado[u] = 1;`,
            `for (int i = 0; i < n; i++) {`,
            `&nbsp;&nbsp;if (!visitado[i] && dist[u] + grafo[u][i] < dist[i]) {`,
            `&nbsp;&nbsp;&nbsp;&nbsp;dist[i] = dist[u] + grafo[u][i];`,
            `&nbsp;&nbsp;}`,
            `}`
        ];
        
        visited[u] = true;
        order.push(u);
        
        if (parent[u] !== null) edgesUsed.push([parent[u], u]);
        else edgesUsed.push(null);
        
        let neighbors = getNeighbors(u);
        neighbors.forEach(n_node => {
            if (!visited[n_node.node]) {
                if (dist[u] + n_node.weight < dist[n_node.node]) {
                    dist[n_node.node] = dist[u] + n_node.weight;
                    parent[n_node.node] = u;
                }
            }
        });
        
        for(let i=0; i<n; i++) distsObj[i] = dist[i] === Infinity ? '∞' : dist[i];
        
        if (count < n - 1) {
            steps.push({ 
                dists: {...distsObj}, 
                msg: currentDiff === 'easy' 
                    ? "Regra Dijkstra: Selecione o nó NÃO visitado com a MENOR distância visualizada."
                    : "Modo Pesadelo Dijkstra: Calcule as distâncias na cabeça e selecione o nó mais próximo!",
                cLines: currentCLines
            });
        } else {
            let finalMsg = allowNegative 
                ? "Dijkstra finalizado! ⚠️ ATENÇÃO: Como há pesos negativos, o caminho gerado NÃO é o mínimo real. O algoritmo foi enganado, pois ele nunca reavalia nós já 'visitados'!" 
                : "Sensacional! Você construiu o caminho mínimo usando Dijkstra!";
                
            steps.push({ 
                dists: {...distsObj}, 
                msg: finalMsg,
                cLines: currentCLines.concat(["<span class='comment'>// Todos os vértices visitados. Fim!</span>"])
            });
        }
    }
    sequences.dijkstra = { order, steps, edgesUsed, type: 'nodes' };
}

function runPrim() {
    let order = [];
    let edgesUsed = [];
    let steps = [];
    let n = graphData.nodes.length;
    let custo = new Array(n).fill(Infinity);
    let naAGM = new Array(n).fill(false);
    let pai = new Array(n).fill(null);
    
    custo[0] = 0;
    let distsObj = {};
    for(let i=0; i<n; i++) distsObj[i] = custo[i] === Infinity ? '∞' : custo[i];
    
    steps.push({ 
        dists: {...distsObj}, 
        msg: "Objetivo: Inicie o algoritmo de Prim escolhendo a Origem (Vértice 0).",
        cLines: [
            "<span class='comment'>// Iniciando Prim</span>",
            "for (i = 0; i < n; i++) { custo[i] = INFINITO; naAGM[i] = 0; }",
            "custo[0] = 0;"
        ]
    });

    for (let count = 0; count < n; count++) {
        let u = -1;
        let min = Infinity;
        for (let i = 0; i < n; i++) {
            if (!naAGM[i] && custo[i] < min) {
                min = custo[i];
                u = i;
            }
        }
        if (u === -1) break;
        
        let currentCLines = [
            `u = menorCusto(); <span class='comment'>// Processando nó ${u}</span>`,
            `naAGM[u] = 1;`,
            `for (int i = 0; i < n; i++) {`,
            `&nbsp;&nbsp;if (grafo[u][i] != 0 && naAGM[i] == 0) {`,
            `&nbsp;&nbsp;&nbsp;&nbsp;if (grafo[u][i] < custo[i]) custo[i] = grafo[u][i];`,
            `&nbsp;&nbsp;}`,
            `}`
        ];
        
        naAGM[u] = true;
        order.push(u);
        
        if (pai[u] !== null) edgesUsed.push([pai[u], u]);
        else edgesUsed.push(null);
        
        let neighbors = getNeighbors(u);
        neighbors.forEach(n_node => {
            if (!naAGM[n_node.node]) {
                if (n_node.weight < custo[n_node.node]) {
                    custo[n_node.node] = n_node.weight;
                    pai[n_node.node] = u;
                }
            }
        });
        
        for(let i=0; i<n; i++) distsObj[i] = custo[i] === Infinity ? '∞' : custo[i];
        
        if (count < n - 1) {
            steps.push({ 
                dists: {...distsObj}, 
                msg: currentDiff === 'easy' 
                    ? "Regra Prim: Selecione o nó NÃO visitado com a MENOR aresta de conexão direta visualizada."
                    : "Modo Pesadelo Prim: Calcule mentalmente e selecione a aresta mais barata que conecta a AGM!",
                cLines: currentCLines
            });
        } else {
            steps.push({ 
                dists: {...distsObj}, 
                msg: "Sensacional! Árvore Geradora Mínima montada com Prim!",
                cLines: currentCLines.concat(["<span class='comment'>// Árvore completa. Fim!</span>"])
            });
        }
    }
    sequences.prim = { order, steps, edgesUsed, type: 'nodes' };
}

function runKruskal() {
    let order = []; // Holds edge IDs "edge-u-v"
    let edgesUsed = [];
    let steps = [];
    
    let edges = [...graphData.edges].sort((a, b) => a.weight - b.weight);
    let n = graphData.nodes.length;
    let pai = new Array(n).fill(0).map((_, i) => i);
    
    function encontrar(x) {
        if (pai[x] !== x) pai[x] = encontrar(pai[x]);
        return pai[x];
    }
    
    function unir(x, y) {
        let raizX = encontrar(x);
        let raizY = encontrar(y);
        pai[raizX] = raizY;
    }
    
    steps.push({ 
        msg: "Objetivo: Clique nas ETIQUETAS de Custo. Kruskal sempre pega a menor aresta de todo o mapa!",
        cLines: [
            "<span class='comment'>// Iniciando Kruskal</span>",
            "ordenar_arestas();",
            "for (int i=0; i<n; i++) pai[i] = i; <span class='comment'>// Cada um é sua própria raiz</span>"
        ]
    });
    
    for (let i = 0; i < edges.length; i++) {
        let e = edges[i];
        let u = e.source;
        let v = e.target;
        
        if (encontrar(u) !== encontrar(v)) {
            let edgeId = `edge-${Math.min(u, v)}-${Math.max(u, v)}`;
            order.push(edgeId);
            edgesUsed.push([u, v]);
            
            unir(u, v);
            
            let currentCLines = [
                `u = arestas[i].origem; v = arestas[i].destino; <span class='comment'>// Testando aresta ${u}-${v} (peso ${e.weight})</span>`,
                `if (encontrar(u) != encontrar(v)) { <span class='comment'>// Não forma ciclo!</span>`,
                `&nbsp;&nbsp;unir(u, v);`,
                `}`
            ];
            
            if (order.length < n - 1) {
                steps.push({ 
                    msg: "Regra Kruskal: Clique na próxima aresta mais barata que NÃO forma um ciclo fechado com as já escolhidas.",
                    cLines: currentCLines
                });
            } else {
                steps.push({ 
                    msg: "Sensacional! Árvore Geradora Mínima montada perfeitamente com Kruskal!",
                    cLines: currentCLines.concat(["<span class='comment'>// Árvore possui V-1 arestas. Fim!</span>"])
                });
                break;
            }
        }
    }
    sequences.kruskal = { order, steps, edgesUsed, type: 'edges' };
}


function initGraph() {
    generateRandomGraph();
    runBFS();
    runDFS();
    runDijkstra();
    runPrim();
    runKruskal();

    nodesContainer.innerHTML = '';
    edgesSvg.innerHTML = '';
    
    graphData.edges.forEach(edge => {
        const source = graphData.nodes.find(n => n.id === edge.source);
        const target = graphData.nodes.find(n => n.id === edge.target);
        
        let minId = Math.min(source.id, target.id);
        let maxId = Math.max(source.id, target.id);
        let edgeId = `edge-${minId}-${maxId}`;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('id', edgeId);
        line.setAttribute('x1', `${source.x}%`);
        line.setAttribute('y1', `${source.y}%`);
        line.setAttribute('x2', `${target.x}%`);
        line.setAttribute('y2', `${target.y}%`);
        line.classList.add('edge-line');
        edgesSvg.appendChild(line);
        
        const costLabel = document.createElement('div');
        costLabel.className = 'cost-badge';
        costLabel.style.left = `${(source.x + target.x) / 2}%`;
        costLabel.style.top = `${(source.y + target.y) / 2}%`;
        costLabel.textContent = `${edge.weight}h`;
        
        // Add click listener for Kruskal
        costLabel.addEventListener('click', () => handleEdgeClick(edgeId));
        
        nodesContainer.appendChild(costLabel);
    });
    
    graphData.nodes.forEach(node => {
        const el = document.createElement('div');
        el.className = 'node';
        el.id = `node-${node.id}`;
        el.style.left = `${node.x}%`;
        el.style.top = `${node.y}%`;
        el.textContent = node.id;
        
        const distLabel = document.createElement('div');
        distLabel.className = 'node-dist';
        distLabel.id = `dist-${node.id}`;
        distLabel.textContent = '∞';
        el.appendChild(distLabel);
        
        el.addEventListener('click', () => handleNodeClick(node.id));
        nodesContainer.appendChild(el);
    });

    currentIndex = 0;
    updateUI();
}

function printToConsole(lines) {
    consoleOutput.innerHTML = '';
    if (!lines) return;
    
    lines.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'console-line';
        div.innerHTML = `> ${line}`;
        div.style.animationDelay = `${index * 0.1}s`;
        consoleOutput.appendChild(div);
    });
    setTimeout(() => {
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }, 100);
}

function updateUI() {
    const seq = sequences[currentMode];
    const step = seq.steps[currentIndex];
    
    if(step) {
        instructionText.textContent = step.msg;
        printToConsole(step.cLines);
    }
    
    document.body.className = `mode-${currentMode} diff-${currentDiff}`;
    
    document.querySelectorAll('.node').forEach(n => {
        n.classList.remove('visited', 'reachable', 'processing');
    });
    
    document.querySelectorAll('.edge-line').forEach(e => {
        e.classList.remove('active', 'active-red');
    });
    
    if (seq.type === 'nodes') {
        for (let i = 0; i < currentIndex; i++) {
            const el = document.getElementById(`node-${seq.order[i]}`);
            if(el) el.classList.add('visited');
            
            let edge = seq.edgesUsed[i];
            if (edge) {
                let edgeId = `edge-${Math.min(edge[0], edge[1])}-${Math.max(edge[0], edge[1])}`;
                let edgeEl = document.getElementById(edgeId);
                if(edgeEl) edgeEl.classList.add('active');
            }
        }
    } else if (seq.type === 'edges') {
        for (let i = 0; i < currentIndex; i++) {
            let edgeId = seq.order[i];
            let edgeEl = document.getElementById(edgeId);
            if(edgeEl) edgeEl.classList.add('active');
            
            let edgePair = seq.edgesUsed[i];
            if (edgePair) {
                document.getElementById(`node-${edgePair[0]}`).classList.add('visited');
                document.getElementById(`node-${edgePair[1]}`).classList.add('visited');
            }
        }
    }
    
    if (currentMode === 'bfs' || currentMode === 'dfs') {
        queueDisplay.innerHTML = '';
        visitedDisplay.innerHTML = '';
        
        if(step && step.q) {
            const qArr = JSON.parse(step.q);
            qArr.forEach(item => {
                const b = document.createElement('span');
                b.className = 'badge processing';
                b.textContent = item;
                queueDisplay.appendChild(b);
            });
        }
        
        if(step && step.v) {
            const vArr = JSON.parse(step.v);
            vArr.forEach(item => {
                const b = document.createElement('span');
                b.className = 'badge visited';
                b.textContent = item;
                visitedDisplay.appendChild(b);
            });
        }
    } else if (currentMode === 'dijkstra' || currentMode === 'prim') {
        queueDisplay.innerHTML = '<span class="badge" style="border-color:transparent;background:transparent;">Consulte as etiquetas sobre os nós</span>';
        visitedDisplay.innerHTML = '';
        for (let i = 0; i < currentIndex; i++) {
            const b = document.createElement('span');
            b.className = 'badge visited';
            b.textContent = seq.order[i];
            visitedDisplay.appendChild(b);
        }
        
        if (step && step.dists) {
            const visitedSoFar = seq.order.slice(0, currentIndex);
            Object.keys(step.dists).forEach(id => {
                const distEl = document.getElementById(`dist-${id}`);
                if(distEl) {
                    const isVisited = visitedSoFar.includes(parseInt(id));
                    if (isVisited || currentDiff !== 'hard') {
                        distEl.textContent = `Dist: ${step.dists[id]}`;
                        distEl.style.color = isVisited ? '#6ee7b7' : '#fbbf24';
                    } else {
                        distEl.textContent = `?`;
                        distEl.style.color = '#fbbf24';
                    }
                }
            });
        }
    } else if (currentMode === 'kruskal') {
        queueDisplay.innerHTML = '<span class="badge" style="border-color:transparent;background:transparent;">Consulte os pesos das arestas no mapa</span>';
        visitedDisplay.innerHTML = '';
    }
}

function showFeedback(isCorrect) {
    if (isCorrect) {
        feedbackMessage.textContent = "Correto! ✅";
        feedbackMessage.className = `feedback correct`;
    } else {
        let hint = "";
        if (currentMode === 'bfs') hint = "Lembrete FIFO: Quem chegou primeiro na Fila?";
        else if (currentMode === 'dfs') hint = "Lembrete Pilha: Mergulhe no vizinho mais profundo (menor ID se houver empate)!";
        else if (currentMode === 'kruskal') hint = "Lembrete Kruskal: Aresta mais barata de TODO o mapa que NÃO forma ciclo!";
        else hint = "Lembrete: Busque o menor valor amarelo entre os nós não verdes!";
        
        feedbackMessage.innerHTML = `Ops! Errado! ❌ <span style="font-size:0.9rem; font-weight:normal; display:block; margin-top:4px; color:#cbd5e1;">${hint}</span>`;
        feedbackMessage.className = `feedback wrong`;
    }
    
    setTimeout(() => { feedbackMessage.textContent = ''; }, 3500);
}

function handleNodeClick(nodeId) {
    const seq = sequences[currentMode];
    if (seq.type !== 'nodes') return;
    
    if (currentIndex >= seq.order.length) return; 
    const expected = seq.order[currentIndex];
    const nodeEl = document.getElementById(`node-${nodeId}`);
    
    if (nodeId === expected) {
        showFeedback(true);
        currentIndex++;
        updateUI();
    } else {
        showFeedback(false);
        nodeEl.classList.add('shake');
        setTimeout(() => nodeEl.classList.remove('shake'), 500);
    }
}

function handleEdgeClick(edgeId) {
    const seq = sequences[currentMode];
    if (seq.type !== 'edges') return;
    
    if (currentIndex >= seq.order.length) return; 
    const expected = seq.order[currentIndex];
    
    if (edgeId === expected || edgeId === expected.split('-').slice(0,1).concat(expected.split('-').reverse().slice(0,2)).join('-')) {
        // Because edge IDs are sorted by min/max, string matching is exactly the same!
        if (edgeId === expected) {
            showFeedback(true);
            currentIndex++;
            updateUI();
        }
    } else {
        showFeedback(false);
    }
}

document.querySelectorAll('.sidebar-left .btn[id^="btn-"]').forEach(btn => {
    if (btn.id.startsWith('btn-diff-') || btn.id === 'btn-reset') return;
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar-left .btn:not(.diff-btn):not(#btn-reset)').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = btn.id.replace('btn-', '');
        currentIndex = 0;
        updateUI();
    });
});

document.getElementById('btn-diff-easy').addEventListener('click', (e) => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentDiff = 'easy';
    initGraph();
});

document.getElementById('btn-diff-medium').addEventListener('click', (e) => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentDiff = 'medium';
    initGraph();
});

document.getElementById('btn-diff-hard').addEventListener('click', (e) => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentDiff = 'hard';
    initGraph();
});

document.getElementById('chk-negative').addEventListener('change', (e) => {
    allowNegative = e.target.checked;
    initGraph();
});

document.getElementById('preset-select').addEventListener('change', (e) => {
    currentPreset = e.target.value;
    
    if (currentPreset.startsWith('bfs')) {
        currentMode = 'bfs';
        document.querySelectorAll('.sidebar-left .btn[id^="btn-"]:not(.diff-btn):not(#btn-reset)').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-bfs').classList.add('active');
    } else if (currentPreset.startsWith('dijkstra')) {
        currentMode = 'dijkstra';
        document.querySelectorAll('.sidebar-left .btn[id^="btn-"]:not(.diff-btn):not(#btn-reset)').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-dijkstra').classList.add('active');
        
        if (currentPreset === 'dijkstra3') {
            allowNegative = true;
            document.getElementById('chk-negative').checked = true;
        } else {
            allowNegative = false;
            document.getElementById('chk-negative').checked = false;
        }
    }
    
    initGraph();
});

document.getElementById('btn-reset').addEventListener('click', () => {
    initGraph();
});

// Start
initGraph();
