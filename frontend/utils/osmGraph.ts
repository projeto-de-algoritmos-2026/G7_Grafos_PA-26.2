export interface OSMNode {
    id: number;
    lat: number;
    lon: number;
}

export interface OSMEdge {
    source: number;
    target: number;
    distance: number;
}

export interface OSMGraph {
    nodes: Record<number, OSMNode>;
    edges: Record<number, { target: number; distance: number }[]>;
}

// Calcula distância em metros entre duas coordenadas geográficas usando a fórmula de Haversine
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180; // lat1 em radianos
    const φ2 = lat2 * Math.PI / 180; // lat2 em radianos
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // em metros
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } finally {
        clearTimeout(timeout);
    }
}

// Geocodificação inteligente com fallbacks progressivos
export async function geocodeCEP(cep: string): Promise<{ lat: number; lon: number } | null> {
    try {
        if (!cep) return null;
        const cleanCep = cep.replace(/\D/g, '');

        let streetQuery = '';
        let neighborhoodQuery = '';
        let cityQuery = '';
        
        try {
            const viaRes = await fetchWithTimeout(`https://viacep.com.br/ws/${cleanCep}/json/`, {}, 4000);
            const viaData = await viaRes.json();
            if (!viaData.erro) {
                const city = viaData.localidade;
                const uf = viaData.uf;
                const bairro = viaData.bairro ? viaData.bairro.replace(/[\(\)]/g, '') : '';
                
                if (viaData.logradouro) {
                    let sQuery = `street=${encodeURIComponent(viaData.logradouro)}`;
                    if (bairro) {
                        sQuery += `&county=${encodeURIComponent(bairro)}`;
                    }
                    sQuery += `&city=${encodeURIComponent(city)}&state=${encodeURIComponent(uf)}&country=Brazil`;
                    streetQuery = sQuery;
                }
                if (bairro) {
                    // O Nominatim mapeia bairros frequentemente no parâmetro 'county' ou na query livre. 
                    // Uma tática híbrida muito forte é passar o bairro no street ou county junto com cidade e estado
                    neighborhoodQuery = `county=${encodeURIComponent(bairro)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(uf)}&country=Brazil`;
                }
                cityQuery = `city=${encodeURIComponent(city)}&state=${encodeURIComponent(uf)}&country=Brazil`;
            }
        } catch (e) {
            console.warn("ViaCEP falhou ou expirou.");
        }

        const queriesToTry = [
            streetQuery,
            neighborhoodQuery,
            `postalcode=${cleanCep}&country=Brazil`,
            cityQuery
        ].filter(q => q.length > 0);

        for (const query of queriesToTry) {
            try {
                const res = await fetchWithTimeout(
                    `https://nominatim.openstreetmap.org/search?${query}&format=json&limit=1`,
                    {},
                    5000
                );
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    
                    if (lat.toFixed(4) === '-15.7797' || lat.toFixed(4) === '-15.7801') {
                        continue;
                    }
                    
                    return { lat, lon };
                }
            } catch(e) {
                continue;
            }
        }

        console.warn("Nominatim não encontrou as coordenadas para o CEP:", cep);
        // Fallback Brasília 
        return { lat: -15.7975, lon: -47.8919 }; 

    } catch (e) {
        console.error("Geocoding erro/timeout:", e);
        return { lat: -15.7975, lon: -47.8919 }; 
    }
}

