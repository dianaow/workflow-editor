import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, isConnectable, ...props }) => {
  return (
    <>
      <div style={{width: data.width, height: data.height, background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4', transform: `rotateX(55deg) rotateY(0deg) rotateZ(-50deg)`}}>
        <div style={{transform: `transform: rotateX(-90deg) rotate(180deg) translateZ(${data.width}px})`}}>{data.label}</div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="b"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="b"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      </div>
    </>
  );
});
