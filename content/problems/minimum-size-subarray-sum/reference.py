class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        left = 0
        total = 0
        best = len(nums) + 1
        for right, value in enumerate(nums):
            total += value
            while total >= target:
                best = min(best, right - left + 1)
                total -= nums[left]
                left += 1
        return 0 if best == len(nums) + 1 else best