export async function buildRoadGraph(lat1: number, lon1: number, lat2: number, lon2: number): Promise<OSMGraph | null> {
    try {
        const latMargin = Math.max(Math.abs(lat1 - lat2) * 0.1, 0.01);
        const lonMargin = Math.max(Math.abs(lon1 - lon2) * 0.1, 0.01);
        
        const minLat = Math.min(lat1, lat2) - latMargin;
        const maxLat = Math.max(lat1, lat2) + latMargin;
        const minLon = Math.min(lon1, lon2) - lonMargin;
        const maxLon = Math.max(lon1, lon2) + lonMargin;

        const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;
        
        // Calcula a distância total para decidir o nível de detalhe das ruas
        const distTotal = calculateDistance(lat1, lon1, lat2, lon2);
        
        // Se a distância for muito grande (ex: > 10km), pegamos apenas avenidas principais para não travar a API e o navegador
        let highwayFilter = 'way["highway"]';
        if (distTotal > 15000) {
            highwayFilter = 'way["highway"~"motorway|trunk|primary|secondary"]';
        } else if (distTotal > 5000) {
            highwayFilter = 'way["highway"~"motorway|trunk|primary|secondary|tertiary"]';
        } else {
            // Para distâncias curtas, pegamos ruas residenciais também, mas excluímos caminhos de pé
            highwayFilter = 'way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified"]';
        }

        const overpassQuery = `
            [out:json][timeout:25];
            (
                ${highwayFilter}( ${bbox} );
            );
            (._;>;);
            out body;
        `;

        const endpoints = [
            'https://overpass-api.de/api/interpreter',
            'https://lz4.overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter'
        ];

        let res = null;
        let lastError = null;

        for (const endpoint of endpoints) {
            try {
                res = await fetchWithTimeout(endpoint, {
                    method: 'POST',
                    body: overpassQuery,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }, 20000); // 20s timeout per endpoint
                if (res.ok) break;
            } catch (err) {
                lastError = err;
            }
        }

        if (!res || !res.ok) {
            throw new Error(`Overpass API Error: ${res ? res.statusText : (lastError as any)?.message}`);
        }

        const data = await res.json();
        
        const nodes: Record<number, OSMNode> = {};
        const ways: any[] = [];

        for (const element of data.elements) {
            if (element.type === 'node') {
                nodes[element.id] = { id: element.id, lat: element.lat, lon: element.lon };
            } else if (element.type === 'way' && element.nodes && element.nodes.length > 0) {
                ways.push(element);
            }
        }

        const edges: Record<number, { target: number; distance: number }[]> = {};
        
        for (const way of ways) {
            for (let i = 0; i < way.nodes.length - 1; i++) {
                const u = way.nodes[i];
                const v = way.nodes[i + 1];
                
                if (nodes[u] && nodes[v]) {
                    const dist = calculateDistance(nodes[u].lat, nodes[u].lon, nodes[v].lat, nodes[v].lon);
                    
                    if (!edges[u]) edges[u] = [];
                    edges[u].push({ target: v, distance: dist });
                    
                    if (!edges[v]) edges[v] = [];
                    edges[v].push({ target: u, distance: dist }); 
                }
            }
        }

        return { nodes, edges };
    } catch (e) {
        console.error("Build graph error:", e);
        return null;
    }
}

// Encontra o nó mais próximo a uma coordenada geográfica
export function findNearestNode(graph: OSMGraph, lat: number, lon: number): number | null {
    let nearestId: number | null = null;
    let minDistance = Infinity;

    for (const id in graph.nodes) {
        const node = graph.nodes[id];
        // Distância euclidiana simples apenas para achar o nó (mais leve que haversine para muitos pontos)
        const dLat = node.lat - lat;
        const dLon = node.lon - lon;
        const dist = dLat*dLat + dLon*dLon;
        if (dist < minDistance) {
            minDistance = dist;
            nearestId = Number(id);
        }
    }
    return nearestId;
}

export interface RouteResult {
    distances: Record<number, number>;
    predecessors: Record<number, number | null>;
    path: number[];
    totalDistance: number;
    visitedEdges: { u: number, v: number }[];
}

