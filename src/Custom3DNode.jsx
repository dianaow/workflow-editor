import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, isConnectable }) => {
  return (
    <>
      <div className='box'>
        <div className="side side-1"></div>
        <div className="side side-2"></div>
        <div className="side side-3"></div>
        <div className="side side-4"></div>
        <div className="side side-5"></div>
        <div className="side side-6"></div>
      <Handle
        type="target"
        position={Position.Left}
        className='handle-left'
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        className='handle-right'
        id="a"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        className='handle-bottom'
        position={Position.Bottom}
        id="b"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        className='handle-top'
        position={Position.Top}
        id="b"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      </div>
    </>
  );
});
