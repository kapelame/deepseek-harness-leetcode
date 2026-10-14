def maxDistinctWindowSum(nums, k):
    best = 0
    for i in range(len(nums) - k):
        window = nums[i:i + k]
        if len(set(window)) == k:
            best = max(best, sum(window))
    return best
