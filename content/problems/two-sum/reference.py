class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for index, value in enumerate(nums):
            other = target - value
            if other in seen:
                return [seen[other], index]
            seen[value] = index
        return []
