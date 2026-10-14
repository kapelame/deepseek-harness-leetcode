def countOccurrences(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return 1
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return 0
