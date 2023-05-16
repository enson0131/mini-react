# 前置知识
1 JSX 其实最终会通过 Babel 编译成 React.createElement 函数, createElement 函数最终将生成 VDom 对象
```
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}
```


2 在 render 方法中，我们通过 递归循环 的方式，将 VDom 渲染成节点，但如果 VDom 节点太多时，递归可能会阻塞主线程，因为使用 requestIdleCallback 作为一个循环，将任务分成一个个小块，每当我们完成其中的一个小块之后需要把控制权交给浏览器，让浏览器判断是否有更高优先级任务需要完成。

为了把所有的任务单元组织起来，我们需要一个数据结构: Fiber 结构


