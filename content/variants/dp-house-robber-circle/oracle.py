def robCircle(nums):
    n = len(nums)
    best = 0
    for mask in range(1 << n):
        ok = all(not (mask >> i & 1 and mask >> ((i + 1) % n) & 1) for i in range(n)) if n > 1 else True
        if ok:
            best = max(best, sum(nums[i] for i in range(n) if mask >> i & 1))
    return best
