import React from 'react';
import { ReactComponent as Group } from "./assets/nodes/common/group.svg"
import { ReactComponent as Node } from "./assets/nodes/common/node.svg"
import { ReactComponent as Line } from "./assets/nodes/common/line.svg"
import { ReactComponent as SingleConnector } from "./assets/nodes/common/connector-single.svg"
import { ReactComponent as DoubleConnector } from "./assets/nodes/common/connector-double.svg"

export default ({setEdgeType}) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebarWrapper">
      <h2 style={{textAlign: 'center', marginTop: '0px'}}>Components</h2>
      <div className="sidebar--header">Common</div>
      <div className="sidebar--cloud-components">
      <div className='sidebar--items' onClick={() => setEdgeType('line')}>
          <Line />
          <div>Line</div>
        </div>
        <div className='sidebar--items' onClick={() => setEdgeType('single-connector')}>
          <SingleConnector />
          <div>Single Connector</div>
        </div>
        <div className='sidebar--items' onClick={() => setEdgeType('double-connector')}>
          <DoubleConnector />
          <div>Double Connector</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Node')} draggable>
          <Node />
          <div>Node</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Group')} draggable>
          <Group />
          <div>Group</div>
        </div>
      </div>
    </div>
  );
};