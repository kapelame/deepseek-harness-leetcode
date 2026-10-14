def maxSubarraySumCircular(nums):
    n = len(nums)
    best = None
    for start in range(n):
        total = 0
        for length in range(1, n + 1):
            total += nums[(start + length - 1) % n]
            best = total if best is None else max(best, total)
    return best
