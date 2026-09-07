from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from app.algoritmos.bellman_ford import run_bellman_ford

router = APIRouter(
    prefix="/api",
    tags=["Algoritmos"]
)

class GraphNode(BaseModel):
    lat: float
    lon: float

class GraphEdge(BaseModel):
    target: int
    distance: float

class Graph(BaseModel):
    nodes: Dict[int, GraphNode]
    edges: Dict[int, List[GraphEdge]]

class CalculateRouteRequest(BaseModel):
    graph_data: Graph = Field(alias="graph")
    start_node: int = Field(alias="startNode")
    end_node: int = Field(alias="endNode")
    algorithm: str

class VisitedEdge(BaseModel):
    u: int
    v: int

class RouteResultResponse(BaseModel):
    distances: Dict[int, float]
    predecessors: Dict[int, Optional[int]]
    path: List[int]
    totalDistance: float
    visitedEdges: List[VisitedEdge]

@router.post("/routes/calculate", response_model=RouteResultResponse)
async def calculate_route(payload: CalculateRouteRequest):
    """
    Calcula a menor rota usando Bellman-Ford.
    """
    if payload.algorithm != "bellman":
        raise HTTPException(status_code=400, detail="Apenas o algoritmo 'bellman' é suportado no momento.")

    # Converte os modelos Pydantic para os dicionários que a função original espera
    # graph_nodes: Dict[int, dict]
    graph_nodes = {node_id: node.model_dump() for node_id, node in payload.graph_data.nodes.items()}
    
    # graph_edges: Dict[int, List[dict]]
    graph_edges = {node_id: [edge.model_dump() for edge in edges] for node_id, edges in payload.graph_data.edges.items()}

    # O algoritmo tem run_bellman_ford que recebe (nodes, edges, start, end)
    result = run_bellman_ford(graph_nodes, graph_edges, payload.start_node, payload.end_node)

    if result is None:
        raise HTTPException(status_code=404, detail="Não foi possível traçar uma rota conexa entre os pontos ou grafo contém ciclo negativo.")

    # Mapear o objeto RouteResult do Python para o Pydantic
    return RouteResultResponse(
        distances=result.distances,
        predecessors=result.predecessors,
        path=result.path,
        totalDistance=result.totalDistance,
        visitedEdges=[VisitedEdge(u=edge['u'], v=edge['v']) for edge in result.visitedEdges]
    )
