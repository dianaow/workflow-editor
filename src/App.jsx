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
import * as math from 'mathjs'

// function generateJSON(numChildren) {
//   let nodes = []
//   for (let i = 0; i < numChildren; i++) {
//     let node = generateNodes(i)
//     nodes.push(node)
//   }

//   let maxNextConnections = 22
//   const numNextConnection = Math.floor(Math.random() * maxNextConnections)
//   for (let j = 0; j < numNextConnection; j++) {
//     const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
//     const regex = /g(\d+)/;
//     const match = sourceNode.id.match(regex);
//     const num = match ? parseInt(match[1]) + Math.floor(Math.random() * 2) : null;
//     if(num && num < numChildren){
//       const targetID = 'viz01-g' + num
//       if (targetID !== sourceNode.id && !sourceNode.connectTo.includes(targetID)) {
//         sourceNode.connectTo.push(targetID);
//       }
//     }
//   }
  
//   let maxConnections = 32
//   const numConnections = Math.floor(Math.random() * maxConnections);
//   for (let j = 0; j < numConnections; j++) {
//     const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
//     const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
//     const regex = /g(\d+)/;
//     const sourceID = parseInt(sourceNode.id.match(regex)[1])
//     const targetID = parseInt(randomNode.id.match(regex)[1])
//     if (randomNode.id !== sourceNode.id && !sourceNode.connectTo.includes(randomNode) && targetID > sourceID) {
//       sourceNode.connectTo.push(randomNode.id);
//     }
//   }
  
//   const json = {
//     "id": "viz01",
//     "name": "GCP Architecture",
//     "nodes": [
//       {"nodes": nodes}
//     ]
//   }

//   return json
// }

// function generateNodes(counter) {
//   const rootNode = {
//     id: "viz01-g" + counter,
//     name: null,
//     type: "group",
//     category: "group",
//     connectTo: [],
//     otherProperties: "...",
//     nodes: []
//   };

//   const stack = [rootNode];

//   const names = ['Pub/Sub', 'App Engine', 'Big Query', 'Cloud Storage', 'Compute Engine', 'Data Flow', 'Data Lab', 'Data Prop', 'Data Store', 'Logging',  'Monitoring']

//   while (stack.length > 0) {
//     let nodeCounter = 0
//     let groupCounter = 0
//     const currNode = stack.pop();
//     const numChildren = Math.floor(Math.random() * 4) + 1;
//     if (numChildren > 1) {
//       for (let i = 0; i < numChildren; i++) {
//         let type = Math.random() < 0.75 ? "node" : "group"
//         const childNode = {
//           id: `${currNode.id}-${(type ===  "node" ? "u" + nodeCounter : "g" + groupCounter)}`,
//           name: type === "node" ? names[Math.floor(Math.random() * names.length)] : null,
//           type,
//           category: type === "node" ? "service" : "group",
//           connectTo: [],
//           nodes: []
//         };
//         currNode.nodes.push(childNode);
//         if (childNode.type === "group") {
//           stack.push(childNode);
//         }
//         if(type === 'node'){
//           nodeCounter += 1
//         } else {
//           groupCounter += 1
//         }
//       }
//     } else {
//       const childNode = {
//         id: `${currNode.id}-${("u" + nodeCounter)}`,
//         name: null,
//         type: "node",
//         category: "service",
//         connectTo: [],
//         otherProperties: "...",
//         nodes: []
//       };
//       currNode.nodes.push(childNode);
//       nodeCounter += 1
//     }
//   }

//   return rootNode;
// }

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

function findConnectedNodes(json) {
  const nodes = json[0].nodes;
  const connections = {};
  for (const node of nodes) {
    for (const otherNode of nodes) {
      if (node !== otherNode) {
        if (node.connectTo.includes(otherNode.id)) {
          if (connections[node.id]) {
            connections[node.id].push(otherNode.id);
          } else {
            connections[node.id] = [otherNode.id];
          }
        }
      }
    }
  }
  return connections;
}

