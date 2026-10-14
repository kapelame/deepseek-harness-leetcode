def canPartition(nums):
    sums = {0}
    for x in nums:
        sums |= {s + x for s in sums}
    total = sum(nums)
    return total % 2 == 0 and total // 2 in sums
