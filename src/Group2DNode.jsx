import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, isConnectable, ...props }) => {
  return (
    <>
      <div style={{width: data.width, height: data.height, background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4' }}>
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