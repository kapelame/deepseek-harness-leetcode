def adjust(args, rng, size):
    nums, k = args
    if size == "large":
        left = rng.randrange(len(nums))
        right = rng.randrange(left, min(len(nums), left + 50))
        k = sum(nums[left:right + 1])
    return [nums, k]
