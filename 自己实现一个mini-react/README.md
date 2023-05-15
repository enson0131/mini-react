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
