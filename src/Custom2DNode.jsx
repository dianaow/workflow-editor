import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { ReactComponent as PubSub } from "./assets/nodes/services/pubsub.svg";
import { ReactComponent as AppEngine } from "./assets/nodes/services/appengine.svg";
import { ReactComponent as BigQuery } from "./assets/nodes/services/bigquery.svg";
import { ReactComponent as CloudStorage } from "./assets/nodes/services/cloudstorage.svg"
import { ReactComponent as ComputeEngine } from "./assets/nodes/services/computeengine.svg"
import { ReactComponent as DataFlow } from "./assets/nodes/services/dataflow.svg"
import { ReactComponent as DataLab } from "./assets/nodes/services/datalab.svg"
import { ReactComponent as DataProp } from "./assets/nodes/services/dataprop.svg"
import { ReactComponent as DataStore } from "./assets/nodes/services/datastore.svg"
import { ReactComponent as Logging } from "./assets/nodes/services/logging.svg"
import { ReactComponent as Monitoring } from "./assets/nodes/services/monitoring.svg"

export default memo(({ data, isConnectable }) => {

  let IconComponent = PubSub
  if(data.name === 'Pub/Sub') IconComponent = PubSub
  if(data.name === 'App Engine') IconComponent = AppEngine
  if(data.name === 'Big Query') IconComponent = BigQuery
  if(data.name === 'Cloud Storage') IconComponent = CloudStorage
  if(data.name === 'Compute Engine') IconComponent = ComputeEngine
  if(data.name === 'Data Flow') IconComponent = DataFlow
  if(data.name === 'Data Lab') IconComponent = DataLab
  if(data.name === 'Data Prop') IconComponent = DataProp
  if(data.name === 'Data Store') IconComponent = DataStore
  if(data.name === 'Logging') IconComponent = Logging
  if(data.name === 'Monitoring') IconComponent = Monitoring

  return (
    <>
    <div style={{transformOrigin: '0 0', position: 'relative', width: '64px', height: '64px'}}>
      {/* <div id="node" style={{transform: `translate(20px, -25px)`}}></div> */}
      <div id="node" style={{transformOrigin: '0 0', transform: `translate(0px, 0px)`}}>
      <IconComponent/>
        <Handle
          id='left'
          type='target'
          position={Position.Left}
          style={{ background: '#555', opacity: 0.3 }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle
          id='top'
          type='target'
          position={Position.Top}
          style={{ background: '#555', opacity: 0.3 }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle
          id='right'
          type='source'
          position={Position.Right}
          style={{ background: '#555', opacity: 0.3 }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle
          id='bottom'
          type='source'
          position={Position.Bottom}
          style={{ background: '#555', opacity: 0.3 }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
      </div>
      {/* <div id="node" style={{transform: `translate(-20px, 25px)`}}></div> */}
    </div>
    <div>{data.name}</div>
    </>
  );
});
