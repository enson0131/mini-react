/** 
const element = React.createElement(
    "div",
    { id: "foo" },
    React.createElement("a", null, "bar"),
    React.createElement("b")
)

*/

const TEXT_ELEMENT = "TEXT_ELEMENT";
/** 实现一个  createElement start */
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                return typeof child === "object" ? child : createTextElement(child)
            }),
        }
    }
}

function createTextElement(text) {
    return {
        type: TEXT_ELEMENT,
        props: {
            nodeValue: text,
            children: [],
        },
    }
}
/** 实现一个  createElement end */


/** 实现一个 render 函数 start */
// 递归写法，当 VDOM 过大的时候容易阻塞主进程，因此改成 requestIdleCallback + Fiber 架构
// function render(element, container) {
//     const type = element.type;
//     // 根据虚拟dom类型创建真实 DOM
//     const dom = type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(element.type);
    
//     // 将数据赋值给 DOM 元素
//     const isProperty = key => key !== 'children';
//     Object.keys(element.props).filter(isProperty).forEach(name => {
//         dom[name] = element.props[name];
//     })

//     // 递归元素
//     if (Array.isArray(element?.props?.children)) {
//         element?.props?.children?.forEach(child => {
//             render(child, dom)
//         })
//     }
//     container.appendChild(dom);
// }

// requestIdleCallback + Fiber 架构 start
let nextUnitOfWork = null; // Fiber节点
let wipRoot = null; // Fiber 树
let currentRoot = null; // 当前的 Fiber 树的根节点
let deletions = []; // 需要删除的旧的 Fiber 节点
/**
 * 根据 Fiber 创建
 * @param {*} fiber 
 */
function createDom(fiber) {
    const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)
  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })
  return dom
}

function render(element, container) {
    // 将 nextUnitOfWork 作为 Fiber 树的根节点
    wipRoot = { // 为了避免在边操作树边渲染树，因UI阻塞导致页面不完全，因此采用了将操作DOM的记录存储到 wipRoot 上, 最终在修改成 DOM 树
        dom: container, 
        props: {
            children: [element]
        },
        alternate: currentRoot, // 记录旧的 Fiber 节点引用
    }

    nextUnitOfWork = wipRoot;
    deletions = [];
}

/**
 * 根据 Fiber 节点渲染 DOM 树
 */
function commitRoot () {
    deletions.forEach(commitWork); // 删除旧的 Fiber 节点
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

/**
 * 递归渲染 Fiber 节点
 * 为了避免一边渲染一边操作 DOM, 有可能会导致 UI 阻塞, 这会导致用户看到的 UI 不完全, 因此需要将操作 DOM 的记录存储到 wipRoot 上, 最终在修改成 DOM 树
 * @param {*} fiber 
 */
function commitWork(fiber) {
    if (!fiber) return;

    let domParentFiber = fiber.parent;
    while(!domParentFiber.dom) { // 如果父节点没有 DOM 一直往上查
        domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;

    if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if ( fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(
          fiber.dom,
          fiber.alternate.props,
          fiber.props
        )
    } else if (fiber.effectTag === 'DELETION') {
        // domParent.removeChild(fiber.dom);
        commitDeletion(fiber, domParent);
    } 

    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function commitDeletion (fiber, domParent) { 
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}
const isEvent = key => key.startsWith('on'); // 过滤事件属性
const isProperty = key => key !== 'children' && !isEvent(key); // 过滤 children、事件 属性 
const isNew = (prev, next) => key => prev[key] !== next[key]; // 判断属性是否更新 (这里返回的是一个函数)
const isGone = (prev, next) => key => !(key in next); // 判断属性是否删除
function updateDom(dom, prevProps, nextProps) {
    // 删除旧的事件 filter => true 才返回
    Object.keys(prevProps).filter(isEvent).filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key)).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
    });

    // 删除旧的属性
    Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(name => {
        dom[name] = '';
    });

    // 更新新的属性
    Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(name => {
        dom[name] = nextProps[name];
    });

    // 添加新的事件
    Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
    });
}

/**
 * 构建 Fiber 树🌲
 * Fiber Reconciler 的实现算法
 * nextUnitOfWork - Fiber 根节点, FiberNode 类
 * @param {*} deadline - 空闲时间
 */
function workLoop(deadline) {
    let shouldYield = false;
    // 循环构建 Fiber 树
    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(
        nextUnitOfWork
      )
      shouldYield = deadline.timeRemaining() < 1; // 判断是否需要中断
    }

    // 构建完 Fiber 树了, 将 Fiber 树的数据构建 DOM 树
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)


