import React from 'react';
import { getStraightPath } from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {

  let b1 = sourceY -  Math.tan(-35 * Math.PI/180) * sourceX
  let b2 = targetY -  Math.tan(-35 * Math.PI/180) * targetX
  let dist = Math.abs(b2-b1) / 1.05
  //let dist = Math.abs(b2-b1)

  let p1 = sourceY -  Math.tan(-155 * Math.PI/180) * sourceX
  let p2 = targetY -  Math.tan(-155 * Math.PI/180) * targetX
  //console.log(id, b2-b1, p2-p1)

  let yOffset = Math.sin(-35 * Math.PI/180) * (targetX-sourceX)/2
  let xOffset = Math.cos(-35 * Math.PI/180) * (targetX-sourceX)/2

  xOffset = xOffset < 0 ? 0 : xOffset
  yOffset = yOffset > 0 ? 0 : yOffset

  let yOffset1 = (Math.sin(-155 * Math.PI/180) * dist) * (b2-b1 < 0 ? 1 : -1)
  let xOffset1 = (Math.cos(-155* Math.PI/180) * dist) * (b2-b1 < 0 ? 1 : -1)

  let yOffset2 = Math.sin(-35 * Math.PI/180) * 100
  let xOffset2 = Math.cos(-35 * Math.PI/180) * 100

  const [edgeH1] = getStraightPath({
    sourceX,
    sourceY,
    targetX: sourceX + xOffset,
    targetY: sourceY + yOffset
  });

  const [edgeH2] = getStraightPath({
    sourceX: sourceX + xOffset + xOffset1,
    sourceY: sourceY + yOffset + yOffset1,
    targetX: (b1 < b2 && p1 < p2 && sourceY < targetY) ? targetX + xOffset2 : targetX,
    targetY: (b1 < b2 && p1 < p2 && sourceY < targetY) ? targetY + yOffset2 : targetY
  });

  const [edgeV] = getStraightPath({
    sourceX: sourceX + xOffset,
    sourceY: sourceY + yOffset,
    targetX: sourceX + xOffset + xOffset1,
    targetY: sourceY + yOffset + yOffset1,
  })

  return (
    <>
      <path
        id={id}
        className="path"
        d={edgeH1}
      />
      <path
        id={id}
        className="path"
        d={edgeV}
      />
      <path
        id={id}
        className="path"
        d={edgeH2}
        markerEnd={markerEnd}
      />
    </>
  );
}

