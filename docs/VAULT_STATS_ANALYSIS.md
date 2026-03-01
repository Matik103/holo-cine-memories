# Vault Stats Tracking Analysis

## What We Track ✅

### Automatically Tracked (via recordSearch in CineMind.tsx)
1. **Total Searches** - Incremented on every search
2. **Vault Score** - +5 points per search
3. **Genres Explored** - Added from movie.genre array
4. **Streaks** - Via update_user_streak() RPC function
5. **Badges** - Checked after every search

### Manually Tracked
1. **Predictions** - Via submitPrediction in PredictionGame
2. **Prediction Streak** - Via resolve_prediction() function

## Gaps Found ❌

### 1. Hidden Gems Rated - NOT TRACKED
**Issue**: `hidden_gems_rated` counter is never incremented
**Location**: vaultService has `recordHiddenGemRating()` but it's NEVER CALLED
**Impact**: "Hidden Gem Hunter" badge (10 hidden gems rated) is impossible to unlock

### 2. Favorites Not Integrated
**Issue**: When users favorite a movie, vault stats aren't updated
**Location**: Favorites component doesn't call vaultService
**Impact**: Missing activity feed entries, no badge progress

### 3. Streak Not Updated on Prediction Votes
**Issue**: Voting on predictions doesn't update last_active_date
**Location**: submitPrediction doesn't call update_user_streak
**Impact**: Users lose streaks even when active

### 4. Percentile Not Calculated
**Issue**: rank_percentile is always null
**Location**: calculate_vault_percentiles() exists but is never called
**Impact**: "CineMind Elite" badge (top 1%) is impossible to unlock

### 5. Early Discovery Badge Impossible
**Issue**: "Trendsetter" badge condition always returns false
**Location**: checkBadgeCondition case 'early_discovery' returns false
**Impact**: Badge can never be unlocked

## Fixes Needed

1. Call recordHiddenGemRating when user favorites a hidden gem
2. Integrate favorites with vault activity feed
3. Update streak on prediction votes
4. Schedule calculate_vault_percentiles() to run periodically
5. Implement early_discovery logic (movie searched before it trends)
