def sortedArrayToBST(nums):
    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi))
    return build(0, len(nums) - 1)
