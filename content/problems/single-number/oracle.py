def singleNumber(nums):
    for x in nums:
        if nums.count(x) == 1:
            return x
