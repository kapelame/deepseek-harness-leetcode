def firstMissingPositive(nums):
    x = 1
    while x in nums:
        x += 1
    return x
