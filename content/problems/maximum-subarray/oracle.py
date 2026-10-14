def maxSubArray(nums):
    return max(sum(nums[i:j + 1]) for i in range(len(nums)) for j in range(i, len(nums)))
