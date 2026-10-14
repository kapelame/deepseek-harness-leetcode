def countDistinctPairs(nums, target):
    pairs = set()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                pairs.add((min(nums[i], nums[j]), max(nums[i], nums[j])))
    return len(pairs)
