
import ChildrenUpdate from './components/childrenUpdate';

import './App.css'

function App() {
  console.log(`父组件更新了？？`);
  return (
    <>
      <div>
        父组件
        <ChildrenUpdate />
      </div>
    </>
  )
}

export default App
