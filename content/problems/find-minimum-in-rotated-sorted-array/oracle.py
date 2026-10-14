def findMin(nums):
    smallest = nums[0]
    for x in nums:
        if x < smallest:
            smallest = x
    return smallest
