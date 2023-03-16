import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, isConnectable }) => {

  return (
    <>
    <div style={{position: 'relative', width: '100px', height: '100px'}}>
      {/* <div id="node" style={{transform: `translate(20px, -25px)`}}></div> */}
      <div id="node" style={{transform: `translate(0px, 0px)`}}>
      <Handle
        id='left'
        type='target'
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        id='top'
        type='target'
        position={Position.Top}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        id='right'
        type='source'
        position={Position.Right}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        id='bottom'
        type='source'
        position={Position.Bottom}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      </div>
      {/* <div id="node" style={{transform: `translate(-20px, 25px)`}}></div> */}
    </div>
    </>
  );
});
