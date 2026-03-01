# Vault Features Analysis - Hidden Gems, Prediction Game, Champions

## 🔍 CURRENT STATE ANALYSIS

### ✅ What's Working

1. **Database Structure** - All vault tables exist:
   - `vault_trending` - Tracks movie recall counts
   - `vault_badges` - Badge definitions
   - `vault_user_stats` - User scores, streaks, badges
   - `vault_predictions` - Prediction challenges
   - `vault_user_predictions` - User prediction submissions
   - `vault_activity_feed` - Real-time activity stream

2. **Service Layer** - `vaultService.ts` provides:
   - Trending movies (hour/day/week)
   - Hidden gems discovery
   - User stats tracking
   - Badge system
   - Prediction game
   - Champions leaderboard
   - Live activity feed

3. **UI Components** - All components exist:
   - `HiddenGems.tsx`
   - `PredictionGame.tsx`
   - `Champions.tsx`
   - `LivePulse.tsx`
   - `TrendingChart.tsx`
   - `UserVaultStats.tsx`

---

## 🚨 CRITICAL GAPS & ISSUES

### 1. **DATA ACCURACY PROBLEMS**

#### Issue: Trending Data Not Being Recorded
```typescript
// In CineMind.tsx - Search success handler
// ❌ MISSING: No call to vaultService.recordSearch()
```

**Impact**: Trending movies, hidden gems, and user stats are NOT being updated when users search for movies.

**Fix Required**:
```typescript
// Add to CineMind.tsx after successful movie search
if (user) {
  await vaultService.recordSearch(
    user.id,
    movie.title,
    movie.year,
    movie.genre
  );
}
```

---

#### Issue: Hidden Gems Logic is Flawed
```typescript
// Current logic in vaultService.ts
async getHiddenGems(limit = 10): Promise<VaultTrending[]> {
  // ❌ PROBLEM 1: Checks is_hidden_gem flag but nothing sets it
  const { data } = await supabase
    .from('vault_trending')
    .select('*')
    .eq('is_hidden_gem', true) // This will always be empty!
    
  // ❌ PROBLEM 2: Falls back to favorites with rating >= 4
  // But this doesn't make them "hidden" - they're popular!
  const { data: favorites } = await supabase
    .from('favorites')
    .select('*')
    .gte('rating', 4) // High-rated = not hidden
}
```

**What Hidden Gems Should Be**:
- Movies with LOW recall count (< 50 searches)
- But HIGH average rating (>= 4 stars)
- Released more than 2 years ago
- Not in top 100 trending

**Correct Implementation**:
```typescript
async getHiddenGems(limit = 10): Promise<VaultTrending[]> {
  // Get movies with low searches but high ratings
  const { data } = await supabase
    .from('vault_trending')
    .select('*')
    .lt('recall_count_total', 50) // Low search count
    .gte('average_rating', 4.0) // High rating
    .lt('movie_year', new Date().getFullYear() - 2) // Older movies
    .order('average_rating', { ascending: false })
    .limit(limit);
    
  return data || [];
}
```

---

#### Issue: Prediction Game Has No Data
```typescript
// ❌ PROBLEM: vault_predictions table is empty
// No predictions are being created
```

**Fix Required**: Create seed predictions or admin interface to add them.

**Example Predictions**:
```sql
INSERT INTO vault_predictions (
  prediction_type, title, description, options, 
  points_reward, starts_at, ends_at, is_active
) VALUES
(
  'trending',
  'Which movie will be #1 this week?',
  'Predict which movie will have the most searches this week',
  '[
    {"id": "inception", "label": "Inception", "icon": "🌀"},
    {"id": "matrix", "label": "The Matrix", "icon": "💊"},
    {"id": "interstellar", "label": "Interstellar", "icon": "🚀"}
  ]'::jsonb,
  100,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
);
```

---

#### Issue: Champions Data May Be Inaccurate
```typescript
// Current implementation
async getChampions(limit = 5): Promise<VaultChampion[]> {
  const { data } = await supabase
    .from('vault_user_stats')
    .select('*')
    .gt('vault_score', 0) // ✅ Good
    .order('vault_score', { ascending: false }) // ✅ Good
    .limit(limit);
}
```

**Potential Issues**:
1. No time period filter - shows all-time champions
2. Doesn't exclude inactive users
3. No tie-breaking logic

**Improved Implementation**:
```typescript
async getChampions(period: 'week' | 'month' | 'alltime' = 'week', limit = 5) {
  let query = supabase
    .from('vault_user_stats')
    .select('*')
    .gt('vault_score', 0);
    
  // Filter by activity period
  if (period === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte('last_active_date', weekAgo.toISOString());
  } else if (period === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    query = query.gte('last_active_date', monthAgo.toISOString());
  }
  
  const { data } = await query
    .order('vault_score', { ascending: false })
    .order('current_streak', { ascending: false }) // Tie-breaker
    .limit(limit);
    
  return data || [];
}
```

---

### 2. **MISSING DATABASE FUNCTIONS**

