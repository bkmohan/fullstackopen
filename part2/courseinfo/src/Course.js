const Part = (props) => {
    return(
      <p>
          {props.part.name} {props.part.exercises}
      </p>
    )
  }
  
  const Header = (props) => {
    return (
        <h1>{props.course}</h1>
    )
  }
  
  const Content = (props) => {
    return (
      <>
        {props.parts.map(part => <Part key={part.id} part={part}/>)}
      </>
    )
  }
  
  const Total = (props) => {
    return (
      <>
        <h5>Total of {props.parts.reduce((acc, cur) => acc + cur.exercises, 0)} exercises</h5>
      </>
    )
  }
  
  const Course = ({course}) => {
  
    return (
      <div>
        <Header course={course.name}></Header>
        <Content parts={course.parts}></Content>
        <Total parts={course.parts} ></Total>
      </div>
    )
  }

  export default Course