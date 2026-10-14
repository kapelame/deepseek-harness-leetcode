def countOccurrences(nums, target):
    def lower_bound(value):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] >= value:
                hi = mid
            else:
                lo = mid + 1
        return lo
    return lower_bound(target + 1) - lower_bound(target) + 1
