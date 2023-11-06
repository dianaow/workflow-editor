import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { ReactComponent as Node } from "./assets/nodes/common/node.svg";

export default memo(({ data, isConnectable }) => {
  let IconComponent = Node
  return (
    <>
    <div style={{position: 'relative', width: '64px', height: '64px'}}>
      <div id="node" style={{transform: `translate(0px, 0px)`}}>
      <IconComponent/>
        <Handle
          id='left'
          type='target'
          position={Position.Left}
          style={{ background: '#555', opacity: 0.3 }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle
          id='top'
          type='target'
          position={Position.Top}
          style={{ background: '#555', opacity: 0.3 }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle
          id='right'
          type='source'
          position={Position.Right}
          style={{ background: '#555', opacity: 0.3 }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle
          id='bottom'
          type='source'
          position={Position.Bottom}
          style={{ background: '#555', opacity: 0.3 }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <div>{data.name}</div>
      </div>
      {/* <div id="node" style={{transform: `translate(-20px, 25px)`}}></div> */}
    </div>
    </>
  );
});
