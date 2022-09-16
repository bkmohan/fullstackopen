import { useEffect, useState } from 'react'
import contact from './services/contacts'

const Filter = (props) => {
  const [filterName, setFilterName] = useState('')

  const handleFilterChange = (event) => {
    let query = event.target.value
    setFilterName(query);
    props.updateFilter(query);
  }

  return <div>
          filter shown with <input value={filterName} onChange={handleFilterChange}/>
        </div>
}

const ContactForm = (props) => {
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  }

  const addContact = (event) => {
      event.preventDefault();
      props.addContact(newName, newNumber);
      setNewName('');
      setNewNumber('');
  }

  return <div>
          <h2>add a new</h2>
          <form onSubmit={addContact}>
            <div>
              name: <input value={newName} onChange={handleNameChange}/>
            </div>
            <div>
              number: <input value={newNumber} onChange={handleNumberChange}/>
            </div>
            <div>
              <button type="submit">add</button>
            </div>
          </form>
        </div>
}

const Persons = ({filter, deleteBtn}) => {

    const deleteContact = (event) => {
      deleteBtn(event.target.getAttribute('data-id'));
    }

      return filter.map(person => {
                    return <div key={person.id}>
                      <span>{person.name} {person.number} </span>
                      <button data-id={person.id} onClick={deleteContact}>Delete</button>
                      </div>
                    
                  })
  }


const Notification = ({message, type}) => {
  const errorStyle = {
    color: 'red',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    margiBottom: '10px'
  }

  const infoStyle = {
    color: 'green',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    margiBottom: '10px'
  }

  if(message == null) return null;

  return (
    <div style={ type === 'error' ? errorStyle : infoStyle}>
      {message}
    </div>
  )

}


const App = () => {
  const [persons, setPersons] = useState([]) 
  const [filter, setFilter] = useState([])
  const [message, setMessage] = useState({text: null, type: null});

  useEffect(() => {
      contact.getAll().then(initalContacts =>  {
        console.log(initalContacts)
        setPersons(initalContacts)
        setFilter(initalContacts)
      })
  }, [])

  useEffect(() => {
    setFilter(persons)
}, [persons])


  const addContact = (name, number) => {
    let person = persons.find(person => person.name === name);

    if(name === '' || number === ''){
      alert(`Please enter both name and number`);
    }
    else if(person){
      if(window.confirm(`${person.name} is already added to phonebook, replace the old number with a new one?`)){  
        contact.update(person.id, {name, number}).then(newContact => {
          setPersons(prevPersons => prevPersons.map(contact => contact.id === newContact.id ? newContact : contact))
          setFilter(persons);

          setMessage({text: `Updated phonenumber of ${newContact.name}`, type: 'info'})

          setTimeout(() => {
            setMessage({text: null, type : null})
          }, 5000)

        })
      }
    }
    else{
      contact.create({name, number})
              .then(newContact =>{
                setPersons(prevPersons => prevPersons.concat(newContact))
                setFilter(persons);
                setMessage({text: `Added ${newContact.name}`, type: 'info'})

                setTimeout(() => {
                  setMessage({text: null, type : null})
                }, 5000)
              })
    }
    
  }

  const deleteContact = (id) => {
    id = parseInt(id);
    let person = persons.find(p => p.id === id);
      
    if(window.confirm(`Delete ${person.name}?`)){
          contact.delContact(id)
        .catch(error => {
          setMessage({text:`Information of ${person.name} has already been removed from server.`, type:'error'});
          setTimeout(() => {
            setMessage({text: null, type : null})
          }, 5000)
        })
  
        setPersons(persons.filter(person => person.id !== id));
        setFilter(prevFilt => prevFilt.filter(filt => filt.id !== id));
    }
  }

  const handleFilterChange = (query) => {
    if(query === ''){
      setFilter(persons);
    }
    else {
      setFilter(
        persons.filter(person => person.name.toLowerCase().includes(query.toLowerCase()))
      )
    }
  }



  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message.text} type={message.type} />
      <Filter updateFilter={handleFilterChange}/>
      <ContactForm addContact={addContact} />
    
      <h3>Numbers</h3>
      <Persons filter={filter} deleteBtn={deleteContact}/>
    </div>
  )
}

export default App