
import { useState } from 'react'

function Form({selectedGraph, updateGraph}) {

  const [form, setForm] = useState({display: false});

  const handleClick = (e) => {
    e.preventDefault()
    const newGraph = { 
      node: {
        ...selectedGraph.node, 
        data: {...selectedGraph.node.data, name: form.name, description: form.description}
      },
      edges: selectedGraph.edges
    }
    updateGraph(newGraph)
    console.log('click save')
    setForm({...form, display: false})
    selectedGraph.display = false
  }

  const handleChange = (evt, field) => {
    console.log('change field', evt.target.value)
    setForm({...form, [field]:evt.target.value === '' ? '' : evt.target.value})
  }
  
  const handleCancel = () => {
    console.log('cancel button')
    setForm({...form, display: false})
    selectedGraph.display = false
  }

  return (
    <div className="updatenode__controls" style={{display: form.display || selectedGraph.display ? 'block' : 'none'}}>
      <h3>Edit component</h3>
      <div className='form-field'>
        <label>Name:</label>
        <input value={form.name || (selectedGraph.node.data ? selectedGraph.node.data.name : '')} onChange={(e) => handleChange(e, 'name')} />
      </div>
      <div className='form-field'>
        <label>Description:</label>
        <input value={form.description || (selectedGraph.node.data ? selectedGraph.node.data.description : '')} onChange={(e) => handleChange(e, 'description')} />
      </div>
      <div className='form-field'>
        <label>Values</label>
        <input value={form.values || (selectedGraph.node.data ? selectedGraph.node.data.values: '')} onChange={(e) => handleChange(e, 'values')} />
      </div>
      <div className='btn-wrapper'>
        <div className="btn" onClick={handleCancel}>
            <div className='btn-label'>Cancel</div>
        </div>
        <div className="btn" onClick={handleClick}>
            <div className='btn-label'>Save</div>
        </div>
      </div>
    </div>
  )
}

export default Form