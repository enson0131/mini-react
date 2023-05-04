import logo from './logo.svg';
import './App.css';
import { useReducer } from 'react';
import { useState } from 'react';


const reducer = (state, action) => {
    return action

}

/**
 * React 的异步更新机制其实就是通过一个全局开关（executionContext）判断是否需要开启批处理 
 * React 会维护一个异步更新队列 SyncQueue, 将需要更新的任务存放到队列中
 * 从对应的 Fiber 节点出发，不断地向上收集对应的事件，直到 Root 节点为止
 * 然后在通过 Scheduler_scheduleCallback （微任务）调度任务
 * 
 */
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
