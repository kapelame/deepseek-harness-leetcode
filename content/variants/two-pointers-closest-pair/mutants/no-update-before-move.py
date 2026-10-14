def closestPairGap(nums, target):
    left, right = 0, len(nums) - 1
    best = abs(nums[0] + nums[-1] - target)
    while left < right:
        total = nums[left] + nums[right]
        if total < target:
            left += 1
        elif total > target:
            right -= 1
        else:
            return 0
    return best
