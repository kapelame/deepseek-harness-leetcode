def canPartition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    reach = [True] + [False] * target
    for x in nums:
        for t in range(target, x - 1, -1):
            if reach[t - x]:
                reach[t] = True
    return reach[target]