#### Issue: increment_field RPC doesn't exist
```typescript
// Used in vaultService.ts but not defined
await supabase
  .from('vault_user_stats')
  .update({
    total_searches: supabase.rpc('increment_field', { field: 'total_searches' })
    // ❌ This RPC function doesn't exist!
  });
```

**Fix Required**:
```sql
CREATE OR REPLACE FUNCTION increment_field(
  field TEXT,
  amount INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
BEGIN
  RETURN amount;
END;
$$ LANGUAGE plpgsql;
```

**Better Approach** - Use PostgreSQL's built-in increment:
```typescript
await supabase
  .from('vault_user_stats')
  .update({
    total_searches: supabase.sql`total_searches + 1`,
    vault_score: supabase.sql`vault_score + 5`
  })
  .eq('user_id', userId);
```

---

#### Issue: update_user_streak RPC doesn't exist
```typescript
// Called in recordSearch but not defined
await supabase.rpc('update_user_streak', { p_user_id: userId });
```

**Fix Required**:
```sql
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_active_date, current_streak, longest_streak
  INTO v_last_active, v_current_streak, v_longest_streak
  FROM vault_user_stats
  WHERE user_id = p_user_id;
  
  -- Check if user was active yesterday
  IF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    v_current_streak := v_current_streak + 1;
  ELSIF v_last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Streak broken, reset
    v_current_streak := 1;
  END IF;
  
  -- Update longest streak if current is higher
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  -- Update stats
  UPDATE vault_user_stats
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. **INTEGRATION GAPS**

#### Issue: Vault Not Integrated with Main Search Flow
```typescript
// CineMind.tsx - handleSearch function
// ❌ MISSING: No vault integration after successful search
```

**Required Integration Points**:
1. After movie identified → Record search in vault
2. After adding to favorites → Update hidden gems
3. After rating movie → Update average ratings
4. On daily login → Update streak

**Implementation**:
```typescript
// In CineMind.tsx - handleSearch success block
if (user && rawMovie && rawMovie.title) {
  // Record search in vault
  try {
    await vaultService.recordSearch(
      user.id,
      rawMovie.title,
      rawMovie.year,
      rawMovie.genre
    );
    
    // Check for new badges
    const newBadges = await vaultService.checkAndUnlockBadges(user.id);
    if (newBadges.length > 0) {
      toast({
        title: "🎉 Badge Unlocked!",
        description: `You earned: ${newBadges.map(b => b.name).join(', ')}`,
      });
    }
  } catch (error) {
    console.error('Vault integration error:', error);
    // Don't fail the search if vault fails
  }
}
```

---

### 4. **TMDB API KEY EXPOSED**

#### 🔴 CRITICAL SECURITY ISSUE
```typescript
// In vaultService.ts
const TMDB_API_KEY = '2dca580c2a14b55200e784d157207b4d'; // ❌ EXPOSED!
```

**Impact**: API key is visible in client-side code, can be stolen and abused.

**Fix Required**:
1. Move TMDB calls to Edge Function
2. Store API key in Supabase secrets
3. Never expose keys in client code

**Correct Implementation**:
```typescript
// Create supabase/functions/tmdb-trending/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
  
  const response = await fetch(
    `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`
  );
  
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
});

// In vaultService.ts - call Edge Function instead
private async getTMDBTrending(): Promise<VaultTrending[]> {
  const { data } = await supabase.functions.invoke('tmdb-trending');
  return data?.results || [];
}
```

---

### 5. **MISSING FEATURES**

#### A. No Rating System for Hidden Gems
```typescript
// Users can't rate movies to contribute to hidden gems
// Need to add rating functionality
```

**Required**:
```typescript
// Add to favorites table
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

// Update vaultService
async rateMovie(userId: string, movieTitle: string, movieYear: number, rating: number) {
  await supabase
    .from('favorites')
    .upsert({
      user_id: userId,
      movie_title: movieTitle,
      movie_year: movieYear,
      rating: rating
    });
    
  // Update average rating in vault_trending
  const { data: ratings } = await supabase
    .from('favorites')
    .select('rating')
    .eq('movie_title', movieTitle)
    .eq('movie_year', movieYear)
    .not('rating', 'is', null);
    
  if (ratings && ratings.length > 0) {
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await supabase
      .from('vault_trending')
      .update({ average_rating: avgRating })
      .eq('movie_title', movieTitle)
      .eq('movie_year', movieYear);
  }
}
```

#### B. No Prediction Resolution System
```typescript
// Predictions are created but never resolved
// Need admin interface or automated resolution
```

**Required**:
```typescript
async resolvePrediction(predictionId: string, correctAnswer: string) {
  // Mark prediction as resolved
  await supabase
    .from('vault_predictions')
    .update({
      correct_answer: correctAnswer,
      is_resolved: true,
      is_active: false
    })
    .eq('id', predictionId);
    
  // Award points to correct predictors
  const { data: correctPredictions } = await supabase
    .from('vault_user_predictions')
    .select('user_id')
    .eq('prediction_id', predictionId)
    .eq('selected_option', correctAnswer);
    
  if (correctPredictions) {
    for (const pred of correctPredictions) {
      await supabase
        .from('vault_user_stats')
        .update({
          predictions_correct: supabase.sql`predictions_correct + 1`,
          prediction_streak: supabase.sql`prediction_streak + 1`,
          vault_score: supabase.sql`vault_score + 100`
        })
        .eq('user_id', pred.user_id);
    }
  }
}
```

#### C. No Badge Notification System
```typescript
// Badges are unlocked but users aren't notified
```

**Required**: Add toast notifications when badges are unlocked (already partially implemented in integration code above).

---

## 📊 DATA FLOW DIAGRAM

```
User Searches Movie
       ↓
