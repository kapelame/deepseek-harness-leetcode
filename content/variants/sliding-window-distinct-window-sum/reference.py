def maxDistinctWindowSum(nums, k):
    counts = {}
    repeated = 0
    total = 0
    best = 0
    for right, value in enumerate(nums):
        counts[value] = counts.get(value, 0) + 1
        if counts[value] == 2:
            repeated += 1
        total += value
        if right >= k:
            old = nums[right - k]
            counts[old] -= 1
            if counts[old] == 1:
                repeated -= 1
            total -= old
        if right >= k - 1 and repeated == 0:
            best = max(best, total)
    return best
