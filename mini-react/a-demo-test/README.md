# 调试 React 项目
## 第一步 - 创建软链
- 1 在 mini-react/react/node_modules/react 执行 yarn link 创建软链
- 2 在 mini-react/react/node_modules/react-dom 执行 yarn link 创建软链

## 第二步 - 映射软链
在 mini-react/a-demo-test 执行 yarn link react react-dom 进行软链映射
这样在 a-demo-test 中使用的 react、 react-dom 就是 mini-react/react/node_modules/ 下的 react 和 react-dom 了
便于调试