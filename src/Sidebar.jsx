import React from 'react';

export default () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebarWrapper">
      <h3>Components</h3>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default2DNode')} draggable>
        Default Node
      </div>
    </div>
  );
};