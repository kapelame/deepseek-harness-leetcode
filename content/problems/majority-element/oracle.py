def majorityElement(nums):
    for x in nums:
        if nums.count(x) * 2 > len(nums):
            return x
