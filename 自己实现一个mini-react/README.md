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

3 在 performUnitOfWork 方法中，如果一边生成新的 DOM 并添加到其父节点上, 在整颗树的渲染前，浏览器还要中途阻断这个过程，用户有可能看到渲染未完全的 UI，
因此我们将修改DOM 这部分的内容记录在 Fiber tree 上, 通过最终这颗 Fiber tree 来收集所有的 DOM 节点的修改，这个树叫做 wipRoot(work in progress root); 
一旦 wipRoot 完成了所有的任务，我们就会将这颗树的变更提交到实际的 DOM 上。（这个提交操作都在 commitRoot 函数中完成）

4 在更新整颗树的时候，需要构建新的 Fiber 节点，因此我们通过 alternate 记录旧的节点，通过新的element和旧的fiber节点的type的对比进行复用，生成新的fiber节点

总体的遍历过程是先子节点在兄弟节点。



# 函数组件
1 函数组件的fiber节点是没有 DOM 节点的
2 子节点是由函数运行而来，而不是直接从 props 属性中获取





