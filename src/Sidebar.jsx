import React from 'react';

export default () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebarWrapper">
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'defaultNode')} draggable>
        Default Node
      </div>
    </div>
  );
};