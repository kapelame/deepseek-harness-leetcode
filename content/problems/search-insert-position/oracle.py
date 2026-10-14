def searchInsert(nums, target):
    for i, v in enumerate(nums):
        if v >= target:
            return i
    return len(nums)
