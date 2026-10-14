def adjust(args, rng, size):
    nums = args[0]
    k = rng.randrange(len(nums))
    return [nums[k:] + nums[:k]]
