def minSpeedWithRest(piles, h):
    rest = len(piles) - 1
    if len(piles) + rest > h:
        return -1
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum((pile + mid - 1) // mid for pile in piles) + rest <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo
