import { useState, useRef, useCallback } from 'react'
import ReactFlow, { Position, MarkerType, ReactFlowProvider, Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import Custom2DNode from './Custom2DNode';
import Custom3DNode from './Custom3DNode';
import Group3DNode from './Group3DNode';
import Group2DNode from './Group2DNode';
import CustomEdge from './CustomEdge';
import Sidebar from './Sidebar';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import './App.css'
import './sidebar.css'
import {codeSample} from './code-sample.js'

const nodeTypes = {
  boxNode: Custom3DNode,
  defaultNode: Custom2DNode,
  groupNode: Group3DNode,
}

const edgeTypes = {
  boxEdge: CustomEdge,
}

const EDGE_TYPE = 'boxEdge'

let id = 0;
const getId = () => `dndnode_${id++}`;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {

  const nodeWidth = (node) => 200 * (node.connectTo.length+1)
  const nodeHeight = (node) => 200 * (node.connectTo.length+1)
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth(node), height: nodeHeight(node) });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth(node) / 2,
      y: nodeWithPosition.y - nodeHeight(node) / 2,
    };

    return node;
  });

  return { nodes, edges };
};

function App() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const updateData = (data) => {
    let nodes = []
    let edges = []

    data.nodes.map(d => {
      nodes.push({
        ...d,
        type: d.type === "group" ? 'groupNode' : 'boxNode',
        data: { 
          label: d.id, 
          name: d.name, 
          width: 140 * (d.connectTo.length+1), 
          height: 140 * (d.connectTo.length+1),
          origX: 20, 
          origY: 20 
        }, 
        position: {
          //x: 20,
          //y: 20,
          x: 20 * Math.cos(-35 * Math.PI/180), 
          y: 20 * Math.sin(-35 * Math.PI/180)
        }
      })

      if(d.connectTo.length > 0){
        d.connectTo.map(c => {
          edges.push({
            id: d.id + '-' + c, 
            source: d.id, 
            target: c,
            type: EDGE_TYPE,
            style: { 
              stroke: '#555'
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            }       
          })
        })
      }

      let rectXGlobal = 20
      let counter = 0
      if(d.nodes){
        d.nodes.map((d1,i1) => {
          
          if(d1.connectTo.length > 0){
            d1.connectTo.map(c1 => {
              edges.push({
                id: d1.id + '-' + c1, 
                source: d1.id, 
                target: c1,
                type: EDGE_TYPE,
                style: { 
                  stroke: '#555'
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                }       
              })
            })
          }
          
          let rectWidth = 100
          let rectX = 20;
          let idx = 0
          if(d1.nodes.length > 0){
            let nrOfRows = Math.ceil(Math.sqrt(d1.nodes.length))
            let nrOfColumns = (Math.sqrt(d1.nodes.length) % 1) > 0.5 ? nrOfRows : Math.floor(Math.sqrt(d1.nodes.length))
            for (let colIdx = 0; colIdx < nrOfColumns; colIdx++) {
              let rectY = 20;
              for (let rowIdx = 0; rowIdx < nrOfRows; rowIdx++) {
                let d2 = d1.nodes[idx]
                if(d2){
                  // node with icon within group
                  nodes.push({
                    ...d2,
                    type: 'boxNode',
                    data: { 
                      label: d2.id, 
                      name: d2.name,
                      origX: rectX, 
                      origY: rectY
                    },
                    parentNode: d1.id,
                    //extent: 'parent',
                    position: { 
                      x: rectX, 
                      y: rectY 
                    },
                  })
                }
                rectY += rectWidth + 20;
                idx += 1
              }
              rectX += rectWidth + 20;
            } 
            d1.nodes.map((d2) => {
              if(d2.connectTo.length > 0){
                d2.connectTo.map(c2 => {
                  edges.push({
                    id: d2.id + '-' + c2, 
                    source: d2.id, 
                    target: c2,
                    type: EDGE_TYPE,
                    style: { 
                      stroke: '#555'
                    },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                    }       
                  })
                })
              }
            }) 

            const singleNodeCounter = +d1.id.split('-')[2].split('')[2] - 1
            console.log(counter)
            //group nodes
            nodes.push({
              ...d1,
              type: d1.type === "group" ? 'groupNode' : 'boxNode',
              data: { 
                label: d1.id, 
                name: d1.name, 
                width: nrOfColumns * 120 + 20, 
                height: nrOfRows * 120 + 20,
                origX: rectXGlobal,
                origY: 20
              },
              parentNode: d1.type === "group" ? d.id : null,
              //extent:  d1.type === "group" ? 'parent' : null,
              position: { 
                //x: rectXGlobal,
                //y: 20,
                x: rectXGlobal * Math.cos(-35 * Math.PI/180), 
                y: counter * ((nrOfRows * 120 + 20) * Math.sin(-35 * Math.PI/180)) + 200
              }, 
            })
            let conn = edges.filter(e => e.target === d1.id)
            let sameSourceConns = edges.filter(e => conn.map(c => c.source).indexOf(e.source) !== -1).map(e => e.target)
            let nodesWithSameSource = nodes.filter(n => sameSourceConns.indexOf(n.id) !== -1)
            if(nodesWithSameSource.length === 1) {
              rectXGlobal += nrOfColumns * 120 + 60
              counter += 1
            }

          } else {
            // node with icon without group
            const singleNodeCounter = +d1.id.split('-')[2].split('')[2] - 1
            nodes.push({
              ...d1,
              type: 'boxNode',
              data: { 
                label: d1.id, 
                name: d1.name, 
                origX: rectXGlobal, 
                origY: 20 + (120 * singleNodeCounter)
              },
              parentNode: d.id,
              //extent: 'parent',
              position: { 
                //x: rectXGlobal,
                //y: 20 + 120 * singleNodeCounter,
                x: rectXGlobal * Math.cos(-35 * Math.PI/180), 
                y: (20 + (120 * singleNodeCounter)) * Math.sin(-35 * Math.PI/180) + 200
              },
            })
            if(i1 === 0 || i1 === d.nodes.filter(n => n.nodes.length === 0).length -1){
              rectX += rectWidth + 20
              rectXGlobal += rectX + 60
            }
          }

        })
      }
    })

    nodes.forEach(node => {
      let conn = edges.filter(e => e.target === node.id)
      let X = 0
      let Y = 0
      if(node.type === 'groupNode'){
        if(conn.length > 0){
          let sameSourceConns = edges.filter(e => conn.map(c => c.source).indexOf(e.source) !== -1).map(e => e.target)
          let nodesWithSameSource = nodes.filter(n => sameSourceConns.indexOf(n.id) !== -1)
          X = Math.min(...nodesWithSameSource.map(d => d.position.x))
          let refNode = nodesWithSameSource.find(n => n.position.x === X)
          if(refNode){
            console.log(refNode.id === node.id)
            let targetX = (refNode.data.height * Math.sin(-35 * Math.PI/180) + (refNode.position.y -  Math.tan(-155 * Math.PI/180) * refNode.position.x) - refNode.position.y) / -Math.tan(-155 * Math.PI/180)
            X = refNode.id === node.id ? refNode.position.x : targetX
            Y = refNode.id === node.id ? refNode.position.y : refNode.data.height + 40
            node.position = {x: X, y: refNode.position.y }
          }
        } 
      } 
    })

    
    nodes.forEach(node => {
      let conn = edges.filter(e => e.target === node.id)
      if(node.type !== 'groupNode'){
        if(conn.length > 0){
          const singleNodeCounter = +node.id.split('-')[2].split('')[2] - 1
          let sourceNodes = nodes.filter(n => conn.map(c => c.source).indexOf(n.id) !== -1)
          let sourceX = Math.max(...sourceNodes.map(d => d.position.x))
          let width = Math.max(...sourceNodes.map(d => d.data.width)) 
          let X = sourceX + (width + 60) + ((sourceNodes[0].connectTo.length >= 2 && sourceNodes[0].connectTo.every(d => d.includes('u'))) ? ((20 + (160 * singleNodeCounter)) * Math.sin(-35 * Math.PI/180)) : 0)
          node.position = {x: X, y: node.position.y }
        } 
      } 
    })
    
    const maxX = Math.max(...nodes.slice(1).map(d => d.position.x))
    const minX = Math.min(...nodes.slice(1).map(d => d.position.x))
    const maxY = Math.max(...nodes.slice(1).map(d => d.position.y))
    const minY = Math.min(...nodes.slice(1).map(d => d.position.y))
    nodes[0].position = {x: minX * Math.sin(-35 * Math.PI/180), y: minY}
    nodes[0].data = { ...nodes[0].data, width: maxX - minX + 200, height:  maxY - minY + 200}

    setNodes([...nodes]);
    setEdges([...edges])
  }

  const importData = () => {
    updateData(codeSample)
    // let reader = new FileReader();
    // reader.onload = (e) => {
    //   try {
    //     let data = JSON.parse(e.target.result)
    //     updateData(data)
    //   } catch {
    //     console.log('error uploading json')
    //   }  
    // }
  }

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({...params, type: 'boxEdge', markerEnd: {type: MarkerType.ArrowClosed},}, eds)), []);

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
          <button type='button' className='importBtn' onClick={() => importData()}>Import from Code</button>
          <ReactFlow
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            // onInit={setReactFlowInstance}
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
