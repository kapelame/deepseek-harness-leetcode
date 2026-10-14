def subsets(nums):
    return [[nums[i] for i in range(len(nums)) if mask >> i & 1] for mask in range(1 << len(nums))]