// Algoritmo Puro de Bellman-Ford (O(V*E))
export function runBellmanFord(graph: OSMGraph, startNode: number, endNode: number): RouteResult | null {
    // Para Bellman-Ford precisamos da lista de todas as arestas
    const allEdges: { u: number; v: number; weight: number }[] = [];
    const vertices = new Set<number>();
    
    for (const u in graph.edges) {
        const numU = Number(u);
        vertices.add(numU);
        for (const edge of graph.edges[numU]) {
            allEdges.push({ u: numU, v: edge.target, weight: edge.distance });
            vertices.add(edge.target);
        }
    }

    const dist: Record<number, number> = {};
    const pred: Record<number, number | null> = {};

    // 1. Inicialização
    for (const v of vertices) {
        dist[v] = Infinity;
        pred[v] = null;
    }
    dist[startNode] = 0;

    const visitedEdges: { u: number, v: number }[] = [];

    // 2. Relaxamento (V - 1 vezes)
    const V = vertices.size;
    // Otimização prática: paramos se não houver mudança (Early stopping)
    for (let i = 1; i <= V - 1; i++) {
        let changed = false;
        for (const { u, v, weight } of allEdges) {
            if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pred[v] = u;
                changed = true;
                // Only track edge if it actually relaxed to avoid millions of edges in animation
                if (visitedEdges.length < 5000) { 
                    visitedEdges.push({ u, v }); 
                }
            }
        }
        if (!changed) break; // Se nada mudou, achamos o menor caminho
    }

    // 3. Verificação de Ciclo Negativo (não deve ocorrer em distância geográfica, mas o algoritmo exige)
    for (const { u, v, weight } of allEdges) {
        if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
            console.warn("Grafo contém ciclo de peso negativo!");
            return null; 
        }
    }

    // Se o destino é inalcançável
    if (dist[endNode] === Infinity) {
        return null;
    }

    // Reconstruir o caminho final
    const path: number[] = [];
    let current: number | null = endNode;
    
    // Evita loop infinito caso tenha ocorrido algum erro (safety check)
    const visitedInPath = new Set<number>();
    while (current !== null) {
        if (visitedInPath.has(current)) break;
        visitedInPath.add(current);
        
        path.push(current);
        if (current === startNode) break;
        current = pred[current];
    }
    path.reverse();

    return {
        distances: dist,
        predecessors: pred,
        path: path,
        totalDistance: dist[endNode],
        visitedEdges: visitedEdges
    };
}

export function runDijkstra(graph: OSMGraph, startNode: number, endNode: number): RouteResult | null {
    const dist: Record<number, number> = {};
    const pred: Record<number, number | null> = {};
    const visited = new Set<number>();
    const visitedEdges: { u: number, v: number }[] = [];
    
    // Inicialização
    for (const nodeStr in graph.nodes) {
        const nodeId = Number(nodeStr);
        dist[nodeId] = Infinity;
        pred[nodeId] = null;
    }
    dist[startNode] = 0;
    
    const queue = new Set<number>();
    for (const nodeStr in graph.nodes) {
        queue.add(Number(nodeStr));
    }
    
    while (queue.size > 0) {
        let u: number | null = null;
        let minDist = Infinity;
        
        for (const nodeId of queue) {
            if (dist[nodeId] < minDist) {
                minDist = dist[nodeId];
                u = nodeId;
            }
        }
        
        if (u === null) break;
        if (u === endNode) break; // Early exit
        
        queue.delete(u);
        visited.add(u);
        
        if (graph.edges[u]) {
            for (const edge of graph.edges[u]) {
                const v = edge.target;
                const weight = edge.distance;
                if (!visited.has(v)) {
                    if (visitedEdges.length < 10000) {
                        visitedEdges.push({ u, v }); // Track the edge visit for animation
                    }
                    if (dist[u] + weight < dist[v]) {
                        dist[v] = dist[u] + weight;
                        pred[v] = u;
                    }
                }
            }
        }
    }
    
    if (dist[endNode] === Infinity) {
        return null;
    }
    
    const path: number[] = [];
    let current: number | null = endNode;
    while (current !== null) {
        path.push(current);
        if (current === startNode) break;
        current = pred[current];
    }
    path.reverse();
    
    return {
        distances: dist,
        predecessors: pred,
        path,
        totalDistance: dist[endNode],
        visitedEdges
    };
}
