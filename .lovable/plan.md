

## Fix: Tab Highlight on Load + User Skill Level Feature

### Problem 1: Active Tab Not Visually Highlighted on Load
The "Beginner" tab is correctly set as `activeTab` via `useState("beginner")`, and Radix Tabs does set `data-[state=active]` on it. However, the styling conflict between `bg-transparent` on `TabsList` and `data-[state=active]:bg-card` on `TabsTrigger` makes the active state nearly invisible against the `bg-secondary/50` container. The `bg-card` and `bg-secondary/50` are too similar in the dark theme, so there's no visible contrast.

**Fix:** Update the active tab trigger styling in `TabbedCodeBlock.tsx` to use a more contrasting background and add a visible bottom border indicator:
- Change `data-[state=active]:bg-card` to `data-[state=active]:bg-background/80 data-[state=active]:border-b-2 data-[state=active]:border-primary`
- This gives a clear visual indicator regardless of theme

### Problem 2: Default Tab Based on User's Skill Level

This requires:

#### Step A: Database Migration
Create a `user_preferences` table:
```sql
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  python_level text NOT NULL DEFAULT 'beginner',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
```
With RLS policies: users can read/update their own row, and auto-insert on first login.

#### Step B: Skill Level Selection UI
Add a small UI element (e.g., dropdown or button group) on the project detail page or in user settings where logged-in users can set their Python level to Beginner, Intermediate, or Expert. This saves to `user_preferences`.

#### Step C: Hook — `useUserPreferences`
A new hook that:
- Fetches the logged-in user's `python_level` from `user_preferences`
- Provides a setter function to update it
- Returns `"beginner"` as default for unauthenticated users

#### Step D: Update TabbedCodeBlock
- Accept an optional `defaultLevel` prop
- Use it as the initial value for `activeTab` instead of hardcoded `"beginner"`

#### Step E: Wire It Together in ContentRenderer/ProjectDetail
- In the project detail page, call `useUserPreferences()` to get the user's level
- Pass it down to `ContentRenderer` → `TabbedCodeBlock` as `defaultLevel`

### Files to Create/Modify
| File | Action |
|---|---|
| Database migration | Create `user_preferences` table + RLS |
| `src/hooks/useUserPreferences.tsx` | Create — fetch/update user level |
| `src/components/content-blocks/TabbedCodeBlock.tsx` | Fix tab highlight styling + accept `defaultLevel` prop |
| `src/components/content-blocks/ContentRenderer.tsx` | Pass `defaultLevel` to TabbedCodeBlock |
| `src/pages/ProjectDetail.tsx` | Fetch user preferences and pass level down |
| `src/components/UserLevelSelector.tsx` | Create — small UI to pick skill level |

