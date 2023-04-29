import { useState, useRef, useCallback, useEffect } from 'react'
import ReactFlow, { MarkerType, ReactFlowProvider, Controls, Background, applyNodeChanges, applyEdgeChanges, updateEdge, addEdge } from 'reactflow';
import Custom2DNode from './Custom2DNode';
import Custom3DNode from './Custom3DNode';
import Group3DNode from './Group3DNode';
import Group2DNode from './Group2DNode';
import CustomEdge from './CustomEdge';
import Sidebar from './Sidebar';
import Form from './Form';
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

const isGroup = d => d.type === 'group' || d.type === 'group2DNode' || d.type === 'group3DNode'
const isNode = d => d.type === 'node' || d.type === 'default2DNode' || d.type === 'default3DNode'

function App() {
  const reactFlowWrapper = useRef(null);
  const [rawData, setRawData] = useState({});
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [toggleState, setToggleState] = useState(false);
  const [edgeType, setEdgeType] = useState('single-connector')
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState({node: {}, edges: {}});

  const updateData = (data, toggleState) => {
    console.log(data)
    const NODE_TYPE = toggleState ? 'default3DNode' : 'default2DNode'
    const GROUP_NODE_TYPE = toggleState ? 'group3DNode' : 'group2DNode'
    const EDGE_TYPE = toggleState ? 'edge3D' : 'step'

    let nodes = []
    let edges = []
    data.nodes.map(d => {

      if(d.id){
        nodes.push({
          ...d,
          type: GROUP_NODE_TYPE,
          id: d.id,
          data: { 
            label: d.id, 
            name: 'Root'
          }, 
          style: toggleState ? {} : {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' },
          zIndex: -1
        })
      }

      if(d.connectTo && d.connectTo.length > 0){
        d.connectTo.map(c => {
          edges.push({
            id: d.id + '-' + c, 
            source: d.id, 
            target: c,
            type: EDGE_TYPE,
            style: { 
              stroke: '#555'
            },
            markerEnd: MARKER_END,
            sourceHandle: 'right',
            targetHandle: 'left'
          })
        })
      }

      let rectXGlobal = 20
      let counter = 0
      if(d.nodes){
        d.nodes.map((d1,i1) => {
          
          if(d1.connectTo && d1.connectTo.length > 0){
            d1.connectTo.map(c1 => {
              edges.push({
                id: d1.id + '-' + c1, 
                source: d1.id, 
                target: c1,
                type: EDGE_TYPE,
                style: { 
                  stroke: '#555'
                },
                markerEnd: MARKER_END,
                sourceHandle: 'right',
                targetHandle: 'left'
              })
            })
          }
          
          let rectWidth = 100
          let rectX = 20;
          let idx = 0
          if(d1.nodes && d1.nodes.length > 0){
            d1.nodes = d1.nodes.filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.id === value.id
              ))
            )
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
                    type: d2.name === 'Group' ? GROUP_NODE_TYPE : NODE_TYPE,
                    data: { 
                      label: d2.id, 
                      name: d2.name,
                      origX: rectX, 
                      origY: rectY,
                      width: 140,
                      height: 140
                    },
                    parentNode: d1.id,
                    style: {},
                    extent: toggleState ? null : 'parent',
                    position: { 
                      x: toggleState ? (nrOfRows === 1 && nrOfColumns === 1 ? rectX : (rectX * Math.cos(-35 * Math.PI/180)) + (rowIdx * 100)) : rectX, 
                      y: toggleState ? (nrOfRows === 1 && nrOfColumns === 1 ? rectY : (rectY * Math.sin(-35 * Math.PI/180)) + (rowIdx * 120) - (colIdx * 60) + (nrOfRows >= 3 ? 160 : 100)) : rectY
                    },
                    zIndex: 2
                  })
                }
                rectY += rectWidth + 20;
                idx += 1
              }
              rectX += rectWidth + 20;
            } 
            d1.nodes.map((d2) => {
              if(d2.connectTo && d2.connectTo.length > 0){
                d2.connectTo.map(c2 => {
                  edges.push({
                    id: d2.id + '-' + c2, 
                    source: d2.id, 
                    target: c2,
                    type: EDGE_TYPE,
                    style: { 
                      stroke: '#555'
                    },
                    markerEnd: MARKER_END,
                    sourceHandle: 'right',
                    targetHandle: 'left'
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
                width: nrOfColumns * (toggleState ? 140 : 120) + 20, 
                height: nrOfRows * (toggleState ? 140 : 120) + 20,
                origX: rectXGlobal,
                origY: 20
              },
              style: toggleState ? {} : {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' },
              parentNode: d.id,
              extent: (!d.id || toggleState) ? null : 'parent',
              position: { 
                x: toggleState ? (rectXGlobal * Math.cos(-35 * Math.PI/180)) : rectXGlobal, 
                y: toggleState ? (counter * ((nrOfRows * 120) * Math.sin(-35 * Math.PI/180))) + 360 : 20
              }, 
              zIndex: 1
            })
            //let conn = edges.filter(e => e.target === d1.id)
            //let sameSourceConns = edges.filter(e => conn.map(c => c.source).indexOf(e.source) !== -1).map(e => e.target)
            //let nodesWithSameSource = nodes.filter(n => sameSourceConns.indexOf(n.id) !== -1)
            //if(nodesWithSameSource.length === 1) {
              rectXGlobal += nrOfColumns * 120 + 60
              counter += 1
            //}
            // if(d1.name === 'Group'){
            //   rectXGlobal += (nrOfColumns+1) * 120 + 60
            //   counter += 1       
            // }

          } else {
            // node with icon without group OR drag-drop group
            const singleNodeCounter = +d1.id.split('-')[2].split('')[2] - 1
            nodes.push({
              ...d1,
              type: d1.name === 'Group' ? GROUP_NODE_TYPE : NODE_TYPE,
              data: { 
                label: d1.id, 
                name: d1.name, 
                origX: rectXGlobal, 
                origY: 20 + (120 * singleNodeCounter),
                width: 140,
                height: 140
              },
              parentNode: d.id,
              extent: (!d.id || toggleState) ? null : 'parent',
              style: (d1.name === 'Group' && toggleState === false) ? {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' } : {},
              position: { 
                x: toggleState ? (rectXGlobal * Math.cos(-35 * Math.PI/180)) : rectXGlobal, 
                y: toggleState ? (singleNodeCounter === 0 ? 550 : ((20 + (120 * singleNodeCounter)) * Math.sin(-35 * Math.PI/180) + 400)) : (20 + 120 * singleNodeCounter)
              },
              zIndex: 1
            })
            // if the next object in array is a group, then increase the x-position, so that the group node is placed without overlap of the previous individual nodes
            const nextObjIdx = data.nodes[0].nodes.map(n => n.id).indexOf(d1.id) + 1
            const isGroupNext = data.nodes[0].nodes[nextObjIdx] ? isGroup(data.nodes[0].nodes[nextObjIdx]) : false
            if(i1 === 0 || isGroupNext){
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
            let refNodes = nodesWithSameSource.filter(n => n.position.x === X)
            if(refNodes.length > 0){
              const refNode = refNodes.slice(-1)[0]
              let targetX = (refNode.data.height * Math.sin(-35 * Math.PI/180) + (refNode.position.y -  Math.tan(-155 * Math.PI/180) * refNode.position.x) - refNode.position.y) / -Math.tan(-155 * Math.PI/180)
              X = refNode.id === node.id ? refNode.position.x: targetX
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
            let X = sourceX + (width) + ((sourceNodes[0].connectTo.length >= 2 && sourceNodes[0].connectTo.every(d => d.includes('u'))) ? ((20 + (160 * singleNodeCounter)) * Math.sin(-35 * Math.PI/180)) : 0)
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
            Y = refNode.id === node.id ? node.position.y : refNode.position.y + refNode.data.height + 40
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

    if(data.nodes[0].id){
      const maxX = Math.max(...nodes.slice(1).map(d => d.position.x))
      const minX = Math.min(...nodes.slice(1).map(d => d.position.x))
      const maxY = Math.max(...nodes.slice(1).map(d => d.position.y))
      const minY = Math.min(...nodes.slice(1).map(d => d.position.y))
      nodes[0].position = {x: minX, y: minY}
      nodes[0].data = { ...nodes[0].data, width: maxX - minX + 250, height:  maxY - minY + 300}
    }

    setNodes([...nodes]);
    setEdges([...edges])
  }

  const updateGraph = (updates) => {
    const selectedNodes = nodes.filter(d => d.id !== selectedGraph.node.id)
    setNodes([...selectedNodes, updates.node]);
    //setEdges([...edges, updates.edges])
    const otherData = rawData.filter(d => d.id !== updates.node.id)
    setRawData({...otherData, ...updates.node})
  }

  useEffect(() => {
    if(Object.keys(rawData).length !== 0){
      updateData(rawData, toggleState)
    }
  }, [toggleState])

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

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    []
  );

  const onConnect = useCallback((params) => {
    setEdges((eds) => { 
      return addEdge({
        ...params, 
        id: params.source + '-' + params.target, 
        type: toggleState ? 'edge3D' : 'step', 
        markerEnd: {
          type: edgeType === 'line' ? null : MarkerType.ArrowClosed,
          width: 10,
          height: 10
        },
        markerStart: {
          type: (edgeType === 'line' || edgeType === 'single-connector') ? null : MarkerType.ArrowClosed,
          width: 10,
          height: 10
        }  
      }, eds)
    })

    let rawDataCopy = {...rawData}
    const sourceNodeIndex = rawDataCopy.nodes[0].nodes.map(n => n.id).indexOf(params.source)
    if(sourceNodeIndex >= 0){
      let sourceNodeConnections = [...rawDataCopy.nodes[0].nodes[sourceNodeIndex].connectTo]
      rawDataCopy.nodes[0].nodes[sourceNodeIndex].connectTo = sourceNodeConnections.length === 0 ? [params.target] : [...sourceNodeConnections, params.target]
      setRawData(rawDataCopy)
    }

  }, [rawData, toggleState, edgeType]);

  const onNodeClick = (event, node) => {
    const selectedEdges = edges.filter(e => e.source === node.id || e.target === node.id)
    setSelectedGraph({node, edges: selectedEdges, display: true})
  }
  
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

      let rawDataCopy = {...rawData}
      if(Object.keys(rawDataCopy).length === 0) rawDataCopy = {nodes: [{nodes: []}]} // if no json has been imported
      
      const countNodes = nodes.length === 0 ? 0 : nodes.filter(isNode).length
      const countGroups = nodes.length === 0 ? 0 : nodes.filter(isGroup).length

      const NODE_TYPE = toggleState ? 'default3DNode' : 'default2DNode'
      const GROUP_NODE_TYPE = toggleState ? 'group3DNode' : 'group2DNode'

      const newNode = {
        id: type === 'Group' ? `viz01-g01-g0${countGroups+1}` : `viz01-g01-u0${countNodes+1}`,
        type: type === 'Group' ? GROUP_NODE_TYPE : NODE_TYPE,
        position,
        name: type,
        data: { name: `${type}`, label: `${type}`},
        style: type === 'Group' ? {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' } : {},
        nodes: [],
        connectTo: []
      };

      setNodes((nds) => nds.concat(newNode)); // create and add the new node

      rawDataCopy.nodes[0].nodes.push(newNode)
      setRawData(rawDataCopy) // capture the data of new node and store it in the original json format, for ease of conversion from 2D to 3D and back
    },
    [rawData, toggleState, reactFlowInstance]
  );

  const onNodesChange = useCallback(
    (changes) => {
      let rawDataCopy = {...rawData}
      setNodes((nds) => {
        //get the changed node and all its attributes from original node data
        const nodeAddToGrp = nds.find(n => n.id === changes[0].id) || {}
        //find the group nodes (other group nodes if it's a group node being moved)
        const groupNodes = nds.filter(d => isGroup(d) && d.id !== changes[0].id)
        // iterate over group nodes and find if the moved node position is within the boundaries of any of the group nodes
        console.log(nds, groupNodes, changes[0].id)
        groupNodes.forEach(g => {
          if(changes[0].position && g.position && Object.keys(nodeAddToGrp).length !== 0){
            let posX = changes[0].positionAbsolute ? changes[0].positionAbsolute.x : changes[0].position.x // have to do this because a group node has no positionAbsolute attributes
            let posY = changes[0].positionAbsolute ? changes[0].positionAbsolute.y : changes[0].position.y
            if(posX >= g.position.x && posY >= g.position.y && posX <= g.position.x + g.width && posY <= g.position.y + g.height){
              nodeAddToGrp.extent = 'parent' // restrict movement to node to within group
              nodeAddToGrp.parentNode = g.id // modify moved node to indicate its part of a group
              if(changes[0].position.x === posX) {
                nodeAddToGrp.position = {x: changes[0].position.x-g.position.x, y: changes[0].position.y-g.position.y} // positional coordinates relative to group
              } else {
                nodeAddToGrp.position = {x: changes[0].position.x, y: changes[0].position.y} 
              }
              nodeAddToGrp.positionAbsolute = {x: g.position.x, y: g.position.y} // coordinates of group
              nodeAddToGrp.zIndex = 3
              //check if moved node is a group node
              const checkIfGrp = nds.find(n => n.id === changes[0].id && isGroup(n)) || {}
              nodeAddToGrp.id = g.id + (Object.keys(checkIfGrp).length !== 0 ? '-g' :  '-u') + changes[0].id.split('-')[changes[0].id.split('-').length-1].replace(/[^0-9]/g,"") // change id to indicate its part of group
              //also change id and parent id of this group node's children
              nodeAddToGrp.nodes.forEach(d => {
                const checkIfGrp = nds.find(n => n.id === d.id && isGroup(n)) || {}
                d.id = nodeAddToGrp.id + (Object.keys(checkIfGrp).length !== 0 ? '-g' :  '-u') + changes[0].id.split('-')[changes[0].id.split('-').length-1].replace(/[^0-9]/g,"") 
                d.parentNode = nodeAddToGrp.id 
              })
              
              if(!g.nodes.some(d => d.id === nodeAddToGrp.id)){
                g.nodes.push(nodeAddToGrp)
              }
            }
          }
        })
        if(Object.keys(nodeAddToGrp).length !== 0 && nodeAddToGrp.parentNode){
          nds = [...nds.filter(d => isNode(d) && d.id !== nodeAddToGrp.id), nodeAddToGrp, ...groupNodes] // modify original array of all nodes
          nds = nds.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.id === value.id
            ))
          )
          console.log('modify original array of all nodes', nds)
          return nds
        } 

        rawDataCopy = {nodes: [{nodes: [...nds.filter(d => isNode(d) && !d.parentNode), ...nds.filter(d => isGroup(d))]}]} // lone nodes and group nodes
        return applyNodeChanges(changes, nds)
      })
      setRawData(rawDataCopy)
    },
    [rawData]
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
            minZoom={0.2}
            maxZoom={4}
            //fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
          <Form selectedGraph={selectedGraph} updateGraph={updateGraph}/>
          {toggleState &&
            <div style={{position: 'absolute', bottom: '30px', right: '20px', display: 'flex'}}>View only mode in 3D view </div>
          }
        </div>
      </ReactFlowProvider>
    </div>
  )
}

export default App

