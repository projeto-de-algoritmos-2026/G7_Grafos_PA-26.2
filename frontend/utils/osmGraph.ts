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

// Geocodificação usando ViaCEP + Nominatim (OpenStreetMap)
export async function geocodeCEP(cep: string): Promise<{ lat: number; lon: number } | null> {
    try {
        if (!cep) {
            console.warn("CEP vazio, usando fallback.");
            return { lat: -23.550520, lon: -46.633308 };
        }
        const cleanCep = cep.replace(/\D/g, '');
        
        // 1. Tenta pegar a rua exata no ViaCEP
        let query = `postalcode=${cleanCep}&country=Brazil`;
        try {
            const viaRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const viaData = await viaRes.json();
            if (!viaData.erro && viaData.logradouro) {
                // Nominatim funciona muito melhor buscando pelo nome da rua e cidade
                query = `q=${encodeURIComponent(viaData.logradouro)}, ${encodeURIComponent(viaData.localidade)}, Brazil`;
            }
        } catch (e) {
            console.warn("ViaCEP falhou, tentando Nominatim direto com CEP");
        }

        // 2. Busca no Nominatim
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${query}&format=json&limit=1`);
        const data = await res.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        
        // Fallback de demonstração (Centro de SP) caso não ache a rua
        console.warn("Nominatim não encontrou as coordenadas exatas, usando fallback.");
        return { lat: -23.550520, lon: -46.633308 };
        
    } catch (e) {
        console.error("Geocoding erro:", e);
        // Fallback de segurança para não travar a aplicação de demonstração
        return { lat: -23.550520, lon: -46.633308 };
    }
}

// Constrói o Grafo rodoviário usando a API Overpass
export async function buildRoadGraph(lat1: number, lon1: number, lat2: number, lon2: number): Promise<OSMGraph | null> {
    try {
        // Encontra o Bounding Box que cobre a origem e destino com uma margem extra (0.01 graus ~ 1km)
        const margin = 0.015;
        const minLat = Math.min(lat1, lat2) - margin;
        const maxLat = Math.max(lat1, lat2) + margin;
        const minLon = Math.min(lon1, lon2) - margin;
        const maxLon = Math.max(lon1, lon2) + margin;

        const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;

        // Consulta na linguagem OverpassQL
        // Pega todas as ruas (highway) adequadas para carros e motos e seus nós
        const overpassQuery = `
            [out:json][timeout:25];
            (
                way["highway"]( ${bbox} );
            );
            (._;>;);
            out body;
        `;

        const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!res.ok) {
            throw new Error(`Overpass API Error: ${res.statusText}`);
        }

        const data = await res.json();
        
        const nodes: Record<number, OSMNode> = {};
        const ways: any[] = [];

        for (const element of data.elements) {
            if (element.type === 'node') {
                nodes[element.id] = { id: element.id, lat: element.lat, lon: element.lon };
            } else if (element.type === 'way' && element.nodes && element.nodes.length > 0) {
                // Filtramos "highway" tags para remover coisas que não são dirigíveis se fosse o caso (footway, etc)
                // Mas para esse projeto, qualquer rua serve.
                ways.push(element);
            }
        }

        const edges: Record<number, { target: number; distance: number }[]> = {};
        
        // Constrói Lista de Adjacência bidirecional
        for (const way of ways) {
            for (let i = 0; i < way.nodes.length - 1; i++) {
                const u = way.nodes[i];
                const v = way.nodes[i + 1];
                
                if (nodes[u] && nodes[v]) {
                    const dist = calculateDistance(nodes[u].lat, nodes[u].lon, nodes[v].lat, nodes[v].lon);
                    
                    if (!edges[u]) edges[u] = [];
                    edges[u].push({ target: v, distance: dist });
                    
                    if (!edges[v]) edges[v] = [];
                    // Ruas de mão única seriam ignoradas aqui se quiséssemos simular 100% tráfego real, 
                    // mas para garantir um grafo fortemente conexo vamos adicionar nos dois sentidos.
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

export interface BellmanFordResult {
    distances: Record<number, number>;
    predecessors: Record<number, number | null>;
    path: number[];
    totalDistance: number;
}

// Algoritmo Puro de Bellman-Ford (O(V*E))
export function runBellmanFord(graph: OSMGraph, startNode: number, endNode: number): BellmanFordResult | null {
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
        totalDistance: dist[endNode]
    };
}
