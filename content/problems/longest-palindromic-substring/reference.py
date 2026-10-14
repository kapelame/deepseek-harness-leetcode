def longestPalindrome(s):
    best = (0, 1)
    for center in range(2 * len(s) - 1):
        left = center // 2
        right = left + center % 2
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        if right - left - 1 > best[1] - best[0]:
            best = (left + 1, right)
    return s[best[0]:best[1]]
