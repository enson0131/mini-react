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
function render(element, container) {
    const type = element.type;
    // 根据虚拟dom类型创建真实 DOM
    const dom = type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(element.type);
    
    // 将数据赋值给 DOM 元素
    const isProperty = key => key !== 'children';
    Object.keys(element.props).filter(isProperty).forEach(name => {
        dom[name] = element.props[name];
    })

    // 递归元素
    if (Array.isArray(element?.props?.children)) {
        element?.props?.children?.forEach(child => {
            render(child, dom)
        })
    }


    container.appendChild(dom);
}
/** 实现一个 render 函数 end */

const miniReact = {
    createElement,
    render
}