function translatePointOnRotatedPlane(point) {
  // Define the initial point coordinates and rotation angles in degrees
  let rotateX = 55;
  let rotateY = 0;
  let rotateZ = -50;
  let translateVector = [0, 0, 0];

  // Convert the rotation angles to radians
  let radX = rotateX * Math.PI / 180;
  let radY = rotateY * Math.PI / 180;
  let radZ = rotateZ * Math.PI / 180;

  // Define the transformation matrices for each type of transformation
  let translationMatrix = math.matrix([
    [1, 0, 0, translateVector[0]],
    [0, 1, 0, translateVector[1]],
    [0, 0, 1, translateVector[2]],
    [0, 0, 0, 1]
  ]);
  let rotationXMatrix = math.matrix([
    [1, 0, 0, 0],
    [0, Math.cos(radX), -Math.sin(radX), 0],
    [0, Math.sin(radX), Math.cos(radX), 0],
    [0, 0, 0, 1]
  ]);
  let rotationYMatrix = math.matrix([
    [Math.cos(radY), 0, Math.sin(radY), 0],
    [0, 1, 0, 0],
    [-Math.sin(radY), 0, Math.cos(radY), 0],
    [0, 0, 0, 1]
  ]);
  let rotationZMatrix = math.matrix([
    [Math.cos(radZ), -Math.sin(radZ), 0, 0],
    [Math.sin(radZ), Math.cos(radZ), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]);

  // Combine the transformation matrices into a single composite matrix
  let compositeMatrix = math.multiply(math.multiply(math.multiply(translationMatrix, rotationXMatrix), rotationYMatrix), rotationZMatrix);

  // Apply the composite transformation to the point
  let pointHomogeneous = math.concat(point, [1]);
  let transformedPointHomogeneous = math.multiply(compositeMatrix, pointHomogeneous);
  let transformedPoint = transformedPointHomogeneous['_data']
  //console.log(`Transformed point: (${transformedPoint[0]}, ${transformedPoint[1]}, ${transformedPoint[2]})`);
  return transformedPoint
}


function countColumns(tree) {
  let count = 0;
  let stack = [tree];

  while (stack.length > 0) {
    const node = stack.pop();
    if(!node.nodes) continue
    let nodeCount = node.nodes.filter(d => d.type === 'node').length
    let nrOfRows = Math.ceil(Math.sqrt(nodeCount));
    let nrOfColumns = Math.sqrt(nodeCount) % 1 > 0.5 ? nrOfRows : Math.floor(Math.sqrt(nodeCount));
    count +=  nrOfColumns
    if (node.nodes) {
      stack = stack.concat(node.nodes);
    }
  }

  return count;
}

function hasConnectionBefore(nodeId, data, sibNodes) {
  let found = false;
  let result = false;
  const search = (node, targetId) => {
    if (node.id === targetId) {
      found = true;
      return;
    }
    if (node.nodes) {
      node.nodes.forEach(n => search(n, targetId));
    }
    if (found && node.nodes) {
      const previousNode = node.nodes[node.nodes.findIndex(n => n.id === targetId) - 1];
      if (previousNode && previousNode.connectTo.length > 0 && !previousNode.connectTo.includes(nodeId) && !previousNode.connectTo.includes(sibNodes)) {
        result = true;
      }
    }
  };
  data.nodes.forEach(node => search(node, nodeId));
  return result;
}

function App() {
  const reactFlowWrapper = useRef(null);
  //const [rawData, setRawData] = useState(generateJSON(12));
  const [rawData, setRawData] = useState([]);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [toggleState, setToggleState] = useState(false);
  const [edgeType, setEdgeType] = useState('single-connector')
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState({node: {}, edges: {}});

  const updateData = (data, toggleState, currentNodes) => {
    const NODE_TYPE = toggleState ? 'default3DNode' : 'default2DNode'
    const GROUP_NODE_TYPE = toggleState ? 'group3DNode' : 'group2DNode'
    const EDGE_TYPE = toggleState ? 'edge3D' : 'step'

    let nodes = []
    let edges = []
    let box = 64
    let pad = 30       
    let counter = 0
    let rectWidth = toggleState ? (box + pad) * 1.5 : (box + pad) //node width (64px) including padding (to give sufficient gap between nodes)
    let rectXGlobal = pad //initial padding for the first node placement 
    let singleNodeCounter = 0 //this is used to count the number of singles nodes within the root node
    let rectXGlobal3D = pad

    const connectedNodes = Object.entries(findConnectedNodes(data.nodes))

    function createNodes(d1, rectX) {

      const nodeCount1 = d1.nodes.length
      const nrOfRows = Math.ceil(Math.sqrt(nodeCount1));
      const nrOfColumns = Math.sqrt(nodeCount1) % 1 > 0.5 ? nrOfRows : Math.floor(Math.sqrt(nodeCount1));

      let idx = 0 //counter to select a node from array of nested nodes
      let maxY = 0;
 
      for (let colIdx = 0; colIdx < nrOfColumns; colIdx++) {
        let maxWidth = 0;
        let rectY = pad;
        for (let rowIdx = 0; rowIdx < nrOfRows; rowIdx++) {
          const d2 = d1.nodes[idx];
 
          if (d2) {
            let nrOfColumns1 = countColumns(d2);
            let width = rectWidth;
            let height = rectWidth;

            if (d2.nodes) {
              let rectX1 = 0
              let {rectX, maxY} = createNodes(
                d2,
                rectX1
              );
 
              width = isGroup(d2) ? nrOfColumns1 * rectWidth : rectWidth;
              height = isGroup(d2) ? maxY : rectWidth;

            }
    
            const newPoint = translatePointOnRotatedPlane([
              isGroup(d2) ? rectX : rectX + width / 2 + pad,
              rectY - pad,
              0,
            ]);
    
            nodes.push({
              ...d2,
              type: isGroup(d2) ? GROUP_NODE_TYPE : NODE_TYPE,
              data: {
                label: d2.id,
                name: d2.name,
                width,
                height,
              },
              style:
              isGroup(d2) && toggleState === false
                  ? { background: "rgba(102, 157, 246, 0.14)", border: "1px dashed #4285F4" }
                  : {},
              parentNode: d1.id,
              extent: "parent",
              position: {
                x: toggleState ? newPoint[0] : rectX,
                y: toggleState ? newPoint[1] : rectY,
              },
              zIndex: 2,
            });
    
            if (width > maxWidth) maxWidth = width;
            rectY += height + (isGroup(d2) ? pad : 0);
    
            if (rectY > maxY) maxY = rectY;
          }
          idx++;
        }
        rectX += maxWidth;
      }
    
      return {rectX, maxY}
    }
    
    data.nodes.map(d => {
      // add root node, if any. this will always be a group node 
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
          zIndex: -1 //this root node is the lowest level amongst all other kinds of nodes
        })
      }
    
      if(d.nodes){ //continue adding more elements if there are nested elements within the root node
        d.nodes.map((d1,i1) => {
          
          if(d1.connectTo && d1.connectTo.length > 0){ //add edges if there are connections between elements (single/group) within root node
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
          
          let rectX = pad
          const refNode = currentNodes ? currentNodes.find(d => d.id === d1.id) : []

          if(d1.nodes && d1.nodes.length > 0){ //continue adding more elements if there are nested elements (single/group) within parent
            //necessary to prevent duplicate nested nodes that arise from the custom onNodesChanges function
            d1.nodes = d1.nodes.filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.id === value.id
              ))
            )

            let {rectX, maxY} = createNodes(d1, pad);

            //add edges if there are connections between nested nodes
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

            // the group node has to contain all nested single and group nodes of various sizes
            //console.log('group node without parent', d1.id)
            const sameSourceConn = connectedNodes.filter(d => d[1].indexOf(d1.id) !== -1).slice(-1)[0]
            let connNodes = sameSourceConn ? nodes.filter(d => sameSourceConn[1].indexOf(d.id) !== -1) : []
            // note: there seems to be duplicate nodes...
            connNodes = connNodes.filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.id === value.id
              ))
            )
    
            const targetNode = edges.find(d => d.target === d1.id)
            const srcNode = (sameSourceConn && targetNode) ? nodes.find(d => d.id === targetNode.source) : null

            let X = []
            let Y = []
            let X_3d = []
            let Y_3d = []

            if(connNodes.length > 0){
              const sibNode = connNodes.slice(-1)[0] // sibling before (all siblings share the same source node)
              //const totalY = connNodes.filter(d => d.id !== d1.id).map(d => d.data.height).reduce((a, b) => a + b, 0) + pad
              const totalY = sibNode.position.y + sibNode.data.height + pad
              if(d1.id !== sibNode.id) {
                X = sibNode.position.x
                Y = totalY
                X_3d = sibNode.position.x + rectWidth * 1.5
                Y_3d = totalY * 1.5
              } else {
                X = sibNode.position.x
                Y = sibNode.position.y
                X_3d = sibNode.position.x
                Y_3d = sibNode.position.y
              }
              const hasConnection = hasConnectionBefore(d1.id, data,sibNode.id); //check if previous node has a connection to another node further down, that is not a reference node (sibNode). if yes, shift current node up by its height
              if(hasConnection) {
                //console.log('previous node has other connections', d1.id)
                //Y = Y - maxY
              } 
            } else {
              X = rectXGlobal
              Y = srcNode ? srcNode.position.y : pad  // adjust y position based on source node
              X_3d = rectXGlobal3D
              Y_3d = srcNode ? srcNode.position.y : pad
            }
            const newPoint1 = translatePointOnRotatedPlane([X, Y, 0])
            const newPoint = translatePointOnRotatedPlane([X_3d, Y_3d, 0])
            //const newPoint = translatePointOnRotatedPlane([rectXGlobal, pad, 0])

            const connections = edges.filter(d => d.source === d1.id || d.target === d1.id) // check if node has any connections
            const targetOnly = edges.filter(d => d.target === d1.id || d.source !== d1.id) // check if node is only a target node
            if(connections.length === 0) {
              //console.log('no connections', d1.id)
              //Y = Y - maxY
            } else if(targetOnly.length > 0){
              //Y = Y + maxY
            } 
            console.log('d1', d1.data)
            nodes.push({
              ...d1,
              type: GROUP_NODE_TYPE,
              data: { 
                label: d1.id, 
                name: d1.name, 
                width: rectX, 
                height: maxY
              },
              style: toggleState ? {} : {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' },
              parentNode: d.id,
              extent: !d.id ? null : 'parent',
              // position: { 
              //   x: toggleState ? newPoint[0] : rectXGlobal, 
              //   y: toggleState ? newPoint[1] : pad
              // }, 
              position: { 
                x: (toggleState && currentNodes) ? (refNode.position3D ? refNode.position3D.x : newPoint1[0]) : X,
                y: (toggleState && currentNodes) ? (refNode.position3D ? refNode.position3D.y : newPoint1[1]) : Y
              }, 
              position3D: {
                x: newPoint[0],
                y: newPoint[1]
              },
              zIndex: 1
            })
            if(connNodes.length === 0) { //check that group nodes do 
              rectXGlobal += rectX + rectWidth + (pad ) // increase x-position of the next group within root node (based on group node width + padding between groups)
              rectXGlobal3D += (rectX * 1.5) + (pad)
            } else {
              rectXGlobal += Math.max(...connNodes.map(d => d.data.width)) - rectWidth  + pad
            }
            counter += 1 

          } else {
            
            // node with icon without group OR empty group. this nodes may or may not be cononected to other nodes
            //(to note: actually seems unlikely to have empty groups, but this may be possible if the user manually contructs the graph)
            if(d1.parentNode) return //do this to ensure node is not within a group
            //console.log('non-nested node or empty group', d1.id)
            const edge = edges.find(d => d.target === d1.id)
            const srcNode = edge ? nodes.find(d => d.id === edge.source) : null
            const Y = (srcNode ? (srcNode.position.y + srcNode.data.height/2 - rectWidth/2 + (rectWidth * edges.filter(d => d.source === edge.source && d.target.includes("u")).map(d => d.target).indexOf(d1.id))) : (rectWidth * singleNodeCounter))
            const newPoint = translatePointOnRotatedPlane([rectXGlobal3D + (rectX*1.5) + (pad*2), Y, 0])

            nodes.push({
              ...d1,
              type: d1.name === 'Group' ? GROUP_NODE_TYPE : NODE_TYPE,
              data: { 
                label: d1.id, 
                name: d1.name,
                width: rectWidth,
                height: rectWidth,
                type: 'single',
              },
              parentNode: d.id,
              extent: !d.id ? null : 'parent',
              style: (d1.name === 'Group' && toggleState === false) ? {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' } : {},
              position: { 
                x: toggleState ? (refNode.position3D ? refNode.position3D.x : newPoint[0]) : rectXGlobal, 
                y: toggleState ? (refNode.position3D ? refNode.position3D.y : newPoint[1]) : Y
              },
              position3D: {
                x: newPoint[0],
                y: newPoint[1]
              },
              zIndex: 1
            })
            // if the next object in array is a group, then increase the x-position, so that the group node is placed without overlap of the previous individual nodes
            const nextObjIdx = data.nodes[0].nodes.map(n => n.id).indexOf(d1.id) + 1
            const isGroupNext = data.nodes[0].nodes[nextObjIdx] ? isGroup(data.nodes[0].nodes[nextObjIdx]) : false
            if(i1 === 0 || isGroupNext){
              rectX += rectWidth
              rectXGlobal += rectX + (pad*2)
              rectXGlobal3D += rectX + (pad*2) 
            }
            if(!edge) singleNodeCounter += 1
          }

        })
      }
    })
    // just a safety check that there are no duplicate nodes or edges
    nodes = nodes.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.id === value.id
      ))
    )
    edges = edges.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.source === value.source && t.target === value.target
      ))
    )

    if(data.nodes[0].id){
      const maxX = Math.max(...nodes.filter(d => d.name !== 'Root').map(d => Math.abs(d.position.x) + d.data.width))
      const maxY = Math.max(...nodes.filter(d => d.name !== 'Root').slice(1).map(d => Math.abs(d.position.y) + d.data.height))
      const newPoint = translatePointOnRotatedPlane([0, 0, 0])
      nodes[0].position = {x: newPoint[0], y: newPoint[1]}
      nodes[0].data = { ...nodes[0].data, width: maxX + rectWidth + pad + nodes.slice(-1)[0].data.width, height: maxY  + pad}
    }
    console.log('post-processed flat array of nodes to render', nodes, edges)
    setNodes([...nodes]);
    setEdges([...edges])
  }

  const updateGraph = (updates) => {
    const selectedNodes = nodes.filter(d => d.id !== selectedGraph.node.id)
    setNodes([...selectedNodes, updates.node]);
    //setEdges([...edges, updates.edges])
    const index = rawData.nodes[0].nodes.findIndex(d => d.id === updates.node.id)
    rawData.nodes[0].nodes[index] = updates.node
    setRawData({...rawData})
  }

  useEffect(() => {
    if(Object.keys(rawData).length !== 0){
      updateData(rawData, toggleState, nodes)
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
    (changes) => {
      let rawDataCopy = {...rawData}
      setEdges((eds) => {
        if(changes[0].type === 'remove') {
          const edgeToRemove = eds.find(d => d.id === changes[0].id)
          eds = eds.filter(d => d.id !== changes[0].id)
          removeConnectionById(rawDataCopy, edgeToRemove.source, edgeToRemove.target)
        }
        return applyEdgeChanges(changes, eds)
      })
      setRawData(rawDataCopy)
    },
    [rawData]
  );

  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    []
  );
  
  // get called when drawing a new edge between two nodes
  const onConnect = useCallback((params) => {
    console.log(params, edgeType)
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

  function addToGroup(nds, changes) {
    //find the changed node
    const nodeAddToGrp = nds.find(n => n.id === changes[0].id) || changes[0] || {}
    //find the group nodes (other group nodes if it's a group node being moved)
    const groupNodes = nds.filter(d => isGroup(d) && d.id !== changes[0].id && !d.parentNode)
    //check if the moved node position is within the boundaries of any group node (only without a parent)
    //since a node can only be nested into one group at a time, there should not be multiple groups which node overlaps with 
    groupNodes.forEach(g => {
      // (to note: still do this even if the moved node is already within the boundaries of any group)
      if(changes[0].position && g.position && Object.keys(nodeAddToGrp).length !== 0){
        let posX = changes[0].positionAbsolute ? changes[0].positionAbsolute.x : changes[0].position.x // have to do this because a group node has no positionAbsolute attributes
        let posY = changes[0].positionAbsolute ? changes[0].positionAbsolute.y : changes[0].position.y
        // option1: only add the node if it is fully fitted within the group
        //if(posX >= g.position.x && posY >= g.position.y && (posX + nodeAddToGrp.width) <= (g.position.x + g.width) && (posY + nodeAddToGrp.height) <= (g.position.y + g.height)){
        // option2: add the node if the top-left coordinate is within the group (whole node is not needed to be inside the group)
        if(posX >= g.position.x && posY >= g.position.y && posX <= (g.position.x + g.width) && posY <= (g.position.y + g.height)){
          nodeAddToGrp.extent = 'parent' // restrict movement to node to within group
          nodeAddToGrp.parentNode = g.id // modify moved node to indicate its part of a group
          if(changes[0].position.x === posX) {
            nodeAddToGrp.position = {x: changes[0].position.x-g.position.x, y: changes[0].position.y-g.position.y} // positional coordinates relative to group
          } else {
            nodeAddToGrp.position = {x: changes[0].position.x, y: changes[0].position.y} 
          }
          nodeAddToGrp.positionAbsolute = {x: g.position.x, y: g.position.y} // coordinates of group
          nodeAddToGrp.zIndex = 3
          // (to note: comment out this part for simplicity sake. IDs of each node can reflect that it's part of a group, however since this does not actually affect graph layout algorithm and its complex when there are highly nested nodes as the child nodes have to be found recursively, I chose to remove it)
          // check if moved node is a group node
          // const checkIfGrp = nds.find(n => n.id === changes[0].id && isGroup(n)) || {}
          // nodeAddToGrp.id = g.id + (Object.keys(checkIfGrp).length !== 0 ? '-g' :  '-u') + changes[0].id.split('-')[changes[0].id.split('-').length-1].replace(/[^0-9]/g,"") // change id to indicate its part of group

          if(!g.nodes.some(d => d.id === nodeAddToGrp.id)){
            g.nodes.push(nodeAddToGrp)
          }
        }
      }
    })

    return nodeAddToGrp
  }

  function recursiveFindNode(obj, id, imputeObj) {
    if (obj.id === id) {
      // found the object to impute, so merge the imputeObj into the current object
      Object.assign(obj, imputeObj);
      return true;
    } else if (Array.isArray(obj.nodes)) {
      // recursively check each child node
      for (const node of obj.nodes) {
        if (recursiveFindNode(node, id, imputeObj)) {
          return true;
        }
      }
    }
    return false;
  }
  
  function removeConnectionById(obj, id, conn) {
    if (obj.id === id) {
      obj.connectTo = obj.connectTo.filter((c) => c !== conn);
      return true;
    }
    if (obj.nodes) {
      for (let i = 0; i < obj.nodes.length; i++) {
        if (removeConnectionById(obj.nodes[i], id, conn)) {
          return true;
        }
      }
    }
    return false;
  }

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
        //position3D: [newPoint[0], newPoint[1]],
        name: type,
        data: { name: `${type}`, label: `${type}`},
        style: type === 'Group' ? {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' } : {},
        nodes: [],
        connectTo: [],
        width: 100,
        height: 100
      };

      setNodes((nds) => {
        let newNodesChanged = {...newNode}
        if(nds.length > 0) newNodesChanged = addToGroup(nds, [{...newNode}]) 
        rawDataCopy.nodes[0].nodes.push(newNodesChanged) // since the new node has no hierarchy, it is pushed into the json on the same level as the root node
        return nds.concat(newNodesChanged)
      }); // create and add the new node

      setRawData(rawDataCopy) // capture the data of new node and store it in the original json format, for ease of conversion from 2D to 3D and back
    },
    [rawData, toggleState, reactFlowInstance]
  );

  const onNodesChange = useCallback(
    (changes) => {
      if(toggleState) return // view-only mode in 3D

      let rawDataCopy = {...rawData}
      setNodes((nds) => {
        
        const nodeAddToGrp = addToGroup(nds, changes) 

        if(Object.keys(nodeAddToGrp).length !== 0 && nodeAddToGrp.parentNode){
          nds = [...nds.filter(d => isNode(d) && d.id !== nodeAddToGrp.id), nodeAddToGrp, ...nds.filter(d => isGroup(d) && d.id !== changes[0].id)] // all nodes in a flat structure (single nodes not picked, the picked node (single/group), groups not picked)
          // lone nodes and group nodes that are not nested
          recursiveFindNode(rawDataCopy, nodeAddToGrp.id, {...nodeAddToGrp})
          //console.log('dynamic modification of flat array of all nodes', nds)
          //console.log('modify JSON structure of nodes pre-render', rawDataCopy)
          return nds
        } 

        //rawDataCopy = {nodes: [{nodes: [...nds.filter(d => isNode(d) && !d.parentNode), ...nds.filter(d => isGroup(d) && !d.parentNode)]}]} // lone nodes and group nodes that are not nested (commented out because the original sequential order of nodes and groups have to be maintained)
        recursiveFindNode(rawDataCopy, nodeAddToGrp.id, {...nodeAddToGrp})
        return applyNodeChanges(changes, nds)
      })
      setRawData(rawDataCopy)
    },
    [rawData, toggleState]
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


