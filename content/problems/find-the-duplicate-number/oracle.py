def findDuplicate(nums):
    for i, x in enumerate(nums):
        if x in nums[i + 1:]:
            return x
