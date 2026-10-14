def searchRange(nums, target):
    hits = [i for i, x in enumerate(nums) if x == target]
    return [hits[0], hits[-1]] if hits else [-1, -1]
