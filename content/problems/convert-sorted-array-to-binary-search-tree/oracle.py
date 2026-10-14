def sortedArrayToBST(nums):
    if not nums:
        return None
    mid = (len(nums) - 1) // 2
    root = TreeNode(nums[mid])
    root.left = sortedArrayToBST(nums[:mid])
    root.right = sortedArrayToBST(nums[mid + 1:])
    return root
