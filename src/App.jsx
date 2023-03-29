import { useState, useRef, useCallback, useEffect } from 'react'
import ReactFlow, { MarkerType, ReactFlowProvider, Controls, Background, applyNodeChanges, applyEdgeChanges, updateEdge, addEdge } from 'reactflow';
import Custom2DNode from './Custom2DNode';
import Custom3DNode from './Custom3DNode';
import Group3DNode from './Group3DNode';
import Group2DNode from './Group2DNode';
import CustomEdge from './CustomEdge';
import Sidebar from './Sidebar';
import 'reactflow/dist/style.css';
import './App.css'
import './sidebar.css'
//import {codeSample} from './code-sample.js'
import { ReactComponent as Download } from "./assets/misc/download.svg"
import { ReactComponent as Upload } from "./assets/misc/upload.svg"

const nodeTypes = {
  default2DNode: Custom2DNode,
  group2DNode: Group2DNode,
  default3DNode: Custom3DNode,
  group3DNode: Group3DNode
}

const edgeTypes = {
  edge3D: CustomEdge
}

const MARKER_END = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height:20
}       

let id = 0;
const getId = () => `dndnode_${id++}`;

function App() {
  const reactFlowWrapper = useRef(null);
  const [rawData, setRawData] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [toggleState, setToggleState] = useState(false);
  const [edgeType, setEdgeType] = useState('single-connector')
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const NODE_TYPE = toggleState ? 'default3DNode' : 'default2DNode'
  const GROUP_NODE_TYPE = toggleState ? 'group3DNode' : 'group2DNode'
  const EDGE_TYPE = toggleState ? 'edge3D' : 'step'

  const updateData = (data, toggleState) => {
    let nodes = []
    let edges = []
    data.nodes.map(d => {
      nodes.push({
        ...d,
        type: GROUP_NODE_TYPE,
        data: { 
          label: d.id, 
          name: d.name
        }, 
        style: {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' },
        zIndex: -1
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
            markerEnd: MARKER_END
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
                markerEnd: MARKER_END   
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
                    type: NODE_TYPE,
                    data: { 
                      label: d2.id, 
                      name: d2.name,
                      origX: rectX, 
                      origY: rectY,
                      width: 140,
                      height: 140,
                      icon: 'PubSub'
                    },
                    parentNode: d1.id,
                    extent: toggleState ? null : 'parent',
                    position: { 
                      x: rectX, 
                      y: rectY 
                    },
                    zIndex: 1
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
                    markerEnd: MARKER_END 
                  })
                })
              }
            }) 

            //group nodes
            nodes.push({
              ...d1,
              type: GROUP_NODE_TYPE,
              data: { 
                label: d1.id, 
                name: d1.name, 
                width: nrOfColumns * 120 + 20, 
                height: nrOfRows * 120 + 20,
                origX: rectXGlobal,
                origY: 20
              },
              style: {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' },
              parentNode: d.id,
              extent: toggleState ? null : 'parent',
              position: { 
                x: toggleState ? (rectXGlobal * Math.cos(-35 * Math.PI/180)) : rectXGlobal, 
                y: toggleState ? (counter * ((nrOfRows * 120 + 20) * Math.sin(-35 * Math.PI/180)) + 200) : 20
              }, 
              zIndex: 1
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
              type: NODE_TYPE,
              data: { 
                label: d1.id, 
                name: d1.name, 
                origX: rectXGlobal, 
                origY: 20 + (120 * singleNodeCounter),
                width: 140,
                height: 140
              },
              parentNode: d.id,
              extent: toggleState ? null : 'parent',
              position: { 
                x: toggleState ? (rectXGlobal * Math.cos(-35 * Math.PI/180)) : rectXGlobal, 
                y: toggleState ? ((20 + (120 * singleNodeCounter)) * Math.sin(-35 * Math.PI/180) + 200) : (20 + 120 * singleNodeCounter)
              },
              zIndex: 1
            })
            if(i1 === 0 || i1 === d.nodes.filter(n => n.nodes.length === 0).length -1){
              rectX += rectWidth + 20
              rectXGlobal += rectX + 60
            }
          }

        })
      }
    })

    if(toggleState){
      nodes.forEach(node => {
        let conn = edges.filter(e => e.target === node.id)
        let X = 0
        let Y = 0
        if(node.type === GROUP_NODE_TYPE){
          if(conn.length > 0){
            let sameSourceConns = edges.filter(e => conn.map(c => c.source).indexOf(e.source) !== -1).map(e => e.target)
            let nodesWithSameSource = nodes.filter(n => sameSourceConns.indexOf(n.id) !== -1)
            X = Math.min(...nodesWithSameSource.map(d => d.position.x))
            let refNode = nodesWithSameSource.find(n => n.position.x === X)
            if(refNode){
              let targetX = (refNode.data.height * Math.sin(-35 * Math.PI/180) + (refNode.position.y -  Math.tan(-155 * Math.PI/180) * refNode.position.x) - refNode.position.y) / -Math.tan(-155 * Math.PI/180)
              X = refNode.id === node.id ? refNode.position.x : targetX
              node.position = {x: X, y: refNode.position.y}
            }
          } 
        } 
      })
  
      nodes.forEach(node => {
        let conn = edges.filter(e => e.target === node.id)
        if(node.type !== GROUP_NODE_TYPE){
          if(conn.length > 0){
            const singleNodeCounter = +node.id.split('-')[2].split('')[2] - 1
            let sourceNodes = nodes.filter(n => conn.map(c => c.source).indexOf(n.id) !== -1)
            let sourceX = Math.max(...sourceNodes.map(d => d.position.x))
            let width = Math.max(...sourceNodes.map(d => d.data.width)) 
            let X = sourceX + (width + 60) + ((sourceNodes[0].connectTo.length >= 2 && sourceNodes[0].connectTo.every(d => d.includes('u'))) ? ((20 + (160 * singleNodeCounter)) * Math.sin(-35 * Math.PI/180)) : 0)
            node.position = {x: X, y: node.position.y}
          } 
        } 
      })
    } else {
      nodes.forEach(node => {
        let conn = edges.filter(e => e.target === node.id)
        let X = 0
        let Y = 0
        if(node.type === GROUP_NODE_TYPE){
          if(conn.length > 0){
            let sameSourceConns = edges.filter(e => conn.map(c => c.source).indexOf(e.source) !== -1).map(e => e.target)
            let nodesWithSameSource = nodes.filter(n => sameSourceConns.indexOf(n.id) !== -1)
            X = Math.min(...nodesWithSameSource.map(d => d.position.x))
            let refNode = nodesWithSameSource.find(n => n.position.x === X)
            Y = refNode.id === node.id ? node.position.y : refNode.data.height + 40
            node.position = {x: refNode.position.x, y: Y}
          } 
        } 
      })
  
      nodes.forEach(node => {
        let conn = edges.filter(e => e.target === node.id)
        if(node.type !== GROUP_NODE_TYPE){
          if(conn.length > 0){
            let sourceNodes = nodes.filter(n => conn.map(c => c.source).indexOf(n.id) !== -1)
            let X = Math.max(...sourceNodes.map(d => d.position.x)) + Math.max(...sourceNodes.map(d => d.data.width)) + 40
            node.position = {x: X, y: node.position.y}
          } 
        } 
      })  
    }

    const maxX = Math.max(...nodes.slice(1).map(d => d.position.x))
    const minX = Math.min(...nodes.slice(1).map(d => d.position.x))
    const maxY = Math.max(...nodes.slice(1).map(d => d.position.y))
    const minY = Math.min(...nodes.slice(1).map(d => d.position.y))
    nodes[0].position = {x: toggleState ? minX * Math.sin(-35 * Math.PI/180) : minX, y: minY}
    nodes[0].data = { ...nodes[0].data, width: maxX - minX + 300, height:  maxY - minY + 300}

    setNodes([...nodes]);
    setEdges([...edges])
  }

  useEffect(() => {
    if(Object.keys(rawData).length !== 0){
      updateData(rawData, toggleState)
    }
  }, [rawData, toggleState])

  const importData = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      let data = JSON.parse(event.target.result)[0]
      setRawData(data)
      updateData(data, toggleState)
    }
    reader.readAsText(e.target.files[0]);
  }

  const exportData = (e) => {
    const data = {nodes, edges}
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(data)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'export.json';
    a.click();
  }  

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    []
  );

  const onConnect = useCallback((params) => setEdges((eds) => { 
    return addEdge(
    {
      ...params, 
      type: 'step', 
      markerEnd: {
        type: edgeType === 'line' ? null : MarkerType.ArrowClosed,
        width: 20,
        height: 20
      },
      markerStart: {
        type: (edgeType === 'line' || edgeType === 'single-connector') ? null : MarkerType.ArrowClosed,
        width: 20,
        height: 20
      }  
    }, eds) }), [edgeType]);

  const onNodeClick = (event, node) => console.log('click node', node);
  
  const onNodeDragStop = useCallback((event, node) => {
    const intersections = reactFlowInstance.getIntersectingNodes(node).map((n) => n.id);
    const nodesCopy = [...nodes]
    nodesCopy.forEach(d => {
      if(intersections.includes(d.id)){
        d.parentNode = d.id
        d.extent = 'parent'
      }
    })
    //setNodes(nodesCopy)
  }, [nodes, reactFlowInstance]);

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
        type: type === 'Group' ? 'group2DNode' : 'default2DNode',
        position,
        data: { name: `${type}`},
        style: type === 'Group' ? {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' } : {}
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="App">
      <ReactFlowProvider>
        <Sidebar setEdgeType={setEdgeType} />
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <div style={{position: 'absolute', top: '0px', left: '0px', display: 'flex', zIndex: 99}}>
            <div className="btn">
              <label style={{display: 'flex'}} for="file-upload">
                <div className='btn-svg'><Upload/></div>
                <div className='btn-label'>Import JSON</div>
              </label>
              <input type="file" id="file-upload" accept="application/json" onChange={importData} style={{display: "none"}}/>
            </div>
            <div className="btn">
              <div style={{display: 'flex'}} id="file-export" onClick={exportData}>
                <div className='btn-svg'><Download/></div>
                <div className='btn-label'>Export JSON</div>
              </div>
            </div>
            <div style={{margin: "17px 0px 0px 25px"}}>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round" onClick={() => setToggleState(!toggleState)}></span>
              </label>
            </div>
          </div>
          {nodes.length === 0 &&
            <div style={{position: 'absolute', top: '50%', left: '45%', width: '278px'}}>Add components from the component lib, or generate diagram by importing from code</div>
          }
          <ReactFlow
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeUpdate={onEdgeUpdate}
            onNodeClick={onNodeClick}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStop={onNodeDragStop}
            selectNodesOnDrag={false}
            minZoom={0.2}
            maxZoom={4}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
          {toggleState &&
            <div style={{position: 'absolute', bottom: '30px', right: '20px', display: 'flex'}}>View only mode in 3D view </div>
          }
        </div>
      </ReactFlowProvider>
    </div>
  )
}

export default App

