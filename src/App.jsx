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

function App() {
  const reactFlowWrapper = useRef(null);
  const [rawData, setRawData] = useState({});
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
    let singleNodeCounter = 1 //this is used to count the number of singles nodes within the root node
    
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
      
      // if(d.connectTo && d.connectTo.length > 0){
      //   d.connectTo.map(c => {
      //     edges.push({
      //       id: d.id + '-' + c, 
      //       source: d.id, 
      //       target: c,
      //       type: EDGE_TYPE,
      //       style: { 
      //         stroke: '#555'
      //       },
      //       markerEnd: MARKER_END,
      //       sourceHandle: 'right',
      //       targetHandle: 'left'
      //     })
      //   })
      // }

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
          
          let rectX = pad; //initial padding for each row within parent group node (d1.id)
          let idx = 0 //counter to select a node from array of nested nodes
          if(d1.nodes && d1.nodes.length > 0){ //continue adding more elements if there are nested elements (single/group) within parent
            //necessary to prevent duplicate nested nodes that arise from the custom onNodesChanges function
            d1.nodes = d1.nodes.filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.id === value.id
              ))
            )
            //find the number of rows and columns to fit all nested nodes in a grid layout within parent
            let nrOfRows = Math.ceil(Math.sqrt(d1.nodes.length)) 
            let nrOfColumns = (Math.sqrt(d1.nodes.length) % 1) > 0.5 ? nrOfRows : Math.floor(Math.sqrt(d1.nodes.length))
            let maxY = 0
            for (let colIdx = 0; colIdx < nrOfColumns; colIdx++) {
              let maxWidth = 0
              let rectY = pad; // start each new column in the same y position (20px of padding)
              for (let rowIdx = 0; rowIdx < nrOfRows; rowIdx++) {
                let d2 = d1.nodes[idx] //get data of a node
                if(d2){

                  let nrOfRows1 = d2.nodes ? Math.ceil(Math.sqrt(d2.nodes.length)) : 0
                  let nrOfColumns1 = d2.nodes ? ((Math.sqrt(d2.nodes.length) % 1) > 0.5 ? nrOfRows1 : Math.floor(Math.sqrt(d2.nodes.length))) : 0
                  // nested node can either be a group or single node
                  let width = d2.name === 'Group' ? (nrOfColumns1 * rectWidth) : rectWidth 
                  let height = d2.name === 'Group' ? (nrOfRows1 * rectWidth) : rectWidth
                  //width = (toggleState && d2.name === 'Group') ? width : width
                  //height = (toggleState && d2.name === 'Group') ? height : height

                  let idx1 = 0
                  let rectX1 = pad;
                  if(d2.nodes){
                    for (let colIdx1 = 0; colIdx1 < nrOfColumns1; colIdx1++) {
                      let rectY1 = pad; // start each new column in the same y position (20px of padding)
                      for (let rowIdx1 = 0; rowIdx1 < nrOfRows1; rowIdx1++) {
                        let d3 = d2.nodes[idx1] //get data of a node
                       if(d3){
                        //console.log('nested node ' + d3.id + ' inside group ' + d2.id, rowIdx1)
                        const newPoint = translatePointOnRotatedPlane([rectX1 +rectWidth/2 + pad, rectY1 - pad, 0])
                        nodes.push({
                          ...d3,
                          type: d3.name === 'Group' ? GROUP_NODE_TYPE : NODE_TYPE,
                          data: { 
                            label: d3.id, 
                            name: d3.name,
                            width: rectWidth,
                            height: rectWidth
                          },
                          style: (d3.name === 'Group' && toggleState === false) ? {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' } : {},
                          parentNode: d2.id,
                          extent: 'parent',
                          position: { 
                            x: toggleState ? newPoint[0] : rectX1, 
                            y: toggleState ? newPoint[1] : rectY1
                          },
                          zIndex: 1
                        }) 
                        rectY1 += rectWidth;
                        idx1 += 1 
                       }
                      }
                      rectX1 += rectWidth;
                    }
                  }

                  //console.log('nested node ' + d2.id + ' inside group ' + d1.id)
                  const newPoint = translatePointOnRotatedPlane([d2.name === 'Group' ? rectX : rectX + width/2 + pad, rectY, 0])
                  nodes.push({
                    ...d2,
                    type: d2.name === 'Group' ? GROUP_NODE_TYPE : NODE_TYPE,
                    data: { 
                      label: d2.id, 
                      name: d2.name,
                      width,
                      height
                    },
                    style: (d2.name === 'Group' && toggleState === false) ? {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' } : {},
                    parentNode: d1.id,
                    extent: 'parent', //restrict movment of nested node to within parent
                    position: { 
                      x: toggleState ? newPoint[0] : rectX, 
                      y: toggleState ? newPoint[1] : rectY
                    },
                    zIndex: 1
                  })
                  if(width > maxWidth) maxWidth = width // find the max width from the subset of nodes in the same column
                  rectY += d2.name === 'Group' ? height + (pad * 2) : height; //increase y-position of the next node in a column
                  if(rectY > maxY) maxY = rectY // find the max height from the subset of nodes in the same column
                }
                idx += 1 //move on to the next node in array to give placement to
              }
              rectX += maxWidth;  //increase x-position of the next node in a row
            } 

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
            const newPoint = translatePointOnRotatedPlane([rectXGlobal, pad, 0])
            nodes.push({
              ...d1,
              type: GROUP_NODE_TYPE,
              data: { 
                label: d1.id, 
                name: d1.name, 
                width: rectX, 
                height: maxY, 
                origX: rectXGlobal,
                origY: pad
              },
              style: toggleState ? {} : {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' },
              parentNode: d.id,
              extent: !d.id ? null : 'parent',
              position: { 
                x: toggleState ? newPoint[0] : rectXGlobal,
                y: toggleState ? newPoint[1] : pad //(to note: perhaps there is a better way than hardcoding 340px. had to do this to shift all the nodes downwards to prevent the ugly planar jump upwards from 2D to 3D view)
              }, 
              zIndex: 1
            })
            rectXGlobal += rectX + (pad * 2) // increase x-position of the next group within root node (based on group node width + padding between groups)
            counter += 1 

          } else {
            
            // node with icon without group OR empty group
            //(to note: actually seems unlikely to have empty groups, but this may be possible if the user manually contructs the graph)
            //console.log('lone node or empty group', d1.id)
            const newPoint = translatePointOnRotatedPlane([rectXGlobal + rectWidth, rectWidth * singleNodeCounter, 0])
            nodes.push({
              ...d1,
              type: d1.name === 'Group' ? GROUP_NODE_TYPE : NODE_TYPE,
              data: { 
                label: d1.id, 
                name: d1.name,
                width:  d1.name === 'Group' ? 100 : 64,
                height: d1.name === 'Group' ? 100 : 64,
                origX: rectXGlobal,
                origY: rectWidth * singleNodeCounter,
                type: 'single'
              },
              parentNode: d.id,
              extent: !d.id ? null : 'parent',
              style: (d1.name === 'Group' && toggleState === false) ? {background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' } : {},
              position: { 
                x: toggleState ? newPoint[0] : rectXGlobal, 
                y: toggleState ? newPoint[1] : (rectWidth * singleNodeCounter)
              },
              zIndex: 1
            })
            // if the next object in array is a group, then increase the x-position, so that the group node is placed without overlap of the previous individual nodes
            const nextObjIdx = data.nodes[0].nodes.map(n => n.id).indexOf(d1.id) + 1
            const isGroupNext = data.nodes[0].nodes[nextObjIdx] ? isGroup(data.nodes[0].nodes[nextObjIdx]) : false
            if(i1 === 0 || isGroupNext){
              rectX += rectWidth
              rectXGlobal += rectX + (pad*2)
            }
            singleNodeCounter += 1
          }

        })
      }
    })

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

    // if(toggleState){
    //   nodes.forEach(node => {
    //     const refNode = currentNodes.find(d => d.id === node.id)
    //     let width = refNode.data.name === 'Group' ? refNode.data.width * 1.5 : refNode.data.width
    //     let height = refNode.data.name === 'Group' ? refNode.data.height* 1.5 : refNode.data.height
    //     const newPoint = translatePointOnRotatedPlane([refNode.positionOrig.x, refNode.positionOrig.y, 0])
    //     node.position = {x: newPoint[0], y: newPoint[1]}
    //   })
    // } else {
    //   nodes.forEach(node => {
    //     let conn = edges.filter(e => e.target === node.id)
    //     if(node.type === GROUP_NODE_TYPE){
    //       if(conn.length > 0){
    //         let sameSourceConns = edges.filter(e => conn.map(c => c.source).indexOf(e.source) !== -1).map(e => e.target)
    //         let nodesWithSameSource = nodes.filter(n => sameSourceConns.indexOf(n.id) !== -1)
    //         let X = Math.min(...nodesWithSameSource.map(d => d.position.x))
    //         let refNodes = nodesWithSameSource.filter(n => n.position.x === X)
    //         if(refNodes.length > 0){
    //           const refNode = refNodes.slice(-1)[0] // amongst nodes that share the same source connections, select the last node base the coordinate re-calculation upon
              
    //           const Y = refNodes.map(d => d.data.origY + d.data.height + pad).reduce((a, b) => a + b)
    //           const x = refNode.id === node.id ? refNode.position.x : X
    //           const y = refNode.id === node.id ? refNode.position.y : Y
    //           node.position = {x, y}
    //           node.positionOrig = {x, y}
  
    //           let connToMovedNode = edges.filter(d => d.source === node.id).map(e => e.target)
    //           let movedTargetNodes = nodes.filter(n => connToMovedNode.indexOf(n.id) !== -1)

    //           if(movedTargetNodes.length > 0){
    //             movedTargetNodes.forEach(n => {
    //               const X1 = Math.min(node.position.x + node.data.width, n.data.origX) + (pad*2) 
    //               n.position = {x: X1, y: n.data.origY}
    //             })
    //           }
    //         }
    //       } 
    //     } else {
    //       let sourceNodes = nodes.filter(n => conn.map(c => c.source).indexOf(n.id) !== -1)
    //       if(sourceNodes.length > 0){
    //         let sourceNode = sourceNodes.slice(-1)[0]
    //         node.position = {x: sourceNode.position.x + sourceNode.data.width + pad, y: node.position.y}
    //         node.positionOrig = {...node.position}
    //       } else {
    //         node.positionOrig = {...node.position}
    //       }
    //     } 
    //   })
    // }

    nodes.forEach(node => {
      let conn = edges.filter(e => e.target === node.id)
      if(node.type === GROUP_NODE_TYPE){
        if(conn.length > 0){
          let sameSourceConns = edges.filter(e => conn.map(c => c.source).indexOf(e.source) !== -1).map(e => e.target)
          let nodesWithSameSource = nodes.filter(n => sameSourceConns.indexOf(n.id) !== -1)
          let X = Math.min(...nodesWithSameSource.map(d => d.data.origX))
          let refNodes = nodesWithSameSource.filter(n => n.data.origX === X)
          if(refNodes.length > 0){
            const refNode = refNodes.slice(-1)[0] // amongst nodes that share the same source connections, select the last node base the coordinate re-calculation upon
            
            const Y = refNodes.map(d => d.data.origY + d.data.height + pad).reduce((a, b) => a + b)
            const newPoint = toggleState ? translatePointOnRotatedPlane([X, Y, 0]) : [X, Y]
            const x = refNode.id === node.id ? refNode.position.x : newPoint[0] 
            const y = refNode.id === node.id ? refNode.position.y : newPoint[1]
            node.position = {x, y}
            node.data.origX = X

            let connToMovedNode = edges.filter(d => d.source === node.id).map(e => e.target)
            let movedTargetNodes = nodes.filter(n => connToMovedNode.indexOf(n.id) !== -1)
            console.log(refNodes, node, movedTargetNodes)
          
            if(!toggleState && movedTargetNodes.length > 0){
              movedTargetNodes.forEach(n => {
                const X1 = Math.min(node.position.x + node.data.width, n.data.origX) + (pad*2) 
                const newPoint = toggleState ? translatePointOnRotatedPlane([X1 + (pad*2), n.data.origY, 0]) : [X1, n.data.origY]
                n.position = {x: newPoint[0], y: newPoint[1]}
              })
            }
          }
        } 
      } 
    })


    // // shift lone nodes next to last connected group or node to prevent large gaps that occur after manipulating layout
    // let connectedNodes = nodes.filter(node => node.data.type !== 'single').map(d => d.position.x + d.data.width)
    // let MAX_X = Math.max(...connectedNodes)
    // nodes.forEach(node => {
    //   if(node.data.type === 'single' && node.connectTo.length === 0){
    //     console.log(node, MAX_X)
    //     node.position.x = MAX_X + (pad*2)
    //   }
    // })

    if(data.nodes[0].id){
      const maxX = Math.max(...nodes.slice(1).map(d => Math.abs(d.position.x) + d.data.width))
      const maxY = Math.max(...nodes.slice(1).map(d => Math.abs(d.position.y) + d.data.height))
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
    const otherData = rawData.filter(d => d.id !== updates.node.id)
    setRawData({...otherData, ...updates.node})
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
          nodeAddToGrp.positionOrig = {...nodeAddToGrp.position}
          nodeAddToGrp.positionAbsolute = {x: g.position.x, y: g.position.y} // coordinates of group
          nodeAddToGrp.zIndex = 1
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

  function recursiveFindNode(input, nodeAddToGrp) {
    for (var i = 0, l = input.length; i < l; i++) {
        var current = input[i];
        current.id === nodeAddToGrp.id
        current = {...nodeAddToGrp}
        if (current.nodes && current.nodes.length > 0) {
          recursiveFindNode(current.nodes, nodeAddToGrp);
        };
    };
    return input
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      console.log('on drop')
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
        positionOrig: position,
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
      console.log('on change')
      let rawDataCopy = {...rawData}
      setNodes((nds) => {
        
        const nodeAddToGrp = addToGroup(nds, changes) 

        if(Object.keys(nodeAddToGrp).length !== 0 && nodeAddToGrp.parentNode){
          nds = [...nds.filter(d => isNode(d) && d.id !== nodeAddToGrp.id), nodeAddToGrp, ...nds.filter(d => isGroup(d) && d.id !== changes[0].id)] // all nodes in a flat structure (single nodes not picked, the picked node (single/group), groups not picked)
          // lone nodes and group nodes that are not nested
          rawDataCopy = recursiveFindNode({...rawDataCopy}, {...nodeAddToGrp})
          console.log('dynamic modification of flat array of all nodes', nds)
          console.log('modify JSON structure of nodes pre-render', rawDataCopy)
          return nds
        } 

        //rawDataCopy = {nodes: [{nodes: [...nds.filter(d => isNode(d) && !d.parentNode), ...nds.filter(d => isGroup(d) && !d.parentNode)]}]} // lone nodes and group nodes that are not nested (commented out because the original sequential order of nodes and groups have to be maintained)
        rawDataCopy = recursiveFindNode({...rawDataCopy}, {...nodeAddToGrp})
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

