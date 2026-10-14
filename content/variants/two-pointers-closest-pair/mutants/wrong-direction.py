def closestPairGap(nums, target):
    left, right = 0, len(nums) - 1
    best = abs(nums[0] + nums[1] - target)
    while left < right:
        total = nums[left] + nums[right]
        best = min(best, abs(total - target))
        if total > target:
            left += 1
        else:
            right -= 1
    return best
