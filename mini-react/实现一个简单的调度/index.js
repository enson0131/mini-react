const yieldInterval = 5; // 每次调度的时间
const tasks = []; // 任务队列
let isRunning = false; // 是否正在调度
let startTime = 0; // 开始时间

function addTask(callback) {
    const task = createTask(callback); // 创建任务
    tasks.push(task); // 将任务添加到任务队列
}

/**
 * 调度器
 * @param {*} callback 
 */
function requestSchedule() {
  if (isRunning) { // 是否正在调度
    return;
  }
  isRunning = true;
  scheduleWork();
}

/**
 * 创建子任务
 * @param {*} callback 
 * @returns 
 */
const createTask = (callback) => {
  return {
    id: Math.random().toString(36).slice(2),
    callback: callback,
  }
}

/**
 * 执行任务的 schedule
 */
const scheduleWork = (() => {
    if (typeof setImmediate === 'function') {
      return () => setImmediate(performWork);
    }

    if (typeof MessageChannel !== 'undefined') {
      const channel = new MessageChannel();
      channel.port1.onmessage = performWork;
      const port = channel.port2;
      return () => port.postMessage(null);
    }

    return () => setTimeout(performWork, 0);
})();

const performWork = () => {
    startTime = Date.now();
    workLoop();
}

const workLoop = () => {
    while (tasks.length > 0 && !shouldYield()) {
        const task = tasks.shift();
        task.callback();
    }
 
    if (tasks.length > 0) {
        scheduleWork();
    } else {
        isRunning = false;
    }
}

const shouldYield = () => {
    return Date.now() >= startTime + yieldInterval;
}
// ------------------------ 使用 ------------------------------
addTask(() => {
    console.log('task1')
});
requestSchedule();