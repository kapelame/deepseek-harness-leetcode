def findMedianSortedArrays(nums1, nums2):
    merged = sorted(nums1 + nums2)
    n = len(merged)
    return float(merged[n // 2]) if n % 2 else (merged[n // 2 - 1] + merged[n // 2]) / 2
