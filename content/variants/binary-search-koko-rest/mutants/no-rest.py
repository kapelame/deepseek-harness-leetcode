def minSpeedWithRest(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum((pile + mid - 1) // mid for pile in piles) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo
