def sortColors(nums):
    counts = [nums.count(c) for c in (0, 1, 2)]
    nums[:] = [0] * counts[0] + [1] * counts[1] + [2] * counts[2]
