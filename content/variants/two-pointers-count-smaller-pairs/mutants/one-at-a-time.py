def countPairsBelow(nums, target):
    left, right = 0, len(nums) - 1
    total = 0
    while left < right:
        if nums[left] + nums[right] < target:
            total += 1
            left += 1
        else:
            right -= 1
    return total
