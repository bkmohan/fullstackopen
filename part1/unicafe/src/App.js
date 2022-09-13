import { useState } from "react";


function Button({text, onClick}){
  return (
    <button onClick={onClick}>{text}</button>
  )
}

function Feedback({text, value}){
  return(
    <tr>
      <td>{text}</td>
      <td>{value}</td>
    </tr>
  )
}

function Statistics(props){
  let {good, neutral, bad} = props.stats
  let total = good + neutral + bad;
  let avg = (good - bad) / total;
  let positive = (good / total) * 100

  if(total === 0){
    return (
      <>
        <p>No feedback given</p>
      </>
    )
  }
  else{
    return(
      <table>
        <thead>
          <th colSpan={2}>Statistics</th>
          </thead>

        <Feedback text='good' value={good}></Feedback>
        <Feedback text='neutral' value={neutral}></Feedback>
        <Feedback text='bad' value={bad}></Feedback>
        <Feedback text='all' value={total}></Feedback>
        <Feedback text='average' value={avg}></Feedback>
        <Feedback text='positive' value={positive}></Feedback>
      </table>
    )
  }
}

function App() {

  const [feedbacks, setFeebdbacks] = useState({'good': 0, 'neutral': 0, 'bad' : 0})

  const updateFeedback = (text) => {
      if(text === 'good') setFeebdbacks({...feedbacks, good:feedbacks.good+1});
      else if(text === 'neutral') setFeebdbacks({...feedbacks, neutral:feedbacks.neutral+1});
      else if(text === 'bad') setFeebdbacks({...feedbacks, bad:feedbacks.bad+1});
  }

  return (
      <div>
        <h1>give feedback</h1>
        <Button text="good" onClick={() => updateFeedback('good')}></Button>
        <Button text="neutral" onClick={() => updateFeedback('neutral')}></Button>
        <Button text="bad" onClick={() => updateFeedback('bad')}></Button>
        <Statistics stats={feedbacks}></Statistics>
      </div>

  );
}

export default App;
