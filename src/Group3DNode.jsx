import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, isConnectable, ...props }) => {
  return (
    <>
      <div style={{transformOrigin: '0 0', width: data.width, height: data.height, background: 'rgba(102, 157, 246, 0.14)', border: '1px dashed #4285F4', transform: `rotateX(55deg) rotateY(0deg) rotateZ(-50deg)`}}>
        <div style={{transformOrigin: '0 0', transform: `transform: rotateX(-90deg) rotate(180deg) translateZ(${data.width}px})`}}>{data.label}</div>
      <Handle
        id='left'
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        id='right'
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        id='bottom'
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        id='top'
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      </div>
    </>
  );
});
