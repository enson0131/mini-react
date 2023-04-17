# React 合成事件
React17 之前, 合成事件是在 document 冒泡时触发

# 为什么要有合成事件
1 抹平各个浏览器间的差异
2 React 通过顶层监听的形式，通过事件委托来统一管理所有的事件，可以在事件上区分优先级优化用户体验


# 原生事件和合成事件的执行顺序是什么？
React16: document 捕获 -> 原生事件 -> 合成事件 -> document 冒泡 (原因是事件委托在 document 的冒泡事件上)
React17: document 捕获 -> 合成捕获 -> 原生捕获 -> 原生冒泡 -> 合成冒泡 -> document 冒泡 (原因是合成事件的委托在 root 容器的捕获和冒泡事件上了)

# 合成事件在什么阶段会被执行？
React16 的合成事件委托在 document 的冒泡事件上
React17 的合成事件委托在 root 的捕获和冒泡事件上

# 阻止原生事件的冒泡，会影响到合成事件的执行嘛？
会影响

# 阻止合成事件的冒泡，会影响到原生事件的执行嘛？
会影响原生事件的执行

# 测试链接
React16 - https://codesandbox.io/s/react16-epctik?file=/src/App.js:2057-2093
React17 - https://codesandbox.io/s/react17-hnc416?file=/src/App.js:2057-2094
