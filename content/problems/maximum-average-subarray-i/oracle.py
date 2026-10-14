def findMaxAverage(nums, k):
    return max(sum(nums[i:i + k]) for i in range(len(nums) - k + 1)) / k
