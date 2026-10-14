def maxProfitUnlimited(prices):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def best(i, holding):
        if i == len(prices):
            return 0
        skip = best(i + 1, holding)
        if holding:
            return max(skip, prices[i] + best(i + 1, False))
        return max(skip, -prices[i] + best(i + 1, True))
    return best(0, False)
