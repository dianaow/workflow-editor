import React from 'react';
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
import { ReactComponent as Group } from "./assets/nodes/common/group.svg"
import { ReactComponent as Client } from "./assets/nodes/common/client.svg"
import { ReactComponent as Line } from "./assets/nodes/common/line.svg"
import { ReactComponent as SingleConnector } from "./assets/nodes/common/connector-single.svg"
import { ReactComponent as DoubleConnector } from "./assets/nodes/common/connector-double.svg"

export default ({setEdgeType}) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebarWrapper">
      <h2 style={{textAlign: 'center', marginTop: '0px'}}>Cloud Components</h2>
      <div className="sidebar--header">Common</div>
      <div className="sidebar--cloud-components">
      <div className='sidebar--items' onClick={() => setEdgeType('line')}>
          <Line />
          <div>Line</div>
        </div>
        <div className='sidebar--items' onClick={() => setEdgeType('single-connector')}>
          <SingleConnector />
          <div>Single Connector</div>
        </div>
        <div className='sidebar--items' onClick={() => setEdgeType('double-connector')}>
          <DoubleConnector />
          <div>Double Connector</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Client')} draggable>
          <Client />
          <div>Client</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Group')} draggable>
          <Group />
          <div>Group</div>
        </div>
      </div>
      <div className="sidebar--header">Services</div>
      <div className="sidebar--cloud-components">
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Pub/Sub')} draggable>
          <PubSub />
          <div>Pub/Sub</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Monitoring')} draggable>
          <Monitoring />
          <div>Monitoring</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Logging')} draggable>
          <Logging />
          <div>Logging</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Data Flow')} draggable>
          <DataFlow />
          <div>Data Flow</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Cloud Storage')} draggable>
          <CloudStorage />
          <div>Cloud Storage</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'App Engine')} draggable>
          <AppEngine />
          <div>App Engine</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Data Store')} draggable>
          <DataStore />
          <div>Data Store</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Compute Engine')} draggable>
          <ComputeEngine />
          <div>Compute Engine</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Big Wuery')} draggable>
          <BigQuery />
          <div>Big Query</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Data Prop')} draggable>
          <DataProp />
          <div>Data Prop</div>
        </div>
        <div className='sidebar--items' onDragStart={(event) => onDragStart(event, 'Data Lab')} draggable>
          <DataLab />
          <div>Data Lab</div>
        </div>
      </div>
    </div>
  );
};