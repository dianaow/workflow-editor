import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { ReactComponent as Node } from "./assets/nodes/common/node.svg";

export default memo(({ data, isConnectable }) => {

  let IconComponent = Node

  return (
    <>
      <div className='box'>
        <div className="side side-1"><IconComponent/></div>
        <div className="side side-2">{data.name}</div>
        <div className="side side-3"></div>
        <div className="side side-4"></div>
        <div className="side side-5"></div>
        <div className="side side-6"></div>
      <Handle
        id='left'
        type="target"
        position={Position.Left}
        className='handle-left'
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        id='right'
        type="source"
        position={Position.Right}
        className='handle-right'
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        id='bottom'
        type="source"
        className='handle-bottom'
        position={Position.Bottom}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        id='top'
        type="target"
        className='handle-top'
        position={Position.Top}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      </div>
    </>
  );
});
