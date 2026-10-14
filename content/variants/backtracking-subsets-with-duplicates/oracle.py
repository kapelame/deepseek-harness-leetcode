def subsetsWithDup(nums):
    seen = set()
    for mask in range(1 << len(nums)):
        seen.add(tuple(sorted(nums[i] for i in range(len(nums)) if mask >> i & 1)))
    return [list(s) for s in seen]
