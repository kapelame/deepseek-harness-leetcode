def farthestIndex(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            break
        reach = max(reach, i + step)
    return reach
