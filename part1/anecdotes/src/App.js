import { useState } from 'react'

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 10 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.'
  ]

  const anecdotesVotes = anecdotes.map(a => 0);
   
  const [selected, setSelected] = useState(Math.floor(Math.random() * anecdotes.length))
  const [votes, setVotes] = useState({votes: anecdotesVotes, popular : ''})

  const getRandom = () => {
    let rand = Math.floor(Math.random() * anecdotes.length);
    setSelected(rand);
  }

  const vote = () => {
    let currentVotes = {...votes};
    currentVotes['votes'] = votes.votes.map( (v, idx) => {
      if(idx === selected) return ++v;
      return v});
    

    let mostPopular = 0;
    for(let i=0; i < currentVotes['votes'].length; i++){
      if(currentVotes['votes'][mostPopular] < currentVotes['votes'][i]) {
        mostPopular = i;
      }
    }

    currentVotes['popular'] = anecdotes[mostPopular];

    setVotes(currentVotes)
  }



  return (
    <div>
      <p>{anecdotes[selected]}</p>
      <p>has {votes.votes[selected]} votes</p>
      <button onClick={vote}>vote</button>
      <button onClick={getRandom}>next anecdote</button>

      <h1>Anectode with most votes</h1>
      <p>{votes.popular}</p>
    </div>
  )
}

export default App
