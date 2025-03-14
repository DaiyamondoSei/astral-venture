
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dataFlowAnalyzer, DataFlowAnalysis, DataFlowNode } from '@/utils/test/DataFlowAnalyzer';

const NODE_COLORS = {
  component: '#a5b4fc', // Indigo
  hook: '#bfdbfe',      // Blue
  service: '#fde68a',   // Yellow
  database: '#86efac',  // Green
  external: '#fecaca',  // Red
};

const EnhancedDataFlowVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analysis, setAnalysis] = useState<DataFlowAnalysis | null>(null);
  const [hoveredNode, setHoveredNode] = useState<DataFlowNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<DataFlowNode | null>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // Node positions (memoized to prevent recalculation)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({}); 
  
  useEffect(() => {
    // Generate a sample analysis if none exists
    const analysis = dataFlowAnalyzer.analyze();
    setAnalysis(analysis);
    
    // Calculate initial node positions
    const positions: Record<string, { x: number, y: number }> = {};
    const nodeCount = analysis.nodes.length;
    
    if (nodeCount > 0) {
      const radius = Math.min(400, 100 * Math.sqrt(nodeCount));
      const angleStep = (2 * Math.PI) / nodeCount;
      
      analysis.nodes.forEach((node, index) => {
        const angle = index * angleStep;
        positions[node.id] = {
          x: 500 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle)
        };
      });
      
      setNodePositions(positions);
    }
  }, []);
  
  useEffect(() => {
    if (!canvasRef.current || !analysis) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Apply transformations
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    
    // Draw connections
    analysis.connections.forEach(connection => {
      const sourcePos = nodePositions[connection.source];
      const targetPos = nodePositions[connection.target];
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        
        // Draw curved line
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        const curveFactor = 50;
        
        // Add some curve based on connection.type
        const controlX = midX + (connection.type === 'async' ? curveFactor : 0);
        const controlY = midY - curveFactor;
        
        ctx.quadraticCurveTo(controlX, controlY, targetPos.x, targetPos.y);
        
        // Set line style based on connection.type
        if (connection.type === 'async') {
          ctx.setLineDash([5, 3]);
          ctx.strokeStyle = '#6366f1';
        } else if (connection.type === 'event') {
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = '#f43f5e';
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = '#94a3b8';
        }
        
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw arrow at target
        const angle = Math.atan2(targetPos.y - controlY, targetPos.x - controlX);
        const arrowSize = 10;
        
        ctx.beginPath();
        ctx.moveTo(targetPos.x, targetPos.y);
        ctx.lineTo(
          targetPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
          targetPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(targetPos.x, targetPos.y);
        ctx.lineTo(
          targetPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
          targetPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        
        // Draw data label
        ctx.fillStyle = '#475569';
        ctx.font = '10px sans-serif';
        ctx.fillText(connection.data, midX, midY - 5);
      }
    });
    
    // Draw nodes
    analysis.nodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
      
      // Set fill color based on node type
      ctx.fillStyle = NODE_COLORS[node.type] || '#d1d5db';
      
      // Highlight selected or hovered node
      if (selectedNode?.id === node.id) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3b82f6';
      } else if (hoveredNode?.id === node.id) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#60a5fa';
      } else {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#94a3b8';
      }
      
      ctx.fill();
      ctx.stroke();
      
      // Draw node label
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Shorten the name if needed
      const displayName = node.name.length > 15 
        ? node.name.substring(0, 12) + '...' 
        : node.name;
      
      ctx.fillText(displayName, pos.x, pos.y);
    });
    
    ctx.restore();
  }, [analysis, nodePositions, hoveredNode, selectedNode, scale, offset]);
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !analysis) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position in canvas coordinates
    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;
    
    // Handle dragging
    if (dragging) {
      setOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
      return;
    }
    
    // Check if mouse is over a node
    let hovered: DataFlowNode | null = null;
    
    for (const node of analysis.nodes) {
      const pos = nodePositions[node.id];
      if (!pos) continue;
      
      const dx = mouseX - pos.x;
      const dy = mouseY - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 20) {
        hovered = node;
        break;
      }
    }
    
    setHoveredNode(hovered);
  };
  
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !analysis) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position in canvas coordinates
    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;
    
    // Check if mouse is over a node
    let clicked: DataFlowNode | null = null;
    
    for (const node of analysis.nodes) {
      const pos = nodePositions[node.id];
      if (!pos) continue;
      
      const dx = mouseX - pos.x;
      const dy = mouseY - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 20) {
        clicked = node;
        break;
      }
    }
    
    if (clicked) {
      setSelectedNode(clicked);
    } else {
      setDragging(true);
      setStartPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  };
  
  const handleCanvasMouseUp = () => {
    setDragging(false);
  };
  
  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => Math.max(0.1, Math.min(3, prevScale * zoomFactor)));
  };
  
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };
  
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>Enhanced Data Flow Visualization</CardTitle>
        <CardDescription>
          Visualize how data flows through the application components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
            >
              Reset View
            </Button>
            <div className="text-sm text-muted-foreground">
              Zoom: {(scale * 100).toFixed(0)}%
            </div>
          </div>
          <div className="flex gap-2">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative border rounded-md">
          <canvas
            ref={canvasRef}
            width={1000}
            height={600}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleCanvasWheel}
            className="w-full h-[600px] cursor-move"
          />
          
          {hoveredNode && (
            <div className="absolute bg-white p-2 rounded shadow-md text-xs z-10"
              style={{
                left: `${nodePositions[hoveredNode.id]?.x * scale + offset.x + 30}px`,
                top: `${nodePositions[hoveredNode.id]?.y * scale + offset.y - 10}px`,
              }}
            >
              <div className="font-bold">{hoveredNode.name}</div>
              <div>Type: {hoveredNode.type}</div>
              <div>Dependencies: {hoveredNode.dependencies.length}</div>
              <div>Data In: {hoveredNode.dataIn.length}</div>
              <div>Data Out: {hoveredNode.dataOut.length}</div>
            </div>
          )}
        </div>
        
        {selectedNode && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h3 className="text-lg font-semibold mb-2">{selectedNode.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Details</h4>
                <div className="text-sm">Type: {selectedNode.type}</div>
                <div className="text-sm">ID: {selectedNode.id}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Dependencies</h4>
                {selectedNode.dependencies.length > 0 ? (
                  <ul className="text-sm list-disc pl-4">
                    {selectedNode.dependencies.map(dep => (
                      <li key={dep}>{dep}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No dependencies</div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Data In</h4>
                {selectedNode.dataIn.length > 0 ? (
                  <ul className="text-sm list-disc pl-4">
                    {selectedNode.dataIn.map(data => (
                      <li key={data}>{data}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No input data</div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Data Out</h4>
                {selectedNode.dataOut.length > 0 ? (
                  <ul className="text-sm list-disc pl-4">
                    {selectedNode.dataOut.map(data => (
                      <li key={data}>{data}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No output data</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDataFlowVisualization;
