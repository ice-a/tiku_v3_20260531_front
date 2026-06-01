// 基于种子的伪随机数生成器
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h * 16807 + 0) % 2147483647;
    return (h & 0x7fffffff) / 0x7fffffff;
  };
}

/**
 * 根据种子生成全随机渐变 CSS
 * 两个颜色完全随机 HSL，角度随机
 */
export function generateGradient(seed) {
  const rand = seededRandom(seed || String(Date.now()));

  const h1 = Math.floor(rand() * 360);
  const s1 = Math.floor(rand() * 30) + 60; // 60-90
  const l1 = Math.floor(rand() * 20) + 45; // 45-65

  const h2 = Math.floor(rand() * 360);
  const s2 = Math.floor(rand() * 30) + 60;
  const l2 = Math.floor(rand() * 20) + 45;

  const angle = Math.floor(rand() * 360);
  return `linear-gradient(${angle}deg, hsl(${h1}, ${s1}%, ${l1}%), hsl(${h2}, ${s2}%, ${l2}%))`;
}

/**
 * 为列表中的每个 item 附加随机渐变色
 */
export function attachBlockIcons(items) {
  return items.map(item => ({
    ...item,
    gradient: generateGradient(item._id || item.name || String(Math.random())),
  }));
}
