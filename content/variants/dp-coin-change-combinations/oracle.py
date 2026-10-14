def change(amount, coins):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def count(i, remain):
        if remain == 0:
            return 1
        if i == len(coins):
            return 0
        total = 0
        used = 0
        while used * coins[i] <= remain:
            total += count(i + 1, remain - used * coins[i])
            used += 1
        return total
    return count(0, amount)