CineMind.handleSearch()
       ↓
identifyMovie() → Success
       ↓
[MISSING] vaultService.recordSearch()
       ↓
Updates:
  - vault_trending (recall counts)
  - vault_user_stats (score, searches, streak)
  - vault_activity_feed (new activity)
       ↓
[MISSING] checkAndUnlockBadges()
       ↓
Vault Components Display:
  - Trending (TrendingChart)
  - Hidden Gems (HiddenGems)
  - Champions (Champions)
  - User Stats (UserVaultStats)
```

---

## 🔧 IMPLEMENTATION PRIORITY

### Phase 1: Critical Fixes (Do First)
1. ✅ **Fix TMDB API key exposure** - Move to Edge Function
2. ✅ **Create missing database functions** - increment_field, update_user_streak
3. ✅ **Integrate vault with search flow** - Add recordSearch call
4. ✅ **Fix hidden gems logic** - Use correct criteria

### Phase 2: Data Accuracy
1. ✅ **Add rating system** - Allow users to rate movies
2. ✅ **Fix trending data** - Ensure counts are accurate
3. ✅ **Add prediction resolution** - Admin interface or automation

### Phase 3: Features
1. ✅ **Badge notifications** - Toast when unlocked
2. ✅ **Leaderboard periods** - Week/Month/All-time
3. ✅ **Seed predictions** - Add initial prediction challenges

---

## 🧪 TESTING CHECKLIST

### Hidden Gems
- [ ] Search for obscure movie
- [ ] Rate it 5 stars
- [ ] Verify it appears in Hidden Gems (if < 50 searches)
- [ ] Verify high-search movies don't appear

### Prediction Game
- [ ] Create test prediction
- [ ] Submit prediction as user
- [ ] Resolve prediction with correct answer
- [ ] Verify points awarded
- [ ] Verify streak updated

### Champions
- [ ] Create multiple test users
- [ ] Give them different scores
- [ ] Verify leaderboard order
- [ ] Test week/month filters
- [ ] Verify inactive users excluded

### Trending
- [ ] Search for movie multiple times
- [ ] Verify recall count increases
- [ ] Check hour/day/week counts
- [ ] Verify TMDB fallback works

---

## 📈 EXPECTED METRICS AFTER FIXES

### Before Fixes:
- Trending: Empty or only TMDB data
- Hidden Gems: Random favorites (incorrect)
- Champions: Possibly empty
- Predictions: Empty
- User Stats: Not updating

### After Fixes:
- Trending: Real-time user search data + TMDB
- Hidden Gems: Accurate low-search, high-rating movies
- Champions: Active users ranked correctly
- Predictions: Active challenges with participation
- User Stats: Accurate scores, streaks, badges

---

## 🚀 QUICK FIX SCRIPT

```sql
-- Run this to fix database issues

-- 1. Create missing functions
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_active_date, current_streak, longest_streak
  INTO v_last_active, v_current_streak, v_longest_streak
  FROM vault_user_stats
  WHERE user_id = p_user_id;
  
  IF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSIF v_last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := 1;
  END IF;
  
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  UPDATE vault_user_stats
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Add rating column if missing
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- 3. Add average_rating to vault_trending if missing
ALTER TABLE vault_trending ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;

-- 4. Seed initial prediction
INSERT INTO vault_predictions (
  prediction_type, title, description, options, 
  points_reward, starts_at, ends_at, is_active
) VALUES (
  'trending',
  'Which genre will be most popular this week?',
  'Predict which movie genre will have the most searches',
  '[
    {"id": "action", "label": "Action", "icon": "💥"},
    {"id": "comedy", "label": "Comedy", "icon": "😂"},
    {"id": "drama", "label": "Drama", "icon": "🎭"},
    {"id": "scifi", "label": "Sci-Fi", "icon": "🚀"}
  ]'::jsonb,
  100,
  NOW(),
  NOW() + INTERVAL '7 days',
  true
) ON CONFLICT DO NOTHING;
```

---

## ✅ CONCLUSION

**Current State**: Vault features exist but are NOT functional due to:
1. Missing integration with search flow
2. Incorrect hidden gems logic
3. Missing database functions
4. Exposed API keys
5. Empty prediction data

**After Fixes**: Fully functional gamification system with:
- Real-time trending data
- Accurate hidden gems discovery
- Active prediction challenges
- Competitive leaderboards
- Badge progression system

**Estimated Fix Time**: 2-3 hours for critical fixes, 4-6 hours for complete implementation.
