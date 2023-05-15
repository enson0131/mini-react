# setState 是同步还是异步更新
React17 稳定版本或者 React17 以前的版本中，即 legacy 模式下，在 react 能够接管的地方，比如生命周期或者合成事件中, setState 是异步更新的。
但是在 setTimeout 或者通过 window.addEventListener 添加的原生事件中，setState 则是同步的。