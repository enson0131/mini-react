const tasks = [];
const yieldInterval = 5;


window.requestIdleCallback =
    window.requestIdleCallback ||
    function(cb) {
        var start = Date.now();
        return setTimeout(function() {
            cb({
                didTimeout: false,
                // https://developer.mozilla.org/zh-CN/docs/Web/API/Background_Tasks_API 
                timeRemaining: function() {
                    return Math.max(0, 50 - (Date.now() - start)); // 目前 timeRemaining 有 50ms 的上限
                },
            });
        }, 1);
    };

window.cancelIdleCallback =
    window.cancelIdleCallback ||
    function(id) {
        clearTimeout(id);
    };

async function workLoop(deadline) {
    let shouldYield = false;
    // 循环构建 Fiber 树
    while (tasks.length > 0 && !shouldYield) {
      const task = tasks.shift();
      await task();
      // 判断是否需要中断
 
      shouldYield = deadline.timeRemaining() < yieldInterval; // 返回一个 DOMHighResTimeStamp，其为浮点数，用来表示当前闲置周期的预估剩余毫秒数
    }

    requestIdleCallback(workLoop)
}



const addTask = (callback) => {
    tasks.push(callback);
}

addTask(() => {
    console.log(`1`);
})
requestIdleCallback(workLoop)



