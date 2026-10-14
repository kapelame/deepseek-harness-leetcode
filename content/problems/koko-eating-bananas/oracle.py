def minEatingSpeed(piles, h):
    k = max(1, -(-sum(piles) // h))
    while sum(-(-pile // k) for pile in piles) > h:
        k += 1
    return k
