'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OSMGraph } from '../utils/osmGraph';

interface DeliveryMapProps {
    graph: OSMGraph;
    startNode: number;
    endNode: number;
    path: number[];
}

export default function DeliveryMap({ graph, startNode, endNode, path }: DeliveryMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);

    useEffect(() => {
        // Fix para os ícones padrão do leaflet não renderizarem no Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mapRef.current) return;
        
        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(leafletMap.current);
        }

        const map = leafletMap.current;

        // Limpa layers anteriores exceto tiles
        map.eachLayer((layer) => {
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        const sNode = graph.nodes[startNode];
        const eNode = graph.nodes[endNode];

        if (sNode && eNode) {
            // Desenha pinos
            L.marker([sNode.lat, sNode.lon]).addTo(map).bindPopup("Origem");
            
            const destIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            L.marker([eNode.lat, eNode.lon], { icon: destIcon }).addTo(map).bindPopup("Destino");

            // Desenha a rota (menor caminho)
            if (path && path.length > 0) {
                const latlngs = path.map(nodeId => {
                    const node = graph.nodes[nodeId];
                    return [node.lat, node.lon] as [number, number];
                });

                const polyline = L.polyline(latlngs, { color: '#6032F6', weight: 6, opacity: 0.8 }).addTo(map);
                map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
            } else {
                // Se não tem rota, pelo menos ajusta a visão para os dois pontos
                const group = new L.FeatureGroup([
                    L.marker([sNode.lat, sNode.lon]),
                    L.marker([eNode.lat, eNode.lon])
                ]);
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }
        }

    }, [graph, startNode, endNode, path]);

    return (
        <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-3xl overflow-hidden shadow-inner z-0" />
    );
}
