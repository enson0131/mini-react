import logo from './logo.svg';
import './App.css';
import { useReducer } from 'react';
import { useState } from 'react';


const reducer = (state, action) => {
    return action

}
function App() {
  const [count, setCount] = useState(0);
  // const [count, setCount] = useReducer(reducer, 0);
  const handleClick = () => {
    // 有开启批处理
    // setCount(1);
    // setCount(2);

    // 没有开启批处理
    setTimeout(() => {
      setCount(1);
      setCount(2);
    }, 0);
  }

  console.log("render======", count);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p onClick={handleClick}>
          Edit <code>src/App.js</code> and save to reload. status: {count}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React1
        </a>
      </header>
    </div>
  );
}

export default App;
