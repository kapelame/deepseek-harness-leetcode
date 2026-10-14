def longestPalindrome(s):
    for length in range(len(s), 0, -1):
        for i in range(len(s) - length + 1):
            piece = s[i:i + length]
            if piece == piece[::-1]:
                return piece
