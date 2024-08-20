const taskList = []; // 任务队列
const yieldInterval = 5; // 任务执行的时间间隔
let totalTaskCount = 0; // 总任务数
let currentTaskNumber = 0; // 当前任务数
let taskHandle = null; // 是对当前处理中任务的一个引用



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

/**
 * 创建任务
 * @param {*} taskHandler - 任务处理函数
 * @param {*} taskData - 任务数据
 */
function enqueueTask(taskHandler, taskData) {
    taskList.push({
        taskHandler,
        taskData
    });

    totalTaskCount++;

    if (!taskHandle) {
        taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 }); // 即使没有空闲时间，也会在 1 秒后执行
    }

}

function runTaskQueue (deadline) {
    // deadline.didTimeout: 一个布尔值，如果回调是因为超过了设置的超时时间而被执行的，则其值为 true。
    while (taskList.length > 0 && (deadline.timeRemaining() >= yieldInterval || deadline.didTimeout)) {
        const task = taskList.shift();
        task.taskHandler(task.taskData);
        currentTaskNumber++;
    }

    if (taskList.length > 0) {
        taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 }); // 当前没有空闲时间了，等待下一次调度
    } else {
        taskHandle = 0;
    }
}

