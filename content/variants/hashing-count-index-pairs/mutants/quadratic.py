def countPairs(nums, target):
    total = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                total += 1
    return total
