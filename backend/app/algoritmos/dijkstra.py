import math
from typing import Dict, List, Optional
from .bellman_ford import RouteResult
from .min_heap import MinHeap

def run_dijkstra(graph_nodes: Dict[int, dict], graph_edges: Dict[int, List[dict]], start_node: int, end_node: int) -> Optional[RouteResult]:
    vertices = set([int(k) for k in graph_nodes.keys()])
    
    if start_node not in vertices:
        return None

    distances: Dict[int, float] = {}
    predecessors: Dict[int, Optional[int]] = {}
    visited_edges: List[Dict[str, int]] = []
    
    pq = MinHeap()

    for v in vertices:
        distances[v] = math.inf
        predecessors[v] = None

    distances[start_node] = 0.0
    pq.insert(start_node, 0.0)

    while not pq.is_empty():
        current = pq.extract_min()
        
        if current is None:
            break
            
        u = current['node']
        current_dist = current['dist']

        if u == end_node:
            break

        if current_dist > distances[u]:
            continue

        for edge in graph_edges.get(u, []):
            v = int(edge['target'])
            weight = float(edge['distance'])
            
            if len(visited_edges) < 5000:
                visited_edges.append({'u': u, 'v': v})

            new_dist = current_dist + weight

            if new_dist < distances[v]:
                distances[v] = new_dist
                predecessors[v] = u
                
                if v in pq.pos_map:
                    pq.decrease_key(v, new_dist)
                else:
                    pq.insert(v, new_dist)

    return None