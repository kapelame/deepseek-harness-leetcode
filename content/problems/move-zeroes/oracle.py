def moveZeroes(nums):
    kept = [x for x in nums if x != 0]
    nums[:] = kept + [0] * (len(nums) - len(kept))
