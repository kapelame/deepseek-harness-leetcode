def adjust(args, rng, size):
    nums = list(args[0])
    if len(nums) > 1 and rng.random() < 0.5:
        nums[-1] = nums[rng.randrange(len(nums) - 1)]
    return [nums]