/**
 * 根据 React 虚拟 子DOM 创建 Fiber 节点, 并构建 子 Fiber 树
 * 该函数还会调和旧的 Fiber 节点和新的 React element
 * @param {*} wipFiber 
 * @param {*} elements 
 */
function reconcileChildren(wipFiber, elements = []) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child; // 上次渲染的 Fiber 节点
    let prevSibling = null;

    while(index < elements.length || oldFiber != null) {
        /**
         这里应该是存在 单节点diff 和 多节点diff 的情况
         - 如果是单节点diff
           1 判断key和tag是否相同
             - 如果不相同，则旧的 Fiber 节点标记成删除，继续遍历 Fiber 节点
             - 如果相同，则复用 Fiber 节点，并更新属性
        
        - 如果是多节点diff会有俩个 for 循环，第一个 for 循环判断节点是否需要更新，第二个 for 循环判断是否需要删除、添加、移动节点
           - 第一层 for 循环
            1 判断 key 和 tag 是否相同, 相同则判断需要更新
            2 如果是 key 相同 tag不相同，标记为删除，并继续遍历
            3 如果 key 不相同，跳出循环, 记录上一个 key 相同的 index 索引 lastIndex
           - 第二次 for 循环
            1 建立旧节点的 Map 表，key 为 key, value 为 节点
            2 判断新节点是否在 Map 表中存在, 如果对应的旧节点索引 oldIndex > lastIndex, 表示需要更新节点
            3 如果 oldIndex < lastIndex, 表示需要更新移动节点
            4 如果新节点的key不存在 Map 标中，直接新增节点
         */
        const element = elements[index];

        let newFiber = null;
        // const newFiber = { // 为每个 React element 创建一个 Fiber 节点
        //     type: element.type, // element 是通过 createElement 创建的 react element
        //     props: element.props,
        //     parent: wipFiber,
        //     dom: null,
        // }
        /*
        通过比较旧的Fiber 节点和新的 React element 对象进行复用
        1 对于新旧类型是相同的情况, 我们可以复用旧的DOM, 仅修改上面的属性
        2 如果类型不同, 意味着我们需要创建一个新的 DOM 节点
        3 如果类型不同 旧节点存在的话, 需要把旧节点移除
        */
        const sameType = oldFiber && element && element.type === oldFiber.type; // 判断类型是否相同

        if (sameType) {
            // update the node
            // 如果是相同的类型, 那么复用旧 Fiber 的属性
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE', // 标记需要更新
            }
        }

        if (element && !sameType) {
            // add this node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null, // 会在 performUnitOfWork 中创建
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT', // 标记需要添加
            }
        }

        if (oldFiber && !sameType) {
            // delete the oldFiber's node
            oldFiber.effectTag = 'DELETION'; // 标记需要删除
            deletions.push(oldFiber); // 当我们提交整颗 Fiber 树变更到 DOM 上时, 并不会遍历旧的 Fiber，因此需要将需要删除的 Fiber 节点存储起来
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0) { // 第一个子节点
            wipFiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }
}

function updateHostComponent (fiber) {
    // add dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    // if (fiber.parent) { // 避免边生成边渲染，如果遇到阻塞用户将看到不完全的页面
    //     fiber.parent.dom.appendChild(fiber.dom);
    // }
    // create new fibers
    reconcileChildren(fiber, fiber.props.children);
}

let wipFiber = null;
let hookIndex = null;
function updateFunctionComponent(fiber) {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = []; // 用于存储 hooks
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}

function useState(initial) {
    const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]; // 获取旧的 hook
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: []
    }


    const actions = oldHook ? oldHook.queue : [];
    actions.forEach(action => { // 下一次执行函数组件的时候，就会执行 useState 就会执行setState时存入的 action
        hook.state = action(hook.state);
    })


    const setState = action => {
        hook.queue.push(action);
        wipRoot = { // 设置当前的 Fiber 节点为根节点从根节点开始遍历 Fiber 树
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        }
        nextUnitOfWork = wipRoot;
        deletions = [];
    }


    wipFiber.hooks.push(hook);
    hookIndex++;

    return [hook.state, setState];
}


/**
 * 根据 Fiber 数据，构建 Fiber 树
 * 先深度遍历子节点，再遍历兄弟节点
 * @param {*} fiber 
 * @returns 
 */
function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function;

    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }
    

    // 返回下一个要执行的 fiber 节点
    if (fiber.child) {
        return fiber.child;
    }

    let nextFiber = fiber;
    while(nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }

        nextFiber = nextFiber.parent;
    }

    return nextFiber;
}
// requestIdleCallback + Fiber 架构 end
/** 实现一个 render 函数 end */

const miniReact = {
    createElement,
    render
}