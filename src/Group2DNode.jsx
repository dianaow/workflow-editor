import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';

export default memo(({ data, isConnectable, selected }) => {
  return (
    <>
      <div style={{width: data.width || 100, height: data.height || 100}}>
      <NodeResizer color="#4285F4" isVisible={selected} minWidth={30} minHeight={30} />
      <div>{data.label}</div>
      <Handle
        id='left'
        type="target"
        position={Position.Left}
        style={{ background: '#555', opacity: 0.3 }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        id='right'
        type="source"
        position={Position.Right}
        style={{ background: '#555', opacity: 0.3 }}
        isConnectable={isConnectable}
      />
      <Handle
        id='bottom'
        type="source"
        position={Position.Bottom}
        style={{ background: '#555', opacity: 0.3 }}
        isConnectable={isConnectable}
      />
      <Handle
        id='top'
        type="target"
        position={Position.Top}
        style={{ background: '#555', opacity: 0.3 }}
        isConnectable={isConnectable}
      />
      </div>
    </>
  );
});