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
        type="target"
        position={Position.Left}
        style={{ background: '#555', opacity: 0.3 }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ background: '#555', opacity: 0.3 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="b"
        style={{ background: '#555', opacity: 0.3 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="b"
        style={{ background: '#555', opacity: 0.3 }}
        isConnectable={isConnectable}
      />
      </div>
    </>
  );
});