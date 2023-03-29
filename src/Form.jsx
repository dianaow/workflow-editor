
import { useState } from 'react'

function Form({selectedGraph, updateGraph}) {

  const [form, setForm] = useState({display: false});

  const handleChange = (e) => {
    e.preventDefault()
    const newGraph = { 
      node: {
        ...selectedGraph.node, 
        data: {...selectedGraph.node.data, name: form.name, description: form.description}
      },
      edges: selectedGraph.edges
    }
    updateGraph(newGraph)
    setForm({...form, display: false})
  }
  
  return (
    <div className="updatenode__controls" style={{display: (Object.keys(selectedGraph.node).length === 0 || form.display === false) ? 'none' : 'block'}}>
      <h3>Edit component</h3>
      <div>
        <label>Name:</label>
        <input value={form.name || (selectedGraph.node.data ? selectedGraph.node.data.name : '')} onChange={(evt) => setForm({...form, name: evt.target.value})} />
      </div>
      <div>
        <label>Description:</label>
        <input value={form.description || (selectedGraph.node.data ? selectedGraph.node.data.description : '')} onChange={(evt) => setForm({...form, description: evt.target.value})} />
      </div>
      <div className="btn" onClick={() => setForm({...form, display: false})}>
          <div className='btn-label'>Cancel</div>
      </div>
      <div className="btn" onClick={handleChange}>
          <div className='btn-label'>Save</div>
      </div>
    </div>
  )
}

export default Form