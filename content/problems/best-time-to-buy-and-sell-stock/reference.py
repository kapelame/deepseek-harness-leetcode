def maxProfit(prices):
    lowest, best = prices[0], 0
    for p in prices[1:]:
        best = max(best, p - lowest)
        lowest = min(lowest, p)
    return best
