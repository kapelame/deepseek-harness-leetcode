def sortColors(nums):
    low, i, high = 0, 0, len(nums) - 1
    while i <= high:
        if nums[i] == 0:
            nums[low], nums[i] = nums[i], nums[low]
            low += 1
            i += 1
        elif nums[i] == 2:
            nums[high], nums[i] = nums[i], nums[high]
            high -= 1
        else:
            i += 1
