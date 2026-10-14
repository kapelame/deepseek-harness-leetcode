def robCircle(nums):
    def line(houses):
        take = skip = 0
        for x in houses:
            take, skip = skip + x, max(take, skip)
        return max(take, skip)
    if len(nums) == 1:
        return nums[0]
    return max(line(nums[1:]), line(nums[:-1]))
