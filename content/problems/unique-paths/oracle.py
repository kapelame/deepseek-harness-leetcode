def uniquePaths(m, n):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def walk(i, j):
        if i == m - 1 and j == n - 1:
            return 1
        total = 0
        if i + 1 < m:
            total += walk(i + 1, j)
        if j + 1 < n:
            total += walk(i, j + 1)
        return total
    return walk(0, 0)
