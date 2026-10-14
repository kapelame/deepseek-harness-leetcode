def isPalindrome(s):
    kept = "".join(ch.lower() for ch in s if ch.isalnum())
    return kept == kept[::-1]
