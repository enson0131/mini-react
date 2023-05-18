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

/**
 * 根据 Fiber 创建
 * @param {*} fiber 
 */
function createDom(fiber) {

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
}

/**
 * 根据 Fiber 节点渲染 DOM 树
 */
function commitRoot () {
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

/**
 * 递归渲染 Fiber 节点
 * @param {*} fiber 
 */
function commitWork(fiber) {
    if (!fiber) return;

    const domParent = fiber.parent.dom;
    domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function workLoop(deadline) {
    let shouldYield = false;
    // 循环构建 Fiber 树
    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(
        nextUnitOfWork
      )
      shouldYield = deadline.timeRemaining() < 1; // 判断是否需要中断
    }

    if (!nextUnitOfWork && wipRoot) {
        // 构建完 Fiber 树了, 将 Fiber 树的数据构建 DOM 树
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
function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;

    while(index < elements.length || !oldFiber) {
        const element = elements[index];

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: wipFiber,
            dom: null,
        }

        // TODO compare oldFiber to element
        /*
        通过比较旧的Fiber 节点和新的 React element 对象进行复用
        1 对于新旧类型是相同的情况, 我们可以复用旧的DOM, 仅修改上面的书写
        2 如果类型不同, 意味着我们需要创建一个新的 DOM 节点，并且旧节点存在的话, 需要把旧节点移除
        */


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

/**
 * 根据 Fiber 数据，构建 Fiber 树
 * @param {*} fiber 
 * @returns 
 */
function performUnitOfWork(fiber) {
    // add dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    // if (fiber.parent) {
    //     fiber.parent.dom.appendChild(fiber.dom);
    // }
    // create new fibers
    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);

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