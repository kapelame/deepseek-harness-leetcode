def adjust(args, rng, size):
    nums, target = args
    if rng.random() < 0.6:
        target = rng.choice(nums)
    return [nums, target]
