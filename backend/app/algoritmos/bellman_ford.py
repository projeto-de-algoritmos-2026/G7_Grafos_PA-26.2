from typing import Dict, List, Optional, Tuple, Set
import math

class RouteResult:
    def __init__(self, distances: Dict[int, float], predecessors: Dict[int, Optional[int]], path: List[int], total_distance: float, visited_edges: List[Dict[str, int]]):
        self.distances = distances
        self.predecessors = predecessors
        self.path = path
        self.totalDistance = total_distance
        self.visitedEdges = visited_edges

def run_bellman_ford(graph_nodes: Dict[int, dict], graph_edges: Dict[int, List[dict]], start_node: int, end_node: int) -> Optional[RouteResult]:
    print("----RODANDO BELLMAN-FORD----")
    all_edges = []
    vertices: Set[int] = set()
    
    for u_str, edges in graph_edges.items():
        u = int(u_str)
        vertices.add(u)
        for edge in edges:
            v = int(edge['target'])
            weight = float(edge['distance'])
            all_edges.append({'u': u, 'v': v, 'weight': weight})
            vertices.add(v)

    dist: Dict[int, float] = {}
    pred: Dict[int, Optional[int]] = {}

    for v in vertices:
        dist[v] = math.inf
        pred[v] = None
    
    if start_node not in vertices:
        return None
        
    dist[start_node] = 0.0
    visited_edges: List[Dict[str, int]] = []

    V = len(vertices)
    for i in range(1, V):
        changed = False
        for edge in all_edges:
            u = edge['u']
            v = edge['v']
            weight = edge['weight']
            
            if dist[u] != math.inf and dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                pred[v] = u
                changed = True
                
                if len(visited_edges) < 5000:
                    visited_edges.append({'u': u, 'v': v})
                    
        if not changed:
            break

    for edge in all_edges:
        u = edge['u']
        v = edge['v']
        weight = edge['weight']
        if dist[u] != math.inf and dist[u] + weight < dist[v]:
            print("Aviso: Grafo contém ciclo de peso negativo!")
            return None

    if end_node not in dist or dist[end_node] == math.inf:
        return None

    path: List[int] = []
    current: Optional[int] = end_node
    
    visited_in_path: Set[int] = set()
    
    while current is not None:
        if current in visited_in_path:
            break
        visited_in_path.add(current)
        
        path.append(current)
        if current == start_node:
            break
        current = pred.get(current)
        
    path.reverse()

    return RouteResult(
        distances=dist,
        predecessors=pred,
        path=path,
        total_distance=dist[end_node],
        visited_edges=visited_edges
    )
