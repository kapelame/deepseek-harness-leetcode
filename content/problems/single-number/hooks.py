def adjust(args, rng, size):
    values = args[0]
    single, pairs = values[0], values[1:]
    nums = pairs + pairs + [single]
    rng.shuffle(nums)
    return [nums]
