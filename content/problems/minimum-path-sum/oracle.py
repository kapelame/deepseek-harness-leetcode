import itertools
def minPathSum(grid):
    m, n = len(grid), len(grid[0])
    best = None
    for downs in itertools.combinations(range(m + n - 2), m - 1):
        i = j = 0
        total = grid[0][0]
        downs = set(downs)
        for step in range(m + n - 2):
            if step in downs:
                i += 1
            else:
                j += 1
            total += grid[i][j]
        best = total if best is None else min(best, total)
    return best
