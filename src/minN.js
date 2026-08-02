// minNForTolerance: 주어진 x에 대해 최소 n 찾기 (2 * |x|^(2n+1) / (2n+1) < tol)
function minNForTolerance(x, tol = 1e-14, maxN = 10000000) {
  if (!isFinite(x)) throw new Error("x must be finite");
  const a = Math.abs(x);
  if (a >= 1.0) throw new Error("|x| must be < 1 for convergence.");
  if (a === 0) return 0;
  const lnTol = Math.log(tol);
  const ln2 = Math.log(2);
  function check(n) {
    const numeratorLog = ln2 + (2 * n + 1) * Math.log(a);
    const denomLog = Math.log(2 * n + 1);
    return (numeratorLog - denomLog) < lnTol;
  }

  if (check(0)) return 0;
  let low = 0;
  let high = 1;
  while (!check(high)) {
    low = high + 1;
    high *= 2;
    if (high > maxN) throw new Error(`required n exceeds maxN (${maxN})`);
  }

  let left = low;
  let right = high;
  while (left + 1 < right) {
    const mid = Math.floor((left + right) / 2);
    if (check(mid)) right = mid;
    else left = mid;
  }
  return right;
}

module.exports = { minNForTolerance };
