import { useState, useRef, useCallback } from 'react'
import ReactFlow, { Position, MarkerType, ReactFlowProvider, Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import Custom2DNode from './Custom2DNode';
import Custom3DNode from './Custom3DNode';
import CustomEdge from './CustomEdge';
import Sidebar from './Sidebar';
import 'reactflow/dist/style.css';
import './App.css'
import './sidebar.css'

const nodeTypes = {
  boxNode: Custom3DNode,
  defaultNode: Custom2DNode
}

const edgeTypes = {
  boxEdge: CustomEdge,
}

const initialNodes = [
  {
    id: '1',
    type: 'boxNode',
    data: { label: 'Hello' },
    position: { x: 10, y: 450 },
  },
  {
    id: '2',
    type: 'boxNode',
    data: { label: 'World' },
    position: { x: 300, y: 200 },
    zIndex: -1,
  },
  {
    id: '3',
    type: 'boxNode',
    data: { label: 'Hello' },
    position: { x: 500, y: 300 },
    zIndex: -1,
  },
  {
    id: '4',
    type: 'boxNode',
    data: { label: 'Hello' },
    position: { x: -100, y: 130 },
    zIndex: -1,
  },
];

const initialEdges = [
  { 
    id: '1-2', 
    source: '1', 
    target: '2',
    type: 'boxEdge',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  { 
    id: '1-3', 
    source: '1', 
    target: '3',
    type: 'boxEdge',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  { 
    id: '1-4', 
    source: '1', 
    target: '4',
    type: 'boxEdge',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    }, 
  }
];

let id = 0;
const getId = () => `dndnode_${id++}`;

function App() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({...params, type: 'boxEdge'}, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="App">
      <ReactFlowProvider>
        <Sidebar />
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  )
}

export default App
