def adjust(args, rng, size):
    nums, target = args
    k = rng.randrange(len(nums))
    nums = nums[k:] + nums[:k]
    if rng.random() < 0.6:
        target = rng.choice(nums)
    return [nums, target]
