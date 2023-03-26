/**
 * 使用贪心算法，最大的流星数量就是start - end - start - end 一次排列
 * 最大观测数量
 * @param {*} num - 流星数 
 * @param {*} start - 开始时间
 * @param {*} end - 结束时间
 */
function count(num, start, end) {
    if (num <= 1) return num;

    let res = 0; // 最大流星数
    let time = 0; // 最佳时刻数量
    let startTime = start.sort((a, b) => b - a); // 从小到大排序
    let endTime = end.sort((a, b) => b - a); // 从小到大排序

    let j = 0;
    let tempRes = 0;
    for(let i = 0; i < num; i++) {
        if (endTime[j] < startTime[i]) {
            j++;
        } else {
            tempRes++;
            if (tempRes >= res) {
                time++;
                res = tempRes;
            }
        }
    }

    return [time, res]; 
}