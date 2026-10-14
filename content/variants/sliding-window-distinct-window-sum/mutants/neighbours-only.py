def maxDistinctWindowSum(nums, k):
    best = 0
    for i in range(len(nums) - k + 1):
        window = nums[i:i + k]
        if all(window[j] != window[j + 1] for j in range(k - 1)):
            best = max(best, sum(window))
    return best
