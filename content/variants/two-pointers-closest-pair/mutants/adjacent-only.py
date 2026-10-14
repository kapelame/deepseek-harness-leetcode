def closestPairGap(nums, target):
    return min(abs(nums[i] + nums[i + 1] - target) for i in range(len(nums) - 1))
