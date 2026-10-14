def minSpeedWithRest(piles, h):
    budget = h - (len(piles) - 1)
    if budget < len(piles):
        return -1
    k = max(1, -(-sum(piles) // budget))
    while sum(-(-pile // k) for pile in piles) > budget:
        k += 1
    return k
