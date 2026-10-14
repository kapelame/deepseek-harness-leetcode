from functools import lru_cache
@lru_cache(maxsize=None)
def climbStairs(n):
    if n <= 1:
        return 1
    return climbStairs(n - 1) + climbStairs(n - 2)
