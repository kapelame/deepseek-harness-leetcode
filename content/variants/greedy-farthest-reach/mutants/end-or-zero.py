def farthestIndex(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return 0
        reach = max(reach, i + step)
    return len(nums) - 1
