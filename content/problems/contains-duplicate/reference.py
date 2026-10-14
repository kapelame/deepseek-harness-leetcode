class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()
        for value in nums:
            if value in seen:
                return True
            seen.add(value)
        return False
