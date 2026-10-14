def countOccurrences(nums, target):
    return sum(1 for value in nums if value == target)
