import { useState } from 'react'
const ChildrenUpdate = () => {
    const [count, setCount] = useState(0)
    const handleClick = () => {
        setCount(1);
    }
    console.log(`子组件更新`)
    return (
        <div onClick={handleClick}>
            子组件更新 - {count}
        </div>
    )
}

export default ChildrenUpdate;

